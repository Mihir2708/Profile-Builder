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
import {
  isValidEmail,
  isValidFullName,
  isValidPassword,
  formatAuthError,
} from '../../utils/validation';

const RegisterScreen = ({ navigation }) => {
  const { signUp } = useAuth();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const validateForm = () => {
    const trimmedName = fullName.trim();
    const trimmedEmail = email.trim();

    if (!trimmedName) {
      setError('Full name is required.');
      return false;
    }

    if (!isValidFullName(trimmedName)) {
      setError('Please enter a valid full name (letters, spaces, hyphens, and apostrophes allowed).');
      return false;
    }

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

    if (!isValidPassword(password, 6)) {
      setError('Password must be at least 6 characters.');
      return false;
    }

    if (!confirmPassword) {
      setError('Please confirm your password.');
      return false;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return false;
    }

    return true;
  };

  const handleRegister = async () => {
    setError('');
    setSuccessMessage('');

    if (!validateForm()) return;

    setLoading(true);

    try {
      const { user, session, error: authError } = await signUp({
        email,
        password,
        fullName,
      });

      setLoading(false);

      if (authError) {
        setError(formatAuthError(authError));
        return;
      }

      if (!session && user) {
        setSuccessMessage(
          'Account created successfully! Please check your email to confirm your account before signing in.'
        );
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
          <AppText variant="title" style={styles.title}>
            Create Account
          </AppText>
          <AppText variant="subheading" style={styles.subtitle}>
            Create your profile to get started.
          </AppText>
        </View>

        <ErrorMessage message={error} onDismiss={() => setError('')} />

        <ErrorMessage
          message={successMessage}
          variant="success"
          onDismiss={() => setSuccessMessage('')}
        />

        <View style={styles.formContainer}>
          <AppInput
            label="Full Name"
            value={fullName}
            onChangeText={(text) => {
              setFullName(text);
              if (error) setError('');
            }}
            placeholder="Enter your full name"
            autoCapitalize="words"
          />

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
            placeholder="Enter your password (min 6 characters)"
            secureTextEntry
          />

          <AppInput
            label="Confirm Password"
            value={confirmPassword}
            onChangeText={(text) => {
              setConfirmPassword(text);
              if (error) setError('');
            }}
            placeholder="Confirm your password"
            secureTextEntry
          />

          <AppButton
            title="Create Account"
            onPress={handleRegister}
            loading={loading}
            disabled={loading}
            style={styles.registerButton}
          />
        </View>

        <View style={styles.footerContainer}>
          <View style={styles.loginRow}>
            <AppText variant="body" color={theme.colors.textSecondary}>
              Already have an account?{' '}
            </AppText>
            <TouchableOpacity
              onPress={() => navigation.navigate('Login')}
              accessibilityRole="button"
              accessibilityLabel="Navigate to Login screen"
            >
              <AppText
                variant="body"
                color={theme.colors.primary}
                style={styles.linkText}
              >
                Login
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
    marginBottom: theme.spacing.lg,
  },
  title: {
    marginBottom: theme.spacing.xs,
  },
  subtitle: {
    textAlign: 'center',
  },
  formContainer: {
    marginVertical: theme.spacing.sm,
  },
  registerButton: {
    marginTop: theme.spacing.md,
  },
  footerContainer: {
    alignItems: 'center',
    marginTop: theme.spacing.md,
  },
  loginRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  linkText: {
    fontWeight: theme.fontWeight.bold,
  },
});

export default RegisterScreen;
