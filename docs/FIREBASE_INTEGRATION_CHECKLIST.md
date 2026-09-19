# Firebase Integration Checklist

## Current Status

- Firebase package is installed.
- Firebase app initialization is available in `src/services/firebase.ts`.
- Firestore service functions are available in `src/services/firestoreData.ts`.
- The admin screen saves locally first, then syncs location and room edits to Firestore when Firebase is configured.
- The admin screen loads from Firestore first when Firebase is configured, then caches the data locally for the current app screens.
- `src/services/campusDataStore.ts` is the shared campus data loader for Admin, Home, Map, Search, Categories, Location Details, Building Floors, Room Details, and Room Map.
- Admin login uses Firebase Authentication when Firebase is configured, and checks `users/{uid}.role === "admin"` before allowing access.
- User Google login syncs the signed-in user's profile to `users/{uid}` with `role: "user"` for new accounts.
- The prototype admin login still works only when Firebase is not configured.
- Firestore rules are available in `firestore.rules` and referenced by `firebase.json`.
- Guest history stays local. Signed-in user history syncs to `users/{uid}/recentLocations`, with local storage as fallback.
- Admin location and room saves create Firestore notification records; notification screens load Firestore notifications with sample-data fallback.
- Admins can publish manual notification announcements from the web admin panel.
- Notification read/unread state is synced to `users/{uid}/notificationReads` for signed-in users, with local storage as fallback.
- Firestore is not required yet, so the app will not break if Firebase environment values are empty.

## Required Environment Values

Add these values to `.env` when the Firebase project is ready:

```text
EXPO_PUBLIC_FIREBASE_API_KEY=
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=
EXPO_PUBLIC_FIREBASE_PROJECT_ID=
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
EXPO_PUBLIC_FIREBASE_APP_ID=
EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=
EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID=
EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID=
```

Restart Expo after changing `.env`.

## Collections To Use

```text
locations
rooms
users
categories
history
notifications
```

## First Firestore Functions Added

```text
getLocations()
updateLocation()
getRooms()
updateRoom()
canUseFirestore()
adminLocationToFirestore()
firestoreLocationToAdminLocation()
buildingRoomToFirestore()
firestoreRoomToBuildingRoom()
```

## Next Coding Step

Connect Firebase environment values and create the real Firebase admin account.

## Firestore Rules

Current rule intent:

- Anyone can read public campus data: `locations`, `rooms`, `categories`, and `notifications`.
- Only authenticated admins can create, update, or delete public campus data.
- Admin status is checked using `users/{uid}.role === "admin"`.
- Signed-in users can create/update only their own normal `users/{uid}` profile; admin role changes remain admin-only.
- Signed-in users can only access their own `users/{uid}/notificationReads` documents.
- Signed-in users can only access their own `users/{uid}/recentLocations` documents.
- Signed-in users can only access their own `history` documents.
- Any collection not listed is denied by default.

The rules are stored in:

```text
firestore.rules
```

The Firebase CLI config points to that file:

```text
firebase.json
```

## Admin Auth Setup

1. Enable Email/Password sign-in in Firebase Authentication.
2. Create the admin account in Firebase Authentication.
3. Copy the admin account UID.
4. Create this Firestore document:

```text
users/{adminUid}
```

```json
{
  "email": "admin@example.com",
  "role": "admin"
}
```

## User Google Login Setup

1. In Firebase Console, open **Authentication**.
2. Open **Sign-in method**.
3. Enable **Google** provider.
4. In Google Cloud Console, create OAuth client IDs as needed:
   - Web client ID for Expo web and local browser testing.
   - Android client ID for Android builds.
   - iOS client ID for iOS builds.
5. Add the client IDs to `.env`:

```text
EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=
EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID=
EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID=
```

Restart Expo after changing `.env`.
