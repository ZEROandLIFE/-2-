import { defineStore } from "pinia";
import { ref } from "vue";
import { publishApi, type FormPermission } from "@/api/publish";

export const usePublishStore = defineStore("publish", () => {
  const permission = ref<FormPermission | null>(null);
  const publicLink = ref<string>("");
  const isLoading = ref(false);

  const publishTypeOptions = [
    { label: "仅成员", value: "member" },
    { label: "公开访问", value: "public" },
    { label: "两者都要", value: "both" },
  ];

  const permissionOptions = [
    { label: "提交", value: "submit" },
    { label: "查看", value: "view" },
    { label: "编辑", value: "edit" },
    { label: "删除", value: "delete" },
    { label: "管理", value: "manage" },
  ];

  const loadPermission = async (formId: string) => {
    isLoading.value = true;
    try {
      const response = await publishApi.getPermission(formId);
      if (response.code === 200 && response.data) {
        permission.value = response.data;
        if (response.data.publicUrl) {
          publicLink.value = `${window.location.origin}/form/${response.data.publicUrl}`;
        }
      }
    } finally {
      isLoading.value = false;
    }
  };

  const savePermission = async (
    formId: string,
    data: { publishType: string; publicEnabled: boolean; memberPermissions: any[] }
  ) => {
    isLoading.value = true;
    try {
      const response = await publishApi.updatePermission(formId, {
        publishType: data.publishType,
        publicEnabled: data.publicEnabled,
      });
      if (response.code === 200 && response.data) {
        permission.value = response.data;
      }
      return response;
    } finally {
      isLoading.value = false;
    }
  };

  const publish = async (formId: string) => {
    isLoading.value = true;
    try {
      const response = await publishApi.publish(formId);
      if (response.code === 200 && response.data) {
        publicLink.value = `${window.location.origin}/form/${response.data.publicUrl}`;
        await loadPermission(formId);
      }
      return response;
    } finally {
      isLoading.value = false;
    }
  };

  const unpublish = async (formId: string) => {
    isLoading.value = true;
    try {
      const response = await publishApi.unpublish(formId);
      if (response.code === 200) {
        publicLink.value = "";
        await loadPermission(formId);
      }
      return response;
    } finally {
      isLoading.value = false;
    }
  };

  const addMember = async (formId: string, userId: string, permissions: string[]) => {
    isLoading.value = true;
    try {
      const response = await publishApi.addMember(formId, userId, permissions);
      if (response.code === 200 && response.data) {
        permission.value = response.data;
      }
      return response;
    } finally {
      isLoading.value = false;
    }
  };

  const removeMember = async (formId: string, userId: string) => {
    isLoading.value = true;
    try {
      const response = await publishApi.removeMember(formId, userId);
      if (response.code === 200 && response.data) {
        permission.value = response.data;
      }
      return response;
    } finally {
      isLoading.value = false;
    }
  };

  return {
    permission,
    publicLink,
    isLoading,
    publishTypeOptions,
    permissionOptions,
    loadPermission,
    savePermission,
    publish,
    unpublish,
    addMember,
    removeMember,
  };
});
