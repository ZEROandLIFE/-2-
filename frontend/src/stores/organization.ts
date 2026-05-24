import { defineStore } from "pinia";
import { ref } from "vue";
import {
  departmentApi,
  roleApi,
  userApi,
  applicationApi,
  type Department,
  type Role,
  type DepartmentMember,
  type DepartmentApplication,
  type User,
} from "@/api/organization";

export const useOrganizationStore = defineStore("organization", () => {
  // 部门相关
  const departments = ref<Department[]>([]);
  const currentDepartment = ref<Department | null>(null);
  const departmentMembers = ref<DepartmentMember[]>([]);
  const departmentApplications = ref<DepartmentApplication[]>([]);

  // 角色相关
  const roles = ref<Role[]>([]);
  const currentRole = ref<Role | null>(null);

  // 用户相关
  const allUsers = ref<User[]>([]);

  // 申请相关
  const myApplications = ref<DepartmentApplication[]>([]);

  // 加载状态
  const isLoading = ref(false);

  // ============ 部门操作 ============

  const loadDepartments = async () => {
    isLoading.value = true;
    try {
      const response = await departmentApi.list();
      if (response.code === 200) {
        departments.value = response.data;
      }
    } finally {
      isLoading.value = false;
    }
  };

  const loadDepartment = async (id: string) => {
    const response = await departmentApi.get(id);
    if (response.code === 200) {
      currentDepartment.value = response.data;
      return response.data;
    }
    return null;
  };

  const createDepartment = async (data: {
    name: string;
    parentId?: string;
    leaderId?: string;
    description?: string;
    order?: number;
  }) => {
    const response = await departmentApi.create(data);
    if (response.code === 200) {
      await loadDepartments();
      return response.data;
    }
    throw new Error(response.message || "创建失败");
  };

  const updateDepartment = async (
    id: string,
    data: {
      name?: string;
      parentId?: string;
      leaderId?: string;
      description?: string;
      order?: number;
    },
  ) => {
    const response = await departmentApi.update(id, data);
    if (response.code === 200) {
      await loadDepartments();
      return response.data;
    }
    throw new Error(response.message || "更新失败");
  };

  const deleteDepartment = async (id: string) => {
    try {
      const response = await departmentApi.delete(id);
      if (response.code === 200) {
        await loadDepartments();
      } else {
        throw new Error(response.message || "删除失败");
      }
    } catch (error: any) {
      throw new Error(error.response?.data?.message || error.message || "删除失败");
    }
  };

  // ============ 部门成员操作 ============

  const loadDepartmentMembers = async (departmentId: string) => {
    const response = await departmentApi.getMembers(departmentId);
    if (response.code === 200) {
      departmentMembers.value = response.data;
    }
  };

  const addDepartmentMember = async (
    departmentId: string,
    userId: string,
    isPrimary = false,
  ) => {
    const response = await departmentApi.addMember(departmentId, {
      userId,
      isPrimary,
    });
    if (response.code === 200) {
      await loadDepartmentMembers(departmentId);
      return response.data;
    }
    throw new Error(response.message || "添加失败");
  };

  const removeDepartmentMember = async (
    departmentId: string,
    userId: string,
  ) => {
    const response = await departmentApi.removeMember(departmentId, userId);
    if (response.code === 200) {
      await loadDepartmentMembers(departmentId);
    } else {
      throw new Error(response.message || "移除失败");
    }
  };

  // ============ 部门申请操作 ============

  const loadDepartmentApplications = async (departmentId: string) => {
    const response = await departmentApi.getApplications(departmentId);
    if (response.code === 200) {
      departmentApplications.value = response.data;
    }
  };

  const applyToJoinDepartment = async (
    departmentId: string,
    reason?: string,
  ) => {
    const response = await applicationApi.join({ departmentId, reason });
    if (response.code === 200) {
      return response.data;
    }
    throw new Error(response.message || "申请失败");
  };

  const reviewApplication = async (
    id: string,
    action: "approved" | "rejected",
  ) => {
    const response = await applicationApi.review(id, action);
    if (response.code === 200) {
      return true;
    }
    throw new Error(response.message || "审批失败");
  };

  // ============ 角色操作 ============

  const loadRoles = async () => {
    isLoading.value = true;
    try {
      const response = await roleApi.list();
      if (response.code === 200) {
        roles.value = response.data;
      }
    } finally {
      isLoading.value = false;
    }
  };

  const createRole = async (data: {
    name: string;
    permissions?: string[];
    description?: string;
  }) => {
    const response = await roleApi.create(data);
    if (response.code === 200) {
      await loadRoles();
      return response.data;
    }
    throw new Error(response.message || "创建失败");
  };

  const updateRole = async (
    id: string,
    data: { name?: string; permissions?: string[]; description?: string },
  ) => {
    const response = await roleApi.update(id, data);
    if (response.code === 200) {
      await loadRoles();
      return response.data;
    }
    throw new Error(response.message || "更新失败");
  };

  const deleteRole = async (id: string) => {
    const response = await roleApi.delete(id);
    if (response.code === 200) {
      await loadRoles();
    } else {
      throw new Error(response.message || "删除失败");
    }
  };

  // ============ 用户操作 ============

  const loadAllUsers = async () => {
    const response = await userApi.list();
    if (response.code === 200) {
      allUsers.value = response.data;
    }
  };

  // ============ 我的申请操作 ============

  const loadMyApplications = async () => {
    const response = await applicationApi.myList();
    if (response.code === 200) {
      myApplications.value = response.data;
    }
  };

  return {
    // 状态
    departments,
    currentDepartment,
    departmentMembers,
    departmentApplications,
    roles,
    currentRole,
    allUsers,
    myApplications,
    isLoading,

    // 部门操作
    loadDepartments,
    loadDepartment,
    createDepartment,
    updateDepartment,
    deleteDepartment,

    // 部门成员操作
    loadDepartmentMembers,
    addDepartmentMember,
    removeDepartmentMember,

    // 部门申请操作
    loadDepartmentApplications,
    applyToJoinDepartment,
    reviewApplication,

    // 角色操作
    loadRoles,
    createRole,
    updateRole,
    deleteRole,

    // 用户操作
    loadAllUsers,

    // 我的申请
    loadMyApplications,
  };
});
