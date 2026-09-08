/**
 * Validation and Error Formatting Utility
 * Centralizes input validation and translates technical errors to user-friendly messages.
 */

// Standard RFC 5322 compliant email regex
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Full Name regex: supports letters, spaces, hyphens, and apostrophes (e.g. O'Connor, Jean-Luc, Mihir Yoganand)
const NAME_REGEX = /^[a-zA-Z\s'-]+$/;

/**
 * Validates whether an email string is properly formatted.
 * @param {string} email
 * @returns {boolean}
 */
export const isValidEmail = (email) => {
  if (!email || typeof email !== 'string') return false;
  return EMAIL_REGEX.test(email.trim());
};

/**
 * Validates whether a full name string is non-empty and contains valid characters.
 * @param {string} name
 * @returns {boolean}
 */
export const isValidFullName = (name) => {
  if (!name || typeof name !== 'string') return false;
  const trimmed = name.trim();
  return trimmed.length > 0 && NAME_REGEX.test(trimmed);
};

/**
 * Validates a password string.
 * @param {string} password
 * @param {number} minLength
 * @returns {boolean}
 */
export const isValidPassword = (password, minLength = 6) => {
  if (!password || typeof password !== 'string') return false;
  return password.length >= minLength;
};

/**
 * Converts technical Supabase/network errors into clean, user-friendly error messages.
 * @param {object | string} error - Error object or error message string
 * @returns {string} User-friendly message
 */
export const formatAuthError = (error) => {
  if (!error) return 'An unexpected error occurred. Please try again.';

  const message = (typeof error === 'string' ? error : error.message || error.error_description || '').toString();
  const lowerMessage = message.toLowerCase();

  if (
    lowerMessage.includes('over_email_send_rate_limit') ||
    lowerMessage.includes('email_rate_limit') ||
    lowerMessage.includes('rate limit') ||
    lowerMessage.includes('too many requests')
  ) {
    return 'Too many verification emails were requested. Please wait a while before trying again.';
  }

  if (
    lowerMessage.includes('invalid login credentials') ||
    lowerMessage.includes('invalid_credentials') ||
    lowerMessage.includes('invalid email or password')
  ) {
    return 'Invalid email or password.';
  }

  if (
    lowerMessage.includes('network request failed') ||
    lowerMessage.includes('fetch failed') ||
    lowerMessage.includes('networkerror') ||
    lowerMessage.includes('unable to connect')
  ) {
    return 'Unable to connect. Please check your internet connection and try again.';
  }

  if (
    lowerMessage.includes('user already registered') ||
    lowerMessage.includes('already registered') ||
    lowerMessage.includes('already exists')
  ) {
    return 'An account with this email already exists.';
  }

  if (lowerMessage.includes('email not confirmed')) {
    return 'Please confirm your email address before signing in.';
  }

  return message || 'An error occurred. Please try again.';
};

export default {
  isValidEmail,
  isValidFullName,
  isValidPassword,
  formatAuthError,
};
