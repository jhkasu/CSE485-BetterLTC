const HIDDEN_PAGES = ['/our-work', '/about/history'];

export function isPageVisible(path) {
  return !HIDDEN_PAGES.includes(path);
}
