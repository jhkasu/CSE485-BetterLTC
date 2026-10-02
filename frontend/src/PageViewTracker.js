import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import apiFetch from './api';

const PRIVATE_PREFIXES = ['/admin', '/dashboard', '/org-dashboard'];
const REPEAT_WINDOW_MS = 2000;
let lastRecorded = { path: '', at: 0 };

export function isTrackedPath(pathname) {
  return !PRIVATE_PREFIXES.some(prefix => pathname === prefix || pathname.startsWith(`${prefix}/`));
}

function PageViewTracker() {
  const { pathname } = useLocation();

  useEffect(() => {
    if (!isTrackedPath(pathname)) return;
    const now = Date.now();
    if (lastRecorded.path === pathname && now - lastRecorded.at < REPEAT_WINDOW_MS) return;
    lastRecorded = { path: pathname, at: now };
    apiFetch('/api/statistics/views', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ path: pathname }),
    }).catch(() => {});
  }, [pathname]);

  return null;
}

export default PageViewTracker;
