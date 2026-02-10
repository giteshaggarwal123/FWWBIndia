import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Linking, Alert } from 'react-native';
import { LoginScreen } from '../screens/LoginScreen';
import { DashboardScreen } from '../screens/DashboardScreen';
import { ActivitiesScreen } from '../screens/ActivitiesScreen';
import { ActivityFormScreen } from '../screens/ActivityFormScreen';
import { ExpensesScreen } from '../screens/ExpensesScreen';
import { ExpenseFormScreen } from '../screens/ExpenseFormScreen';
import { AttendanceScreen } from '../screens/AttendanceScreen';
import { LeaveScreen } from '../screens/LeaveScreen';
import { FormsScreen } from '../screens/FormsScreen';
import { MonitoringScreen } from '../screens/MonitoringScreen';
import { MonitoringFormScreen } from '../screens/MonitoringFormScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { useAuth } from '../context/AuthContext';
import { WEB_PORTAL_URL } from '../config';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const WEB_MODULES: { label: string; path: string }[] = [
  { label: 'Dashboard', path: '/dashboard' },
  { label: 'Pending Approvals', path: '/approvals' },
  { label: 'Programs', path: '/programs' },
  { label: 'Budget', path: '/budget' },
  { label: 'Reports', path: '/reports' },
  { label: 'Documents', path: '/documents' },
  { label: 'Donor Management', path: '/donor-mgmt' },
  { label: 'User Management', path: '/user-mgmt' },
  { label: 'Audit Log', path: '/audit' },
  { label: 'Settings', path: '/settings' },
  { label: 'Employees', path: '/employees' },
  { label: 'Letters', path: '/letters' },
  { label: 'LFA', path: '/lfa' },
  { label: 'Beneficiaries', path: '/beneficiaries' },
  { label: 'Partners', path: '/partners' },
  { label: 'Form Builder', path: '/form-builder' },
  { label: 'Travel', path: '/travel' },
  { label: 'Stationery', path: '/stationery' },
  { label: 'Admin Expenses', path: '/admin-expenses' },
  { label: 'Assets', path: '/assets' },
  { label: 'Insurance', path: '/insurance' },
];

function MoreScreen({ navigation }: { navigation: { navigate: (a: string) => void } }) {
  const { logout, user } = useAuth();
  const openWeb = (path: string) => {
    if (!WEB_PORTAL_URL) {
      Alert.alert('Web portal', 'Set WEB_PORTAL_URL in app config to open the full portal in browser.');
      return;
    }
    const url = `${WEB_PORTAL_URL.replace(/\/$/, '')}${path}`;
    Linking.openURL(url).catch(() => Alert.alert('Error', 'Could not open link'));
  };
  return (
    <ScrollView style={moreStyles.container} contentContainerStyle={moreStyles.content}>
      <Text style={moreStyles.name}>{user?.name}</Text>
      <Text style={moreStyles.role}>{user?.role}</Text>
      <TouchableOpacity onPress={() => navigation.navigate('Profile')} style={moreStyles.profileBtn}>
        <Text style={moreStyles.profileBtnText}>Profile & change password</Text>
      </TouchableOpacity>
      <Text style={moreStyles.sectionTitle}>Full portal (web)</Text>
      <Text style={moreStyles.hint}>Open these in the browser. Sign in with the same account.</Text>
      {WEB_MODULES.map((m) => (
        <TouchableOpacity key={m.path} onPress={() => openWeb(m.path)} style={moreStyles.webLink}>
          <Text style={moreStyles.webLinkText}>{m.label}</Text>
        </TouchableOpacity>
      ))}
      <TouchableOpacity onPress={() => logout()} style={moreStyles.logoutBtn}>
        <Text style={moreStyles.logoutText}>Log out</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}
const moreStyles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 24, paddingBottom: 48 },
  name: { fontSize: 18, fontWeight: '600', marginBottom: 8 },
  role: { fontSize: 14, color: '#718096', marginBottom: 16 },
  profileBtn: { paddingVertical: 14, paddingHorizontal: 24, backgroundColor: '#2E3192', borderRadius: 8, alignSelf: 'flex-start', marginBottom: 24 },
  profileBtnText: { color: '#fff', fontWeight: '600', fontSize: 16 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#1a202c', marginBottom: 8 },
  hint: { fontSize: 12, color: '#718096', marginBottom: 12 },
  webLink: { paddingVertical: 12, paddingHorizontal: 4, borderBottomWidth: 1, borderBottomColor: '#e2e8f0' },
  webLinkText: { fontSize: 15, color: '#2E3192', fontWeight: '500' },
  logoutBtn: { marginTop: 24, paddingVertical: 14, paddingHorizontal: 24, backgroundColor: '#e53e3e', borderRadius: 8, alignSelf: 'flex-start' },
  logoutText: { color: '#fff', fontWeight: '600', fontSize: 16 },
});

