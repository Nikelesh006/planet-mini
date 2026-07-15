// API Configuration
// Set VITE_API_URL to your backend origin.
// Production backend: https://planet-mini-e4oc.vercel.app
const DEFAULT_API_BASE_URL = 'https://planet-mini-e4oc.vercel.app';

export const API_BASE_URL = (import.meta.env.VITE_API_URL || DEFAULT_API_BASE_URL).replace(/\/$/, '');

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
