import supabase from './supabase';

/**
 * Profile Service
 * Encapsulates all Supabase database queries for the profiles table.
 * All operations rely on Supabase Row Level Security (RLS) for authorization.
 */

/**
 * Retrieves the profile belonging to the currently authenticated user.
 * If no profile row exists yet, creates a default profile entry.
 * @param {string} [userId] - Optional explicit user ID check
 * @returns {Promise<{ data: object | null, error: object | null }>}
 */
export const getProfile = async (userId) => {
  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return {
        data: null,
        error: userError || new Error('User is not authenticated'),
      };
    }

    const targetUserId = userId || user.id;

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', targetUserId)
      .maybeSingle();

    if (error) {
      return { data: null, error };
    }

    // If profile row doesn't exist yet, auto-create default profile for authenticated user
    if (!data && targetUserId === user.id) {
      const defaultProfile = {
        user_id: user.id,
        full_name: user.user_metadata?.full_name || '',
        email: user.email,
        phone: '',
        bio: '',
        avatar_url: null,
      };

      return await createProfile(defaultProfile);
    }

    return { data, error: null };
  } catch (err) {
    return { data: null, error: err };
  }
};

/**
 * Creates a profile entry for the currently authenticated user.
 * @param {object} profileData - Profile details (full_name, email, phone, bio, avatar_url)
 * @returns {Promise<{ data: object | null, error: object | null }>}
 */
export const createProfile = async (profileData) => {
  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return {
        data: null,
        error: userError || new Error('User is not authenticated'),
      };
    }

    const newProfile = {
      ...profileData,
      user_id: user.id,
      email: profileData.email || user.email,
    };

    const { data, error } = await supabase
      .from('profiles')
      .insert([newProfile])
      .select()
      .single();

    return { data, error };
  } catch (err) {
    return { data: null, error: err };
  }
};

/**
 * Updates an existing profile for the authenticated user.
 * @param {string} profileId - The UUID of the profile
 * @param {object} profileData - Updated profile fields
 * @returns {Promise<{ data: object | null, error: object | null }>}
 */
export const updateProfile = async (profileId, profileData) => {
  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return {
        data: null,
        error: userError || new Error('User is not authenticated'),
      };
    }

    // Omit sensitive ownership fields from payload update
    const { user_id, id, created_at, updated_at, ...updatePayload } = profileData;

    let query = supabase.from('profiles').update(updatePayload);

    if (profileId) {
      query = query.eq('id', profileId);
    }

    const { data, error } = await query
      .eq('user_id', user.id)
      .select()
      .single();

    return { data, error };
  } catch (err) {
    return { data: null, error: err };
  }
};

/**
 * Deletes the profile belonging to the authenticated user.
 * @param {string} [profileId] - The UUID of the profile
 * @returns {Promise<{ data: object | null, error: object | null }>}
 */
export const deleteProfile = async (profileId) => {
  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return {
        data: null,
        error: userError || new Error('User is not authenticated'),
      };
    }

    let query = supabase.from('profiles').delete();

    if (profileId) {
      query = query.eq('id', profileId);
    }

    const { data, error } = await query.eq('user_id', user.id);

    return { data, error };
  } catch (err) {
    return { data: null, error: err };
  }
};

// Base64 to ArrayBuffer converter for React Native
const base64ToArrayBuffer = (base64) => {
  const binaryString = global.atob ? global.atob(base64) : '';
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i += 1) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes.buffer;
};

/**
 * Uploads a profile avatar image to Supabase Storage and updates the user's profile avatar_url.
 * @param {string} userId - Authenticated user ID
 * @param {object} imageAsset - Selected image asset object from react-native-image-picker ({ uri, fileName, type, base64 })
 * @param {string} [oldAvatarUrl] - Previous avatar URL to remove from storage if present
 * @returns {Promise<{ publicUrl: string | null, error: object | null }>}
 */
export const uploadAvatar = async (userId, imageAsset, oldAvatarUrl) => {
  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user || user.id !== userId) {
      return {
        publicUrl: null,
        error: userError || new Error('User is not authorized'),
      };
    }

    if (!imageAsset || (!imageAsset.uri && !imageAsset.base64)) {
      return {
        publicUrl: null,
        error: new Error('No valid image selected'),
      };
    }

    const fileExt = imageAsset.fileName?.split('.').pop() || 'jpg';
    const fileName = `profile-${Date.now()}.${fileExt}`;
    const filePath = `${user.id}/${fileName}`;
    const mimeType = imageAsset.type || 'image/jpeg';

    let fileData;
    if (imageAsset.base64) {
      fileData = base64ToArrayBuffer(imageAsset.base64);
    } else {
      const formData = new FormData();
      formData.append('file', {
        uri: imageAsset.uri,
        name: fileName,
        type: mimeType,
      });
      fileData = formData;
    }

    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(filePath, fileData, {
        contentType: mimeType,
        upsert: true,
      });

    if (uploadError) {
      return { publicUrl: null, error: uploadError };
    }

    const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(filePath);
    const publicUrl = urlData?.publicUrl;

    if (!publicUrl) {
      return { publicUrl: null, error: new Error('Failed to generate public avatar URL') };
    }

    // Update profiles table with new avatar_url
    const { error: updateError } = await updateProfile(null, { avatar_url: publicUrl });

    if (updateError) {
      return { publicUrl: null, error: updateError };
    }

    // Asynchronously remove previous avatar file from storage if it belongs to this user
    if (oldAvatarUrl && typeof oldAvatarUrl === 'string' && oldAvatarUrl.includes('/storage/v1/object/public/avatars/')) {
      const oldPathParts = oldAvatarUrl.split('/storage/v1/object/public/avatars/');
      if (oldPathParts.length > 1) {
        const oldFilePath = oldPathParts[1].split('?')[0];
        if (oldFilePath.startsWith(`${user.id}/`)) {
          try {
            await supabase.storage.from('avatars').remove([oldFilePath]);
          } catch (e) {
            // Ignore cleanup errors
          }
        }
      }
    }

    return { publicUrl, error: null };
  } catch (err) {
    return { publicUrl: null, error: err };
  }
};

/**
 * Development connectivity verification helper.
 * Verifies network connection to the Supabase backend without exposing keys.
 * @returns {Promise<{ connected: boolean, message: string }>}
 */
export const checkSupabaseConnection = async () => {
  try {
    const { error } = await supabase.from('profiles').select('count', { count: 'exact', head: true });
    if (error && error.code !== 'PGRST116' && error.status !== 401 && error.status !== 403) {
      return {
        connected: false,
        message: `Supabase connectivity error: ${error.message}`,
      };
    }
    return {
      connected: true,
      message: 'Supabase client connected successfully.',
    };
  } catch (err) {
    return {
      connected: false,
      message: `Failed to connect to Supabase: ${err.message}`,
    };
  }
};

export default {
  getProfile,
  createProfile,
  updateProfile,
  deleteProfile,
  uploadAvatar,
  checkSupabaseConnection,
};
