import React from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import theme from '../../styles/theme';
import AppText from './AppText';

const LoadingSpinner = ({
  size = 'large',
  color = theme.colors.primary,
  message,
  fullScreen = false,
  style,
}) => {
  return (
    <View
      style={[
        styles.container,
        fullScreen && styles.fullScreenContainer,
        style,
      ]}
    >
      <ActivityIndicator size={size} color={color} />
      {message ? (
        <AppText style={styles.messageText}>{message}</AppText>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: theme.spacing.lg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullScreenContainer: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  messageText: {
    marginTop: theme.spacing.md,
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    fontWeight: theme.fontWeight.medium,
  },
});

export default LoadingSpinner;
