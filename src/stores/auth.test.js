import { describe, expect, it, vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { useAuthStore } from './auth';

const map = new Map();
vi.stubGlobal('localStorage', {
  getItem: (key) => (map.has(key) ? map.get(key) : null),
  setItem: (key, value) => {
    map.set(key, String(value));
  },
  removeItem: (key) => {
    map.delete(key);
  },
});

describe('auth store', () => {
  it('salva e limpa a sessão', () => {
    setActivePinia(createPinia());
    const auth = useAuthStore();
    auth.salvarLogin('token', 'admin', 'admin@beco.com', 1);
    expect(auth.estaLogado).toBe(true);
    expect(auth.isAdmin).toBe(true);
    auth.fazerLogout();
    expect(auth.estaLogado).toBe(false);
  });
});
