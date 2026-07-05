// In dev, Vite proxies /api -> http://localhost:4000 (see vite.config.js).
// In production (Vercel), there is no proxy, so we call the deployed backend
// directly via an env var you set in the Vercel dashboard.
const BASE = import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api` : '/api';

function getToken() { return localStorage.getItem('sb_token'); }

async function req(method, path, body) {
  const headers = { 'Content-Type': 'application/json' };
  const token = getToken();
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Request failed');
  return data;
}

export const api = {
  get: (path) => req('GET', path),
  post: (path, body) => req('POST', path, body),
  patch: (path, body) => req('PATCH', path, body),
  delete: (path) => req('DELETE', path),
};
