import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AuthNavigator from './AuthNavigator';
import ProfileScreen from '../screens/profile/ProfileScreen';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { useAuth } from '../hooks/useAuth';
import theme from '../styles/theme';

const Stack = createNativeStackNavigator();

/**
 * AppNavigator
 * Protected Navigation Architecture:
 * - Shows LoadingSpinner while session is initializing.
 * - Renders ProfileScreen when authenticated (session !== null).
 * - Renders AuthNavigator when unauthenticated (session === null).
 */
const AppNavigator = () => {
  const { session, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner fullScreen message="Loading session..." />;
  }

  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: theme.colors.background,
        },
        headerShadowVisible: false,
        headerTintColor: theme.colors.text,
        headerTitleStyle: {
          fontWeight: theme.fontWeight.semiBold,
          fontSize: theme.fontSize.lg,
        },
        contentStyle: {
          backgroundColor: theme.colors.background,
        },
      }}
    >
      {session ? (
        <Stack.Screen
          name="Profile"
          component={ProfileScreen}
          options={{
            title: 'My Profile',
            headerBackTitleVisible: false,
          }}
        />
      ) : (
        <Stack.Screen
          name="Auth"
          component={AuthNavigator}
          options={{ headerShown: false }}
        />
      )}
    </Stack.Navigator>
  );
};

export default AppNavigator;
