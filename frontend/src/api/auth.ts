import request from './request'
import type { ApiResponse } from './types'

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

export const authApi = {
  login: (data: { email: string; password: string }): Promise<ApiResponse<AuthData>> => {
    return request.post('/auth/login', data)
  },
  register: (data: { username: string; email: string; password: string }): Promise<ApiResponse<AuthData>> => {
    return request.post('/auth/register', data)
  },
  refreshToken: (data: { refreshToken: string }): Promise<ApiResponse<AuthData>> => {
    return request.post('/auth/refresh', data)
  },
  getMe: (): Promise<ApiResponse<UserInfo>> => {
    return request.get('/auth/me')
  },
  logout: (): Promise<ApiResponse<null>> => {
    return request.post('/auth/logout')
  }
}
