function toBase64Url(value) {
  const utf8 = encodeURIComponent(JSON.stringify(value)).replace(/%([0-9A-F]{2})/g, (_, hex) =>
    String.fromCharCode(parseInt(hex, 16))
  );
  return window.btoa(utf8).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

export function makeToken(claims) {
  return `${toBase64Url({ alg: 'HS256', typ: 'JWT' })}.${toBase64Url(claims)}.signature`;
}

export function futureExp(seconds = 3600) {
  return Math.floor(Date.now() / 1000) + seconds;
}
