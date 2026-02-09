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
  Platform,
  Modal,
  FlatList,
} from 'react-native';
import { api } from '../api/client';
import { getCurrentCoords } from '../utils/location';

type Project = { _id: string; name: string };
type Activity = { _id: string; name: string };
type MonitoringEntry = {
  _id: string;
  entryId?: string;
  project?: Project | string;
  activity?: Activity | string;
  location?: string;
  date?: string;
  notes?: string;
  expectedParticipants?: number;
  actualParticipants?: number;
};

export function MonitoringFormScreen({
  route,
  navigation,
}: {
  route: { params?: { entry?: MonitoringEntry } };
  navigation: { goBack: () => void };
}) {
  const edit = route.params?.entry;
  const [projects, setProjects] = useState<Project[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [projectId, setProjectId] = useState<string>(
    typeof edit?.project === 'object' ? edit.project?._id ?? '' : (edit?.project as string) ?? ''
  );
  const [activityId, setActivityId] = useState<string>(
    typeof edit?.activity === 'object' ? edit.activity?._id ?? '' : (edit?.activity as string) ?? ''
  );
  const [location, setLocation] = useState(edit?.location ?? '');
  const [date, setDate] = useState(
    edit?.date
      ? new Date(edit.date).toISOString().slice(0, 10)
      : new Date().toISOString().slice(0, 10)
  );
  const [notes, setNotes] = useState(edit?.notes ?? '');
  const [expectedParticipants, setExpectedParticipants] = useState(
    edit?.expectedParticipants?.toString() ?? ''
  );
  const [actualParticipants, setActualParticipants] = useState(
    edit?.actualParticipants?.toString() ?? ''
  );
  const [saving, setSaving] = useState(false);
  const [showProjectPicker, setShowProjectPicker] = useState(false);
  const [showActivityPicker, setShowActivityPicker] = useState(false);

  useEffect(() => {
    (async () => {
      const res = await api.get<Project[]>('/projects');
      if (res.ok && Array.isArray(res.data)) {
        setProjects(res.data);
        if (!projectId && res.data.length) setProjectId(res.data[0]._id);
      }
    })();
  }, []);

  useEffect(() => {
    if (!projectId) {
      setActivities([]);
      setActivityId('');
      return;
    }
    (async () => {
      const res = await api.get<Activity[]>(`/activities?project=${projectId}`);
      if (res.ok && Array.isArray(res.data)) setActivities(res.data);
      else setActivities([]);
    })();
  }, [projectId]);

  const handleSave = async () => {
    if (!projectId) {
      Alert.alert('Error', 'Select a program');
      return;
    }
    if (!notes.trim()) {
      Alert.alert('Error', 'Notes are required');
      return;
    }
    setSaving(true);
    let lat: number | undefined;
    let lng: number | undefined;
    try {
      const coords = await getCurrentCoords();
      if (coords) {
        lat = coords.latitude;
        lng = coords.longitude;
      }
    } catch {
      // ignore
    }
    const body = {
      entryId: edit?.entryId ?? `MON-${Date.now()}`,
      project: projectId,
      activity: activityId || undefined,
      location: location.trim() || undefined,
      date: date ? new Date(date).toISOString() : new Date().toISOString(),
      notes: notes.trim(),
      expectedParticipants: expectedParticipants ? Number(expectedParticipants) : undefined,
      actualParticipants: actualParticipants ? Number(actualParticipants) : undefined,
      lat,
      lng,
    };
    if (edit?._id) {
      const res = await api.patch(`/monitoring/${edit._id}`, body);
      setSaving(false);
      if (res.ok) navigation.goBack();
      else Alert.alert('Error', 'Failed to update entry');
    } else {
      const res = await api.post('/monitoring', body);
      setSaving(false);
      if (res.ok) navigation.goBack();
      else Alert.alert('Error', 'Failed to add entry');
    }
  };

  const selectedProjectName = projects.find((p) => p._id === projectId)?.name ?? 'Select program';
  const selectedActivityName = activities.find((a) => a._id === activityId)?.name ?? 'None';

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.label}>Program *</Text>
      <TouchableOpacity style={styles.picker} onPress={() => setShowProjectPicker(true)}>
        <Text style={styles.pickerText}>{selectedProjectName}</Text>
      </TouchableOpacity>
      <Modal visible={showProjectPicker} transparent animationType="slide">
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setShowProjectPicker(false)}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select program</Text>
            <FlatList
              data={projects}
              keyExtractor={(p) => p._id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.modalOption}
                  onPress={() => { setProjectId(item._id); setShowProjectPicker(false); }}
                >
                  <Text>{item.name}</Text>
                </TouchableOpacity>
              )}
            />
            <TouchableOpacity style={styles.modalCancel} onPress={() => setShowProjectPicker(false)}>
              <Text style={styles.modalCancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      <Text style={styles.label}>Activity (optional)</Text>
      <TouchableOpacity style={styles.picker} onPress={() => setShowActivityPicker(true)}>
        <Text style={styles.pickerText}>{selectedActivityName}</Text>
      </TouchableOpacity>
      <Modal visible={showActivityPicker} transparent animationType="slide">
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setShowActivityPicker(false)}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select activity</Text>
            <TouchableOpacity
              style={styles.modalOption}
              onPress={() => { setActivityId(''); setShowActivityPicker(false); }}
            >
              <Text>None</Text>
            </TouchableOpacity>
            <FlatList
              data={activities}
              keyExtractor={(a) => a._id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.modalOption}
                  onPress={() => { setActivityId(item._id); setShowActivityPicker(false); }}
                >
                  <Text>{item.name}</Text>
                </TouchableOpacity>
              )}
            />
            <TouchableOpacity style={styles.modalCancel} onPress={() => setShowActivityPicker(false)}>
              <Text style={styles.modalCancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      <Text style={styles.label}>Location</Text>
      <TextInput
        style={styles.input}
        value={location}
        onChangeText={setLocation}
        placeholder="e.g. Phesama - Nagaland"
        placeholderTextColor="#9ca3af"
      />

      <Text style={styles.label}>Date *</Text>
      <TextInput
        style={styles.input}
        value={date}
        onChangeText={setDate}
        placeholder="YYYY-MM-DD"
        placeholderTextColor="#9ca3af"
      />

      <Text style={styles.label}>Notes *</Text>
      <TextInput
        style={[styles.input, styles.textArea]}
        value={notes}
        onChangeText={setNotes}
        placeholder="Field visit observations, outcomes..."
        placeholderTextColor="#9ca3af"
        multiline
        numberOfLines={4}
      />

      <Text style={styles.label}>Expected participants</Text>
      <TextInput
        style={styles.input}
        value={expectedParticipants}
        onChangeText={setExpectedParticipants}
        placeholder="0"
        placeholderTextColor="#9ca3af"
        keyboardType={Platform.OS === 'web' ? 'numeric' : 'number-pad'}
      />

      <Text style={styles.label}>Actual participants</Text>
      <TextInput
        style={styles.input}
        value={actualParticipants}
        onChangeText={setActualParticipants}
        placeholder="0"
        placeholderTextColor="#9ca3af"
        keyboardType={Platform.OS === 'web' ? 'numeric' : 'number-pad'}
      />

      <TouchableOpacity
        style={[styles.btn, saving && styles.btnDisabled]}
        onPress={handleSave}
        disabled={saving}
      >
        {saving ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.btnText}>{edit ? 'Update' : 'Add'} Entry</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 16, paddingBottom: 32 },
  label: { fontSize: 14, fontWeight: '600', marginBottom: 6, color: '#374151' },
  input: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 16,
    backgroundColor: '#fff',
  },
  textArea: { minHeight: 100, textAlignVertical: 'top' },
  picker: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    backgroundColor: '#fff',
    minHeight: 48,
    justifyContent: 'center',
  },
  pickerText: { fontSize: 16, color: '#111827' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#fff', borderTopLeftRadius: 16, borderTopRightRadius: 16, maxHeight: '70%', padding: 16 },
  modalTitle: { fontSize: 18, fontWeight: '600', marginBottom: 12 },
  modalOption: { padding: 16, borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
  modalCancel: { marginTop: 12, padding: 16, alignItems: 'center' },
  modalCancelText: { color: '#6b7280', fontSize: 16 },
  btn: {
    backgroundColor: '#2E3192',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  btnDisabled: { opacity: 0.7 },
  btnText: { color: '#fff', fontWeight: '600', fontSize: 16 },
});
