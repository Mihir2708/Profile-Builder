import {
  getProfile,
  createProfile,
  updateProfile,
  deleteProfile,
  uploadAvatar,
  checkSupabaseConnection,
} from '../src/services/profileService';
import supabase from '../src/services/supabase';

jest.mock('../src/services/supabase', () => {
  const mockSingle = jest.fn();
  const mockMaybeSingle = jest.fn();

  const mockStorageUpload = jest.fn().mockResolvedValue({ data: { path: 'test-user-id/avatar.jpg' }, error: null });
  const mockGetPublicUrl = jest.fn().mockReturnValue({ data: { publicUrl: 'https://example.com/avatar.jpg' } });
  const mockStorageRemove = jest.fn().mockResolvedValue({ data: null, error: null });

  const mockFrom = jest.fn(() => ({
    select: jest.fn(() => ({
      eq: jest.fn(() => ({
        maybeSingle: mockMaybeSingle,
        single: mockSingle,
      })),
    })),
    insert: jest.fn(() => ({
      select: jest.fn(() => ({
        single: mockSingle,
      })),
    })),
    update: jest.fn(() => ({
      eq: jest.fn(() => ({
        eq: jest.fn(() => ({
          select: jest.fn(() => ({
            single: mockSingle,
          })),
        })),
        select: jest.fn(() => ({
          single: mockSingle,
        })),
      })),
    })),
    delete: jest.fn(() => ({
      eq: jest.fn(() => ({
        eq: jest.fn().mockResolvedValue({ data: null, error: null }),
      })),
    })),
  }));

  return {
    __esModule: true,
    default: {
      auth: {
        getUser: jest.fn().mockResolvedValue({
          data: { user: { id: 'test-user-id', email: 'test@example.com', user_metadata: { full_name: 'Test User' } } },
          error: null,
        }),
      },
      from: mockFrom,
      storage: {
        from: jest.fn(() => ({
          upload: mockStorageUpload,
          getPublicUrl: mockGetPublicUrl,
          remove: mockStorageRemove,
        })),
      },
    },
  };
});

// Mock global fetch for image blob conversion in tests
global.fetch = jest.fn().mockResolvedValue({
  blob: jest.fn().mockResolvedValue(new Blob([])),
});

describe('profileService', () => {
  it('should export all required CRUD service methods', () => {
    expect(typeof getProfile).toBe('function');
    expect(typeof createProfile).toBe('function');
    expect(typeof updateProfile).toBe('function');
    expect(typeof deleteProfile).toBe('function');
    expect(typeof uploadAvatar).toBe('function');
    expect(typeof checkSupabaseConnection).toBe('function');
  });

  it('getProfile should return profile data for authenticated user', async () => {
    const mockProfile = { id: 'prof-1', user_id: 'test-user-id', full_name: 'Test User' };
    const { from } = supabase;
    from().select().eq().maybeSingle.mockResolvedValueOnce({ data: mockProfile, error: null });

    const result = await getProfile('test-user-id');
    expect(result.data).toEqual(mockProfile);
    expect(result.error).toBeNull();
  });

  it('updateProfile should send profile updates for authenticated user', async () => {
    const mockUpdated = { id: 'prof-1', user_id: 'test-user-id', full_name: 'Updated Name' };
    const { from } = supabase;
    from().update().eq().eq().select().single.mockResolvedValueOnce({ data: mockUpdated, error: null });

    const result = await updateProfile('prof-1', { full_name: 'Updated Name' });
    expect(result.data).toEqual(mockUpdated);
    expect(result.error).toBeNull();
  });

  it('deleteProfile should execute delete query for authenticated user', async () => {
    const result = await deleteProfile('prof-1');
    expect(result.error).toBeNull();
  });

  it('uploadAvatar should return error if user is unauthenticated or unauthorized', async () => {
    const result = await uploadAvatar('different-user-id', { uri: 'file:///image.jpg' });
    expect(result.publicUrl).toBeNull();
    expect(result.error).toBeDefined();
  });
});
