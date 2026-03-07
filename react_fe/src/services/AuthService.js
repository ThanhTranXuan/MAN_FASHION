// src/services/AuthService.js
import ApiClient from 'api/ApiClient';
import ApiUrl from 'constants/ApiUrl';

const getStorage = (keepLoggedIn) =>
  keepLoggedIn ? localStorage : sessionStorage;

// ✅ decode payload của JWT (base64url)
const decodeJwt = (token) => {
  try {
    const [, payload] = token.split('.');
    if (!payload) return null;
    // base64url -> base64
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
    const padded =
      base64 + '='.repeat((4 - (base64.length % 4)) % 4);
    const json = atob(padded);
    return JSON.parse(json);
  } catch {
    return null;
  }
};

const AuthService = {
  // ==== REGISTER ====
  register: async ({ fullName, email, password }) => {
    await ApiClient.post(ApiUrl.REGISTER, {
      fullName,
      email,
      password,
    });
  },

  // ==== LOGIN ====
  login: async ({ email, password, keepLoggedIn }) => {
    const res = await ApiClient.post(ApiUrl.LOGIN, { email, password });
    const { accessToken, refreshToken /*, user*/ } = res.data || {};

    if (accessToken && refreshToken) {
      const storage = getStorage(keepLoggedIn);
      storage.setItem('access_token', accessToken);
      storage.setItem('refresh_token', refreshToken);
      storage.setItem('keepLoggedIn', keepLoggedIn.toString());
      // ❌ không lưu user nữa
      sessionStorage.removeItem('guest_cart');
    }

    // vẫn trả về data để component có thể setUser ngay nếu muốn
    return res.data;
  },

  // ==== SOCIAL LOGIN ====
  socialLogin: async ({ idToken, provider, keepLoggedIn }) => {
    const res = await ApiClient.post(ApiUrl.SOCIAL_LOGIN, {
      idToken,
      provider,
    });

    const { accessToken, refreshToken /*, user*/ } = res.data || {};
    if (accessToken && refreshToken) {
      const storage = getStorage(keepLoggedIn);
      storage.setItem('access_token', accessToken);
      storage.setItem('refresh_token', refreshToken);
      storage.setItem('keepLoggedIn', keepLoggedIn.toString());
      // ❌ không lưu user
      sessionStorage.removeItem('guest_cart');
    }

    return res.data;
  },

  // ==== REFRESH TOKEN ====
  refreshToken: async () => {
    const token = AuthService.getRefreshToken();
    if (!token) throw new Error('No refresh token found');

    const res = await ApiClient.post(ApiUrl.REFRESH_TOKEN, null, {
      params: { refresh_token: token },
    });

    const { accessToken, refreshToken /*, user*/ } = res.data || {};
    if (accessToken) {
      const keepLoggedIn = AuthService.isKeepLoggedIn();
      const storage = getStorage(keepLoggedIn);

      storage.setItem('access_token', accessToken);
      if (refreshToken) storage.setItem('refresh_token', refreshToken);
      // ❌ không lưu user nữa

      return accessToken;
    }

    throw new Error('Refresh failed');
  },

  // ==== PASSWORD ====
  forgotPassword: (email) =>
    ApiClient.post(ApiUrl.FORGOT_PASSWORD, null, { params: { email } }),

  resetPassword: (token, newPassword) =>
    ApiClient.post(ApiUrl.RESET_PASSWORD, {
      token,
      new_password: newPassword,
    }),

  // ==== GETTERS ====
  getAccessToken: () =>
    localStorage.getItem('access_token') ||
    sessionStorage.getItem('access_token'),

  getRefreshToken: () =>
    localStorage.getItem('refresh_token') ||
    sessionStorage.getItem('refresh_token'),

  setAccessToken: (token) => {
    const keepLoggedIn = AuthService.isKeepLoggedIn();
    const storage = getStorage(keepLoggedIn);
    storage.setItem('access_token', token);
  },

  getUserFromToken: () => {
    const token =
      localStorage.getItem('access_token') ||
      sessionStorage.getItem('access_token');
    if (!token) return null;

    const payload = decodeJwt(token);
    if (!payload) return null;

    return {
      id: payload.sub || payload.userId || payload.id || null,
      roleName: payload.role || payload.roleName || null,
      exp: payload.exp,
      iat: payload.iat,
    };
  },

  getUser: () => {
    return AuthService.getUserFromToken();
  },

  isKeepLoggedIn: () => {
    const val =
      localStorage.getItem('keepLoggedIn') ||
      sessionStorage.getItem('keepLoggedIn');
    return val === 'true';
  },

  logout: () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('keepLoggedIn');

    sessionStorage.removeItem('access_token');
    sessionStorage.removeItem('refresh_token');
    sessionStorage.removeItem('keepLoggedIn');
    sessionStorage.removeItem('user');
  },
};

export default AuthService;
