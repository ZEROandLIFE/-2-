import { defineStore } from "pinia";
import { ref } from "vue";
import { authApi } from "@/api/auth";
import type { ApiResponse } from "@/api/types";

export interface UserInfo {
  id: string;
  username: string;
  email: string;
  nickname?: string;
  avatar?: string;
  role?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface AuthData {
  accessToken: string;
  refreshToken: string;
  user: UserInfo;
}

const getInitialAccessToken = (): string => {
  return localStorage.getItem("accessToken") || "";
};

const getInitialRefreshToken = (): string => {
  return localStorage.getItem("refreshToken") || "";
};

export const useAuthStore = defineStore("auth", () => {
  const accessToken = ref<string>(getInitialAccessToken());
  const refreshToken = ref<string>(getInitialRefreshToken());
  const userInfo = ref<UserInfo | null>(null);
  const isLoading = ref(false);

  const setAccessToken = (token: string) => {
    accessToken.value = token;
    localStorage.setItem("accessToken", token);
  };

  const setRefreshToken = (token: string) => {
    refreshToken.value = token;
    localStorage.setItem("refreshToken", token);
  };

  const setUserInfo = (info: UserInfo | null) => {
    userInfo.value = info;
    if (info) {
      localStorage.setItem("userInfo", JSON.stringify(info));
    } else {
      localStorage.removeItem("userInfo");
    }
  };

  const logout = () => {
    accessToken.value = "";
    refreshToken.value = "";
    userInfo.value = null;
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("userInfo");
  };

  const login = async (email: string, password: string) => {
    isLoading.value = true;
    try {
      const response = await authApi.login({ email, password }) as ApiResponse<AuthData>;
      if (response.code === 200 && response.data) {
        setAccessToken(response.data.accessToken);
        setRefreshToken(response.data.refreshToken);
        setUserInfo(response.data.user);
        return response;
      }
      throw new Error(response.message || "登录失败");
    } finally {
      isLoading.value = false;
    }
  };

  const register = async (
    username: string,
    email: string,
    password: string,
  ) => {
    isLoading.value = true;
    try {
      const response = await authApi.register({ username, email, password }) as ApiResponse<AuthData>;
      if (response.code === 200 && response.data) {
        setAccessToken(response.data.accessToken);
        setRefreshToken(response.data.refreshToken);
        setUserInfo(response.data.user);
        return response;
      }
      throw new Error(response.message || "注册失败");
    } finally {
      isLoading.value = false;
    }
  };

  const refreshTokenFn = async () => {
    try {
      const response = await authApi.refreshToken({
        refreshToken: refreshToken.value,
      }) as ApiResponse<AuthData>;
      if (response.code === 200 && response.data) {
        setAccessToken(response.data.accessToken);
        setRefreshToken(response.data.refreshToken);
        return response;
      }
      throw new Error(response.message || "刷新token失败");
    } catch (error) {
      logout();
      throw error;
    }
  };

  const getMe = async () => {
    try {
      const response = await authApi.getMe() as ApiResponse<UserInfo>;
      if (response.code === 200 && response.data) {
        setUserInfo(response.data);
        return response;
      }
    } catch (error) {
      logout();
    }
  };

  const logoutApi = async () => {
    try {
      await authApi.logout();
    } finally {
      logout();
    }
  };

  return {
    accessToken,
    refreshToken,
    userInfo,
    isLoading,
    setAccessToken,
    setRefreshToken,
    setUserInfo,
    logout,
    login,
    register,
    refreshTokenFn,
    getMe,
    logoutApi,
  };
});
