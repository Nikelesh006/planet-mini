// API Configuration
// Change this URL to your Railway backend URL after deployment
export const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

// Helper function to make API calls
export async function apiFetch(endpoint: string, options?: RequestInit) {
  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`;
  
  const response = await fetch(url, {
    ...options,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });
  
  return response;
}
