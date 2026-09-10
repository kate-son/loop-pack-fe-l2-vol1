export function createWebStorage(type: 'sessionStorage' | 'localStorage') {
  const getItem = (key: string): string | null => {
    if (!key) {
      return null;
    }

    if (type === 'sessionStorage') {
      return sessionStorage.getItem(key);
    } else {
      return localStorage.getItem(key);
    }
  };

  const setItem = (key: string, value: string) => {
    if (type === 'sessionStorage') {
      sessionStorage.setItem(key, value);
    } else {
      localStorage.setItem(key, value);
    }
  };

  const removeItem = (key: string) => {
    if (type === 'sessionStorage') {
      sessionStorage.removeItem(key);
    } else {
      localStorage.removeItem(key);
    }
  };

  return {
    getItem,
    setItem,
    removeItem,
  };
}
