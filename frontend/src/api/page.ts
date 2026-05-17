import request from "./request";
import type { ApiResponse } from "./types";

export interface PageComponent {
  id: string;
  type: string;
  props: Record<string, unknown>;
  style: Record<string, string>;
  children: PageComponent[];
  position: { x: number; y: number };
}

export interface Page {
  _id: string;
  name: string;
  applicationId: string;
  components: PageComponent[];
  createdAt: string;
  updatedAt: string;
}

export interface CreatePageRequest {
  name: string;
  applicationId: string;
}

export interface UpdatePageRequest {
  name?: string;
  components?: PageComponent[];
}

export const pageApi = {
  create: (data: CreatePageRequest): Promise<ApiResponse<Page>> => {
    return request.post("/pages", data);
  },

  list: (applicationId: string): Promise<ApiResponse<Page[]>> => {
    return request.get("/pages", {
      params: { applicationId },
    });
  },

  get: (id: string): Promise<ApiResponse<Page>> => {
    return request.get(`/pages/${id}`);
  },

  update: (id: string, data: UpdatePageRequest): Promise<ApiResponse<Page>> => {
    return request.put(`/pages/${id}`, data);
  },

  delete: (id: string): Promise<ApiResponse<null>> => {
    return request.delete(`/pages/${id}`);
  },
};
