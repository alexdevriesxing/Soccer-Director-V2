const API_BASE_URL = '/api';

interface ApiResponse<T> {
  data: T;
  status: number;
  statusText: string;
}

export const api = {
  get: async <T>(endpoint: string): Promise<ApiResponse<T>> => {
    const response = await fetch(`${API_BASE_URL}${endpoint}`);
    if (!response.ok) throw new Error(`API request failed: ${response.statusText}`);
    const data = await response.json();
    return { data, status: response.status, statusText: response.statusText };
  },
  
  post: async <T>(endpoint: string, data: unknown): Promise<ApiResponse<T>> => {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error(`API request failed: ${response.statusText}`);
    const responseData = await response.json();
    return { data: responseData, status: response.status, statusText: response.statusText };
  },
  
  put: async <T>(endpoint: string, data: unknown): Promise<ApiResponse<T>> => {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error(`API request failed: ${response.statusText}`);
    const responseData = await response.json();
    return { data: responseData, status: response.status, statusText: response.statusText };
  }
};
