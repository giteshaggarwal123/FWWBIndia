import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { api, uploadFile } from '../api/client';

type Project = { _id: string; name: string };
type Activity = { _id: string; name: string };
type Expense = {
  _id: string;
  expenseId?: string;
  project?: Project | string;
  activity?: Activity | string;
  amount?: number;
  category?: string;
  description?: string;
  date?: string;
  budgetHead?: string;
};

const CATEGORIES = [
  'Training',
  'Direct Cost - Training',
  'Support to 360 beneficiaries',
  'Partner NGOs Meet',
  'Training of Trainers',
  'Workbook/training material cost',
  'Travel',
  'Program',
  'Other',
];

export function ExpenseFormScreen({
  route,
  navigation,
}: {
  route: { params?: { expense?: Expense } };
  navigation: { goBack: () => void };
}) {
  const edit = route.params?.expense;
  const [projects, setProjects] = useState<Project[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [projectId, setProjectId] = useState<string>(
    typeof edit?.project === 'object' ? edit.project?._id ?? '' : (edit?.project as string) ?? ''
  );
  const [activityId, setActivityId] = useState<string>(
    typeof edit?.activity === 'object' ? edit.activity?._id ?? '' : (edit?.activity as string) ?? ''
  );
  const [amount, setAmount] = useState(edit?.amount?.toString() ?? '');
  const [category, setCategory] = useState(edit?.category ?? 'Training');
  const [description, setDescription] = useState(edit?.description ?? '');
  const [date, setDate] = useState(
    edit?.date
      ? new Date(edit.date).toISOString().slice(0, 10)
      : new Date().toISOString().slice(0, 10)
  );
  const [budgetHead, setBudgetHead] = useState(edit?.budgetHead ?? '');
  const [saving, setSaving] = useState(false);
  const [billFile, setBillFile] = useState<{ uri: string; name: string; mimeType: string } | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const [pRes, aRes] = await Promise.all([
          api.get<Project[]>('/projects'),
          api.get<Activity[] | { data: Activity[] }>('/activities'),
        ]);
        if (Array.isArray(pRes.data)) {
          setProjects(pRes.data);
          if (!projectId && pRes.data.length) setProjectId(pRes.data[0]._id);
        }
        const actList = Array.isArray(aRes.data) ? aRes.data : (aRes.data as { data?: Activity[] })?.data ?? [];
        if (Array.isArray(actList)) setActivities(actList);
      } catch {}
    })();
  }, []);

  useEffect(() => {
    if (!projectId) return;
    (async () => {
      try {
        const res = await api.get<Activity[] | { data: Activity[] }>(`/activities?project=${projectId}`);
        const list = Array.isArray(res.data) ? res.data : (res.data as { data?: Activity[] })?.data ?? [];
        setActivities(list);
      } catch {
        setActivities([]);
      }
    })();
  }, [projectId]);

  const pickBill = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({ type: '*/*', copyToCacheDirectory: true });
      if (result.canceled) return;
      const f = result.assets[0];
      setBillFile({ uri: f.uri, name: f.name ?? 'bill', mimeType: f.mimeType ?? 'application/octet-stream' });
    } catch {
      Alert.alert('Error', 'Could not open file picker');
    }
  };

  const handleSave = async () => {
    if (!projectId) {
      Alert.alert('Error', 'Select a project');
      return;
    }
    const amt = Number(amount);
    if (!amount || isNaN(amt) || amt <= 0) {
      Alert.alert('Error', 'Enter a valid amount');
      return;
    }
    setSaving(true);
    const body = {
      expenseId: edit?.expenseId ?? `EXP-${Date.now()}`,
      project: projectId,
      activity: activityId || undefined,
      amount: amt,
      category: category.trim(),
      description: description.trim(),
      date: new Date(date).toISOString(),
      status: edit?.status ?? 'submitted',
      budgetHead: budgetHead.trim() || undefined,
    };
    if (edit?._id) {
      const res = await api.patch<Expense>(`/expenses/${edit._id}`, body);
      setSaving(false);
      if (res.ok) {
        if (billFile) {
          const up = await uploadFile(billFile.uri, billFile.name, billFile.mimeType, 'Expense', edit._id);
          if (!up.ok) Alert.alert('Note', 'Expense saved but bill upload failed.');
        }
        navigation.goBack();
      } else {
        Alert.alert('Error', 'Failed to update expense');
      }
    } else {
      const res = await api.post<Expense>('/expenses', body);
      setSaving(false);
      if (res.ok && res.data?._id) {
        if (billFile) {
          const up = await uploadFile(billFile.uri, billFile.name, billFile.mimeType, 'Expense', res.data._id);
          if (!up.ok) Alert.alert('Note', 'Expense saved but bill upload failed.');
        }
        navigation.goBack();
      } else {
        Alert.alert('Error', 'Failed to create expense');
      }
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.label}>Project</Text>
      <View style={styles.pickerRow}>
        {projects.map((p) => (
          <TouchableOpacity
            key={p._id}
            style={[styles.chip, projectId === p._id && styles.chipSelected]}
            onPress={() => setProjectId(p._id)}
          >
            <Text style={[styles.chipText, projectId === p._id && styles.chipTextSelected]} numberOfLines={1}>
              {p.name}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      <Text style={styles.label}>Activity (optional)</Text>
      <View style={styles.pickerRow}>
        <TouchableOpacity
          style={[styles.chip, !activityId && styles.chipSelected]}
          onPress={() => setActivityId('')}
        >
          <Text style={[styles.chipText, !activityId && styles.chipTextSelected]}>— None</Text>
        </TouchableOpacity>
        {activities.slice(0, 5).map((a) => (
          <TouchableOpacity
            key={a._id}
            style={[styles.chip, activityId === a._id && styles.chipSelected]}
            onPress={() => setActivityId(a._id)}
          >
            <Text style={[styles.chipText, activityId === a._id && styles.chipTextSelected]} numberOfLines={1}>
              {a.name}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      <Text style={styles.label}>Amount (₹) *</Text>
      <TextInput
        style={styles.input}
        value={amount}
        onChangeText={setAmount}
        placeholder="0"
        keyboardType="numeric"
        placeholderTextColor="#718096"
      />
      <Text style={styles.label}>Category</Text>
      <View style={styles.pickerRow}>
        {CATEGORIES.map((c) => (
          <TouchableOpacity
            key={c}
            style={[styles.chip, category === c && styles.chipSelected]}
            onPress={() => setCategory(c)}
          >
            <Text style={[styles.chipText, category === c && styles.chipTextSelected]} numberOfLines={1}>
              {c}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      <Text style={styles.label}>Budget head (optional)</Text>
      <TextInput
        style={styles.input}
        value={budgetHead}
        onChangeText={setBudgetHead}
        placeholder="Match budget line for utilization"
        placeholderTextColor="#718096"
      />
      <Text style={styles.label}>Description</Text>
      <TextInput
        style={[styles.input, styles.textArea]}
        value={description}
        onChangeText={setDescription}
        placeholder="Brief description"
        placeholderTextColor="#718096"
        multiline
      />
      <Text style={styles.label}>Date</Text>
      <TextInput
        style={styles.input}
        value={date}
        onChangeText={setDate}
        placeholder="YYYY-MM-DD"
        placeholderTextColor="#718096"
      />
      <Text style={styles.label}>Attach bill / receipt (optional)</Text>
      <TouchableOpacity style={styles.attachBtn} onPress={pickBill}>
        <Text style={styles.attachBtnText}>{billFile ? `Selected: ${billFile.name}` : 'Pick file'}</Text>
      </TouchableOpacity>
      {billFile ? (
        <TouchableOpacity onPress={() => setBillFile(null)}>
          <Text style={styles.removeFile}>Remove attachment</Text>
        </TouchableOpacity>
      ) : null}
      <TouchableOpacity
        style={[styles.button, saving && styles.buttonDisabled]}
        onPress={handleSave}
        disabled={saving}
      >
        {saving ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>{edit ? 'Update' : 'Submit'} Expense</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 16, paddingBottom: 32 },
  label: { fontSize: 14, fontWeight: '600', color: '#4a5568', marginBottom: 6 },
  input: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    marginBottom: 16,
    color: '#1a202c',
  },
  textArea: { minHeight: 80, textAlignVertical: 'top' },
  pickerRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#edf2f7',
  },
  chipSelected: { backgroundColor: '#2E3192' },
  chipText: { fontSize: 14, color: '#4a5568' },
  chipTextSelected: { color: '#fff' },
  button: {
    backgroundColor: '#2E3192',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonDisabled: { opacity: 0.7 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  attachBtn: { borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 8, paddingVertical: 12, paddingHorizontal: 14, marginBottom: 8 },
  attachBtnText: { fontSize: 14, color: '#4a5568' },
  removeFile: { fontSize: 12, color: '#e53e3e', marginBottom: 16 },
});
