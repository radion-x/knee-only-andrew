// API configuration
// For production: uses VITE_SERVER_BASE_URL environment variable to point to backend API
// For development: uses proxy configured in vite.config.ts

export const API_BASE_URL = import.meta.env.VITE_SERVER_BASE_URL || '';

export const getApiUrl = (path: string): string => {
  // Ensure path starts with /
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${API_BASE_URL}${normalizedPath}`;
};

// Fetch options to include credentials (cookies) for authentication
export const fetchWithCredentials = (url: string, options: RequestInit = {}): Promise<Response> => {
  return fetch(url, {
    ...options,
    credentials: 'include', // Send cookies with cross-origin requests
  });
};
