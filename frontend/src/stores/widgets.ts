import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { widgetApi, type Widget, type WidgetCategory, type ExportData, type ImportResult } from "@/api/widget";
import type { ApiResponse } from "@/api/types";
import { ElMessage } from "element-plus";

export const useWidgetStore = defineStore("widget", () => {
  const widgets = ref<Widget[]>([]);
  const categories = ref<WidgetCategory[]>([]);
  const isLoading = ref(false);
  const searchQuery = ref("");
  const activeCategory = ref<string | null>(null);

  const filteredWidgets = computed(() => {
    let result = widgets.value;

    if (activeCategory.value) {
      result = result.filter((w) => w.category?._id === activeCategory.value);
    }

    if (searchQuery.value.trim()) {
      const query = searchQuery.value.toLowerCase();
      result = result.filter(
        (w) =>
          w.name.toLowerCase().includes(query) ||
          w.description?.toLowerCase().includes(query),
      );
    }

    return result;
  });

  const loadWidgets = async () => {
    isLoading.value = true;
    try {
      const response = (await widgetApi.list()) as ApiResponse<Widget[]>;
      if (response.code === 200) {
        widgets.value = response.data;
      }
    } finally {
      isLoading.value = false;
    }
  };

  const loadCategories = async () => {
    isLoading.value = true;
    try {
      const response = (await widgetApi.categories()) as ApiResponse<WidgetCategory[]>;
      if (response.code === 200) {
        categories.value = response.data;
      }
    } finally {
      isLoading.value = false;
    }
  };

  const searchWidgets = async (keyword: string, categoryId?: string) => {
    isLoading.value = true;
    try {
      const response = (await widgetApi.search(keyword, categoryId)) as ApiResponse<Widget[]>;
      if (response.code === 200) {
        widgets.value = response.data;
      }
    } finally {
      isLoading.value = false;
    }
  };

  const getWidgetById = (id: string): Widget | undefined => {
    return widgets.value.find((w) => w._id === id);
  };

  const createWidget = async (data: {
    name: string;
    category?: string;
    icon?: string;
    description?: string;
    props?: Record<string, unknown>;
    defaultStyle?: Record<string, string>;
    preview?: string;
  }) => {
    isLoading.value = true;
    try {
      const response = (await widgetApi.create(data)) as ApiResponse<Widget>;
      if (response.code === 200) {
        widgets.value.push(response.data);
        ElMessage.success("组件创建成功");
        return response.data;
      }
      throw new Error(response.message || "创建失败");
    } finally {
      isLoading.value = false;
    }
  };

  const updateWidget = async (id: string, data: {
    name?: string;
    category?: string;
    icon?: string;
    description?: string;
    props?: Record<string, unknown>;
    defaultStyle?: Record<string, string>;
    preview?: string;
  }) => {
    isLoading.value = true;
    try {
      const response = (await widgetApi.update(id, data)) as ApiResponse<Widget>;
      if (response.code === 200) {
        const index = widgets.value.findIndex((w) => w._id === id);
        if (index !== -1) {
          widgets.value[index] = response.data;
        }
        ElMessage.success("组件更新成功");
        return response.data;
      }
      throw new Error(response.message || "更新失败");
    } finally {
      isLoading.value = false;
    }
  };

  const deleteWidget = async (id: string) => {
    isLoading.value = true;
    try {
      const response = (await widgetApi.delete(id)) as ApiResponse<null>;
      if (response.code === 200) {
        widgets.value = widgets.value.filter((w) => w._id !== id);
        ElMessage.success("组件删除成功");
      }
    } finally {
      isLoading.value = false;
    }
  };

  const exportWidgets = async (categoryId?: string): Promise<ExportData | null> => {
    isLoading.value = true;
    try {
      const response = (await widgetApi.export(categoryId)) as ApiResponse<ExportData>;
      if (response.code === 200) {
        ElMessage.success("导出成功");
        return response.data;
      }
      throw new Error(response.message || "导出失败");
    } finally {
      isLoading.value = false;
    }
  };

  const importWidgets = async (data: { widgets: ExportData['widgets'] }) => {
    isLoading.value = true;
    try {
      const response = (await widgetApi.import(data)) as ApiResponse<ImportResult>;
      if (response.code === 200) {
        await loadWidgets();
        ElMessage.success(response.message);
        return response.data;
      }
      throw new Error(response.message || "导入失败");
    } finally {
      isLoading.value = false;
    }
  };

  const setSearchQuery = (query: string) => {
    searchQuery.value = query;
  };

  const setActiveCategory = (categoryId: string | null) => {
    activeCategory.value = categoryId;
  };

  return {
    widgets,
    categories,
    isLoading,
    searchQuery,
    activeCategory,
    filteredWidgets,
    loadWidgets,
    loadCategories,
    searchWidgets,
    getWidgetById,
    createWidget,
    updateWidget,
    deleteWidget,
    exportWidgets,
    importWidgets,
    setSearchQuery,
    setActiveCategory,
  };
});