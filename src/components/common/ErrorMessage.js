import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import theme from '../../styles/theme';
import AppText from './AppText';

const ErrorMessage = ({
  message,
  variant = 'error',
  onDismiss,
  style,
}) => {
  if (!message) return null;

  const getVariantStyles = () => {
    switch (variant) {
      case 'success':
        return {
          bg: theme.colors.successLight,
          border: theme.colors.success,
          text: theme.colors.success,
          icon: '✓',
        };
      case 'warning':
        return {
          bg: '#FEF3C7',
          border: theme.colors.warning,
          text: '#92400E',
          icon: '⚠',
        };
      case 'info':
        return {
          bg: theme.colors.primaryLight,
          border: theme.colors.primary,
          text: theme.colors.primaryDark,
          icon: 'ℹ',
        };
      case 'error':
      default:
        return {
          bg: theme.colors.errorLight,
          border: theme.colors.error,
          text: theme.colors.error,
          icon: '⚠',
        };
    }
  };

  const currentVariant = getVariantStyles();

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: currentVariant.bg,
          borderColor: currentVariant.border,
        },
        style,
      ]}
    >
      <AppText style={[styles.icon, { color: currentVariant.text }]}>
        {currentVariant.icon}
      </AppText>

      <AppText style={[styles.message, { color: currentVariant.text }]}>
        {message}
      </AppText>

      {onDismiss && (
        <TouchableOpacity
          onPress={onDismiss}
          style={styles.dismissButton}
          accessibilityRole="button"
          accessibilityLabel="Dismiss error message"
        >
          <AppText style={[styles.dismissText, { color: currentVariant.text }]}>
            ✕
          </AppText>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    marginVertical: theme.spacing.xs,
    width: '100%',
  },
  icon: {
    fontSize: theme.fontSize.md,
    marginRight: theme.spacing.sm,
    fontWeight: theme.fontWeight.bold,
  },
  message: {
    flex: 1,
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.medium,
  },
  dismissButton: {
    paddingLeft: theme.spacing.sm,
  },
  dismissText: {
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.bold,
  },
});

export default ErrorMessage;
