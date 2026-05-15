export const mockLoginResponse = {
  success: true,
  message: 'Success',
  data: {
    accessToken: 'mock-access-token',
    refreshToken: 'mock-refresh-token',
    user: {
      id: '1',
      name: 'Admin User',
      email: 'admin@example.com',
      roleName: 'Admin',
      avatar: '',
    },
    permissions: [{ action: 'manage', subject: 'all' }],
  },
};
