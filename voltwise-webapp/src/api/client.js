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
    if (body && body.message) {
      return body.message;
    }
  } catch (ignored) {
    return `Beklenmeyen bir hata oluştu (${response.status}).`;
  }
  return `Beklenmeyen bir hata oluştu (${response.status}).`;
}

export const api = {
  listHomes: () => request('/homes'),
  getStatus: (homeId) => request(`/homes/${homeId}/status`),
  getHistory: (homeId, page = 0, size = 100) => request(`/homes/${homeId}/history?page=${page}&size=${size}`),
  getRecommendations: (homeId, page = 0, size = 20) =>
    request(`/homes/${homeId}/recommendations?page=${page}&size=${size}`),
  registerHome: (payload) => request('/homes', { method: 'POST', body: JSON.stringify(payload) }),
  consumerLogin: (payload) => request('/auth/consumer-login', { method: 'POST', body: JSON.stringify(payload) })
};
