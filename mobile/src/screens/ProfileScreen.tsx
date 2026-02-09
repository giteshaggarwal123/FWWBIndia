import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';

export function ProfileScreen() {
  const { user } = useAuth();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      Alert.alert('Error', 'New passwords do not match');
      return;
    }
    if (newPassword.length < 6) {
      Alert.alert('Error', 'New password must be at least 6 characters');
      return;
    }
    setLoading(true);
    const res = await api.post<{ message?: string }>('/auth/change-password', {
      currentPassword,
      newPassword,
    });
    setLoading(false);
    if (res.ok) {
      Alert.alert('Success', 'Password updated');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } else {
      const msg = (res.data as { message?: string })?.message || 'Failed to change password';
      Alert.alert('Error', msg);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.label}>Name</Text>
        <Text style={styles.value}>{user?.name ?? '—'}</Text>
      </View>
      <View style={styles.section}>
        <Text style={styles.label}>Username</Text>
        <Text style={styles.value}>{user?.username ?? '—'}</Text>
      </View>
      <View style={styles.section}>
        <Text style={styles.label}>Role</Text>
        <Text style={styles.value}>{user?.role ?? '—'}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Change password</Text>
        <Text style={styles.hint}>Only when using database login. Demo users cannot change password here.</Text>
        <TextInput
          style={styles.input}
          value={currentPassword}
          onChangeText={setCurrentPassword}
          placeholder="Current password"
          placeholderTextColor="#9ca3af"
          secureTextEntry
        />
        <TextInput
          style={styles.input}
          value={newPassword}
          onChangeText={setNewPassword}
          placeholder="New password (min 6)"
          placeholderTextColor="#9ca3af"
          secureTextEntry
        />
        <TextInput
          style={styles.input}
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          placeholder="Confirm new password"
          placeholderTextColor="#9ca3af"
          secureTextEntry
        />
        <TouchableOpacity
          style={[styles.btn, loading && styles.btnDisabled]}
          onPress={handleChangePassword}
          disabled={loading}
        >
          <Text style={styles.btnText}>{loading ? 'Updating...' : 'Update password'}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24 },
  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 18, fontWeight: '600', marginBottom: 8 },
  label: { fontSize: 13, color: '#718096', marginBottom: 4 },
  value: { fontSize: 16, color: '#111827' },
  hint: { fontSize: 12, color: '#718096', marginBottom: 12 },
  input: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 12,
    backgroundColor: '#fff',
  },
  btn: {
    backgroundColor: '#2E3192',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  btnDisabled: { opacity: 0.7 },
  btnText: { color: '#fff', fontWeight: '600' },
});
