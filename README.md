# Profile Management App

A production-ready React Native profile management mobile application built with **React Native CLI**, **JavaScript**, and **Supabase**. Features real-time authentication, PostgreSQL profile CRUD, avatar image uploading via Supabase Storage, animated loading indicators, and robust Row Level Security (RLS).

---

## Features

- **User Registration**: Create accounts with full name, email, and password validation.
- **Authentication**: Email & password login/logout powered by Supabase Auth.
- **Session Persistence**: Persistent sessions across app restarts using `@react-native-async-storage/async-storage`.
- **Protected Navigation**: Automatic conditional navigation stack routing (Auth vs. Profile) based on session state.
- **Profile Management (CRUD)**:
  - **Read**: Fetch profile details from Supabase `profiles` table.
  - **Create**: Automatic default profile row creation for new users.
  - **Update**: Edit full name, phone number, and bio with instant persistence.
  - **Delete**: Safely delete user profile with confirmation dialogs.
- **Profile Avatar Upload**:
  - Pick images via `react-native-image-picker`.
  - Secure Base64 to `ArrayBuffer` conversion for cross-platform React Native storage uploads.
  - Automatic removal of previous avatar files to prevent storage bloat.
  - **Animated Border Loader**: Smooth 360° rotating border ring around the avatar perimeter during upload.
- **Form Validation & UX**: Submit-time validation avoiding input remounts, cursor jumping, or keyboard flicker.
- **Error Handling**: Friendly error formatting for auth failures, network timeouts, and rate limits (`over_email_send_rate_limit`).
- **Security & RLS**: Strict Row Level Security policies on PostgreSQL tables and Storage buckets scoped to `auth.uid()`.

---

## Tech Stack

- **Framework**: React Native 0.87.1 (CLI, Pure JavaScript)
- **State & Context**: React Context API (`AuthContext`)
- **Navigation**: React Navigation v7 (Native Stack)
- **Backend & Database**: Supabase (Auth, PostgreSQL Database, Storage)
- **Storage Persistence**: `@react-native-async-storage/async-storage`
- **Image Picker**: `react-native-image-picker`
- **Testing**: Jest 29
- **Linting**: ESLint

---

## Project Structure

```text
MyTestApp/
├── App.js                      # Root application entry point & providers
├── index.js                    # React Native app registry
├── package.json                # Project dependencies & scripts
├── .env.example                # Environment variables template
├── __tests__/                  # Unit test suites (23 passing tests)
│   ├── App.test.js
│   ├── AuthContext.test.js
│   ├── authService.test.js
│   ├── profileService.test.js
│   └── validation.test.js
├── src/
│   ├── components/             # Reusable UI & domain components
│   │   ├── common/             # AppText, AppInput, AppButton, LoadingSpinner, ErrorMessage
│   │   └── profile/            # ProfileHeader (Avatar + Animated Border Loader)
│   ├── context/                # AuthContext provider for global auth state
│   ├── hooks/                  # Custom hooks (useAuth)
│   ├── navigation/             # AppNavigator & AuthNavigator (Protected Navigation)
│   ├── screens/                # Application screens
│   │   ├── auth/               # LoginScreen, RegisterScreen
│   │   └── profile/            # ProfileScreen
│   ├── services/               # API & Supabase integration services
│   │   ├── supabase.js         # Supabase client configuration
│   │   ├── authService.js      # Auth API wrappers (signIn, signUp, signOut)
│   │   └── profileService.js   # Profile CRUD & Storage avatar upload logic
│   ├── styles/                 # Theme tokens (colors, typography, spacing, shadows)
│   └── utils/                  # Form validation & error formatting helpers
└── supabase/
    └── schema.sql              # Database DDL, RLS policies & Storage bucket DDL
```

---

## Authentication Architecture

Authentication is managed through **Supabase Auth** and exposed globally via `AuthContext`:

1. **State Initialization**: Upon startup, `AuthContext` retrieves the stored session via `authService.getSession()` and subscribes to auth state events (`onAuthStateChange`).
2. **Protected Stack Navigation**: `AppNavigator` conditionally renders `ProfileScreen` when an active session exists, or `AuthNavigator` (`Login` / `Register`) when unauthenticated.
3. **Session Persistence**: Session tokens are encrypted and cached in device storage via `@react-native-async-storage/async-storage`.

---

## Database & Security (RLS)

### `public.profiles` Table Schema

| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `UUID` | Primary Key, Default `gen_random_uuid()` | Unique profile ID |
| `user_id` | `UUID` | Foreign Key (`auth.users.id`), Unique, NOT NULL | References Supabase Auth user |
| `full_name` | `TEXT` | NOT NULL | User's full name |
| `email` | `TEXT` | NOT NULL | Auth email address |
| `phone` | `TEXT` | Default `''` | User phone number |
| `bio` | `TEXT` | Default `''` | User biography |
| `avatar_url` | `TEXT` | Default `NULL` | Public URL of profile picture |
| `created_at` | `TIMESTAMPTZ` | Default `NOW()` | Timestamp created |
| `updated_at` | `TIMESTAMPTZ` | Default `NOW()` | Timestamp updated |

### Row Level Security (RLS) Policies

All database queries strictly enforce RLS policies:
- **SELECT**: `auth.uid() = user_id` (Users can only view their own profile).
- **INSERT**: `auth.uid() = user_id` (Users can only create their own profile).
- **UPDATE**: `auth.uid() = user_id` (Users can only update their own profile).
- **DELETE**: `auth.uid() = user_id` (Users can only delete their own profile).

---

## Storage & Avatars

Avatar images are stored in the Supabase Storage public bucket **`avatars`**:
- **Storage Path**: `avatars/{user_id}/profile-{timestamp}.jpg`
- **Storage RLS**: Scoped so authenticated users can only write/delete within their `{user_id}/*` folder.
- **Upload Optimization**: Converts raw image Base64 payloads into `ArrayBuffer` byte arrays before calling `supabase.storage.from('avatars').upload()`, ensuring reliable cross-platform React Native compatibility.

---

## Environment Setup & Installation

### Prerequisites

- **Node.js**: `>= 22.11.0`
- **React Native Development Environment**: Android Studio / Xcode configured according to the [React Native CLI Guide](https://reactnative.dev/docs/set-up-your-environment).

### Step 1: Clone Repository & Install Dependencies

```bash
git clone https://github.com/your-repo/MyTestApp.git
cd MyTestApp
npm install
```

### Step 2: Configure Environment Variables

Create a `.env` file in the project root based on `.env.example`:

```bash
cp .env.example .env
```

Fill in your actual Supabase credentials:

```env
EXPO_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-actual-anon-key
```

> **Note**: Only the public `anon` key should be used. Never include the `service_role` key in mobile application code.

### Step 3: Run Development Build

Start Metro dev server:

```bash
npm start
```

Run on Android emulator / device:

```bash
npm run android
```

Run on iOS simulator:

```bash
cd ios && bundle exec pod install && cd ..
npm run ios
```

---

## Testing & Quality Assurance

### Run Unit Tests

```bash
npm test
```

Expectation: **5 passed test suites, 23 passed unit tests**.

### Run Linter

```bash
npm run lint
```

Expectation: **0 errors, 0 warnings**.
