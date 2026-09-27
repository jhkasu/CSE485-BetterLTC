import {
  TOKEN_KEY,
  USER_KEY,
  clearSession,
  decodeTokenPayload,
  getCurrentUser,
  getSessionRole,
  setSession,
} from './session';
import { futureExp, makeToken } from './testToken';

beforeEach(() => {
  window.localStorage.clear();
});

test('reads the role from a valid token', () => {
  setSession(makeToken({ sub: '3', role: 'organization', exp: futureExp() }), { id: 3, role: 'organization' });
  expect(getSessionRole()).toBe('organization');
  expect(getCurrentUser()).toEqual({ id: 3, role: 'organization' });
});

test('treats an expired token as signed out', () => {
  setSession(makeToken({ sub: '3', role: 'admin', exp: futureExp(-60) }), { id: 3, role: 'admin' });
  expect(getSessionRole()).toBeNull();
  expect(getCurrentUser()).toBeNull();
});

test('ignores the stored user role when the token says otherwise', () => {
  setSession(makeToken({ sub: '5', role: 'volunteer', exp: futureExp() }), { id: 5, role: 'admin' });
  expect(getSessionRole()).toBe('volunteer');
});

test('returns nothing for a missing or broken token', () => {
  expect(getSessionRole()).toBeNull();
  window.localStorage.setItem(TOKEN_KEY, 'not-a-token');
  expect(getSessionRole()).toBeNull();
  expect(decodeTokenPayload('a.@@@.b')).toBeNull();
});

test('decodes non-ASCII claims', () => {
  const token = makeToken({ name: 'Élise', exp: futureExp() });
  expect(decodeTokenPayload(token).name).toBe('Élise');
});

test('clearSession removes the token and the user', () => {
  setSession(makeToken({ role: 'admin', exp: futureExp() }), { id: 0 });
  clearSession();
  expect(window.localStorage.getItem(TOKEN_KEY)).toBeNull();
  expect(window.localStorage.getItem(USER_KEY)).toBeNull();
});
