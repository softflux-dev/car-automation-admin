import axios from "axios";

const BASE_URL =
  import.meta.env.VITE_API_URL ??
  "https://ryansautoreiniging-d36c1fc7d2c2.herokuapp.com/api/";
// const BASE_URL =
//   import.meta.env.VITE_API_URL ??
//   "https://lj1lt6m5-5000.inc1.devtunnels.ms/api/";
const TOKEN_KEY = "car_automation_admin_token";
const REFRESH_KEY = "car_automation_refresh";

const Api = axios.create({
  baseURL: BASE_URL,
  timeout: 12000,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// ─── Request interceptor — attach JWT + log ───────────────────────────────────
Api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (token) config.headers.Authorization = `Bearer ${token}`;

    const method = (config.method ?? "GET").toUpperCase();
    const url = `${config.baseURL ?? BASE_URL}${config.url ?? ""}`;

    console.groupCollapsed(
      `%c⬆ ${method}%c ${config.url}`,
      "color:#1072b7;font-weight:700;font-size:11px;background:#eef6fd;padding:2px 6px;border-radius:4px",
      "color:#374151;font-weight:600;font-size:11px",
    );
    console.log("%cFull URL   ", "color:#6b7280;font-size:10px", url);
    console.log(
      "%cAuth       ",
      "color:#6b7280;font-size:10px",
      token ? `Bearer ${token.substring(0, 12)}…` : "⚠️  No token",
    );
    if (config.params && Object.keys(config.params).length) {
      console.log(
        "%cParams     ",
        "color:#6b7280;font-size:10px",
        config.params,
      );
    }
    if (config.data) {
      console.log("%cPayload    ", "color:#6b7280;font-size:10px", config.data);
    }
    console.log(
      "%cTimestamp  ",
      "color:#6b7280;font-size:10px",
      new Date().toISOString(),
    );
    console.groupEnd();

    config.metadata = { startTime: Date.now() };
    return config;
  },
  (error) => Promise.reject(error),
);

// ─── Response interceptor — log + handle 401 ─────────────────────────────────
Api.interceptors.response.use(
  (response) => {
    const method = (response.config.method ?? "GET").toUpperCase();
    const duration =
      Date.now() - (response.config.metadata?.startTime ?? Date.now());
    const status = response.status;

    console.groupCollapsed(
      `%c⬇ ${method}%c ${response.config.url} %c${status}%c ${duration}ms`,
      "color:#059669;font-weight:700;font-size:11px;background:#ecfdf5;padding:2px 6px;border-radius:4px",
      "color:#374151;font-weight:600;font-size:11px",
      "color:#ffffff;background:#059669;font-size:10px;padding:1px 5px;border-radius:4px",
      "color:#6b7280;font-size:10px",
    );
    console.log("%cResponse   ", "color:#6b7280;font-size:10px", response.data);
    console.groupEnd();

    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    const status = error.response?.status;
    const method = (originalRequest?.method ?? "GET").toUpperCase();
    const duration =
      Date.now() - (originalRequest?.metadata?.startTime ?? Date.now());

    // ─── Log the error ──────────────────────────────────────────────────────
    console.groupCollapsed(
      `%c⬇ ${method}%c ${originalRequest?.url} %c${status ?? "ERR"}%c ${duration}ms`,
      "color:#dc2626;font-weight:700;font-size:11px;background:#fef2f2;padding:2px 6px;border-radius:4px",
      "color:#374151;font-weight:600;font-size:11px",
      "color:#ffffff;background:#dc2626;font-size:10px;padding:1px 5px;border-radius:4px",
      "color:#6b7280;font-size:10px",
    );
    console.log("%cError      ", "color:#dc2626;font-size:10px", error.message);
    if (error.response?.data) {
      console.log(
        "%cServer msg ",
        "color:#6b7280;font-size:10px",
        error.response.data,
      );
    }
    console.groupEnd();

    // ─── 401 — try refresh, then show unauth UI ─────────────────────────────
    if (status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const refreshToken = localStorage.getItem(REFRESH_KEY);
        if (!refreshToken) throw new Error("No refresh token");

        const { data } = await axios.post(`${BASE_URL}/auth/refresh`, {
          refreshToken,
        });
        localStorage.setItem(TOKEN_KEY, data.accessToken);
        originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
        return Api(originalRequest);
      } catch {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(REFRESH_KEY);
        // Notify the UI — the UnauthorizedDialog listens for this event
        // window.dispatchEvent(new CustomEvent("car_automation:unauth"));
      }
    }

    return Promise.reject(error);
  },
);

export const requestType = {
  GET: "GET",
  POST: "POST",
  PUT: "PUT",
  DELETE: "DELETE",
  PATCH: "PATCH",
};

export { TOKEN_KEY, REFRESH_KEY };
export default Api;
