import React, { useState } from 'react';
import {
  View,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import theme from '../../styles/theme';
import AppText from '../../components/common/AppText';
import AppInput from '../../components/common/AppInput';
import AppButton from '../../components/common/AppButton';
import ErrorMessage from '../../components/common/ErrorMessage';
import { useAuth } from '../../hooks/useAuth';
import { isValidEmail, formatAuthError } from '../../utils/validation';

const LoginScreen = ({ navigation }) => {
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const validateForm = () => {
    const trimmedEmail = email.trim();

    if (!trimmedEmail) {
      setError('Email address is required.');
      return false;
    }

    if (!isValidEmail(trimmedEmail)) {
      setError('Please enter a valid email address.');
      return false;
    }

    if (!password) {
      setError('Password is required.');
      return false;
    }

    return true;
  };

  const handleLogin = async () => {
    setError('');

    if (!validateForm()) return;

    setLoading(true);

    try {
      const { error: authError } = await signIn(email, password);

      setLoading(false);

      if (authError) {
        setError(formatAuthError(authError));
        return;
      }
    } catch (err) {
      setLoading(false);
      setError(formatAuthError(err));
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.headerContainer}>
          <View style={styles.logoBadge}>
            <AppText style={styles.logoText}>⚡</AppText>
          </View>
          <AppText variant="title" style={styles.title}>
            Welcome Back
          </AppText>
          <AppText variant="subheading" style={styles.subtitle}>
            Sign in to manage your profile.
          </AppText>
        </View>

        <ErrorMessage message={error} onDismiss={() => setError('')} />

        <View style={styles.formContainer}>
          <AppInput
            label="Email"
            value={email}
            onChangeText={(text) => {
              setEmail(text);
              if (error) setError('');
            }}
            placeholder="Enter your email"
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <AppInput
            label="Password"
            value={password}
            onChangeText={(text) => {
              setPassword(text);
              if (error) setError('');
            }}
            placeholder="Enter your password"
            secureTextEntry
          />

          <AppButton
            title="Login"
            onPress={handleLogin}
            loading={loading}
            disabled={loading}
            style={styles.loginButton}
          />
        </View>

        <View style={styles.footerContainer}>
          <View style={styles.registerRow}>
            <AppText variant="body" color={theme.colors.textSecondary}>
              Don't have an account?{' '}
            </AppText>
            <TouchableOpacity
              onPress={() => navigation.navigate('Register')}
              accessibilityRole="button"
              accessibilityLabel="Navigate to Register screen"
            >
              <AppText
                variant="body"
                color={theme.colors.primary}
                style={styles.linkText}
              >
                Create account
              </AppText>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: theme.spacing.lg,
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
  },
  logoBadge: {
    width: 64,
    height: 64,
    borderRadius: theme.borderRadius.lg,
    backgroundColor: theme.colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  logoText: {
    fontSize: 32,
  },
  title: {
    marginBottom: theme.spacing.xs,
  },
  subtitle: {
    textAlign: 'center',
  },
  formContainer: {
    marginVertical: theme.spacing.md,
  },
  loginButton: {
    marginTop: theme.spacing.md,
  },
  footerContainer: {
    alignItems: 'center',
    marginTop: theme.spacing.lg,
  },
  registerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  linkText: {
    fontWeight: theme.fontWeight.bold,
  },
});

export default LoginScreen;
