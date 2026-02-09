import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { api } from '../api/client';

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
};

export function ActivitiesScreen({ navigation }: { navigation: { navigate: (a: string, b?: object) => void } }) {
  const [list, setList] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = async () => {
    const res = await api.get<Activity[]>('/activities');
    if (res.ok && Array.isArray(res.data)) setList(res.data);
  };

  useEffect(() => {
    load().finally(() => setLoading(false));
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
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
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('ActivityForm', {})}
      >
        <Text style={styles.fabText}>+ Add Activity</Text>
      </TouchableOpacity>
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
  meta: { fontSize: 13, color: '#718096', marginBottom: 8 },
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
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 16,
    left: 16,
    backgroundColor: '#2E3192',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    zIndex: 10,
  },
  fabText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});
