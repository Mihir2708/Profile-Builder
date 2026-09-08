import React from 'react';
import { Text, StyleSheet } from 'react-native';
import theme from '../../styles/theme';

const AppText = ({
  variant = 'body',
  color,
  align = 'left',
  style,
  children,
  numberOfLines,
  ...props
}) => {
  const variantStyle = styles[variant] || styles.body;
  const textColor = color || variantStyle.color || theme.colors.text;

  return (
    <Text
      style={[
        variantStyle,
        { color: textColor, textAlign: align },
        style,
      ]}
      numberOfLines={numberOfLines}
      {...props}
    >
      {children}
    </Text>
  );
};

const styles = StyleSheet.create({
  title: {
    fontSize: theme.fontSize.title,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
    lineHeight: 34,
  },
  heading: {
    fontSize: theme.fontSize.xl,
    fontWeight: theme.fontWeight.semiBold,
    color: theme.colors.text,
    lineHeight: 28,
  },
  subheading: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.medium,
    color: theme.colors.textSecondary,
    lineHeight: 24,
  },
  body: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.regular,
    color: theme.colors.text,
    lineHeight: 22,
  },
  caption: {
    fontSize: theme.fontSize.xs,
    fontWeight: theme.fontWeight.regular,
    color: theme.colors.textMuted,
    lineHeight: 16,
  },
  label: {
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.semiBold,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xs,
  },
  error: {
    fontSize: theme.fontSize.xs,
    fontWeight: theme.fontWeight.medium,
    color: theme.colors.error,
    marginTop: theme.spacing.xs,
  },
});

export default AppText;
