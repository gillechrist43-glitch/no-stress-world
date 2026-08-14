// Lightweight persistence abstraction: uses localStorage on web,
// falls back to AsyncStorage on native when available.
export async function getItem(key: string): Promise<string | null> {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      return Promise.resolve(window.localStorage.getItem(key));
    }
  } catch (e) {
    // ignore
  }

  try {
    const AsyncStorage = await import('@react-native-async-storage/async-storage');
    return AsyncStorage.default.getItem(key);
  } catch (e) {
    return Promise.resolve(null);
  }
}

export async function setItem(key: string, value: string): Promise<void> {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(key, value);
      return Promise.resolve();
    }
  } catch (e) {
    // ignore
  }

  try {
    const AsyncStorage = await import('@react-native-async-storage/async-storage');
    return AsyncStorage.default.setItem(key, value);
  } catch (e) {
    return Promise.resolve();
  }
}

export async function removeItem(key: string): Promise<void> {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.removeItem(key);
      return Promise.resolve();
    }
  } catch (e) {
    // ignore
  }

  try {
    const AsyncStorage = await import('@react-native-async-storage/async-storage');
    return AsyncStorage.default.removeItem(key);
  } catch (e) {
    return Promise.resolve();
  }
}
