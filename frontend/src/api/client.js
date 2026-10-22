import axios from "axios";

const api = axios.create({
  baseURL: "/api",
  timeout: 15000,
  headers: { "Content-Type": "application/json" },
});

// Attach admin key from localStorage if present
api.interceptors.request.use((config) => {
  const key = localStorage.getItem("pawpal_admin_key");
  if (key) config.headers["X-Admin-Key"] = key;
  return config;
});

// Normalise error messages
api.interceptors.response.use(
  (res) => res,
  (err) => {
    const msg =
      err?.response?.data?.detail ||
      err?.response?.data?.message ||
      err?.message ||
      "Unknown error";
    return Promise.reject(new Error(typeof msg === "string" ? msg : JSON.stringify(msg)));
  }
);

export default api;

// ── Named helpers ─────────────────────────────
export const petsApi = {
  list:   (params) => api.get("/pets", { params }),
  get:    (id)     => api.get(`/pets/${id}`),
  create: (data)   => api.post("/pets", data),
  update: (id, data) => api.put(`/pets/${id}`, data),
  remove: (id)     => api.delete(`/pets/${id}`),
};

export const applicationsApi = {
  submit:     (data)       => api.post("/applications", data),
  myApps:     (email)      => api.get(`/applications/my/${encodeURIComponent(email)}`),
  listAll:    (params)     => api.get("/applications", { params }),
  updateStatus: (id, data) => api.put(`/applications/${id}/status`, data),
};

export const analyticsApi = {
  summary:           () => api.get("/analytics/summary"),
  bySpecies:         () => api.get("/analytics/by-species"),
  byStatus:          () => api.get("/analytics/applications-by-status"),
  monthlyTrends:     (months = 6) => api.get("/analytics/monthly-trends", { params: { months } }),
  avgAgeBySpecies:   () => api.get("/analytics/avg-age-by-species"),
  topApplied:        () => api.get("/analytics/top-applied-pets"),
  adoptionRate:      () => api.get("/analytics/adoption-rate"),
  speciesBreakdown:  () => api.get("/analytics/species-status-breakdown"),
};
