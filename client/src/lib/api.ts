// API Configuration
// In production (planetmini.in / Vercel), use relative paths ("") so Vercel rewrites proxy all /api requests.
// This completely hides the backend host URL (planet-mini-e4oc.vercel.app) in DevTools F12!
const isLocalhost =
  typeof window !== 'undefined' &&
  (window.location.hostname === 'localhost' ||
   window.location.hostname === '127.0.0.1' ||
   window.location.hostname === '0.0.0.0');

const DEFAULT_API_BASE_URL = isLocalhost ? 'http://localhost:5001' : '';

export const API_BASE_URL = (import.meta.env.VITE_API_URL !== undefined && import.meta.env.VITE_API_URL !== ''
  ? import.meta.env.VITE_API_URL
  : DEFAULT_API_BASE_URL
).replace(/\/$/, '');

export function buildApiUrl(endpoint: string) {
  if (endpoint.startsWith('http')) return endpoint;
  return `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
}

// Helper function to make API calls
export async function apiFetch(endpoint: string, options?: RequestInit) {
  const url = buildApiUrl(endpoint);
  
  const token = localStorage.getItem('jwtToken');
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'x-planet-mini-client': 'web',
    ...(options?.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    ...options,
    credentials: 'include',
    headers,
  });
  
  return response;
}
