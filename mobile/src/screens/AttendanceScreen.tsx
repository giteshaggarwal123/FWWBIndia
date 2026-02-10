import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { getCurrentCoords } from '../utils/location';

type Employee = { _id: string; name: string; employeeId?: string };
type Attendance = {
  _id: string;
  employee: Employee | string;
  date: string;
  checkIn?: string;
  checkOut?: string;
  status: string;
  notes?: string;
  lat?: number;
  lng?: number;
  checkOutLat?: number;
  checkOutLng?: number;
};

export function AttendanceScreen() {
  const { user } = useAuth();
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [todayRecord, setTodayRecord] = useState<Attendance | null>(null);
  const [teamList, setTeamList] = useState<Attendance[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [teamDateFilter, setTeamDateFilter] = useState<'all' | 'today'>('all');
  const today = new Date().toISOString().slice(0, 10);
  const showTeam = user?.type !== 'employee';

  const load = async () => {
    const meRes = await api.get<Employee>('/employees/me');
    const emp = meRes.ok && meRes.data ? meRes.data : null;
    setEmployee(emp);
    if (emp?._id) {
      const attRes = await api.get<Attendance[]>(`/attendance?employee=${emp._id}&date=${today}`);
      const list = attRes.ok && Array.isArray(attRes.data) ? attRes.data : [];
      setTodayRecord(list[0] ?? null);
    } else {
      setTodayRecord(null);
    }
    if (showTeam) {
      const teamUrl = teamDateFilter === 'today' ? `/attendance?date=${today}` : '/attendance';
      const teamRes = await api.get<Attendance[]>(teamUrl);
      setTeamList(teamRes.ok && Array.isArray(teamRes.data) ? teamRes.data : []);
    }
  };

  useEffect(() => {
    load().finally(() => setLoading(false));
  }, [showTeam, teamDateFilter]);

  const onRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  const handleCheckIn = async () => {
    if (!employee?._id) {
      Alert.alert('Error', 'Unable to mark attendance. Please try again after refreshing.');
      return;
    }
    setSubmitting(true);
    const coords = await getCurrentCoords();
    const now = new Date();
    const res = await api.post('/attendance', {
      employee: employee._id,
      date: now.toISOString().slice(0, 10),
      checkIn: now.toISOString(),
      status: 'present',
      ...(coords && { lat: coords.lat, lng: coords.lng }),
    });
    setSubmitting(false);
    if (res.ok) await load();
    else Alert.alert('Error', 'Could not mark check-in.');
  };

  const handleCheckOut = async () => {
    if (!todayRecord?._id) return;
    setSubmitting(true);
    const coords = await getCurrentCoords();
    const res = await api.patch(`/attendance/${todayRecord._id}`, {
      checkOut: new Date().toISOString(),
      ...(coords && { checkOutLat: coords.lat, checkOutLng: coords.lng }),
    });
    setSubmitting(false);
    if (res.ok) await load();
    else Alert.alert('Error', 'Could not mark check-out.');
  };

  const formatCoords = (lat?: number, lng?: number) =>
    lat != null && lng != null ? `${lat.toFixed(5)}, ${lng.toFixed(5)}` : null;

  const timeStr = (v: string | undefined) =>
    typeof v === 'string' && v.includes('T') ? v.slice(11, 16) : (v ? String(v) : '—');
  const empName = (a: Attendance) => (typeof a.employee === 'object' && a.employee?.name ? a.employee.name : '—');
  const formatDate = (d: string) => {
    try {
      return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
    } catch {
      return d;
    }
  };

  if (loading && !employee && teamList.length === 0) {
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
      {/* My attendance — synced with web portal */}
      <Text style={styles.sectionTitle}>My attendance</Text>
      <View style={styles.card}>
          <Text style={styles.name}>{employee?.name ?? user?.name ?? 'You'}</Text>
          <Text style={styles.date}>{new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</Text>
          {todayRecord ? (
            <>
              <View style={styles.row}>
                <Text style={styles.label}>Status</Text>
                <Text style={styles.badge}>{todayRecord.status}</Text>
              </View>
              {todayRecord.checkIn && (
                <View style={styles.row}>
                  <Text style={styles.label}>Check-in</Text>
                  <Text style={styles.value}>{timeStr(todayRecord.checkIn)}</Text>
                </View>
              )}
              {todayRecord.checkOut && (
                <View style={styles.row}>
                  <Text style={styles.label}>Check-out</Text>
                  <Text style={styles.value}>{timeStr(todayRecord.checkOut)}</Text>
                </View>
              )}
              {formatCoords(todayRecord.lat, todayRecord.lng) && (
                <View style={styles.row}>
                  <Text style={styles.label}>Check-in location</Text>
                  <Text style={styles.coords}>{formatCoords(todayRecord.lat, todayRecord.lng)}</Text>
                </View>
              )}
              {todayRecord.checkOut && formatCoords(todayRecord.checkOutLat, todayRecord.checkOutLng) && (
                <View style={styles.row}>
                  <Text style={styles.label}>Check-out location</Text>
                  <Text style={styles.coords}>{formatCoords(todayRecord.checkOutLat, todayRecord.checkOutLng)}</Text>
                </View>
              )}
              {!todayRecord.checkOut && employee && (
                <TouchableOpacity style={[styles.button, submitting && styles.buttonDisabled]} onPress={handleCheckOut} disabled={submitting}>
                  <Text style={styles.buttonText}>Check out</Text>
                </TouchableOpacity>
              )}
            </>
          ) : (
            <>
              <Text style={styles.muted}>Not marked yet.</Text>
              <TouchableOpacity
                style={[styles.button, (submitting || !employee) && styles.buttonDisabled]}
                onPress={handleCheckIn}
                disabled={submitting || !employee}
              >
                <Text style={styles.buttonText}>{submitting ? '...' : 'Check in'}</Text>
              </TouchableOpacity>
              {!employee && !submitting && (
                <Text style={styles.hint}>Loading your profile… Pull down to refresh.</Text>
              )}
            </>
          )}
        </View>
      <Text style={styles.webLink}>Attendance is synced with the web portal. Check-in and check-out are geotagged when location is available.</Text>

      {/* Team attendance — program/hr/management/admin */}
      {showTeam && (
        <>
          <Text style={styles.sectionTitle}>Team attendance</Text>
          <View style={styles.filterRow}>
            <TouchableOpacity style={[styles.filterChip, teamDateFilter === 'all' && styles.filterChipSel]} onPress={() => setTeamDateFilter('all')}>
              <Text style={[styles.filterChipText, teamDateFilter === 'all' && styles.filterChipTextSel]}>All</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.filterChip, teamDateFilter === 'today' && styles.filterChipSel]} onPress={() => setTeamDateFilter('today')}>
              <Text style={[styles.filterChipText, teamDateFilter === 'today' && styles.filterChipTextSel]}>Today</Text>
            </TouchableOpacity>
          </View>
          {teamList.length === 0 ? (
            <Text style={styles.muted}>No team records yet.</Text>
          ) : (
            teamList.slice(0, 15).map((item) => (
              <View key={item._id} style={styles.teamCard}>
                <Text style={styles.teamName}>{empName(item)}</Text>
                <Text style={styles.meta}>{formatDate(item.date)}</Text>
                <View style={styles.row}>
                  <Text style={styles.badge}>{item.status}</Text>
                  {item.checkIn && <Text style={styles.time}>In: {timeStr(item.checkIn)}</Text>}
                  {item.checkOut && <Text style={styles.time}>Out: {timeStr(item.checkOut)}</Text>}
                </View>
              </View>
            ))
          )}
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
  card: { backgroundColor: '#fff', borderRadius: 8, padding: 20, marginBottom: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 4, elevation: 2 },
  name: { fontSize: 18, fontWeight: '700', color: '#1a202c', marginBottom: 4 },
  date: { fontSize: 14, color: '#718096', marginBottom: 16 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  label: { fontSize: 14, color: '#718096' },
  value: { fontSize: 14, fontWeight: '600' },
  badge: { fontSize: 12, color: '#2E3192', backgroundColor: '#e8ecf7', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, overflow: 'hidden' },
  muted: { fontSize: 14, color: '#718096', marginBottom: 16 },
  button: { backgroundColor: '#2E3192', borderRadius: 8, paddingVertical: 14, alignItems: 'center', marginTop: 8 },
  buttonDisabled: { opacity: 0.7 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  filterRow: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  filterChip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 8, backgroundColor: '#edf2f7' },
  filterChipSel: { backgroundColor: '#2E3192' },
  filterChipText: { fontSize: 14, color: '#4a5568' },
  filterChipTextSel: { color: '#fff' },
  teamCard: { backgroundColor: '#fff', borderRadius: 8, padding: 16, marginBottom: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 4, elevation: 2 },
  teamName: { fontSize: 16, fontWeight: '600', color: '#1a202c', marginBottom: 4 },
  meta: { fontSize: 13, color: '#718096', marginBottom: 8 },
  time: { fontSize: 13, color: '#4a5568' },
  coords: { fontSize: 12, color: '#4a5568', fontFamily: 'monospace' },
  webLink: { fontSize: 12, color: '#718096', marginBottom: 16, fontStyle: 'italic' },
  hint: { fontSize: 12, color: '#718096', marginTop: 8 },
});
