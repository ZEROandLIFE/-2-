import request from "./request";
import type { ApiResponse, CreateFormRequest, UpdateFormRequest } from "./types";
import type { Form, FormData } from "./types";

export const formApi = {
  create: (data: CreateFormRequest): Promise<ApiResponse<Form>> => {
    return request.post("/forms", data);
  },

  list: (applicationId?: string): Promise<ApiResponse<Form[]>> => {
    return request.get("/forms", {
      params: applicationId ? { applicationId } : {},
    });
  },

  getAll: (): Promise<ApiResponse<Form[]>> => {
    return request.get("/forms/all");
  },

  get: (id: string): Promise<ApiResponse<Form>> => {
    return request.get(`/forms/${id}`);
  },

  update: (id: string, data: UpdateFormRequest): Promise<ApiResponse<Form>> => {
    return request.put(`/forms/${id}`, data);
  },

  delete: (id: string): Promise<ApiResponse<null>> => {
    return request.delete(`/forms/${id}`);
  },
};

export const formDataApi = {
  create: (formId: string, data: Record<string, unknown>): Promise<ApiResponse<FormData>> => {
    return request.post(`/forms/${formId}/data`, data);
  },

  list: (formId: string, params?: { page?: number; limit?: number }): Promise<ApiResponse<FormData[]>> => {
    return request.get(`/forms/${formId}/data`, { params });
  },

  get: (formId: string, dataId: string): Promise<ApiResponse<FormData>> => {
    return request.get(`/forms/${formId}/data/${dataId}`);
  },

  update: (formId: string, dataId: string, data: Record<string, unknown>): Promise<ApiResponse<FormData>> => {
    return request.put(`/forms/${formId}/data/${dataId}`, data);
  },

  delete: (formId: string, dataId: string): Promise<ApiResponse<null>> => {
    return request.delete(`/forms/${formId}/data/${dataId}`);
  },
};