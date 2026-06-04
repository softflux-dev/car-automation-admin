export function decodeJwt(token) {
  try {
    const base64 = token.split(".")[1];
    const decoded = JSON.parse(
      atob(base64.replace(/-/g, "+").replace(/_/g, "/"))
    );
    return decoded;
  } catch {
    return null;
  }
}

export function isTokenExpired(token) {
  const payload = decodeJwt(token);
  if (!payload) return true;
  return Date.now() / 1000 > payload.exp;
}

export function getTokenRole(token) {
  return decodeJwt(token)?.role ?? null;
}
