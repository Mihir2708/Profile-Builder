import React from 'react';
import {
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import theme from '../../styles/theme';
import AppText from './AppText';

const AppButton = ({
  title,
  onPress,
  loading = false,
  disabled = false,
  variant = 'primary',
  style,
  textStyle,
  accessibilityLabel,
}) => {
  const isInteractionDisabled = disabled || loading;

  const getContainerStyle = () => {
    switch (variant) {
      case 'secondary':
        return styles.secondaryContainer;
      case 'outline':
        return styles.outlineContainer;
      case 'danger':
        return styles.dangerContainer;
      case 'primary':
      default:
        return styles.primaryContainer;
    }
  };

  const getTextColor = () => {
    if (disabled) return theme.colors.textMuted;
    switch (variant) {
      case 'secondary':
        return theme.colors.text;
      case 'outline':
        return theme.colors.primary;
      case 'danger':
      case 'primary':
      default:
        return '#FFFFFF';
    }
  };

  const getSpinnerColor = () => {
    switch (variant) {
      case 'secondary':
        return theme.colors.text;
      case 'outline':
        return theme.colors.primary;
      case 'danger':
      case 'primary':
      default:
        return '#FFFFFF';
    }
  };

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      disabled={isInteractionDisabled}
      accessibilityRole="button"
      accessibilityState={{ disabled: isInteractionDisabled, busy: loading }}
      accessibilityLabel={accessibilityLabel || title}
      style={[
        styles.baseContainer,
        getContainerStyle(),
        disabled && styles.disabledContainer,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator size="small" color={getSpinnerColor()} />
      ) : (
        <AppText
          style={[
            styles.baseText,
            { color: getTextColor() },
            disabled && styles.disabledText,
            textStyle,
          ]}
        >
          {title}
        </AppText>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  baseContainer: {
    height: 50,
    borderRadius: theme.borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
    marginVertical: theme.spacing.xs,
    ...theme.shadows.small,
  },
  primaryContainer: {
    backgroundColor: theme.colors.primary,
  },
  secondaryContainer: {
    backgroundColor: theme.colors.border,
  },
  outlineContainer: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: theme.colors.primary,
    elevation: 0,
    shadowOpacity: 0,
  },
  dangerContainer: {
    backgroundColor: theme.colors.error,
  },
  disabledContainer: {
    backgroundColor: theme.colors.border,
    borderColor: theme.colors.border,
    elevation: 0,
    shadowOpacity: 0,
  },
  baseText: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.semiBold,
  },
  disabledText: {
    color: theme.colors.textMuted,
  },
});

export default AppButton;
