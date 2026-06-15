import AsyncStorage from '@react-native-async-storage/async-storage';

// ruleid: internal.mobile.security.asyncstorage-sensitive-data
await AsyncStorage.setItem('token', accessToken);

// ruleid: internal.mobile.security.asyncstorage-sensitive-data
AsyncStorage.setItem('accessToken', token);

// ruleid: internal.mobile.security.asyncstorage-sensitive-data
await AsyncStorage.setItem('auth_token', jwt);

// ruleid: internal.mobile.security.asyncstorage-sensitive-data
AsyncStorage.setItem('password', userPassword);

// ruleid: internal.mobile.security.asyncstorage-sensitive-data
await AsyncStorage.setItem('session', sessionId);

// ruleid: internal.mobile.security.asyncstorage-sensitive-data
AsyncStorage.setItem('secret', apiSecret);

// ok: internal.mobile.security.asyncstorage-sensitive-data
await AsyncStorage.setItem('theme', 'dark');

// ok: internal.mobile.security.asyncstorage-sensitive-data
AsyncStorage.setItem('language', 'ko');

// ok: internal.mobile.security.asyncstorage-sensitive-data
await AsyncStorage.setItem('lastLoginDate', dateString);

// ok: internal.mobile.security.asyncstorage-sensitive-data
AsyncStorage.setItem('pushEnabled', 'true');
