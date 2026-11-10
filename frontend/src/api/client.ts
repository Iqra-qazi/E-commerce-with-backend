import axios from "axios";

const baseURL = import.meta.env.VITE_API_URL?.trim();

if (!baseURL) {
  throw new Error("VITE_API_URL is required. Set it in frontend/.env or the frontend deployment environment.");
}

export const api = axios.create({
  baseURL,
  withCredentials: true,
});

let handleUnauthorized = () => {
  localStorage.removeItem("ecommerce_token");
  if (window.location.pathname !== "/login") {
    window.location.assign("/login");
  }
};

export function setUnauthorizedHandler(handler: () => void) {
  handleUnauthorized = handler;
}

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("ecommerce_token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      const requestUrl = error.config?.url ?? "";
      const isAuthSubmission = /\/auth\/(login|register)\/?$/.test(requestUrl);

      if (!isAuthSubmission) {
        handleUnauthorized();
      }
    }

    return Promise.reject(error);
  },
);
