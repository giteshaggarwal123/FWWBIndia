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
} from 'react-native';
import { api } from '../api/client';
import { downloadAndShareExport } from '../api/export';

type ProjectRef = { _id: string; name?: string };
type Activity = {
  _id: string;
  activityId: string;
  name: string;
  project: ProjectRef | string;
  budget?: number;
  status?: string;
  location?: string;
  expectedParticipants?: number;
  actualParticipants?: number;
  budgetHead?: string;
};

type Project = { _id: string; name: string };

export function ActivitiesScreen({ navigation }: { navigation: { navigate: (a: string, b?: object) => void } }) {
  const [list, setList] = useState<Activity[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [projectFilter, setProjectFilter] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [exporting, setExporting] = useState(false);

  const load = async () => {
    try {
      const [actRes, projRes] = await Promise.all([
        api.get<Activity[] | { data: Activity[]; total: number }>(projectFilter ? `/activities?project=${projectFilter}` : '/activities'),
        api.get<Project[]>('/projects'),
      ]);
      const actData = actRes.data;
      const actList = Array.isArray(actData) ? actData : (actData && typeof actData === 'object' && 'data' in actData ? (actData as { data: Activity[] }).data : []);
      if (Array.isArray(actList)) setList(actList);
      if (Array.isArray(projRes.data)) setProjects(projRes.data);
    } catch {
      setList([]);
    }
  };

  useEffect(() => {
    load().finally(() => setLoading(false));
  }, [projectFilter]);

  const onRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  const handleExport = async () => {
    setExporting(true);
    const result = await downloadAndShareExport('/export/activities', 'Activities_Export.xlsx');
    setExporting(false);
    if (!result.ok) Alert.alert('Export failed', result.message ?? 'Could not export');
  };

  const projectName = (a: Activity) =>
    typeof a.project === 'object' && a.project?.name ? a.project.name : '—';

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
        <TouchableOpacity
          style={[styles.chip, !projectFilter && styles.chipSelected]}
          onPress={() => setProjectFilter('')}
        >
          <Text style={[styles.chipText, !projectFilter && styles.chipTextSelected]}>All projects</Text>
        </TouchableOpacity>
        {projects.map((p) => (
          <TouchableOpacity
            key={p._id}
            style={[styles.chip, projectFilter === p._id && styles.chipSelected]}
            onPress={() => setProjectFilter(p._id)}
          >
            <Text style={[styles.chipText, projectFilter === p._id && styles.chipTextSelected]} numberOfLines={1}>{p.name}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
      <View style={styles.actionRow}>
        <TouchableOpacity style={styles.exportBtn} onPress={handleExport} disabled={exporting}>
          <Text style={styles.exportBtnText}>{exporting ? '...' : 'Export Excel'}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.fab}
          onPress={() => navigation.navigate('ActivityForm', {})}
        >
          <Text style={styles.fabText}>+ Add Activity</Text>
        </TouchableOpacity>
      </View>
      <FlatList
        data={list}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={<Text style={styles.empty}>No activities. Add one to get started.</Text>}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() => navigation.navigate('ActivityForm', { activity: item })}
            activeOpacity={0.7}
          >
            <Text style={styles.name} numberOfLines={2}>{item.name}</Text>
            <Text style={styles.meta}>{projectName(item)}</Text>
            {item.budgetHead ? <Text style={styles.budgetHead}>{item.budgetHead}</Text> : null}
            <View style={styles.row}>
              <Text style={styles.badge}>{item.status ?? 'planned'}</Text>
              {item.budget != null && (
                <Text style={styles.amount}>₹{(item.budget / 1000).toFixed(0)}k</Text>
              )}
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  filterRow: { maxHeight: 44, marginHorizontal: 16, marginBottom: 8 },
  filterRowContent: { gap: 8, alignItems: 'center', paddingVertical: 4 },
  chip: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, backgroundColor: '#edf2f7' },
  chipSelected: { backgroundColor: '#2E3192' },
  chipText: { fontSize: 14, color: '#4a5568' },
  chipTextSelected: { color: '#fff' },
  list: { padding: 16, paddingBottom: 80 },
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
  name: { fontSize: 16, fontWeight: '600', color: '#1a202c', marginBottom: 4 },
  meta: { fontSize: 13, color: '#718096', marginBottom: 4 },
  budgetHead: { fontSize: 12, color: '#718096', marginBottom: 8 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  badge: {
    fontSize: 12,
    color: '#2E3192',
    backgroundColor: '#e8ecf7',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    overflow: 'hidden',
  },
  amount: { fontSize: 13, color: '#38a169', fontWeight: '600' },
  empty: { textAlign: 'center', color: '#718096', marginTop: 24 },
  actionRow: { flexDirection: 'row', gap: 12, paddingHorizontal: 16, marginBottom: 12 },
  exportBtn: { backgroundColor: '#38a169', borderRadius: 8, paddingVertical: 12, paddingHorizontal: 16, justifyContent: 'center' },
  exportBtnText: { color: '#fff', fontSize: 14, fontWeight: '600' },
  fab: {
    flex: 1,
    backgroundColor: '#2E3192',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fabText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});
