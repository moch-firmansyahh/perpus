const BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

async function request(path, { method = 'GET', body, token } = {}) {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
    cache: 'no-store',
  });

  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw Object.assign(new Error(json.message || 'Permintaan gagal'), {
      status: res.status,
      errors: json.errors,
    });
  }
  return json;
}

const buildQuery = (params = {}) => {
  const sp = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      sp.set(key, String(value));
    }
  });
  const qs = sp.toString();
  return qs ? `?${qs}` : '';
};

export const api = {
  health: () => request('/health'),

  // Auth
  login: (body) => request('/api/auth/login', { method: 'POST', body }),
  register: (body) => request('/api/auth/register', { method: 'POST', body }),
  me: (token) => request('/api/auth/me', { token }),

  // Buku
  listBuku: (params, token) => request(`/api/buku${buildQuery(params)}`, { token }),
  getBuku: (id, token) => request(`/api/buku/${id}`, { token }),
  createBuku: (body, token) => request('/api/buku', { method: 'POST', body, token }),
  updateBuku: (id, body, token) => request(`/api/buku/${id}`, { method: 'PUT', body, token }),
  deleteBuku: (id, token) => request(`/api/buku/${id}`, { method: 'DELETE', token }),

  // Anggota
  listAnggota: (params, token) => request(`/api/anggota${buildQuery(params)}`, { token }),
  getAnggota: (id, token) => request(`/api/anggota/${id}`, { token }),
  createAnggota: (body, token) => request('/api/anggota', { method: 'POST', body, token }),
  updateAnggota: (id, body, token) => request(`/api/anggota/${id}`, { method: 'PUT', body, token }),
  deleteAnggota: (id, token) => request(`/api/anggota/${id}`, { method: 'DELETE', token }),

  // Peminjaman
  listPeminjaman: (params, token) => request(`/api/peminjaman${buildQuery(params)}`, { token }),
  getPeminjaman: (id, token) => request(`/api/peminjaman/${id}`, { token }),
  createPeminjaman: (body, token) => request('/api/peminjaman', { method: 'POST', body, token }),
  updatePeminjaman: (id, body, token) =>
    request(`/api/peminjaman/${id}`, { method: 'PUT', body, token }),
  deletePeminjaman: (id, token) => request(`/api/peminjaman/${id}`, { method: 'DELETE', token }),

  // Sirkulasi
  pinjam: (body, token) => request('/api/sirkulasi/pinjam', { method: 'POST', body, token }),
  kembali: (peminjamanId, token) =>
    request('/api/sirkulasi/kembali', { method: 'POST', body: { peminjamanId }, token }),
  ringkasan: (token) => request('/api/sirkulasi/ringkasan', { token }),
};
