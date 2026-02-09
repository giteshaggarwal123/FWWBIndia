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
import { api } from '../api/client';

type Project = { _id: string; name: string };
type Activity = {
  _id: string;
  activityId?: string;
  name?: string;
  project?: Project | string;
  budget?: number;
  status?: string;
  location?: string;
  expectedParticipants?: number;
  actualParticipants?: number;
  quarter?: string;
  budgetHead?: string;
};

const STATUS_OPTIONS = ['planned', 'in-progress', 'completed', 'delayed'];

export function ActivityFormScreen({
  route,
  navigation,
}: {
  route: { params?: { activity?: Activity } };
  navigation: { goBack: () => void };
}) {
  const edit = route.params?.activity;
  const [projects, setProjects] = useState<Project[]>([]);
  const [activityId, setActivityId] = useState(edit?.activityId ?? '');
  const [name, setName] = useState(edit?.name ?? '');
  const [projectId, setProjectId] = useState<string>(
    typeof edit?.project === 'object' ? edit.project?._id ?? '' : (edit?.project as string) ?? ''
  );
  const [budget, setBudget] = useState(edit?.budget?.toString() ?? '');
  const [status, setStatus] = useState(edit?.status ?? 'planned');
  const [location, setLocation] = useState(edit?.location ?? '');
  const [expectedParticipants, setExpectedParticipants] = useState(
    edit?.expectedParticipants?.toString() ?? ''
  );
  const [actualParticipants, setActualParticipants] = useState(
    edit?.actualParticipants?.toString() ?? ''
  );
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      const res = await api.get<Project[]>('/projects');
      if (res.ok && Array.isArray(res.data)) setProjects(res.data);
      if (!projectId && res.data?.length) setProjectId(res.data[0]._id);
    })();
  }, []);

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Activity name is required');
      return;
    }
    if (!projectId) {
      Alert.alert('Error', 'Select a project');
      return;
    }
    setSaving(true);
    const body = {
      activityId: activityId.trim() || `ACT-${Date.now()}`,
      name: name.trim(),
      project: projectId,
      budget: budget ? Number(budget) : 0,
      status,
      location: location.trim() || undefined,
      expectedParticipants: expectedParticipants ? Number(expectedParticipants) : undefined,
      actualParticipants: actualParticipants ? Number(actualParticipants) : undefined,
    };
    if (edit?._id) {
      const res = await api.patch(`/activities/${edit._id}`, body);
      setSaving(false);
      if (res.ok) navigation.goBack();
      else Alert.alert('Error', 'Failed to update activity');
    } else {
      const res = await api.post('/activities', body);
      setSaving(false);
      if (res.ok) navigation.goBack();
      else Alert.alert('Error', 'Failed to create activity');
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.label}>Activity ID</Text>
      <TextInput
        style={styles.input}
        value={activityId}
        onChangeText={setActivityId}
        placeholder="e.g. SUPRAJA-2024-008"
        placeholderTextColor="#718096"
        editable={!edit}
      />
      <Text style={styles.label}>Name *</Text>
      <TextInput
        style={styles.input}
        value={name}
        onChangeText={setName}
        placeholder="Activity name"
        placeholderTextColor="#718096"
      />
      <Text style={styles.label}>Project</Text>
      <View style={styles.pickerRow}>
        {projects.map((p) => (
          <TouchableOpacity
            key={p._id}
            style={[styles.chip, projectId === p._id && styles.chipSelected]}
            onPress={() => setProjectId(p._id)}
          >
            <Text style={[styles.chipText, projectId === p._id && styles.chipTextSelected]}>
              {p.name}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      <Text style={styles.label}>Budget (₹)</Text>
      <TextInput
        style={styles.input}
        value={budget}
        onChangeText={setBudget}
        placeholder="0"
        keyboardType="numeric"
        placeholderTextColor="#718096"
      />
      <Text style={styles.label}>Status</Text>
      <View style={styles.pickerRow}>
        {STATUS_OPTIONS.map((s) => (
          <TouchableOpacity
            key={s}
            style={[styles.chip, status === s && styles.chipSelected]}
            onPress={() => setStatus(s)}
          >
            <Text style={[styles.chipText, status === s && styles.chipTextSelected]}>{s}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <Text style={styles.label}>Location</Text>
      <TextInput
        style={styles.input}
        value={location}
        onChangeText={setLocation}
        placeholder="e.g. Ahmedabad - Gujarat"
        placeholderTextColor="#718096"
      />
      <Text style={styles.label}>Expected / Actual participants</Text>
      <View style={styles.row}>
        <TextInput
          style={[styles.input, styles.half]}
          value={expectedParticipants}
          onChangeText={setExpectedParticipants}
          placeholder="Expected"
          keyboardType="numeric"
          placeholderTextColor="#718096"
        />
        <TextInput
          style={[styles.input, styles.half]}
          value={actualParticipants}
          onChangeText={setActualParticipants}
          placeholder="Actual"
          keyboardType="numeric"
          placeholderTextColor="#718096"
        />
      </View>
      <TouchableOpacity
        style={[styles.button, saving && styles.buttonDisabled]}
        onPress={handleSave}
        disabled={saving}
      >
        {saving ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>{edit ? 'Update' : 'Create'} Activity</Text>
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
  half: { flex: 1 },
  row: { flexDirection: 'row', gap: 12 },
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
});
