import { defineStore } from "pinia";
import { ref } from "vue";
import { formDataApi } from "@/api/form";
import type { FormData, ApiResponse } from "@/api/types";

export const useFormDataStore = defineStore("formData", () => {
  const formDataList = ref<FormData[]>([]);
  const currentFormData = ref<FormData | null>(null);
  const isLoading = ref(false);
  const pagination = ref({
    page: 1,
    limit: 10,
    total: 0,
  });

  const loadFormDataList = async (formId: string, page = 1, limit = 10) => {
    isLoading.value = true;
    try {
      const response = (await formDataApi.list(formId, {
        page,
        limit,
      })) as ApiResponse<FormData[]>;
      if (response.code === 200) {
        formDataList.value = response.data;
        if (response.pagination) {
          pagination.value = response.pagination;
        }
      }
    } finally {
      isLoading.value = false;
    }
  };

  const loadFormData = async (formId: string, dataId: string) => {
    isLoading.value = true;
    try {
      const response = (await formDataApi.get(
        formId,
        dataId,
      )) as ApiResponse<FormData>;
      if (response.code === 200) {
        currentFormData.value = response.data;
      }
    } finally {
      isLoading.value = false;
    }
  };

  const createFormData = async (
    formId: string,
    data: Record<string, unknown>,
  ) => {
    isLoading.value = true;
    try {
      const response = (await formDataApi.create(
        formId,
        data,
      )) as ApiResponse<FormData>;
      if (response.code === 200) {
        return response.data;
      }
      throw new Error(response.message || "提交失败");
    } finally {
      isLoading.value = false;
    }
  };

  const updateFormData = async (
    formId: string,
    dataId: string,
    data: Record<string, unknown>,
  ) => {
    isLoading.value = true;
    try {
      const response = (await formDataApi.update(
        formId,
        dataId,
        data,
      )) as ApiResponse<FormData>;
      if (response.code === 200) {
        return response.data;
      }
      throw new Error(response.message || "更新失败");
    } finally {
      isLoading.value = false;
    }
  };

  const deleteFormData = async (formId: string, dataId: string) => {
    isLoading.value = true;
    try {
      const response = (await formDataApi.delete(
        formId,
        dataId,
      )) as ApiResponse<null>;
      if (response.code === 200) {
        return true;
      }
      throw new Error(response.message || "删除失败");
    } finally {
      isLoading.value = false;
    }
  };

  const clearCurrent = () => {
    currentFormData.value = null;
  };

  return {
    formDataList,
    currentFormData,
    isLoading,
    pagination,
    loadFormDataList,
    loadFormData,
    createFormData,
    updateFormData,
    deleteFormData,
    clearCurrent,
  };
});
