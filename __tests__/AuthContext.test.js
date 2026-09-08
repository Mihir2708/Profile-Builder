import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import { AuthProvider, AuthContext } from '../src/context/AuthContext';
import authService from '../src/services/authService';

jest.mock('../src/services/authService');

describe('AuthContext', () => {
  let mockUnsubscribe;

  beforeEach(() => {
    jest.clearAllMocks();
    mockUnsubscribe = jest.fn();

    authService.getSession.mockResolvedValue({
      session: null,
      error: null,
    });

    authService.onAuthStateChange.mockImplementation(() => {
      return { unsubscribe: mockUnsubscribe };
    });

    authService.signIn.mockResolvedValue({
      user: { id: 'user-123', email: 'test@example.com' },
      session: { access_token: 'fake-token' },
      error: null,
    });

    authService.signOut.mockResolvedValue({
      error: null,
    });
  });

  it('provides initial loading state then transitions to unauthenticated state', async () => {
    let contextValue;

    const TestComponent = () => {
      return (
        <AuthContext.Consumer>
          {(value) => {
            contextValue = value;
            return null;
          }}
        </AuthContext.Consumer>
      );
    };

    await ReactTestRenderer.act(async () => {
      ReactTestRenderer.create(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );
    });

    expect(contextValue.loading).toBe(false);
    expect(contextValue.session).toBeNull();
    expect(contextValue.user).toBeNull();
  });

  it('updates state to authenticated when session exists or auth listener triggers SIGNED_IN', async () => {
    const mockSession = { access_token: 'valid-token', user: { id: '123', email: 'user@test.com' } };

    authService.getSession.mockResolvedValueOnce({
      session: mockSession,
      error: null,
    });

    let contextValue;
    const TestComponent = () => (
      <AuthContext.Consumer>
        {(value) => {
          contextValue = value;
          return null;
        }}
      </AuthContext.Consumer>
    );

    await ReactTestRenderer.act(async () => {
      ReactTestRenderer.create(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );
    });

    expect(contextValue.session).toEqual(mockSession);
    expect(contextValue.user).toEqual(mockSession.user);
  });

  it('updates state upon sign out', async () => {
    const mockSession = { access_token: 'valid-token', user: { id: '123' } };
    authService.getSession.mockResolvedValueOnce({ session: mockSession, error: null });

    let contextValue;
    const TestComponent = () => (
      <AuthContext.Consumer>
        {(value) => {
          contextValue = value;
          return null;
        }}
      </AuthContext.Consumer>
    );

    await ReactTestRenderer.act(async () => {
      ReactTestRenderer.create(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );
    });

    expect(contextValue.session).toEqual(mockSession);

    await ReactTestRenderer.act(async () => {
      await contextValue.signOut();
    });

    expect(contextValue.session).toBeNull();
    expect(contextValue.user).toBeNull();
  });

  it('cleans up auth listener subscription on unmount', async () => {
    let renderer;
    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(
        <AuthProvider>
          <React.Fragment />
        </AuthProvider>
      );
    });

    await ReactTestRenderer.act(async () => {
      renderer.unmount();
    });

    expect(mockUnsubscribe).toHaveBeenCalledTimes(1);
  });
});
