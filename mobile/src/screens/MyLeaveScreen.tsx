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

type Employee = { _id: string; name: string };
type Leave = {
  _id: string;
  leaveType: string;
  fromDate: string;
  toDate: string;
  days: number;
  reason?: string;
  status: string;
};

export function MyLeaveScreen() {
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [list, setList] = useState<Leave[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showApply, setShowApply] = useState(false);
  const [leaveType, setLeaveType] = useState('Casual Leave');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [days, setDays] = useState('');
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const load = async () => {
    const meRes = await api.get<Employee>('/employees/me');
    const emp = meRes.ok && meRes.data ? meRes.data : null;
    setEmployee(emp);
    if (!emp?._id) {
      setLoading(false);
      return;
    }
    const leaveRes = await api.get<Leave[]>(`/leave?employee=${emp._id}`);
    setList(Array.isArray(leaveRes.data) ? leaveRes.data : []);
  };

  useEffect(() => {
    load().finally(() => setLoading(false));
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  const handleApply = async () => {
    if (!employee?._id) {
      Alert.alert('Not linked', 'Your account is not linked to an employee record. Contact HR.');
      return;
    }
    const d = Number(days);
    if (!fromDate || !toDate || !days || isNaN(d) || d < 1) {
      Alert.alert('Error', 'Fill from date, to date and days.');
      return;
    }
    setSubmitting(true);
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
    if (res.ok) {
      setShowApply(false);
      setFromDate('');
      setToDate('');
      setDays('');
      setReason('');
      await load();
    } else {
      Alert.alert('Error', 'Could not submit leave request.');
    }
  };

  const formatDate = (d: string) => {
    try {
      return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
    } catch {
      return d;
    }
  };

  if (loading && !employee) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#2E3192" />
      </View>
    );
  }

  if (!employee) {
    return (
      <ScrollView contentContainerStyle={styles.empty} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
        <Text style={styles.emptyText}>Your account is not linked to an employee record. Contact HR to link your profile.</Text>
      </ScrollView>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <TouchableOpacity
        style={styles.applyButton}
        onPress={() => setShowApply(!showApply)}
      >
        <Text style={styles.applyButtonText}>{showApply ? 'Cancel' : '+ Apply for leave'}</Text>
      </TouchableOpacity>

      {showApply && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Apply for leave</Text>
          <Text style={styles.label}>Leave type</Text>
          <TextInput
            style={styles.input}
            value={leaveType}
            onChangeText={setLeaveType}
            placeholder="e.g. Casual Leave"
            placeholderTextColor="#718096"
          />
          <Text style={styles.label}>From date (YYYY-MM-DD)</Text>
          <TextInput
            style={styles.input}
            value={fromDate}
            onChangeText={setFromDate}
            placeholder="2025-02-10"
            placeholderTextColor="#718096"
          />
          <Text style={styles.label}>To date (YYYY-MM-DD)</Text>
          <TextInput
            style={styles.input}
            value={toDate}
            onChangeText={setToDate}
            placeholder="2025-02-12"
            placeholderTextColor="#718096"
          />
          <Text style={styles.label}>Days</Text>
          <TextInput
            style={styles.input}
            value={days}
            onChangeText={setDays}
            placeholder="3"
            keyboardType="numeric"
            placeholderTextColor="#718096"
          />
          <Text style={styles.label}>Reason (optional)</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={reason}
            onChangeText={setReason}
            placeholder="Brief reason"
            placeholderTextColor="#718096"
            multiline
          />
          <TouchableOpacity
            style={[styles.button, submitting && styles.buttonDisabled]}
            onPress={handleApply}
            disabled={submitting}
          >
            <Text style={styles.buttonText}>{submitting ? '...' : 'Submit'}</Text>
          </TouchableOpacity>
        </View>
      )}

      <Text style={styles.sectionTitle}>My leave requests</Text>
      {list.length === 0 && <Text style={styles.muted}>No leave requests yet.</Text>}
      {list.map((item) => (
        <View key={item._id} style={styles.leaveCard}>
          <Text style={styles.leaveType}>{item.leaveType}</Text>
          <Text style={styles.leaveDates}>{formatDate(item.fromDate)} – {formatDate(item.toDate)} ({item.days} days)</Text>
          {item.reason ? <Text style={styles.leaveReason}>{item.reason}</Text> : null}
          <Text style={[styles.statusBadge, item.status === 'approved' && styles.statusApproved, item.status === 'rejected' && styles.statusRejected]}>
            {item.status}
          </Text>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 16, paddingBottom: 32 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  empty: { padding: 24 },
  emptyText: { fontSize: 14, color: '#718096', textAlign: 'center' },
  applyButton: { backgroundColor: '#2E3192', borderRadius: 8, paddingVertical: 14, alignItems: 'center', marginBottom: 16 },
  applyButtonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  card: { backgroundColor: '#fff', borderRadius: 8, padding: 20, marginBottom: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 4, elevation: 2 },
  cardTitle: { fontSize: 16, fontWeight: '600', marginBottom: 16 },
  label: { fontSize: 14, color: '#4a5568', marginBottom: 4 },
  input: { borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 8, paddingHorizontal: 14, paddingVertical: 10, fontSize: 16, marginBottom: 12, color: '#1a202c' },
  textArea: { minHeight: 60 },
  button: { backgroundColor: '#2E3192', borderRadius: 8, paddingVertical: 14, alignItems: 'center', marginTop: 8 },
  buttonDisabled: { opacity: 0.7 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  sectionTitle: { fontSize: 16, fontWeight: '600', marginBottom: 12 },
  muted: { color: '#718096', marginBottom: 16 },
  leaveCard: { backgroundColor: '#fff', borderRadius: 8, padding: 16, marginBottom: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 4, elevation: 2 },
  leaveType: { fontSize: 16, fontWeight: '600', marginBottom: 4 },
  leaveDates: { fontSize: 14, color: '#718096', marginBottom: 4 },
  leaveReason: { fontSize: 13, color: '#4a5568', fontStyle: 'italic', marginBottom: 8 },
  statusBadge: { fontSize: 12, color: '#d69e2e', backgroundColor: '#fef3c7', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, alignSelf: 'flex-start', overflow: 'hidden' },
  statusApproved: { color: '#276749', backgroundColor: '#c6f6d5' },
  statusRejected: { color: '#c53030', backgroundColor: '#fed7d7' },
});
