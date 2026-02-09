import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
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

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function MoreScreen({ navigation }: { navigation: { navigate: (a: string) => void } }) {
  const { logout, user } = useAuth();
  return (
    <View style={moreStyles.container}>
      <Text style={moreStyles.name}>{user?.name}</Text>
      <Text style={moreStyles.role}>{user?.role}</Text>
      <TouchableOpacity onPress={() => navigation.navigate('Profile')} style={moreStyles.profileBtn}>
        <Text style={moreStyles.profileBtnText}>Profile & change password</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => logout()} style={moreStyles.logoutBtn}>
        <Text style={moreStyles.logoutText}>Log out</Text>
      </TouchableOpacity>
    </View>
  );
}
const moreStyles = StyleSheet.create({
  container: { flex: 1, padding: 24, justifyContent: 'center' },
  name: { fontSize: 18, fontWeight: '600', marginBottom: 8 },
  role: { fontSize: 14, color: '#718096', marginBottom: 16 },
  profileBtn: { paddingVertical: 14, paddingHorizontal: 24, backgroundColor: '#2E3192', borderRadius: 8, alignSelf: 'flex-start', marginBottom: 16 },
  profileBtnText: { color: '#fff', fontWeight: '600', fontSize: 16 },
  logoutBtn: { paddingVertical: 14, paddingHorizontal: 24, backgroundColor: '#e53e3e', borderRadius: 8, alignSelf: 'flex-start' },
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
