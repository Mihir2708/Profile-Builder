import {
  isValidEmail,
  isValidFullName,
  isValidPassword,
  formatAuthError,
} from '../src/utils/validation';

describe('validation utilities', () => {
  describe('isValidEmail', () => {
    it('returns true for valid email formats', () => {
      expect(isValidEmail('test@example.com')).toBe(true);
      expect(isValidEmail('user.name+tag@domain.co.uk')).toBe(true);
    });

    it('returns false for invalid email formats', () => {
      expect(isValidEmail('')).toBe(false);
      expect(isValidEmail('invalid-email')).toBe(false);
      expect(isValidEmail('user@')).toBe(false);
      expect(isValidEmail('@domain.com')).toBe(false);
    });
  });

  describe('isValidFullName', () => {
    it('returns true for names with spaces, hyphens, and apostrophes', () => {
      expect(isValidFullName('Mihir Yoganand')).toBe(true);
      expect(isValidFullName("O'Connor")).toBe(true);
      expect(isValidFullName('Jean-Luc')).toBe(true);
    });

    it('returns false for empty names or names with numbers/symbols', () => {
      expect(isValidFullName('')).toBe(false);
      expect(isValidFullName('   ')).toBe(false);
      expect(isValidFullName('User123')).toBe(false);
    });
  });

  describe('isValidPassword', () => {
    it('returns true for passwords of minimum length', () => {
      expect(isValidPassword('123456')).toBe(true);
      expect(isValidPassword('Password@123')).toBe(true);
    });

    it('returns false for short or empty passwords', () => {
      expect(isValidPassword('')).toBe(false);
      expect(isValidPassword('12345')).toBe(false);
    });
  });

  describe('formatAuthError', () => {
    it('formats rate limit errors correctly', () => {
      const err = { message: 'over_email_send_rate_limit' };
      expect(formatAuthError(err)).toBe(
        'Too many verification emails were requested. Please wait a while before trying again.'
      );
    });

    it('formats invalid credentials errors correctly', () => {
      const err = { message: 'Invalid login credentials' };
      expect(formatAuthError(err)).toBe('Invalid email or password.');
    });

    it('formats network failure errors correctly', () => {
      const err = { message: 'TypeError: Network request failed' };
      expect(formatAuthError(err)).toBe(
        'Unable to connect. Please check your internet connection and try again.'
      );
    });

    it('formats user already registered errors correctly', () => {
      const err = { message: 'User already registered' };
      expect(formatAuthError(err)).toBe('An account with this email already exists.');
    });
  });
});
