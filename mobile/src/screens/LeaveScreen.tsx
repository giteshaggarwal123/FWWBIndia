import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  ScrollView,
  ActivityIndicator,
  Alert,
  TextInput,
} from 'react-native';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';

type Employee = { _id: string; name: string };
type Leave = {
  _id: string;
  employee?: Employee | string;
  leaveType: string;
  fromDate: string;
  toDate: string;
  days: number;
  reason?: string;
  status: string;
  approvedBy?: { name?: string } | null;
};

export function LeaveScreen() {
  const { user } = useAuth();
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [myList, setMyList] = useState<Leave[]>([]);
  const [teamList, setTeamList] = useState<Leave[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showApply, setShowApply] = useState(false);
  const [leaveType, setLeaveType] = useState('Casual Leave');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [days, setDays] = useState('');
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const showTeam = user?.type !== 'employee';

  const load = async () => {
    try {
      const meRes = await api.get<Employee>('/employees/me');
      const emp = meRes.data ?? null;
      setEmployee(emp);
      if (emp?._id) {
        const leaveRes = await api.get<Leave[]>(`/leave?employee=${emp._id}`);
        setMyList(Array.isArray(leaveRes.data) ? leaveRes.data : []);
      } else {
        setMyList([]);
      }
      if (showTeam) {
        const teamRes = await api.get<Leave[]>('/leave');
        setTeamList(Array.isArray(teamRes.data) ? teamRes.data : []);
      }
    } catch {
      setMyList([]);
      setTeamList([]);
    }
  };

  useEffect(() => {
    load().finally(() => setLoading(false));
  }, [showTeam]);

  const onRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  const handleApply = async () => {
    if (!employee?._id) {
      Alert.alert('Error', 'Unable to submit leave. Please try again after refreshing.');
      return;
    }
    const d = Number(days);
    if (!fromDate || !toDate || !days || isNaN(d) || d < 1) {
      Alert.alert('Error', 'Fill from date, to date and days.');
      return;
    }
    setSubmitting(true);
    try {
      const res = await api.post('/leave', {
        employee: employee._id,
        leaveType,
        fromDate: new Date(fromDate).toISOString(),
        toDate: new Date(toDate).toISOString(),
        days: d,
        reason: reason.trim() || undefined,
        status: 'pending',
      });
      setSubmitting(false);
      if (res.status >= 200 && res.status < 300) {
        setShowApply(false);
        setFromDate('');
        setToDate('');
        setDays('');
        setReason('');
        await load();
      } else {
        Alert.alert('Error', (res.data as { message?: string })?.message || 'Could not submit leave request.');
      }
    } catch (e: unknown) {
      setSubmitting(false);
      const msg = (e as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Could not submit leave request.';
      Alert.alert('Error', msg);
    }
  };

  const handleApproveReject = async (leaveId: string, status: 'approved' | 'rejected') => {
    setUpdatingId(leaveId);
    try {
      const res = await api.patch(`/leave/${leaveId}`, { status });
      setUpdatingId(null);
      if (res.status >= 200 && res.status < 300) await load();
      else Alert.alert('Error', (res.data as { message?: string })?.message || `Failed to ${status}`);
    } catch (e: unknown) {
      setUpdatingId(null);
      const msg = (e as { response?: { data?: { message?: string } } })?.response?.data?.message || `Failed to ${status}`;
      Alert.alert('Error', msg);
    }
  };

  const formatDate = (d: string) => {
    try {
      return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
    } catch {
      return d;
    }
  };
  const empName = (l: Leave) => (typeof l.employee === 'object' && l.employee?.name ? l.employee.name : '—');

  if (loading && !employee && myList.length === 0 && teamList.length === 0) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#2E3192" />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      {/* My leave — synced with web portal */}
      <Text style={styles.sectionTitle}>My leave</Text>
      <Text style={styles.webLink}>Leave is synced with the web portal. View and manage on the desktop site.</Text>
      <TouchableOpacity style={styles.applyButton} onPress={() => setShowApply(!showApply)}>
        <Text style={styles.applyButtonText}>{showApply ? 'Cancel' : '+ Apply for leave'}</Text>
      </TouchableOpacity>
      {showApply && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Apply for leave</Text>
          <Text style={styles.label}>Leave type</Text>
          <TextInput style={styles.input} value={leaveType} onChangeText={setLeaveType} placeholder="e.g. Casual Leave" placeholderTextColor="#718096" />
          <Text style={styles.label}>From date (YYYY-MM-DD)</Text>
          <TextInput style={styles.input} value={fromDate} onChangeText={setFromDate} placeholder="2025-02-10" placeholderTextColor="#718096" />
          <Text style={styles.label}>To date (YYYY-MM-DD)</Text>
          <TextInput style={styles.input} value={toDate} onChangeText={setToDate} placeholder="2025-02-12" placeholderTextColor="#718096" />
          <Text style={styles.label}>Days</Text>
          <TextInput style={styles.input} value={days} onChangeText={setDays} placeholder="3" keyboardType="numeric" placeholderTextColor="#718096" />
          <Text style={styles.label}>Reason (optional)</Text>
          <TextInput style={[styles.input, styles.textArea]} value={reason} onChangeText={setReason} placeholder="Brief reason" placeholderTextColor="#718096" multiline />
          <TouchableOpacity style={[styles.button, submitting && styles.buttonDisabled]} onPress={handleApply} disabled={submitting}>
            <Text style={styles.buttonText}>{submitting ? '...' : 'Submit'}</Text>
          </TouchableOpacity>
        </View>
      )}
      <Text style={styles.subSection}>My leave requests</Text>
      {myList.length === 0 && <Text style={styles.muted}>No leave requests yet.</Text>}
      {myList.map((item) => (
        <View key={item._id} style={styles.leaveCard}>
          <Text style={styles.leaveType}>{item.leaveType}</Text>
          <Text style={styles.leaveDates}>{formatDate(item.fromDate)} – {formatDate(item.toDate)} ({item.days} days)</Text>
          {item.reason ? <Text style={styles.leaveReason}>{item.reason}</Text> : null}
          <Text style={[styles.statusBadge, item.status === 'approved' && styles.statusApproved, item.status === 'rejected' && styles.statusRejected]}>{item.status}</Text>
        </View>
      ))}

      {/* Team leave — program/hr/management/admin */}
      {showTeam && (
        <>
          <Text style={styles.sectionTitle}>Team leave</Text>
          {teamList.length === 0 ? <Text style={styles.muted}>No team leave requests yet.</Text> : null}
          {teamList.slice(0, 15).map((item) => (
            <View key={item._id} style={styles.teamCard}>
              <Text style={styles.teamName}>{empName(item)}</Text>
              <Text style={styles.meta}>{item.leaveType} · {item.days} day(s)</Text>
              <Text style={styles.dates}>{formatDate(item.fromDate)} – {formatDate(item.toDate)}</Text>
              <Text style={[styles.statusBadge, item.status === 'approved' && styles.statusApproved, item.status === 'rejected' && styles.statusRejected]}>{item.status}</Text>
              {item.status === 'pending' && (
                <View style={styles.actionRow}>
                  <TouchableOpacity
                    style={[styles.actionBtn, styles.actionApprove]}
                    onPress={() => handleApproveReject(item._id, 'approved')}
                    disabled={updatingId === item._id}
                  >
                    <Text style={styles.actionBtnText}>Approve</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.actionBtn, styles.actionReject]}
                    onPress={() => handleApproveReject(item._id, 'rejected')}
                    disabled={updatingId === item._id}
                  >
                    <Text style={styles.actionBtnText}>Reject</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          ))}
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 16, paddingBottom: 32 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#1a202c', marginBottom: 12, marginTop: 8 },
  subSection: { fontSize: 14, fontWeight: '600', color: '#4a5568', marginBottom: 8, marginTop: 16 },
  card: { backgroundColor: '#fff', borderRadius: 8, padding: 20, marginBottom: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 4, elevation: 2 },
  cardTitle: { fontSize: 16, fontWeight: '600', marginBottom: 16 },
  label: { fontSize: 14, color: '#4a5568', marginBottom: 4 },
  input: { borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 8, paddingHorizontal: 14, paddingVertical: 10, fontSize: 16, marginBottom: 12, color: '#1a202c' },
  textArea: { minHeight: 60 },
  applyButton: { backgroundColor: '#2E3192', borderRadius: 8, paddingVertical: 14, alignItems: 'center', marginBottom: 16 },
  applyButtonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  button: { backgroundColor: '#2E3192', borderRadius: 8, paddingVertical: 14, alignItems: 'center', marginTop: 8 },
  buttonDisabled: { opacity: 0.7 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  muted: { fontSize: 14, color: '#718096', marginBottom: 16 },
  leaveCard: { backgroundColor: '#fff', borderRadius: 8, padding: 16, marginBottom: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 4, elevation: 2 },
  leaveType: { fontSize: 16, fontWeight: '600', marginBottom: 4 },
  leaveDates: { fontSize: 14, color: '#718096', marginBottom: 4 },
  leaveReason: { fontSize: 13, color: '#4a5568', fontStyle: 'italic', marginBottom: 8 },
  statusBadge: { fontSize: 12, color: '#d69e2e', backgroundColor: '#fef3c7', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, alignSelf: 'flex-start', overflow: 'hidden' },
  statusApproved: { color: '#276749', backgroundColor: '#c6f6d5' },
  statusRejected: { color: '#c53030', backgroundColor: '#fed7d7' },
  teamCard: { backgroundColor: '#fff', borderRadius: 8, padding: 16, marginBottom: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 4, elevation: 2 },
  teamName: { fontSize: 16, fontWeight: '600', color: '#1a202c', marginBottom: 4 },
  meta: { fontSize: 13, color: '#718096', marginBottom: 2 },
  dates: { fontSize: 13, color: '#4a5568', marginBottom: 8 },
  actionRow: { flexDirection: 'row', gap: 8, marginTop: 10 },
  actionBtn: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 6 },
  actionApprove: { backgroundColor: '#c6f6d5' },
  actionReject: { backgroundColor: '#fed7d7' },
  actionBtnText: { fontSize: 14, fontWeight: '600', color: '#1a202c' },
  webLink: { fontSize: 12, color: '#718096', marginBottom: 16, fontStyle: 'italic' },
});
