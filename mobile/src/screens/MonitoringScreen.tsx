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
} from 'react-native';
import { api } from '../api/client';

type ProjectRef = { _id: string; name?: string };
type Project = { _id: string; name: string };
type ActivityRef = { _id: string; name?: string };
type MonitoringEntry = {
  _id: string;
  entryId: string;
  project: ProjectRef | string;
  activity?: ActivityRef | string;
  location?: string;
  date: string;
  notes?: string;
  expectedParticipants?: number;
  actualParticipants?: number;
  collectedBy?: { name?: string };
};

export function MonitoringScreen({ navigation }: { navigation: { navigate: (a: string) => void } }) {
  const [list, setList] = useState<MonitoringEntry[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [projectFilter, setProjectFilter] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = async () => {
    const [monRes, projRes] = await Promise.all([
      api.get<MonitoringEntry[]>(projectFilter ? `/monitoring?project=${projectFilter}` : '/monitoring'),
      api.get<Project[]>('/projects'),
    ]);
    if (monRes.ok && Array.isArray(monRes.data)) setList(monRes.data);
    if (projRes.ok && Array.isArray(projRes.data)) setProjects(projRes.data);
  };

  useEffect(() => {
    load().finally(() => setLoading(false));
  }, [projectFilter]);

  const onRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  const projectName = (e: MonitoringEntry) =>
    typeof e.project === 'object' && e.project?.name ? e.project.name : '—';
  const activityName = (e: MonitoringEntry) =>
    typeof e.activity === 'object' && e.activity?.name ? e.activity.name : (e.activity ? String(e.activity) : '—');

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
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('MonitoringForm')}
      >
        <Text style={styles.fabText}>+ Add Entry</Text>
      </TouchableOpacity>
      <FlatList
        data={list}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={<Text style={styles.empty}>No monitoring entries. Add one from the field.</Text>}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() => navigation.navigate('MonitoringForm', { entry: item })}
            activeOpacity={0.7}
          >
            <Text style={styles.entryId}>{item.entryId || item._id}</Text>
            <Text style={styles.meta}>{projectName(item)} · {activityName(item)}</Text>
            {item.location ? <Text style={styles.location}>{item.location}</Text> : null}
            <Text style={styles.date}>{item.date ? new Date(item.date).toLocaleDateString() : '—'}</Text>
            {item.notes ? <Text style={styles.notes} numberOfLines={2}>{item.notes}</Text> : null}
            <Text style={styles.collected}>By {item.collectedBy?.name ?? '—'}</Text>
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
    borderLeftWidth: 4,
    borderLeftColor: '#2E3192',
  },
  entryId: { fontSize: 14, fontWeight: '600', color: '#2E3192', marginBottom: 4 },
  meta: { fontSize: 13, color: '#4a5568', marginBottom: 4 },
  location: { fontSize: 12, color: '#718096', marginBottom: 2 },
  date: { fontSize: 12, color: '#718096', marginBottom: 4 },
  notes: { fontSize: 12, color: '#4a5568', fontStyle: 'italic', marginTop: 4 },
  collected: { fontSize: 11, color: '#718096', marginTop: 6 },
  empty: { textAlign: 'center', color: '#718096', padding: 24 },
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 24,
    backgroundColor: '#2E3192',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    zIndex: 10,
  },
  fabText: { color: '#fff', fontWeight: '600', fontSize: 14 },
});
