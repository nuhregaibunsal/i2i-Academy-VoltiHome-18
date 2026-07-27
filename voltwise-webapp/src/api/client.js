const BASE = '/api';

async function request(path, options) {
  let response;
  try {
    response = await fetch(`${BASE}${path}`, {
      headers: { 'Content-Type': 'application/json' },
      ...options
    });
  } catch (networkError) {
    throw new Error('Sunucuya ulaşılamıyor. Bağlantınızı kontrol edin.');
  }

  if (!response.ok) {
    const message = await extractError(response);
    throw new Error(message);
  }

  if (response.status === 204) {
    return null;
  }
  return response.json();
}

async function extractError(response) {
  try {
    const body = await response.json();
    const message = body && (body.detail || body.message || body.title);
    if (message) {
      return message;
    }
  } catch (ignored) {
    return `Beklenmeyen bir hata oluştu (${response.status}).`;
  }
  return `Beklenmeyen bir hata oluştu (${response.status}).`;
}

export const api = {
  listHomes: () => request('/homes'),
  getStatus: (homeId) => request(`/homes/${homeId}/status`),
  getHistory: (homeId, opts = {}) => {
    const params = new URLSearchParams({ page: opts.page ?? 0, size: opts.size ?? 300 });
    if (opts.from) params.set('from', opts.from);
    if (opts.to) params.set('to', opts.to);
    return request(`/homes/${homeId}/history?${params.toString()}`);
  },
  getRecommendations: (homeId, page = 0, size = 20) =>
    request(`/homes/${homeId}/recommendations?page=${page}&size=${size}`),
  registerHome: (payload) => request('/homes', { method: 'POST', body: JSON.stringify(payload) }),
  addAppliance: (homeId, payload) =>
    request(`/homes/${homeId}/appliances`, { method: 'POST', body: JSON.stringify(payload) }),
  removeAppliance: (homeId, applianceId) =>
    request(`/homes/${homeId}/appliances/${applianceId}`, { method: 'DELETE' }),
  deleteHome: (homeId) => request(`/homes/${homeId}`, { method: 'DELETE' }),
  consumerLogin: (payload) => request('/auth/consumer-login', { method: 'POST', body: JSON.stringify(payload) }),
  getNotifications: (opts = {}) => {
    const params = new URLSearchParams({ page: opts.page ?? 0, size: opts.size ?? 30 });
    if (opts.homeId != null) params.set('homeId', opts.homeId);
    return request(`/notifications?${params.toString()}`);
  },
  markNotificationRead: (id) => request(`/notifications/${id}/read`, { method: 'PATCH' }),
  markAllNotificationsRead: (homeId) => {
    const q = homeId != null ? `?homeId=${homeId}` : '';
    return request(`/notifications/read-all${q}`, { method: 'PATCH' });
  }
};
