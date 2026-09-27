export const TOKEN_KEY = 'authToken';
export const USER_KEY = 'currentUser';

export function decodeTokenPayload(token) {
  try {
    const part = token.split('.')[1];
    const base64 = part.replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64 + '='.repeat((4 - (base64.length % 4)) % 4);
    const binary = window.atob(padded);
    const json = decodeURIComponent(
      Array.from(binary, (c) => `%${c.charCodeAt(0).toString(16).padStart(2, '0')}`).join('')
    );
    return JSON.parse(json);
  } catch {
    return null;
  }
}

export function getToken() {
  try {
    return window.localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function getTokenClaims() {
  const token = getToken();
  if (!token) return null;
  const claims = decodeTokenPayload(token);
  if (!claims || typeof claims.exp !== 'number' || claims.exp * 1000 <= Date.now()) return null;
  return claims;
}

export function getSessionRole() {
  const claims = getTokenClaims();
  return claims ? claims.role || null : null;
}

export function getCurrentUser() {
  if (!getTokenClaims()) return null;
  try {
    return JSON.parse(window.localStorage.getItem(USER_KEY));
  } catch {
    return null;
  }
}

export function setSession(token, user) {
  window.localStorage.setItem(TOKEN_KEY, token);
  window.localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function clearSession() {
  try {
    window.localStorage.removeItem(TOKEN_KEY);
    window.localStorage.removeItem(USER_KEY);
  } catch {
    return;
  }
}
