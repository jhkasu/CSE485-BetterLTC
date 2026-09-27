import apiFetch, { SESSION_EXPIRED_PATH } from './api';
import { TOKEN_KEY, USER_KEY, setSession } from './auth/session';
import { futureExp, makeToken } from './auth/testToken';

const originalLocation = window.location;

beforeEach(() => {
  window.localStorage.clear();
  global.fetch = jest.fn();
  delete window.location;
  window.location = { pathname: '/dashboard', assign: jest.fn() };
});

afterEach(() => {
  window.location = originalLocation;
  delete global.fetch;
});

test('sends the saved token as a Bearer header', async () => {
  const token = makeToken({ role: 'volunteer', exp: futureExp() });
  setSession(token, { id: 1 });
  global.fetch.mockResolvedValue({ status: 200 });
  await apiFetch('/api/volunteers/1', { headers: { 'Content-Type': 'application/json' } });
  const [url, options] = global.fetch.mock.calls[0];
  expect(url).toMatch(/\/api\/volunteers\/1$/);
  expect(options.headers).toEqual({ 'Content-Type': 'application/json', Authorization: `Bearer ${token}` });
});

test('sends no Authorization header when signed out', async () => {
  global.fetch.mockResolvedValue({ status: 200 });
  await apiFetch('/api/listings');
  expect(global.fetch.mock.calls[0][1].headers).toEqual({});
});

test('a 401 clears the session and sends the user to sign in', async () => {
  setSession(makeToken({ role: 'admin', exp: futureExp() }), { id: 0 });
  global.fetch.mockResolvedValue({ status: 401 });
  const res = await apiFetch('/api/volunteers');
  expect(res.status).toBe(401);
  expect(window.localStorage.getItem(TOKEN_KEY)).toBeNull();
  expect(window.localStorage.getItem(USER_KEY)).toBeNull();
  expect(window.location.assign).toHaveBeenCalledWith(SESSION_EXPIRED_PATH);
});

test('a 401 without a session does not redirect', async () => {
  global.fetch.mockResolvedValue({ status: 401 });
  await apiFetch('/api/auth/signin', { method: 'POST' });
  expect(window.location.assign).not.toHaveBeenCalled();
});

test('a 403 keeps the session', async () => {
  setSession(makeToken({ role: 'volunteer', exp: futureExp() }), { id: 1 });
  global.fetch.mockResolvedValue({ status: 403 });
  await apiFetch('/api/volunteers');
  expect(window.localStorage.getItem(TOKEN_KEY)).not.toBeNull();
  expect(window.location.assign).not.toHaveBeenCalled();
});
