import request from "./request";
import type { ApiResponse } from "./types";

export interface Application {
  _id: string;
  name: string;
  description: string;
  thumbnail: string;
  status: "draft" | "published";
  owner: string;
  templateId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ApplicationStats {
  total: number;
  draft: number;
  published: number;
}

export interface CreateApplicationRequest {
  name: string;
  description?: string;
  templateId?: string;
}

export interface UpdateApplicationRequest {
  name?: string;
  description?: string;
  status?: "draft" | "published";
  templateId?: string;
}

export const applicationApi = {
  create: (
    data: CreateApplicationRequest,
  ): Promise<ApiResponse<Application>> => {
    return request.post("/applications", data);
  },

  list: (page = 1, limit = 10): Promise<ApiResponse<Application[]>> => {
    return request.get("/applications", {
      params: { page, limit },
    });
  },

  get: (id: string): Promise<ApiResponse<Application>> => {
    return request.get(`/applications/${id}`);
  },

  update: (
    id: string,
    data: UpdateApplicationRequest,
  ): Promise<ApiResponse<Application>> => {
    return request.put(`/applications/${id}`, data);
  },

  delete: (id: string): Promise<ApiResponse<null>> => {
    return request.delete(`/applications/${id}`);
  },

  stats: (): Promise<ApiResponse<ApplicationStats>> => {
    return request.get("/applications/stats");
  },
};
