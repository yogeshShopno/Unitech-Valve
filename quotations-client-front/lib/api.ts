export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

function getAuthToken() {
  if (typeof document !== 'undefined') {
    const match = document.cookie.match(new RegExp('(^| )authToken=([^;]+)'));
    if (match) return match[2];
  }
  return null;
}

/**
 * Standard fetch wrapper to inject base URL and default headers
 */
export async function apiFetch(endpoint: string, options: RequestInit = {}) {
  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`;
  
  const token = getAuthToken();
  
  const headers: Record<string, string> = {
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...(options.headers as Record<string, string> || {}),
  };

  // Only set application/json if Content-Type is not explicitly provided
  // and the body is not FormData (which needs boundary set automatically by browser)
  if (!headers['Content-Type'] && !(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  const response = await fetch(url, {
    ...options,
    headers,
    // Enable cookies for session management if needed
    credentials: options.credentials || 'include',
  });

  return response;
}
