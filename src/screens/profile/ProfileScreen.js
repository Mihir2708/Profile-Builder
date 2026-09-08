import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Alert,
} from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import theme from '../../styles/theme';
import AppText from '../../components/common/AppText';
import AppInput from '../../components/common/AppInput';
import AppButton from '../../components/common/AppButton';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorMessage from '../../components/common/ErrorMessage';
import ProfileHeader from '../../components/profile/ProfileHeader';
import { useAuth } from '../../hooks/useAuth';
import profileService from '../../services/profileService';
import { isValidFullName, formatAuthError } from '../../utils/validation';

const ProfileScreen = () => {
  const { user, signOut } = useAuth();
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [profileId, setProfileId] = useState(null);
  const [profile, setProfile] = useState({
    full_name: '',
    email: '',
    phone: '',
    bio: '',
    avatar_url: null,
  });

  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSelectAvatar = async () => {
    setSuccessMessage('');
    setErrorMessage('');

    if (typeof launchImageLibrary !== 'function') {
      setErrorMessage('Image picker module is initializing. Please restart the app with "npm run android".');
      return;
    }

    try {
      const result = await launchImageLibrary({
        mediaType: 'photo',
        quality: 0.8,
        includeBase64: true,
        selectionLimit: 1,
      });

      if (result.didCancel) {
        return;
      }

      if (result.errorCode) {
        setErrorMessage(result.errorMessage || 'Failed to select image.');
        return;
      }

      const asset = result.assets?.[0];
      if (!asset || !asset.uri) {
        setErrorMessage('No valid image was selected.');
        return;
      }

      setUploadingAvatar(true);

      const { publicUrl, error } = await profileService.uploadAvatar(
        user.id,
        asset,
        profile.avatar_url
      );

      setUploadingAvatar(false);

      if (error) {
        setErrorMessage(formatAuthError(error));
      } else if (publicUrl) {
        setProfile(prev => ({ ...prev, avatar_url: publicUrl }));
        setSuccessMessage('✓ Profile picture updated.');
      }
    } catch (err) {
      setUploadingAvatar(false);
      setErrorMessage(formatAuthError(err));
    }
  };

  useEffect(() => {
    let isMounted = true;

    const loadProfileData = async () => {
      if (!user?.id) {
        setLoadingProfile(false);
        return;
      }

      setLoadingProfile(true);
      const { data, error } = await profileService.getProfile(user.id);

      if (isMounted) {
        setLoadingProfile(false);
        if (data) {
          setProfileId(data.id);
          setProfile({
            full_name: data.full_name || user.user_metadata?.full_name || '',
            email: data.email || user.email || '',
            phone: data.phone || '',
            bio: data.bio || '',
            avatar_url: data.avatar_url || null,
          });
        } else if (error) {
          setErrorMessage(formatAuthError(error));
        }
      }
    };

    loadProfileData();

    return () => {
      isMounted = false;
    };
  }, [user?.id, user?.email, user?.user_metadata?.full_name]);

  const handleChange = (field, value) => {
    setProfile(prev => ({ ...prev, [field]: value }));
    if (successMessage) setSuccessMessage('');
    if (errorMessage) setErrorMessage('');
  };

  const handleSaveChanges = async () => {
    setErrorMessage('');
    setSuccessMessage('');

    const trimmedName = profile.full_name.trim();

    if (!trimmedName) {
      setErrorMessage('Full name is required.');
      return;
    }

    if (!isValidFullName(trimmedName)) {
      setErrorMessage('Please enter a valid full name.');
      return;
    }

    setSaving(true);

    const { data, error } = await profileService.updateProfile(profileId, {
      full_name: trimmedName,
      phone: profile.phone.trim(),
      bio: profile.bio.trim(),
      avatar_url: profile.avatar_url,
    });

    setSaving(false);

    if (error) {
      setErrorMessage(formatAuthError(error));
    } else if (data) {
      setProfile(prev => ({
        ...prev,
        full_name: data.full_name || prev.full_name,
        phone: data.phone || '',
        bio: data.bio || '',
      }));
      setSuccessMessage('✓ Profile updated successfully.');
    }
  };

  const handleDeleteProfile = () => {
    Alert.alert(
      'Delete Profile',
      'Are you sure you want to delete your profile? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              setSaving(true);
              const { error } = await profileService.deleteProfile(profileId);
              if (error) {
                setSaving(false);
                setErrorMessage('Failed to delete profile: ' + error.message);
                return;
              }
              await signOut();
            } catch (err) {
              setSaving(false);
              setErrorMessage('Failed to delete profile. Please try again.');
            }
          },
        },
      ]
    );
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to log out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          onPress: async () => {
            try {
              await signOut();
            } catch (err) {
              setErrorMessage('Failed to sign out. Please try again.');
            }
          },
        },
      ]
    );
  };

  if (loadingProfile) {
    return <LoadingSpinner fullScreen message="Loading profile..." />;
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={true}
      >
        <ProfileHeader
          fullName={profile.full_name}
          email={profile.email}
          avatarUrl={profile.avatar_url}
          uploadingAvatar={uploadingAvatar}
          onAvatarPress={handleSelectAvatar}
        />

        <ErrorMessage
          message={successMessage}
          variant="success"
          onDismiss={() => setSuccessMessage('')}
        />

        <ErrorMessage
          message={errorMessage}
          variant="error"
          onDismiss={() => setErrorMessage('')}
        />

        <View style={styles.cardContainer}>
          <AppText variant="heading" style={styles.sectionTitle}>
            Personal Details
          </AppText>

          <AppInput
            label="Full Name"
            value={profile.full_name}
            onChangeText={(val) => handleChange('full_name', val)}
            placeholder="Enter your full name"
            autoCapitalize="words"
          />

          <AppInput
            label="Email (Auth Managed)"
            value={profile.email}
            editable={false}
            placeholder="Your email address"
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <AppInput
            label="Phone"
            value={profile.phone}
            onChangeText={(val) => handleChange('phone', val)}
            placeholder="Enter your phone number"
            keyboardType="phone-pad"
          />

          <AppInput
            label="Bio"
            value={profile.bio}
            onChangeText={(val) => handleChange('bio', val)}
            placeholder="Tell us about yourself"
            multiline
            numberOfLines={3}
          />

          <AppButton
            title="Save Changes"
            onPress={handleSaveChanges}
            loading={saving}
            disabled={saving}
            style={styles.saveButton}
          />
        </View>

        <View style={styles.actionsContainer}>
          <AppButton
            title="Logout"
            variant="outline"
            onPress={handleLogout}
            disabled={saving}
            style={styles.actionButton}
          />

          <AppButton
            title="Delete Profile"
            variant="danger"
            onPress={handleDeleteProfile}
            loading={saving}
            disabled={saving}
            style={styles.actionButton}
          />
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: theme.spacing.lg,
    paddingBottom: theme.spacing.xxl * 2,
  },
  cardContainer: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    marginVertical: theme.spacing.md,
    ...theme.shadows.small,
  },
  sectionTitle: {
    fontSize: theme.fontSize.lg,
    marginBottom: theme.spacing.md,
  },
  saveButton: {
    marginTop: theme.spacing.md,
  },
  actionsContainer: {
    marginTop: theme.spacing.md,
  },
  actionButton: {
    marginVertical: theme.spacing.xs,
  },
});

export default ProfileScreen;
