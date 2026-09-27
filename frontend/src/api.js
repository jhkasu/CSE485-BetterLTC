import API_BASE from './config';
import { clearSession, getToken } from './auth/session';

export const SESSION_EXPIRED_PATH = '/signin?expired=1';

export async function apiFetch(path, options = {}) {
  const token = getToken();
  const headers = { ...(options.headers || {}) };
  if (token) headers.Authorization = `Bearer ${token}`;
  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });
  if (res.status === 401 && token) {
    clearSession();
    if (window.location.pathname !== '/signin') window.location.assign(SESSION_EXPIRED_PATH);
  }
  return res;
}

export default apiFetch;
