const BASE_URL = process.env.REACT_APP_API_URL || 'http://127.0.0.1:8000';

const withBase = (url) => (url.startsWith('http') ? url : `${BASE_URL}${url}`);

const parseJsonSafe = async (res) => {
  const contentType = res.headers.get('content-type') || '';
  const text = await res.text();
  if (!contentType.includes('application/json')) {
    throw new Error(text ? text.slice(0, 200) : 'Non-JSON response');
  }
  let data;
  try {
    data = JSON.parse(text);
  } catch (err) {
    throw new Error('Invalid JSON response');
  }
  if (!res.ok) {
    throw new Error(data.message || `HTTP ${res.status}`);
  }
  return data;
};

export const postJson = async (url, body, token) => {
  const res = await fetch(withBase(url), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(body),
  });
  return parseJsonSafe(res);
};

export const getJson = async (url, token) => {
  const res = await fetch(withBase(url), {
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
  return parseJsonSafe(res);
};

export const API = {
  login: (email, password) => postJson('/api/auth/login', { email, password }),
  signup: (name, email, password) => postJson('/api/auth/signup', { name, email, password }),
  me: (token) => getJson('/api/auth/me', token),
  logout: (token) => postJson('/api/auth/logout', {}, token),
};

