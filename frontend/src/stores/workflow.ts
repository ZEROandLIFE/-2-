import { defineStore } from "pinia";
import { ref } from "vue";
import {
  workflowApi,
  type Workflow,
  type WorkflowInstance,
  type WorkflowNode,
} from "@/api/workflow";

export const useWorkflowStore = defineStore("workflow", () => {
  // 流程定义
  const workflows = ref<Workflow[]>([]);
  const currentWorkflow = ref<Workflow | null>(null);

  // 流程实例
  const instances = ref<WorkflowInstance[]>([]);
  const myApprovals = ref<WorkflowInstance[]>([]);

  // 加载状态
  const isLoading = ref(false);

  // ============ 流程定义操作 ============

  const loadWorkflows = async () => {
    isLoading.value = true;
    try {
      const response = await workflowApi.list();
      if (response.code === 200) {
        workflows.value = response.data;
      }
    } finally {
      isLoading.value = false;
    }
  };

  const loadWorkflow = async (id: string) => {
    isLoading.value = true;
    try {
      const response = await workflowApi.get(id);
      if (response.code === 200) {
        currentWorkflow.value = response.data;
        return response.data;
      }
      return null;
    } finally {
      isLoading.value = false;
    }
  };

  const createWorkflow = async (data: {
    formId: string;
    name: string;
    description?: string;
    nodes?: WorkflowNode[];
  }) => {
    const response = await workflowApi.create(data);
    if (response.code === 200) {
      await loadWorkflows();
      return response.data;
    }
    throw new Error(response.message || "创建失败");
  };

  const updateWorkflow = async (
    id: string,
    data: {
      name?: string;
      description?: string;
      nodes?: WorkflowNode[];
      isActive?: boolean;
    }
  ) => {
    const response = await workflowApi.update(id, data);
    if (response.code === 200) {
      await loadWorkflows();
      return response.data;
    }
    throw new Error(response.message || "更新失败");
  };

  const deleteWorkflow = async (id: string) => {
    try {
      const response = await workflowApi.delete(id);
      if (response.code === 200) {
        await loadWorkflows();
      } else {
        throw new Error(response.message || "删除失败");
      }
    } catch (error: any) {
      throw new Error(error.response?.data?.message || error.message || "删除失败");
    }
  };

  // ============ 流程实例操作 ============

  const loadInstances = async (params?: { status?: string; workflowId?: string }) => {
    isLoading.value = true;
    try {
      const response = await workflowApi.getInstances(params);
      if (response.code === 200) {
        instances.value = response.data;
      }
    } finally {
      isLoading.value = false;
    }
  };

  const loadMyApprovals = async () => {
    isLoading.value = true;
    try {
      const response = await workflowApi.getMyApprovals();
      if (response.code === 200) {
        myApprovals.value = response.data;
      }
    } finally {
      isLoading.value = false;
    }
  };

  const loadInstance = async (id: string) => {
    const response = await workflowApi.getInstance(id);
    if (response.code === 200) {
      return response.data;
    }
    throw new Error(response.message || "获取失败");
  };

  const startWorkflow = async (workflowId: string, formDataId: string, operatorId: string) => {
    const response = await workflowApi.start({ workflowId, formDataId, operatorId });
    if (response.code === 200) {
      await loadMyApprovals();
      return response.data;
    }
    throw new Error(response.message || "启动失败");
  };

  const approveWorkflow = async (instanceId: string, action: "approve" | "reject", comment?: string) => {
    const response = await workflowApi.approve(instanceId, { action, comment });
    if (response.code === 200) {
      await loadMyApprovals();
      return response.data;
    }
    throw new Error(response.message || "操作失败");
  };

  return {
    workflows,
    currentWorkflow,
    instances,
    myApprovals,
    isLoading,
    loadWorkflows,
    loadWorkflow,
    createWorkflow,
    updateWorkflow,
    deleteWorkflow,
    loadInstances,
    loadMyApprovals,
    loadInstance,
    startWorkflow,
    approveWorkflow,
  };
});