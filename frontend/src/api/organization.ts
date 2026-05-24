import request from "./request";
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

// ============ 部门 API ============

export const departmentApi = {
  // 创建部门
  create: (data: { name: string; parentId?: string; leaderId?: string; description?: string; order?: number }) => {
    return request.post<ApiResponse<Department>>("/organization/departments", data);
  },

  // 获取部门列表（树形）
  list: () => {
    return request.get<ApiResponse<Department[]>>("/organization/departments");
  },

  // 获取单个部门
  get: (id: string) => {
    return request.get<ApiResponse<Department>>(`/organization/departments/${id}`);
  },

  // 更新部门
  update: (id: string, data: { name?: string; parentId?: string; leaderId?: string; description?: string; order?: number }) => {
    return request.put<ApiResponse<Department>>(`/organization/departments/${id}`, data);
  },

  // 删除部门
  delete: (id: string) => {
    return request.delete<ApiResponse<null>>(`/organization/departments/${id}`);
  },

  // 获取部门成员
  getMembers: (departmentId: string) => {
    return request.get<ApiResponse<DepartmentMember[]>>(`/organization/departments/${departmentId}/members`);
  },

  // 添加部门成员
  addMember: (departmentId: string, data: { userId: string; isPrimary?: boolean }) => {
    return request.post<ApiResponse<DepartmentMember>>(`/organization/departments/${departmentId}/members`, data);
  },

  // 移除部门成员
  removeMember: (departmentId: string, userId: string) => {
    return request.delete<ApiResponse<null>>(`/organization/departments/${departmentId}/members/${userId}`);
  },

  // 获取部门的待审批申请
  getApplications: (departmentId: string) => {
    return request.get<ApiResponse<DepartmentApplication[]>>(`/organization/applications/department/${departmentId}`);
  },
};

// ============ 角色 API ============

export const roleApi = {
  // 创建角色
  create: (data: { name: string; permissions?: string[]; description?: string }) => {
    return request.post<ApiResponse<Role>>("/organization/roles", data);
  },

  // 获取角色列表
  list: () => {
    return request.get<ApiResponse<Role[]>>("/organization/roles");
  },

  // 获取单个角色
  get: (id: string) => {
    return request.get<ApiResponse<Role>>(`/organization/roles/${id}`);
  },

  // 更新角色
  update: (id: string, data: { name?: string; permissions?: string[]; description?: string }) => {
    return request.put<ApiResponse<Role>>(`/organization/roles/${id}`, data);
  },

  // 删除角色
  delete: (id: string) => {
    return request.delete<ApiResponse<null>>(`/organization/roles/${id}`);
  },
};

// ============ 用户 API ============

export const userApi = {
  // 获取所有用户
  list: () => {
    return request.get<ApiResponse<User[]>>("/organization/users");
  },

  // 获取用户的部门列表
  getDepartments: (userId: string) => {
    return request.get<ApiResponse<Department[]>>(`/organization/users/${userId}/departments`);
  },
};

// ============ 申请 API ============

export const applicationApi = {
  // 申请加入部门
  join: (data: { departmentId: string; reason?: string }) => {
    return request.post<ApiResponse<DepartmentApplication>>("/organization/applications/join", data);
  },

  // 获取我的申请列表
  myList: () => {
    return request.get<ApiResponse<DepartmentApplication[]>>("/organization/applications/my");
  },

  // 审批申请
  review: (id: string, action: "approved" | "rejected") => {
    return request.put<ApiResponse<null>>(`/organization/applications/${id}/review`, { action });
  },
};