function MainTabs() {
  const { hasPermission } = useAuth();
  const showAttendance = hasPermission('attendance');
  const showLeave = hasPermission('leave');
  const showActivities = hasPermission('activities');
  const showExpenses = hasPermission('expenses');
  const showForms = hasPermission('form-builder') || hasPermission('activities');
  const showMonitoring = hasPermission('monitoring');

  // Tab order: Home → Attendance → Leave → Activities → Expenses → Forms → Monitoring → More
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: '#2E3192',
        tabBarInactiveTintColor: '#718096',
        tabBarLabelStyle: { fontSize: 11 },
        headerStyle: { backgroundColor: '#2E3192' },
        headerTintColor: '#fff',
        headerTitleStyle: { fontWeight: '600' },
      }}
    >
      <Tab.Screen name="Home" component={DashboardScreen} options={{ title: 'Dashboard', tabBarLabel: 'Home' }} />
      {showAttendance && (
        <Tab.Screen name="Attendance" component={AttendanceScreen} options={{ title: 'Attendance', tabBarLabel: 'Attendance' }} />
      )}
      {showLeave && (
        <Tab.Screen name="Leave" component={LeaveScreen} options={{ title: 'Leave', tabBarLabel: 'Leave' }} />
      )}
      {showActivities && (
        <Tab.Screen name="Activities" component={ActivitiesScreen} options={{ title: 'Activities', tabBarLabel: 'Activities' }} />
      )}
      {showExpenses && (
        <Tab.Screen name="Expenses" component={ExpensesScreen} options={{ title: 'Expenses', tabBarLabel: 'Expenses' }} />
      )}
      {showForms && (
        <Tab.Screen name="Forms" component={FormsScreen} options={{ title: 'Data Collection', tabBarLabel: 'Forms' }} />
      )}
      {showMonitoring && (
        <Tab.Screen name="Monitoring" component={MonitoringScreen} options={{ title: 'Monitoring', tabBarLabel: 'Monitoring' }} />
      )}
      <Tab.Screen name="More" component={MoreScreen} options={{ title: 'More', tabBarLabel: 'More' }} />
    </Tab.Navigator>
  );
}

export function AppNavigator() {
  const { user, loading } = useAuth();

  if (loading) {
    return <Text style={{ flex: 1, textAlign: 'center', marginTop: 48 }}>Loading...</Text>;
  }

  return (
    <NavigationContainer>
      {!user ? (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Login" component={LoginScreen} />
        </Stack.Navigator>
      ) : (
        <Stack.Navigator
          screenOptions={{
            headerStyle: { backgroundColor: '#2E3192' },
            headerTintColor: '#fff',
            headerTitleStyle: { fontWeight: '600' },
          }}
        >
          <Stack.Screen name="Main" component={MainTabs} options={{ headerShown: false }} />
          <Stack.Screen name="ActivityForm" component={ActivityFormScreen} options={{ title: 'Activity' }} />
          <Stack.Screen name="ExpenseForm" component={ExpenseFormScreen} options={{ title: 'Expense' }} />
          <Stack.Screen name="MonitoringForm" component={MonitoringFormScreen} options={{ title: 'Monitoring Entry' }} />
          <Stack.Screen name="Profile" component={ProfileScreen} options={{ title: 'Profile' }} />
        </Stack.Navigator>
      )}
    </NavigationContainer>
  );
}
