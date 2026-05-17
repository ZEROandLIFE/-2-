import { defineStore } from "pinia";
import { ref, computed } from "vue";
import {
  applicationApi,
  type Application,
  type ApplicationStats,
  type CreateApplicationRequest,
  type UpdateApplicationRequest,
} from "@/api/application";
import type { ApiResponse } from "@/api/types";

export const useApplicationStore = defineStore("application", () => {
  const applications = ref<Application[]>([]);
  const stats = ref<ApplicationStats>({ total: 0, draft: 0, published: 0 });
  const isLoading = ref(false);
  const pagination = ref({
    page: 1,
    limit: 10,
    total: 0,
  });

  const loadApplications = async (page = 1, limit = 10) => {
    isLoading.value = true;
    try {
      const response = (await applicationApi.list(page, limit)) as ApiResponse<
        Application[]
      >;
      if (response.code === 200) {
        applications.value = response.data;
        if (response.pagination) {
          pagination.value = response.pagination;
        }
      }
    } finally {
      isLoading.value = false;
    }
  };

  const loadStats = async () => {
    try {
      const response =
        (await applicationApi.stats()) as ApiResponse<ApplicationStats>;
      if (response.code === 200) {
        stats.value = response.data;
      }
    } catch (error) {
      console.error("Failed to load stats:", error);
    }
  };

  const createApplication = async (data: CreateApplicationRequest) => {
    isLoading.value = true;
    try {
      const response = (await applicationApi.create(
        data,
      )) as ApiResponse<Application>;
      if (response.code === 200) {
        await loadApplications(pagination.value.page, pagination.value.limit);
        await loadStats();
        return response.data;
      }
      throw new Error(response.message || "创建失败");
    } finally {
      isLoading.value = false;
    }
  };

  const updateApplication = async (
    id: string,
    data: UpdateApplicationRequest,
  ) => {
    isLoading.value = true;
    try {
      const response = (await applicationApi.update(
        id,
        data,
      )) as ApiResponse<Application>;
      if (response.code === 200) {
        await loadApplications(pagination.value.page, pagination.value.limit);
        return response.data;
      }
      throw new Error(response.message || "更新失败");
    } finally {
      isLoading.value = false;
    }
  };

  const deleteApplication = async (id: string) => {
    isLoading.value = true;
    try {
      const response = (await applicationApi.delete(id)) as ApiResponse<null>;
      if (response.code === 200) {
        await loadApplications(pagination.value.page, pagination.value.limit);
        await loadStats();
      } else {
        throw new Error(response.message || "删除失败");
      }
    } finally {
      isLoading.value = false;
    }
  };

  const getApplicationById = (id: string) => {
    return applications.value.find((app) => app._id === id);
  };

  const publishedCount = computed(() => stats.value.published);
  const draftCount = computed(() => stats.value.draft);
  const totalCount = computed(() => stats.value.total);

  return {
    applications,
    stats,
    isLoading,
    pagination,
    loadApplications,
    loadStats,
    createApplication,
    updateApplication,
    deleteApplication,
    getApplicationById,
    publishedCount,
    draftCount,
    totalCount,
  };
});
