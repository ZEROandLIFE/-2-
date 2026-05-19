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
  department?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface AuthData {
  token: string;
  user: UserInfo;
}

const getInitialToken = (): string => {
  return localStorage.getItem("token") || "";
};

const getInitialUserInfo = (): UserInfo | null => {
  const stored = localStorage.getItem("userInfo");
  return stored ? JSON.parse(stored) : null;
};

export const useAuthStore = defineStore("auth", () => {
  const token = ref<string>(getInitialToken());
  const userInfo = ref<UserInfo | null>(getInitialUserInfo());
  const isLoading = ref(false);

  const setToken = (newToken: string) => {
    token.value = newToken;
    localStorage.setItem("token", newToken);
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
    token.value = "";
    userInfo.value = null;
    localStorage.removeItem("token");
    localStorage.removeItem("userInfo");
  };

  const login = async (email: string, password: string) => {
    isLoading.value = true;
    try {
      const response = (await authApi.login({
        email,
        password,
      })) as ApiResponse<AuthData>;
      if (response.code === 200 && response.data) {
        setToken(response.data.token);
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
      const response = (await authApi.register({
        username,
        email,
        password,
      })) as ApiResponse<AuthData>;
      if (response.code === 200 && response.data) {
        setToken(response.data.token);
        setUserInfo(response.data.user);
        return response;
      }
      throw new Error(response.message || "注册失败");
    } finally {
      isLoading.value = false;
    }
  };

  const getMe = async () => {
    try {
      const response = (await authApi.getMe()) as ApiResponse<UserInfo>;
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
    token,
    userInfo,
    isLoading,
    setToken,
    setUserInfo,
    logout,
    login,
    register,
    getMe,
    logoutApi,
  };
});
