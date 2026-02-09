import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  SectionList,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
  TextInput,
  ScrollView,
  Alert,
} from 'react-native';
import { api } from '../api/client';
import { getCurrentCoords } from '../utils/location';

type Form = {
  _id: string;
  title: string;
  description?: string;
  fields?: { key: string; label: string; type: string }[];
  project?: { _id: string; name: string };
};
type MySubmission = {
  _id: string;
  form: string;
  formTitle?: string;
  project?: { _id: string; name: string };
  submittedBy?: { name: string };
  data: Record<string, unknown>;
  createdAt: string;
};

export function FormsScreen({ navigation }: { navigation: { navigate: (a: string, b?: object) => void } }) {
  const [list, setList] = useState<Form[]>([]);
  const [mySubmissions, setMySubmissions] = useState<MySubmission[]>([]);
  const [showMySubmissions, setShowMySubmissions] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedForm, setSelectedForm] = useState<Form | null>(null);
  const [values, setValues] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  const load = async () => {
    const [formsRes, myRes] = await Promise.all([
      api.get<Form[]>('/forms'),
      api.get<MySubmission[]>('/forms/my-submissions'),
    ]);
    setList(Array.isArray(formsRes.data) ? formsRes.data : []);
    setMySubmissions(Array.isArray(myRes.data) ? myRes.data : []);
  };

  useEffect(() => {
    load().finally(() => setLoading(false));
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await load();
    setSelectedForm(null);
    setRefreshing(false);
  };

  // Group forms by project (for multiple projects)
  const sections = (() => {
    const byProject = new Map<string, Form[]>();
    for (const f of list) {
      const name = (f.project?.name ?? 'Other') as string;
      if (!byProject.has(name)) byProject.set(name, []);
      byProject.get(name)!.push(f);
    }
    return Array.from(byProject.entries()).map(([title, data]) => ({ title, data }));
  })();

  const openForm = (form: Form) => {
    setSelectedForm(form);
    const initial: Record<string, string> = {};
    form.fields?.forEach((f) => { initial[f.key] = ''; });
    setValues(initial);
  };

  const handleSubmit = async () => {
    if (!selectedForm) return;
    setSubmitting(true);
    const coords = await getCurrentCoords();
    const payload: { data: Record<string, string>; lat?: number; lng?: number } = { data: values };
    if (coords) {
      payload.lat = coords.lat;
      payload.lng = coords.lng;
    }
    const res = await api.post(`/forms/${selectedForm._id}/submit`, payload);
    setSubmitting(false);
    if (res.ok) {
      Alert.alert('Submitted', 'Your response has been submitted.' + (coords ? ' Location was recorded.' : ''));
      setSelectedForm(null);
    } else {
      Alert.alert('Error', 'Could not submit. Try again.');
    }
  };

  if (loading && list.length === 0) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#2E3192" />
      </View>
    );
  }

  if (selectedForm) {
    return (
      <ScrollView style={styles.container} contentContainerStyle={styles.formContent}>
        <Text style={styles.formTitle}>{selectedForm.title}</Text>
        {selectedForm.project?.name ? <Text style={styles.projectTag}>{selectedForm.project.name}</Text> : null}
        {selectedForm.description ? <Text style={styles.formDesc}>{selectedForm.description}</Text> : null}
        {selectedForm.fields?.map((f) => (
          <View key={f.key} style={styles.fieldWrap}>
            <Text style={styles.fieldLabel}>{f.label} {f.type === 'select' ? '' : ''}</Text>
            {f.type === 'textarea' ? (
              <TextInput
                style={[styles.input, styles.textArea]}
                value={values[f.key] ?? ''}
                onChangeText={(t) => setValues((v) => ({ ...v, [f.key]: t }))}
                placeholder={`Enter ${f.label}`}
                placeholderTextColor="#718096"
                multiline
              />
            ) : (
              <TextInput
                style={styles.input}
                value={values[f.key] ?? ''}
                onChangeText={(t) => setValues((v) => ({ ...v, [f.key]: t }))}
                placeholder={`Enter ${f.label}`}
                placeholderTextColor="#718096"
                keyboardType={f.type === 'number' ? 'numeric' : 'default'}
              />
            )}
          </View>
        ))}
        <View style={styles.row}>
          <TouchableOpacity style={styles.cancelBtn} onPress={() => setSelectedForm(null)}>
            <Text style={styles.cancelBtnText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.submitBtn, submitting && styles.buttonDisabled]}
            onPress={handleSubmit}
            disabled={submitting}
          >
            <Text style={styles.submitBtnText}>{submitting ? '...' : 'Submit'}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.toggleRow}>
        <TouchableOpacity
          style={[styles.toggleBtn, !showMySubmissions && styles.toggleBtnActive]}
          onPress={() => setShowMySubmissions(false)}
        >
          <Text style={[styles.toggleBtnText, !showMySubmissions && styles.toggleBtnTextActive]}>Fill forms</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.toggleBtn, showMySubmissions && styles.toggleBtnActive]}
          onPress={() => setShowMySubmissions(true)}
        >
          <Text style={[styles.toggleBtnText, showMySubmissions && styles.toggleBtnTextActive]}>My submissions</Text>
        </TouchableOpacity>
      </View>

      {showMySubmissions ? (
        <FlatList
          data={mySubmissions}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.list}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          ListEmptyComponent={
            <Text style={styles.empty}>No submissions yet. Submit forms from the &quot;Fill forms&quot; tab.</Text>
          }
          renderItem={({ item }) => (
            <View style={styles.submissionCard}>
              <Text style={styles.submissionFormTitle}>{item.formTitle ?? 'Form'}</Text>
              {item.project?.name ? <Text style={styles.submissionProject}>{item.project.name}</Text> : null}
              <Text style={styles.submissionDate}>
                {new Date(item.createdAt).toLocaleDateString(undefined, { dateStyle: 'medium' })} at{' '}
                {new Date(item.createdAt).toLocaleTimeString(undefined, { timeStyle: 'short' })}
              </Text>
              {Object.keys(item.data || {}).length > 0 && (
                <Text style={styles.submissionPreview} numberOfLines={2}>
                  {Object.entries(item.data as Record<string, unknown>)
                    .slice(0, 2)
                    .map(([k, v]) => `${k}: ${String(v)}`)
                    .join(' · ')}
                </Text>
              )}
            </View>
          )}
        />
      ) : (
        <SectionList
          sections={sections}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.list}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          ListEmptyComponent={
            <Text style={styles.empty}>No data collection forms yet. Program team creates forms on the web portal.</Text>
          }
          renderSectionHeader={({ section: { title } }) => (
            <Text style={styles.sectionHeader}>{title}</Text>
          )}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.card} onPress={() => openForm(item)} activeOpacity={0.7}>
              <Text style={styles.cardTitle}>{item.title}</Text>
              {item.description ? <Text style={styles.cardDesc} numberOfLines={2}>{item.description}</Text> : null}
              <Text style={styles.cardMeta}>{item.fields?.length ?? 0} fields · Tap to fill</Text>
            </TouchableOpacity>
          )}
          stickySectionHeadersEnabled={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  toggleRow: { flexDirection: 'row', paddingHorizontal: 16, paddingTop: 12, paddingBottom: 8, gap: 8 },
  toggleBtn: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 8, backgroundColor: '#e2e8f0' },
  toggleBtnActive: { backgroundColor: '#2E3192' },
  toggleBtnText: { fontSize: 14, fontWeight: '600', color: '#4a5568' },
  toggleBtnTextActive: { color: '#fff' },
  list: { padding: 16, paddingTop: 8 },
  sectionHeader: { fontSize: 14, fontWeight: '700', color: '#2E3192', marginTop: 16, marginBottom: 8 },
  empty: { textAlign: 'center', color: '#718096', marginTop: 24, paddingHorizontal: 16 },
  card: { backgroundColor: '#fff', borderRadius: 8, padding: 16, marginBottom: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 4, elevation: 2 },
  cardTitle: { fontSize: 16, fontWeight: '600', marginBottom: 4 },
  cardDesc: { fontSize: 14, color: '#718096', marginBottom: 4 },
  cardMeta: { fontSize: 12, color: '#2E3192' },
  submissionCard: { backgroundColor: '#fff', borderRadius: 8, padding: 16, marginBottom: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 4, elevation: 2 },
  submissionFormTitle: { fontSize: 16, fontWeight: '600', marginBottom: 4 },
  submissionProject: { fontSize: 12, color: '#2E3192', marginBottom: 4 },
  submissionDate: { fontSize: 13, color: '#718096', marginBottom: 4 },
  submissionPreview: { fontSize: 12, color: '#4a5568', fontStyle: 'italic' },
  formContent: { padding: 16, paddingBottom: 32 },
  formTitle: { fontSize: 20, fontWeight: '700', marginBottom: 8 },
  projectTag: { fontSize: 12, color: '#2E3192', marginBottom: 4 },
  formDesc: { fontSize: 14, color: '#718096', marginBottom: 20 },
  fieldWrap: { marginBottom: 16 },
  fieldLabel: { fontSize: 14, fontWeight: '600', color: '#4a5568', marginBottom: 6 },
  input: { borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 8, paddingHorizontal: 14, paddingVertical: 12, fontSize: 16, color: '#1a202c' },
  textArea: { minHeight: 80, textAlignVertical: 'top' },
  row: { flexDirection: 'row', gap: 12, marginTop: 24 },
  cancelBtn: { flex: 1, paddingVertical: 14, alignItems: 'center', borderRadius: 8, borderWidth: 1, borderColor: '#e2e8f0' },
  cancelBtnText: { color: '#4a5568', fontWeight: '600' },
  submitBtn: { flex: 1, paddingVertical: 14, alignItems: 'center', borderRadius: 8, backgroundColor: '#2E3192' },
  submitBtnText: { color: '#fff', fontWeight: '600' },
  buttonDisabled: { opacity: 0.7 },
});
