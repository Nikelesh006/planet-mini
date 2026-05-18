// API Configuration
// Change this URL to your Railway backend URL after deployment
export const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

// Helper function to make API calls
export async function apiFetch(endpoint: string, options?: RequestInit) {
  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`;
  
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
