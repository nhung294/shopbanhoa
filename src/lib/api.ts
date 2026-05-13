const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const getToken = () => localStorage.getItem('token');

const apiFetch = async (path: string, options: RequestInit = {}) => {
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const res = await fetch(`${BASE_URL}${path}`, { ...options, headers });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Request failed');
  return data;
};

export const api = {
  get: (path: string) => apiFetch(path),
  post: (path: string, body: unknown) => apiFetch(path, { method: 'POST', body: JSON.stringify(body) }),
  put: (path: string, body: unknown) => apiFetch(path, { method: 'PUT', body: JSON.stringify(body) }),
  patch: (path: string, body: unknown) => apiFetch(path, { method: 'PATCH', body: JSON.stringify(body) }),
  delete: (path: string) => apiFetch(path, { method: 'DELETE' }),
};

// PayOS payment API
export const payosApi = {
  createPaymentLink: (orderId: string) =>
    api.post('/api/payos/payment-link', { orderId }),

  getPaymentStatus: (orderId: string) =>
    api.get(`/api/payos/payment-status/${orderId}`),

  checkPaymentStatus: (orderId: string) =>
    api.get(`/api/payos/check-payment/${orderId}`),
};
