import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, RefreshControl, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { api } from '../api/client';

type Employee = { _id: string; name: string; employeeId?: string };
type Attendance = {
  _id: string;
  date: string;
  checkIn?: string;
  checkOut?: string;
  status: string;
  notes?: string;
};

export function MyAttendanceScreen() {
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [todayRecord, setTodayRecord] = useState<Attendance | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const today = new Date().toISOString().slice(0, 10);

  const load = async () => {
    const meRes = await api.get<Employee>('/employees/me');
    const emp = meRes.ok && meRes.data ? meRes.data : null;
    setEmployee(emp);
    if (!emp?._id) {
      setLoading(false);
      return;
    }
    const attRes = await api.get<Attendance[]>(`/attendance?employee=${emp._id}&date=${today}`);
    const list = attRes.ok && Array.isArray(attRes.data) ? attRes.data : [];
    setTodayRecord(list[0] ?? null);
  };

  useEffect(() => {
    load().finally(() => setLoading(false));
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  const handleCheckIn = async () => {
    if (!employee?._id) {
      Alert.alert('Not linked', 'Your account is not linked to an employee record. Contact HR.');
      return;
    }
    setSubmitting(true);
    const now = new Date();
    const res = await api.post('/attendance', {
      employee: employee._id,
      date: now.toISOString().slice(0, 10),
      checkIn: now.toISOString(),
      status: 'present',
    });
    setSubmitting(false);
    if (res.ok) await load();
    else Alert.alert('Error', 'Could not mark check-in.');
  };

  const handleCheckOut = async () => {
    if (!todayRecord?._id) return;
    setSubmitting(true);
    const res = await api.patch(`/attendance/${todayRecord._id}`, { checkOut: new Date().toISOString() });
    setSubmitting(false);
    if (res.ok) await load();
    else Alert.alert('Error', 'Could not mark check-out.');
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
        <Text style={styles.emptyText}>Your account is not linked to an employee record.</Text>
        <Text style={styles.emptySub}>Contact HR to link your login to an employee profile. Then you can mark attendance here.</Text>
      </ScrollView>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <Text style={styles.name}>{employee.name}</Text>
      <Text style={styles.date}>{new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</Text>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Today's attendance</Text>
        {todayRecord ? (
          <>
            <View style={styles.row}>
              <Text style={styles.label}>Status</Text>
              <Text style={styles.badge}>{todayRecord.status}</Text>
            </View>
            {todayRecord.checkIn && (
              <View style={styles.row}>
                <Text style={styles.label}>Check-in</Text>
                <Text style={styles.value}>
                  {typeof todayRecord.checkIn === 'string' && todayRecord.checkIn.includes('T')
                    ? todayRecord.checkIn.slice(11, 16)
                    : String(todayRecord.checkIn)}
                </Text>
              </View>
            )}
            {todayRecord.checkOut && (
              <View style={styles.row}>
                <Text style={styles.label}>Check-out</Text>
                <Text style={styles.value}>
                  {typeof todayRecord.checkOut === 'string' && todayRecord.checkOut.includes('T')
                    ? todayRecord.checkOut.slice(11, 16)
                    : String(todayRecord.checkOut)}
                </Text>
              </View>
            )}
            {!todayRecord.checkOut && (
              <TouchableOpacity
                style={[styles.button, submitting && styles.buttonDisabled]}
                onPress={handleCheckOut}
                disabled={submitting}
              >
                <Text style={styles.buttonText}>Check out</Text>
              </TouchableOpacity>
            )}
          </>
        ) : (
          <>
            <Text style={styles.muted}>Not marked yet.</Text>
            <TouchableOpacity
              style={[styles.button, submitting && styles.buttonDisabled]}
              onPress={handleCheckIn}
              disabled={submitting}
            >
              <Text style={styles.buttonText}>{submitting ? '...' : 'Check in'}</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 16 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  empty: { padding: 24, alignItems: 'center' },
  emptyText: { fontSize: 16, color: '#4a5568', textAlign: 'center', marginBottom: 8 },
  emptySub: { fontSize: 14, color: '#718096', textAlign: 'center' },
  name: { fontSize: 20, fontWeight: '700', color: '#1a202c', marginBottom: 4 },
  date: { fontSize: 14, color: '#718096', marginBottom: 20 },
  card: { backgroundColor: '#fff', borderRadius: 8, padding: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 4, elevation: 2 },
  cardTitle: { fontSize: 16, fontWeight: '600', marginBottom: 16 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  label: { fontSize: 14, color: '#718096' },
  value: { fontSize: 14, fontWeight: '600' },
  badge: { fontSize: 14, color: '#2E3192', backgroundColor: '#e8ecf7', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6, overflow: 'hidden' },
  muted: { fontSize: 14, color: '#718096', marginBottom: 16 },
  button: { backgroundColor: '#2E3192', borderRadius: 8, paddingVertical: 14, alignItems: 'center', marginTop: 8 },
  buttonDisabled: { opacity: 0.7 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});
