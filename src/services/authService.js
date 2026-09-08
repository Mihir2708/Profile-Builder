import supabase from './supabase';

/**
 * Authentication Service
 * Encapsulates all Supabase Authentication operations.
 * Passwords and access tokens are handled securely by Supabase.
 */

/**
 * Signs in an existing user with email and password.
 * @param {string} email
 * @param {string} password
 * @returns {Promise<{ user: object | null, session: object | null, error: object | null }>}
 */
export const signIn = async (email, password) => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    return {
      user: data?.user || null,
      session: data?.session || null,
      error,
    };
  } catch (err) {
    return { user: null, session: null, error: err };
  }
};

/**
 * Registers a new user with email, password, and full name metadata.
 * @param {object} params
 * @param {string} params.email
 * @param {string} params.password
 * @param {string} params.fullName
 * @returns {Promise<{ user: object | null, session: object | null, error: object | null }>}
 */
export const signUp = async ({ email, password, fullName }) => {
  try {
    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        data: {
          full_name: fullName.trim(),
        },
      },
    });

    return {
      user: data?.user || null,
      session: data?.session || null,
      error,
    };
  } catch (err) {
    return { user: null, session: null, error: err };
  }
};

/**
 * Signs out the currently authenticated user.
 * @returns {Promise<{ error: object | null }>}
 */
export const signOut = async () => {
  try {
    const { error } = await supabase.auth.signOut();
    return { error };
  } catch (err) {
    return { error: err };
  }
};

/**
 * Retrieves the currently authenticated user.
 * @returns {Promise<{ user: object | null, error: object | null }>}
 */
export const getCurrentUser = async () => {
  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    return { user, error };
  } catch (err) {
    return { user: null, error: err };
  }
};

/**
 * Retrieves the active Supabase session.
 * @returns {Promise<{ session: object | null, error: object | null }>}
 */
export const getSession = async () => {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    return { session, error };
  } catch (err) {
    return { session: null, error: err };
  }
};

/**
 * Subscribes to Supabase authentication state changes.
 * @param {function} callback - Callback triggered on auth events (SIGNED_IN, SIGNED_OUT, etc.)
 * @returns {object} Subscription object with unsubscribe() method
 */
export const onAuthStateChange = (callback) => {
  const { data: { subscription } } = supabase.auth.onAuthStateChange(callback);
  return subscription;
};

export default {
  signIn,
  signUp,
  signOut,
  getCurrentUser,
  getSession,
  onAuthStateChange,
};
