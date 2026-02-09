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
};

export function ExpensesScreen({ navigation }: { navigation: { navigate: (a: string, b?: object) => void } }) {
  const [list, setList] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = async () => {
    const res = await api.get<Expense[]>('/expenses');
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

  const formatDate = (d: string) => {
    try {
      return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
    } catch {
      return d;
    }
  };

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
        onPress={() => navigation.navigate('ExpenseForm', {})}
      >
        <Text style={styles.fabText}>+ Add Expense</Text>
      </TouchableOpacity>
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
              <Text style={styles.badge}>{item.status ?? 'submitted'}</Text>
            </View>
            <Text style={styles.desc} numberOfLines={2}>{item.description || item.category}</Text>
            <Text style={styles.meta}>{formatDate(item.date)} · {item.category}</Text>
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
  desc: { fontSize: 14, color: '#4a5568', marginBottom: 4 },
  meta: { fontSize: 12, color: '#718096' },
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
