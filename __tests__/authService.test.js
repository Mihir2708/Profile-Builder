import {
  signIn,
  signUp,
  signOut,
  getCurrentUser,
  getSession,
  onAuthStateChange,
} from '../src/services/authService';

describe('authService', () => {
  it('should export all required authentication service methods', () => {
    expect(typeof signIn).toBe('function');
    expect(typeof signUp).toBe('function');
    expect(typeof signOut).toBe('function');
    expect(typeof getCurrentUser).toBe('function');
    expect(typeof getSession).toBe('function');
    expect(typeof onAuthStateChange).toBe('function');
  });

  it('getSession should execute without crashing', async () => {
    const result = await getSession();
    expect(result).toHaveProperty('session');
    expect(result).toHaveProperty('error');
  });

  it('getCurrentUser should return user and error properties', async () => {
    const result = await getCurrentUser();
    expect(result).toHaveProperty('user');
    expect(result).toHaveProperty('error');
  });
});
