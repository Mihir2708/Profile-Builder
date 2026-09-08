import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Animated,
  Easing,
  StyleSheet,
} from 'react-native';
import theme from '../../styles/theme';
import AppText from '../common/AppText';

const ProfileHeader = ({
  fullName = 'User',
  email = '',
  avatarUrl,
  uploadingAvatar = false,
  onAvatarPress,
}) => {
  const [imageError, setImageError] = useState(false);
  const spinAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (uploadingAvatar) {
      spinAnim.setValue(0);
      const animation = Animated.loop(
        Animated.timing(spinAnim, {
          toValue: 1,
          duration: 1000,
          easing: Easing.linear,
          useNativeDriver: true,
        })
      );
      animation.start();
      return () => animation.stop();
    }
  }, [uploadingAvatar, spinAnim]);

  const spin = spinAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const getInitials = (name) => {
    if (!name) return 'U';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  const showImage = avatarUrl && !imageError;

  return (
    <View style={styles.container}>
      <TouchableOpacity
        onPress={onAvatarPress}
        disabled={!onAvatarPress || uploadingAvatar}
        activeOpacity={0.85}
        style={styles.avatarContainer}
        accessibilityRole="button"
        accessibilityLabel="Change profile avatar"
      >
        <View style={styles.avatarWrapper}>
          {uploadingAvatar && (
            <Animated.View
              style={[
                styles.borderLoader,
                { transform: [{ rotate: spin }] },
              ]}
            />
          )}

          <View style={[styles.avatarCircle, showImage && styles.avatarCircleWithImage]}>
            {showImage ? (
              <Image
                source={{ uri: avatarUrl }}
                style={styles.avatarImage}
                resizeMode="cover"
                onError={() => setImageError(true)}
              />
            ) : (
              <AppText style={styles.initialsText}>
                {getInitials(fullName)}
              </AppText>
            )}

            {uploadingAvatar && <View style={styles.dimOverlay} />}
          </View>
        </View>

        {uploadingAvatar ? (
          <View style={styles.uploadingBadge}>
            <ActivityIndicator color="#FFFFFF" size="small" />
          </View>
        ) : (
          <View style={styles.editBadge}>
            <AppText style={styles.editBadgeText}>📷</AppText>
          </View>
        )}
      </TouchableOpacity>

      <AppText variant="heading" style={styles.nameText}>
        {fullName}
      </AppText>

      {email ? (
        <AppText variant="subheading" style={styles.emailText}>
          {email}
        </AppText>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: theme.spacing.lg,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: theme.spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarWrapper: {
    width: 112,
    height: 112,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  borderLoader: {
    position: 'absolute',
    width: 112,
    height: 112,
    borderRadius: 56,
    borderWidth: 3.5,
    borderColor: 'transparent',
    borderTopColor: theme.colors.primary,
    borderRightColor: theme.colors.primary,
  },
  avatarCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: theme.colors.surface,
    ...theme.shadows.medium,
  },
  avatarCircleWithImage: {
    backgroundColor: theme.colors.surface,
  },
  avatarImage: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
    borderRadius: 50,
  },
  dimOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(15, 23, 42, 0.35)',
    borderRadius: 50,
  },
  initialsText: {
    fontSize: 32,
    fontWeight: theme.fontWeight.bold,
    color: '#FFFFFF',
  },
  editBadge: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    backgroundColor: theme.colors.primary,
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2.5,
    borderColor: theme.colors.surface,
    ...theme.shadows.medium,
  },
  editBadgeText: {
    fontSize: 14,
    color: '#FFFFFF',
  },
  uploadingBadge: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    backgroundColor: theme.colors.primary,
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2.5,
    borderColor: theme.colors.surface,
    ...theme.shadows.medium,
  },
  nameText: {
    textAlign: 'center',
    color: theme.colors.text,
  },
  emailText: {
    textAlign: 'center',
    color: theme.colors.textSecondary,
    fontSize: theme.fontSize.sm,
    marginTop: theme.spacing.xs,
  },
});

export default ProfileHeader;
