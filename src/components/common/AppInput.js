import React, { useState } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import theme from '../../styles/theme';
import AppText from './AppText';

const AppInput = React.memo(({
  label,
  value,
  onChangeText,
  placeholder,
  secureTextEntry = false,
  keyboardType = 'default',
  error,
  autoCapitalize = 'none',
  editable = true,
  multiline = false,
  numberOfLines = 1,
  style,
  inputStyle,
  accessibilityLabel,
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  const isSecure = secureTextEntry && !showPassword;

  let borderStyle = styles.borderDefault;
  if (error) {
    borderStyle = styles.borderError;
  } else if (isFocused) {
    borderStyle = styles.borderFocused;
  }

  return (
    <View style={[styles.container, style]}>
      {label && <AppText variant="label">{label}</AppText>}

      <View
        style={[
          styles.inputContainer,
          borderStyle,
          multiline && styles.multilineContainer,
          !editable && styles.disabledContainer,
        ]}
      >
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={theme.colors.textMuted}
          secureTextEntry={isSecure}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          editable={editable}
          multiline={multiline}
          numberOfLines={numberOfLines}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          accessibilityLabel={accessibilityLabel || label || placeholder}
          style={[
            styles.input,
            multiline && styles.multilineInput,
            inputStyle,
          ]}
        />

        {secureTextEntry && (
          <TouchableOpacity
            onPress={togglePasswordVisibility}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            style={styles.eyeButton}
            accessibilityRole="button"
            accessibilityLabel={showPassword ? 'Hide password' : 'Show password'}
          >
            <AppText style={styles.eyeText}>
              {showPassword ? 'Hide' : 'Show'}
            </AppText>
          </TouchableOpacity>
        )}
      </View>

      {error ? <AppText variant="error">{error}</AppText> : null}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    marginVertical: theme.spacing.xs,
    width: '100%',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.surface,
    paddingHorizontal: theme.spacing.md,
    height: 48,
  },
  borderDefault: {
    borderColor: theme.colors.border,
  },
  borderFocused: {
    borderColor: theme.colors.primary,
  },
  borderError: {
    borderColor: theme.colors.error,
  },
  disabledContainer: {
    backgroundColor: theme.colors.background,
    borderColor: theme.colors.border,
  },
  multilineContainer: {
    height: 'auto',
    minHeight: 90,
    alignItems: 'flex-start',
    paddingVertical: theme.spacing.sm,
  },
  input: {
    flex: 1,
    fontSize: theme.fontSize.md,
    color: theme.colors.text,
    padding: 0,
  },
  multilineInput: {
    textAlignVertical: 'top',
  },
  eyeButton: {
    paddingLeft: theme.spacing.sm,
  },
  eyeText: {
    fontSize: theme.fontSize.xs,
    fontWeight: theme.fontWeight.semiBold,
    color: theme.colors.primary,
  },
});

export default AppInput;
