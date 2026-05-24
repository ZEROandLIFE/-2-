import type { ApiResponse } from "./types";

export interface WorkflowNode {
  id: string;
  type: "start" | "approval" | "condition" | "branch" | "end";
  title: string;
  assignees: string[];
  assigneeType: "user" | "role" | "department" | "leader";
  config: Record<string, unknown>;
  nextNodes: string[];
  x?: number;
  y?: number;
}

export interface Workflow {
  _id: string;
  formId: {
    _id: string;
    name: string;
  };
  name: string;
  description: string;
  nodes: WorkflowNode[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface WorkflowHistoryItem {
  nodeId: string;
  nodeTitle: string;
  action: "submit" | "approve" | "reject";
  operator: {
    _id: string;
    username: string;
    nickname?: string;
  };
  comment: string;
  timestamp: string;
}

export interface WorkflowInstance {
  _id: string;
  workflowId:
    | Workflow
    | {
        _id: string;
        name: string;
      };
  formDataId: {
    _id: string;
    createdAt: string;
  };
  currentNodeId: string;
  status: "running" | "completed" | "rejected";
  history: WorkflowHistoryItem[];
  createdAt: string;
  updatedAt: string;
}

import request from "./request";

export const workflowApi = {
  create: (data: {
    formId: string;
    name: string;
    description?: string;
    nodes?: WorkflowNode[];
  }) => {
    return request.post<ApiResponse<Workflow>>(
      "/workflows",
      data,
    ) as unknown as Promise<ApiResponse<Workflow>>;
  },

  list: () => {
    return request.get<ApiResponse<Workflow[]>>(
      "/workflows",
    ) as unknown as Promise<ApiResponse<Workflow[]>>;
  },

  get: (id: string) => {
    return request.get<ApiResponse<Workflow>>(
      `/workflows/${id}`,
    ) as unknown as Promise<ApiResponse<Workflow>>;
  },

  update: (
    id: string,
    data: {
      name?: string;
      description?: string;
      nodes?: WorkflowNode[];
      isActive?: boolean;
    },
  ) => {
    return request.put<ApiResponse<Workflow>>(
      `/workflows/${id}`,
      data,
    ) as unknown as Promise<ApiResponse<Workflow>>;
  },

  delete: (id: string) => {
    return request.delete<ApiResponse<null>>(
      `/workflows/${id}`,
    ) as unknown as Promise<ApiResponse<null>>;
  },

  start: (data: {
    workflowId: string;
    formDataId: string;
    operatorId: string;
  }) => {
    return request.post<ApiResponse<WorkflowInstance>>(
      "/workflows/instances",
      data,
    ) as unknown as Promise<ApiResponse<WorkflowInstance>>;
  },

  getInstances: (params?: { status?: string; workflowId?: string }) => {
    const query = new URLSearchParams(params).toString();
    return request.get<ApiResponse<WorkflowInstance[]>>(
      `/workflows/instances?${query}`,
    ) as unknown as Promise<ApiResponse<WorkflowInstance[]>>;
  },

  getInstance: (id: string) => {
    return request.get<ApiResponse<WorkflowInstance>>(
      `/workflows/instances/${id}`,
    ) as unknown as Promise<ApiResponse<WorkflowInstance>>;
  },

  approve: (
    instanceId: string,
    data: { action: "approve" | "reject"; comment?: string },
  ) => {
    return request.put<ApiResponse<{ status: string }>>(
      `/workflows/instances/${instanceId}/approve`,
      data,
    ) as unknown as Promise<ApiResponse<{ status: string }>>;
  },

  getMyApprovals: () => {
    return request.get<ApiResponse<WorkflowInstance[]>>(
      "/workflows/my-approvals",
    ) as unknown as Promise<ApiResponse<WorkflowInstance[]>>;
  },
};
