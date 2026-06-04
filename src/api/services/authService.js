import Api, { TOKEN_KEY, REFRESH_KEY } from "../axios";
import { ENDPOINTS } from "../endpoints";

export const authService = {
  async login(credentials) {
    const { data } = await Api.post(ENDPOINTS.auth.login, credentials);
    const payload = data.data ?? data;
    const accessToken = payload.token ?? payload.accessToken ?? null;
    const refreshToken = payload.refreshToken ?? null;

    if (accessToken) localStorage.setItem(TOKEN_KEY, accessToken);
    if (refreshToken) localStorage.setItem(REFRESH_KEY, refreshToken);

    return {
      accessToken,
      user: payload.admin ?? payload.user ?? null,
      message: data.message ?? null,
    };
  },

  async forgotPassword(email) {
    const { data } = await Api.post(ENDPOINTS.auth.forgotPassword, { email });
    return data;
  },

  async resendOtp(email) {
    const { data } = await Api.post(ENDPOINTS.auth.resendOtp, { email });
    return data;
  },

  async verifyOtp(payload) {
    const { data } = await Api.post(ENDPOINTS.auth.verifyOtp, payload);
    return data;
  },

  async resetPassword(payload) {
    const { data } = await Api.post(ENDPOINTS.auth.resetPassword, payload);
    return data;
  },
};
