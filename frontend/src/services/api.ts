import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || '';

export const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Injetar token automaticamente
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('synaps_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Redirecionar para login em 401
api.interceptors.response.use(
  (r) => r,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('synaps_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// --- Auth ---
export const authApi = {
  me: () => api.get('/auth/me').then((r) => r.data),
  logout: () => api.post('/auth/logout').then((r) => r.data),
};

// --- Tenants ---
export const tenantApi = {
  create: (data: { name: string; slug?: string }) =>
    api.post('/api/tenants', data).then((r) => r.data),

  get: (slug: string) => api.get(`/api/tenants/${slug}`).then((r) => r.data),

  update: (slug: string, data: { name?: string; logoUrl?: string | null }) =>
    api.patch(`/api/tenants/${slug}`, data).then((r) => r.data),

  members: (slug: string) =>
    api.get(`/api/tenants/${slug}/members`).then((r) => r.data),

  invite: (slug: string, data: { email: string; role: string }) =>
    api.post(`/api/tenants/${slug}/invite`, data).then((r) => r.data),

  updateMember: (slug: string, id: string, role: string) =>
    api.patch(`/api/tenants/${slug}/members/${id}`, { role }).then((r) => r.data),

  removeMember: (slug: string, id: string) =>
    api.delete(`/api/tenants/${slug}/members/${id}`).then((r) => r.data),

  getInvite: (token: string) =>
    api.get(`/api/tenants/invite/${token}`).then((r) => r.data),

  acceptInvite: (token: string) =>
    api.post(`/api/tenants/invite/accept/${token}`).then((r) => r.data),
};

// --- Projects ---
export const projectApi = {
  list: (slug: string, params?: Record<string, string>) =>
    api.get(`/api/tenants/${slug}/projects`, { params }).then((r) => r.data),

  create: (slug: string, data: Record<string, unknown>) =>
    api.post(`/api/tenants/${slug}/projects`, data).then((r) => r.data),

  get: (slug: string, id: string) =>
    api.get(`/api/tenants/${slug}/projects/${id}`).then((r) => r.data),

  update: (slug: string, id: string, data: Record<string, unknown>) =>
    api.patch(`/api/tenants/${slug}/projects/${id}`, data).then((r) => r.data),

  delete: (slug: string, id: string) =>
    api.delete(`/api/tenants/${slug}/projects/${id}`).then((r) => r.data),

  logs: (slug: string, id: string) =>
    api.get(`/api/tenants/${slug}/projects/${id}/logs`).then((r) => r.data),
};

// --- Tasks ---
export const taskApi = {
  create: (projectId: string, data: { title: string; dueDate?: string; assignee?: string }) =>
    api.post(`/api/projects/${projectId}/tasks`, data).then((r) => r.data),

  update: (id: string, data: { title?: string; done?: boolean; dueDate?: string; assignee?: string }) =>
    api.patch(`/api/tasks/${id}`, data).then((r) => r.data),

  delete: (id: string) =>
    api.delete(`/api/tasks/${id}`).then((r) => r.data),
};

// --- Dashboard ---
export const dashboardApi = {
  get: (slug: string) =>
    api.get(`/api/tenants/${slug}/dashboard`).then((r) => r.data),
};
