require('dotenv').config();

module.exports = {
  presets: ['module:@react-native/babel-preset'],
  plugins: [
    [
      'transform-inline-environment-variables',
      {
        include: [
          'EXPO_PUBLIC_SUPABASE_URL',
          'EXPO_PUBLIC_SUPABASE_ANON_KEY',
          'SUPABASE_URL',
          'SUPABASE_ANON_KEY',
        ],
      },
    ],
  ],
};
