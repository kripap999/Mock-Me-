// Lightweight API client with graceful fallbacks
// Uses Vite env var VITE_API_BASE_URL if present

const API_BASE = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_BASE_URL) || '';

const safeFetch = async (path, options = {}) => {
  const url = API_BASE ? `${API_BASE}${path}` : path;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 12000);
  try {
    const res = await fetch(url, { ...options, signal: controller.signal });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const contentType = res.headers.get('content-type') || '';
    if (contentType.includes('application/json')) return await res.json();
    return await res.text();
  } finally {
    clearTimeout(timeout);
  }
};

export const getDemos = async () => {
  if (!API_BASE) throw new Error('API base not configured');
  return await safeFetch('/api/demos/');
};

export const uploadResume = async (formData) => {
  if (!API_BASE) throw new Error('API base not configured');
  return await safeFetch('/api/upload-resume/', {
    method: 'POST',
    body: formData,
  });
};

export const submitAnswers = async (payload) => {
  if (!API_BASE) throw new Error('API base not configured');
  return await safeFetch('/api/submit-answers/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
};

export const analyze = async (payload) => {
  if (!API_BASE) throw new Error('API base not configured');
  return await safeFetch('/api/analyze/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
};


