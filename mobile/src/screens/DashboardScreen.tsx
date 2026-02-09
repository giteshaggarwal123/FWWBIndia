import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, TouchableOpacity } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';

type DashboardData = {
  activityCount?: number;
  projectCount?: number;
  expenseCount?: number;
  totalAllocated?: number;
  totalSpent?: number;
};

type MyDashboardData = {
  employee?: { name?: string };
  myAttendanceCount?: number;
  myLeaveCount?: number;
  myFormSubmissionsCount?: number;
  pendingLeave?: number;
};

export function DashboardScreen() {
  const { user, logout } = useAuth();
  const [data, setData] = useState<DashboardData | null>(null);
  const [myData, setMyData] = useState<MyDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = async () => {
    const [res, meRes] = await Promise.all([
      api.get<DashboardData>('/dashboard'),
      api.get<MyDashboardData>('/dashboard/me'),
    ]);
    if (res.ok && res.data) setData(res.data);
    if (meRes.ok && meRes.data) setMyData(meRes.data);
  };

  useEffect(() => {
    load().finally(() => setLoading(false));
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  if (loading && !data && !myData) {
    return (
      <View style={styles.centered}>
        <Text style={styles.muted}>Loading...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <Text style={styles.welcome}>Hello, {user?.name ?? user?.username}</Text>
      <Text style={styles.role}>{user?.role}</Text>

      {/* Field-team: my data analytics */}
      {myData && (
        <>
          <Text style={styles.sectionTitle}>My analytics</Text>
          <Text style={styles.webLink}>Attendance, leave and forms are synced with the web portal. View on desktop for full reports.</Text>
          <View style={styles.grid}>
            <View style={styles.card}>
              <Text style={styles.cardLabel}>My form submissions</Text>
              <Text style={styles.cardValue}>{myData.myFormSubmissionsCount ?? 0}</Text>
            </View>
            <View style={styles.card}>
              <Text style={styles.cardLabel}>Attendance (this month)</Text>
              <Text style={styles.cardValue}>{myData.myAttendanceCount ?? 0}</Text>
            </View>
            <View style={styles.card}>
              <Text style={styles.cardLabel}>My leave requests</Text>
              <Text style={styles.cardValue}>{myData.myLeaveCount ?? 0}</Text>
            </View>
            <View style={styles.card}>
              <Text style={styles.cardLabel}>Pending leave</Text>
              <Text style={styles.cardValue}>{myData.pendingLeave ?? 0}</Text>
            </View>
          </View>
        </>
      )}

      <Text style={styles.sectionTitle}>Organization</Text>
      <View style={styles.grid}>
        <View style={styles.card}>
          <Text style={styles.cardLabel}>Projects</Text>
          <Text style={styles.cardValue}>{data?.projectCount ?? 0}</Text>
        </View>
        <View style={styles.card}>
          <Text style={styles.cardLabel}>Activities</Text>
          <Text style={styles.cardValue}>{data?.activityCount ?? 0}</Text>
        </View>
        <View style={styles.card}>
          <Text style={styles.cardLabel}>Expenses</Text>
          <Text style={styles.cardValue}>{data?.expenseCount ?? 0}</Text>
        </View>
        <View style={styles.card}>
          <Text style={styles.cardLabel}>Allocated</Text>
          <Text style={[styles.cardValue, styles.small]} numberOfLines={1}>
            ₹{((data?.totalAllocated ?? 0) / 100000).toFixed(1)}L
          </Text>
        </View>
        <View style={styles.card}>
          <Text style={styles.cardLabel}>Spent</Text>
          <Text style={[styles.cardValue, styles.small]} numberOfLines={1}>
            ₹{((data?.totalSpent ?? 0) / 100000).toFixed(1)}L
          </Text>
        </View>
      </View>

      <Text style={styles.muted}>
        Use the tabs below: mark attendance, apply leave, submit forms, or add activities & expenses (based on your role). Data syncs with the web portal.
      </Text>
      <TouchableOpacity style={styles.logout} onPress={() => logout()}>
        <Text style={styles.logoutText}>Log out</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 16, paddingBottom: 32 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  welcome: { fontSize: 22, fontWeight: '700', color: '#1a202c', marginBottom: 4 },
  role: { fontSize: 14, color: '#718096', marginBottom: 20 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#1a202c', marginBottom: 8, marginTop: 8 },
  webLink: { fontSize: 12, color: '#718096', fontStyle: 'italic', marginBottom: 12 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 24 },
  card: {
    width: '48%',
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  cardLabel: { fontSize: 12, color: '#718096', marginBottom: 4 },
  cardValue: { fontSize: 20, fontWeight: '700', color: '#2E3192' },
  small: { fontSize: 16 },
  muted: { fontSize: 13, color: '#718096', lineHeight: 20, marginBottom: 24 },
  logout: { alignSelf: 'center', paddingVertical: 12, paddingHorizontal: 20 },
  logoutText: { fontSize: 14, color: '#e53e3e', fontWeight: '600' },
});
