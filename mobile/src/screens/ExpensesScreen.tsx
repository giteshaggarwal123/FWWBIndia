import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
  ScrollView,
  Alert,
  Modal,
} from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';

type Ref = { _id: string; name?: string };
type Expense = {
  _id: string;
  expenseId: string;
  project: Ref | string;
  activity?: Ref | string;
  amount: number;
  category: string;
  description?: string;
  date: string;
  status?: string;
  budgetHead?: string;
};

type Project = { _id: string; name: string };

const STATUS_OPTIONS = ['', 'submitted', 'verified', 'approved', 'rejected', 'settled'];

export function ExpensesScreen({ navigation }: { navigation: { navigate: (a: string, b?: object) => void } }) {
  const { hasPermission } = useAuth();
  const canChangeStatus = hasPermission('expenses');
  const [list, setList] = useState<Expense[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [projectFilter, setProjectFilter] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [importModal, setImportModal] = useState<{ rows: Record<string, unknown>[]; sheetName: string } | null>(null);
  const [importProjectId, setImportProjectId] = useState<string>('');
  const [importing, setImporting] = useState(false);

  const load = async () => {
    try {
      const params = new URLSearchParams();
      if (projectFilter) params.set('project', projectFilter);
      if (statusFilter) params.set('status', statusFilter);
      const [expRes, projRes] = await Promise.all([
        api.get<Expense[]>(`/expenses${params.toString() ? `?${params.toString()}` : ''}`),
        api.get<Project[]>('/projects'),
      ]);
      if (Array.isArray(expRes.data)) setList(expRes.data);
      if (Array.isArray(projRes.data)) setProjects(projRes.data);
    } catch {
      setList([]);
    }
  };

  useEffect(() => {
    load().finally(() => setLoading(false));
  }, [projectFilter, statusFilter]);

  const onRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  const updateStatus = async (id: string, status: string) => {
    setUpdatingId(id);
    try {
      const res = await api.patch(`/expenses/${id}`, { status });
      setUpdatingId(null);
      if (res.status >= 200 && res.status < 300) await load();
      else Alert.alert('Error', (res.data as { message?: string })?.message || 'Failed to update');
    } catch (e: unknown) {
      setUpdatingId(null);
      const msg = (e as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Failed to update';
      Alert.alert('Error', msg);
    }
  };

  const pickAndParseExcel = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({ type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', copyToCacheDirectory: true });
      if (result.canceled) return;
      const uri = result.assets[0].uri;
      const base64 = await FileSystem.readAsStringAsync(uri, { encoding: FileSystem.EncodingType.Base64 });
      const parseRes = await api.post<{ sheetName: string; rows: Record<string, unknown>[] }>('/bulk-import/parse-excel', { base64 });
      if (!parseRes.ok || !Array.isArray(parseRes.data?.rows)) {
        Alert.alert('Error', (parseRes.data as { message?: string })?.message ?? 'Invalid Excel file');
        return;
      }
      setImportProjectId(projects[0]?._id ?? '');
      setImportModal({ sheetName: parseRes.data.sheetName ?? '', rows: parseRes.data.rows });
    } catch {
      Alert.alert('Error', 'Could not read file');
    }
  };

  const runImport = async () => {
    if (!importModal || !importProjectId) return;
    setImporting(true);
    const res = await api.post<{ count: number }>('/bulk-import/expenses', { projectId: importProjectId, rows: importModal.rows });
    setImporting(false);
    setImportModal(null);
    if (res.ok) {
      await load();
      Alert.alert('Done', `Imported ${(res.data as { count?: number })?.count ?? importModal.rows.length} expense(s).`);
    } else {
      Alert.alert('Error', (res.data as { message?: string })?.message ?? 'Import failed');
    }
  };

  const formatDate = (d: string) => {
    try {
      return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
    } catch {
      return d;
    }
  };

  const projectName = (e: Expense) =>
    typeof e.project === 'object' && e.project?.name ? e.project.name : '—';

  if (loading && list.length === 0) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#2E3192" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView horizontal style={styles.filterRow} contentContainerStyle={styles.filterRowContent} showsHorizontalScrollIndicator={false}>
        <TouchableOpacity style={[styles.chip, !projectFilter && styles.chipSelected]} onPress={() => setProjectFilter('')}>
          <Text style={[styles.chipText, !projectFilter && styles.chipTextSelected]}>All projects</Text>
        </TouchableOpacity>
        {projects.map((p) => (
          <TouchableOpacity key={p._id} style={[styles.chip, projectFilter === p._id && styles.chipSelected]} onPress={() => setProjectFilter(p._id)}>
            <Text style={[styles.chipText, projectFilter === p._id && styles.chipTextSelected]} numberOfLines={1}>{p.name}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
      <ScrollView horizontal style={styles.filterRow} contentContainerStyle={styles.filterRowContent} showsHorizontalScrollIndicator={false}>
        {STATUS_OPTIONS.map((s) => (
          <TouchableOpacity key={s || 'all'} style={[styles.chip, statusFilter === s && styles.chipSelected]} onPress={() => setStatusFilter(s)}>
            <Text style={[styles.chipText, statusFilter === s && styles.chipTextSelected]}>{s || 'All status'}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
      <View style={styles.fabRow}>
        <TouchableOpacity style={styles.importBtn} onPress={pickAndParseExcel}>
          <Text style={styles.importBtnText}>Import Excel</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.fab} onPress={() => navigation.navigate('ExpenseForm', {})}>
          <Text style={styles.fabText}>+ Add Expense</Text>
        </TouchableOpacity>
      </View>
      <Modal visible={!!importModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Import expenses</Text>
            {importModal && (
              <>
                <Text style={styles.modalText}>{importModal.rows.length} row(s) from {importModal.sheetName}</Text>
                <Text style={styles.modalLabel}>Project</Text>
                <ScrollView horizontal style={styles.modalChips}>
                  {projects.map((p) => (
                    <TouchableOpacity key={p._id} style={[styles.modalChip, importProjectId === p._id && styles.modalChipSel]} onPress={() => setImportProjectId(p._id)}>
                      <Text style={[styles.modalChipText, importProjectId === p._id && styles.modalChipTextSel]} numberOfLines={1}>{p.name}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
                <View style={styles.modalActions}>
                  <TouchableOpacity style={styles.modalCancel} onPress={() => setImportModal(null)}>
                    <Text style={styles.modalCancelText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.modalImport, importing && styles.buttonDisabled]} onPress={runImport} disabled={importing || !importProjectId}>
                    <Text style={styles.modalImportText}>{importing ? '...' : 'Import'}</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>
      <FlatList
        data={list}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={<Text style={styles.empty}>No expenses. Add one to get started.</Text>}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() => navigation.navigate('ExpenseForm', { expense: item })}
            activeOpacity={0.7}
          >
            <View style={styles.row}>
              <Text style={styles.amount}>₹{item.amount?.toLocaleString() ?? 0}</Text>
              <Text style={[styles.badge, item.status === 'approved' && styles.badgeApproved, item.status === 'rejected' && styles.badgeRejected, item.status === 'settled' && styles.badgeSettled]}>
                {item.status ?? 'submitted'}
              </Text>
            </View>
            <Text style={styles.desc} numberOfLines={2}>{item.description || item.category}</Text>
            <Text style={styles.meta}>{formatDate(item.date)} · {projectName(item)}</Text>
            {item.budgetHead ? <Text style={styles.budgetHead}>{item.budgetHead}</Text> : null}
            {canChangeStatus && (item.status === 'submitted' || item.status === 'verified' || item.status === 'approved') && (
              <View style={styles.actionRow}>
                {item.status === 'submitted' && (
                  <TouchableOpacity
                    style={[styles.actionBtn, styles.actionVerify]}
                    onPress={() => updateStatus(item._id, 'verified')}
                    disabled={updatingId === item._id}
                  >
                    <Text style={styles.actionBtnText}>Verify</Text>
                  </TouchableOpacity>
                )}
                {(item.status === 'submitted' || item.status === 'verified') && (
                  <>
                    <TouchableOpacity
                      style={[styles.actionBtn, styles.actionApprove]}
                      onPress={() => updateStatus(item._id, 'approved')}
                      disabled={updatingId === item._id}
                    >
                      <Text style={styles.actionBtnText}>Approve</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.actionBtn, styles.actionReject]}
                      onPress={() => updateStatus(item._id, 'rejected')}
                      disabled={updatingId === item._id}
                    >
                      <Text style={styles.actionBtnText}>Reject</Text>
                    </TouchableOpacity>
                  </>
                )}
                {item.status === 'approved' && (
                  <TouchableOpacity
                    style={[styles.actionBtn, styles.actionSettle]}
                    onPress={() => updateStatus(item._id, 'settled')}
                    disabled={updatingId === item._id}
                  >
                    <Text style={styles.actionBtnText}>Settle</Text>
                  </TouchableOpacity>
                )}
              </View>
            )}
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  filterRow: { maxHeight: 44, marginHorizontal: 16, marginBottom: 4 },
  filterRowContent: { gap: 8, alignItems: 'center', paddingVertical: 4 },
  chip: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, backgroundColor: '#edf2f7' },
  chipSelected: { backgroundColor: '#2E3192' },
  chipText: { fontSize: 14, color: '#4a5568' },
  chipTextSelected: { color: '#fff' },
  list: { padding: 16, paddingBottom: 72 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  amount: { fontSize: 18, fontWeight: '700', color: '#2E3192' },
  badge: {
    fontSize: 12,
    color: '#38a169',
    backgroundColor: '#e6fffa',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    overflow: 'hidden',
  },
  badgeApproved: { color: '#276749', backgroundColor: '#c6f6d5' },
  badgeRejected: { color: '#c53030', backgroundColor: '#fed7d7' },
  badgeSettled: { color: '#2b6cb0', backgroundColor: '#bee3f8' },
  desc: { fontSize: 14, color: '#4a5568', marginBottom: 4 },
  meta: { fontSize: 12, color: '#718096' },
  budgetHead: { fontSize: 11, color: '#718096', marginTop: 4 },
  actionRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 10 },
  actionBtn: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6 },
  actionVerify: { backgroundColor: '#e6fffa' },
  actionApprove: { backgroundColor: '#c6f6d5' },
  actionReject: { backgroundColor: '#fed7d7' },
  actionSettle: { backgroundColor: '#bee3f8' },
  actionBtnText: { fontSize: 12, fontWeight: '600', color: '#1a202c' },
  empty: { textAlign: 'center', color: '#718096', marginTop: 24 },
  fabRow: { position: 'absolute', bottom: 24, left: 16, right: 16, flexDirection: 'row', gap: 12, alignItems: 'center', zIndex: 10 },
  importBtn: { backgroundColor: '#2c5282', borderRadius: 8, paddingVertical: 14, paddingHorizontal: 16 },
  importBtnText: { color: '#fff', fontSize: 14, fontWeight: '600' },
  fab: { flex: 1, backgroundColor: '#2E3192', borderRadius: 8, paddingVertical: 14, alignItems: 'center', justifyContent: 'center' },
  fabText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 24 },
  modalBox: { backgroundColor: '#fff', borderRadius: 12, padding: 20 },
  modalTitle: { fontSize: 18, fontWeight: '700', marginBottom: 8 },
  modalText: { fontSize: 14, color: '#718096', marginBottom: 12 },
  modalLabel: { fontSize: 14, fontWeight: '600', marginBottom: 8 },
  modalChips: { maxHeight: 44, marginBottom: 16 },
  modalChip: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, backgroundColor: '#edf2f7', marginRight: 8 },
  modalChipSel: { backgroundColor: '#2E3192' },
  modalChipText: { fontSize: 14, color: '#4a5568' },
  modalChipTextSel: { color: '#fff' },
  modalActions: { flexDirection: 'row', gap: 12, marginTop: 8 },
  modalCancel: { paddingVertical: 12, paddingHorizontal: 20 },
  modalCancelText: { fontSize: 16, color: '#718096' },
  modalImport: { flex: 1, backgroundColor: '#38a169', borderRadius: 8, paddingVertical: 12, alignItems: 'center' },
  modalImportText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  buttonDisabled: { opacity: 0.7 },
});
