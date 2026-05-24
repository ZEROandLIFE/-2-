import type { ApiResponse } from "./types";

export interface Department {
  _id: string;
  name: string;
  parentId: string | null;
  leaderId: {
    _id: string;
    username: string;
    nickname?: string;
    email: string;
  } | null;
  description: string;
  order: number;
  children?: Department[];
  createdAt: string;
  updatedAt: string;
}

export interface Role {
  _id: string;
  name: string;
  permissions: string[];
  description: string;
  createdAt: string;
  updatedAt: string;
}

export interface DepartmentMember {
  _id: string;
  userId: {
    _id: string;
    username: string;
    nickname?: string;
    email: string;
    avatar?: string;
  };
  departmentId: string;
  isPrimary: boolean;
  joinedAt: string;
}

export interface DepartmentApplication {
  _id: string;
  userId: {
    _id: string;
    username: string;
    nickname?: string;
    email: string;
  };
  departmentId: {
    _id: string;
    name: string;
  };
  status: "pending" | "approved" | "rejected";
  reviewerId?: string;
  reviewedAt?: string;
  reason: string;
  createdAt: string;
}

export interface User {
  _id: string;
  username: string;
  nickname?: string;
  email: string;
  avatar?: string;
}

import request from "./request";

export const departmentApi = {
  create: (data: {
    name: string;
    parentId?: string;
    leaderId?: string;
    description?: string;
    order?: number;
  }) => {
    return request.post<ApiResponse<Department>>(
      "/organization/departments",
      data,
    ) as unknown as Promise<ApiResponse<Department>>;
  },

  list: () => {
    return request.get<ApiResponse<Department[]>>(
      "/organization/departments",
    ) as unknown as Promise<ApiResponse<Department[]>>;
  },

  get: (id: string) => {
    return request.get<ApiResponse<Department>>(
      `/organization/departments/${id}`,
    ) as unknown as Promise<ApiResponse<Department>>;
  },

  update: (
    id: string,
    data: {
      name?: string;
      parentId?: string;
      leaderId?: string;
      description?: string;
      order?: number;
    },
  ) => {
    return request.put<ApiResponse<Department>>(
      `/organization/departments/${id}`,
      data,
    ) as unknown as Promise<ApiResponse<Department>>;
  },

  delete: (id: string) => {
    return request.delete<ApiResponse<null>>(
      `/organization/departments/${id}`,
    ) as unknown as Promise<ApiResponse<null>>;
  },

  getMembers: (departmentId: string) => {
    return request.get<ApiResponse<DepartmentMember[]>>(
      `/organization/departments/${departmentId}/members`,
    ) as unknown as Promise<ApiResponse<DepartmentMember[]>>;
  },

  addMember: (
    departmentId: string,
    data: { userId: string; isPrimary?: boolean },
  ) => {
    return request.post<ApiResponse<DepartmentMember>>(
      `/organization/departments/${departmentId}/members`,
      data,
    ) as unknown as Promise<ApiResponse<DepartmentMember>>;
  },

  removeMember: (departmentId: string, userId: string) => {
    return request.delete<ApiResponse<null>>(
      `/organization/departments/${departmentId}/members/${userId}`,
    ) as unknown as Promise<ApiResponse<null>>;
  },

  getApplications: (departmentId: string) => {
    return request.get<ApiResponse<DepartmentApplication[]>>(
      `/organization/applications/department/${departmentId}`,
    ) as unknown as Promise<ApiResponse<DepartmentApplication[]>>;
  },
};

export const roleApi = {
  create: (data: {
    name: string;
    permissions?: string[];
    description?: string;
  }) => {
    return request.post<ApiResponse<Role>>(
      "/organization/roles",
      data,
    ) as unknown as Promise<ApiResponse<Role>>;
  },

  list: () => {
    return request.get<ApiResponse<Role[]>>(
      "/organization/roles",
    ) as unknown as Promise<ApiResponse<Role[]>>;
  },

  get: (id: string) => {
    return request.get<ApiResponse<Role>>(
      `/organization/roles/${id}`,
    ) as unknown as Promise<ApiResponse<Role>>;
  },

  update: (
    id: string,
    data: { name?: string; permissions?: string[]; description?: string },
  ) => {
    return request.put<ApiResponse<Role>>(
      `/organization/roles/${id}`,
      data,
    ) as unknown as Promise<ApiResponse<Role>>;
  },

  delete: (id: string) => {
    return request.delete<ApiResponse<null>>(
      `/organization/roles/${id}`,
    ) as unknown as Promise<ApiResponse<null>>;
  },
};

export const userApi = {
  list: () => {
    return request.get<ApiResponse<User[]>>(
      "/organization/users",
    ) as unknown as Promise<ApiResponse<User[]>>;
  },

  getDepartments: (userId: string) => {
    return request.get<ApiResponse<Department[]>>(
      `/organization/users/${userId}/departments`,
    ) as unknown as Promise<ApiResponse<Department[]>>;
  },
};

export const applicationApi = {
  join: (data: { departmentId: string; reason?: string }) => {
    return request.post<ApiResponse<DepartmentApplication>>(
      "/organization/applications/join",
      data,
    ) as unknown as Promise<ApiResponse<DepartmentApplication>>;
  },

  myList: () => {
    return request.get<ApiResponse<DepartmentApplication[]>>(
      "/organization/applications/my",
    ) as unknown as Promise<ApiResponse<DepartmentApplication[]>>;
  },

  review: (id: string, action: "approved" | "rejected") => {
    return request.put<ApiResponse<null>>(
      `/organization/applications/${id}/review`,
      { action },
    ) as unknown as Promise<ApiResponse<null>>;
  },
};
