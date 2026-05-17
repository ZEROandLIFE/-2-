import request from "./request";
import type { ApiResponse } from "./types";

export interface WidgetCategory {
  _id: string;
  name: string;
  icon: string;
  order: number;
  createdAt: string;
}

export interface Widget {
  _id: string;
  name: string;
  category: WidgetCategory;
  icon: string;
  description: string;
  props: Record<string, unknown>;
  defaultStyle: Record<string, string>;
  preview: string;
  isSystem: boolean;
  createdAt: string;
}

export interface ExportData {
  version: string;
  exportTime: string;
  widgets: {
    name: string;
    category?: string;
    icon?: string;
    description?: string;
    props: Record<string, unknown>;
    defaultStyle: Record<string, string>;
    preview?: string;
    isSystem: boolean;
  }[];
}

export interface ImportResult {
  importedCount: number;
  skippedCount: number;
}

export const widgetApi = {
  list: (categoryId?: string): Promise<ApiResponse<Widget[]>> => {
    return request.get("/widgets", {
      params: categoryId ? { categoryId } : {},
    });
  },

  search: (
    keyword: string,
    categoryId?: string,
  ): Promise<ApiResponse<Widget[]>> => {
    return request.get("/widgets/search", {
      params: { keyword, categoryId },
    });
  },

  get: (id: string): Promise<ApiResponse<Widget>> => {
    return request.get(`/widgets/${id}`);
  },

  categories: (): Promise<ApiResponse<WidgetCategory[]>> => {
    return request.get("/widgets/categories");
  },

  create: (data: {
    name: string;
    category?: string;
    icon?: string;
    description?: string;
    props?: Record<string, unknown>;
    defaultStyle?: Record<string, string>;
    preview?: string;
  }): Promise<ApiResponse<Widget>> => {
    return request.post("/widgets", data);
  },

  update: (
    id: string,
    data: {
      name?: string;
      category?: string;
      icon?: string;
      description?: string;
      props?: Record<string, unknown>;
      defaultStyle?: Record<string, string>;
      preview?: string;
    },
  ): Promise<ApiResponse<Widget>> => {
    return request.put(`/widgets/${id}`, data);
  },

  delete: (id: string): Promise<ApiResponse<null>> => {
    return request.delete(`/widgets/${id}`);
  },

  export: (categoryId?: string): Promise<ApiResponse<ExportData>> => {
    return request.get("/widgets/export", {
      params: categoryId ? { categoryId } : {},
    });
  },

  import: (data: {
    widgets: ExportData["widgets"];
  }): Promise<ApiResponse<ImportResult>> => {
    return request.post("/widgets/import", data);
  },
};
