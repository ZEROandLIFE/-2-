<template>
  <div class="workflow-list">
    <div class="page-header">
      <div class="page-header__left">
        <button class="back-btn" @click="goBack">
          <span>←</span>
          <span>返回</span>
        </button>
        <h1 class="page-title">流程管理</h1>
      </div>
      <div class="page-header__right">
        <ElButton type="primary" @click="handleCreate">新建流程</ElButton>
      </div>
    </div>

    <div class="list-content">
      <div v-if="workflowStore.isLoading" class="loading">
        <div class="loading-spinner"></div>
        <span>加载中...</span>
      </div>
      <div v-else-if="workflowStore.workflows.length === 0" class="list-empty">
        <div class="empty-icon">📋</div>
        <h3>暂无流程</h3>
        <p>点击右上角按钮创建流程</p>
      </div>
      <div v-else class="workflow-grid">
        <div
          v-for="workflow in workflowStore.workflows"
          :key="workflow._id"
          class="workflow-card"
        >
          <div class="card-header">
            <h3>{{ workflow.name }}</h3>
            <span
              class="status-badge"
              :class="
                workflow.isActive
                  ? 'status-badge--active'
                  : 'status-badge--inactive'
              "
            >
              {{ workflow.isActive ? "已启用" : "已停用" }}
            </span>
          </div>
          <div class="card-body">
            <p class="form-name">关联表单：{{ workflow.formId.name }}</p>
            <p class="node-count">节点数：{{ workflow.nodes.length }}</p>
            <p v-if="workflow.description" class="description">
              {{ workflow.description }}
            </p>
          </div>
          <div class="card-footer">
            <span class="create-time">{{
              formatTime(workflow.createdAt)
            }}</span>
            <div class="card-actions">
              <ElButton size="small" @click="handleEdit(workflow._id)"
                >设计</ElButton
              >
              <ElButton
                size="small"
                type="primary"
                @click="handleToggleActive(workflow)"
              >
                {{ workflow.isActive ? "停用" : "启用" }}
              </ElButton>
              <ElButton
                size="small"
                type="danger"
                @click="handleDelete(workflow)"
                >删除</ElButton
              >
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { onMounted } from "vue";
  import { useRouter } from "vue-router";
  import { ElMessage, ElMessageBox } from "element-plus";
  import { useWorkflowStore } from "@/stores/workflow";
  import type { Workflow } from "@/api/workflow";

  const router = useRouter();
  const workflowStore = useWorkflowStore();

  const goBack = () => {
    router.push("/admin");
  };

  const handleCreate = () => {
    router.push("/editor/workflow");
  };

  const handleEdit = (id: string) => {
    router.push(`/editor/workflow/${id}`);
  };

  const handleToggleActive = async (workflow: Workflow) => {
    try {
      await workflowStore.updateWorkflow(workflow._id, {
        isActive: !workflow.isActive,
      });
      ElMessage.success(workflow.isActive ? "已停用" : "已启用");
    } catch (error: any) {
      ElMessage.error(error.message || "操作失败");
    }
  };

  const handleDelete = async (workflow: Workflow) => {
    try {
      await ElMessageBox.confirm(
        `确定要删除流程"${workflow.name}"吗？`,
        "提示",
        {
          type: "warning",
        },
      );
      await workflowStore.deleteWorkflow(workflow._id);
      ElMessage.success("删除成功");
    } catch (error: any) {
      if (error !== "cancel") {
        ElMessage.error(error.message || "删除失败");
      }
    }
  };

  const formatTime = (time: string) => {
    return new Date(time).toLocaleString("zh-CN");
  };

  onMounted(async () => {
    await workflowStore.loadWorkflows();
  });
</script>

<style scoped>
  .workflow-list {
    min-height: calc(100vh - 60px);
    padding: 16px;
  }

  .list-content {
    max-width: 1200px;
    margin: 0 auto;
  }

  .loading {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 60px;
  }

  .loading-spinner {
    width: 40px;
    height: 40px;
    border: 3px solid #e8eef3;
    border-top-color: #769fcd;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }

  .page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px;
    background: white;
    border-bottom: 1px solid #e8eef3;
  }

  .page-header__left {
    display: flex;
    align-items: center;
    gap: 16px;
  }

  .page-title {
    font-size: 18px;
    font-weight: 600;
    margin: 0;
    color: #1e2022;
  }

  .page-header__right {
    display: flex;
    gap: 12px;
  }

  .back-btn {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 8px 14px;
    border: none;
    border-radius: 8px;
    background: #ffffff;
    color: #52616b;
    font-size: 14px;
    cursor: pointer;
    transition: all 0.3s ease;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.06);
  }

  .back-btn:hover {
    background: #e8eef3;
  }

  .list-empty {
    text-align: center;
    padding: 60px;
  }

  .empty-icon {
    font-size: 64px;
    margin-bottom: 16px;
  }

  .workflow-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
    gap: 16px;
  }

  .workflow-card {
    background: white;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
    overflow: hidden;
  }

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px;
    border-bottom: 1px solid #f0f0f0;
  }

  .card-header h3 {
    margin: 0;
    font-size: 15px;
    font-weight: 600;
  }

  .status-badge {
    font-size: 12px;
    padding: 2px 8px;
    border-radius: 12px;
  }

  .status-badge--active {
    background: #e8f8e8;
    color: #67c23a;
  }

  .status-badge--inactive {
    background: #f5f5f5;
    color: #999;
  }

  .card-body {
    padding: 16px;
  }

  .form-name,
  .node-count {
    font-size: 13px;
    color: #666;
    margin: 0 0 8px 0;
  }

  .description {
    font-size: 13px;
    color: #999;
    margin: 0;
    line-height: 1.5;
  }

  .card-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 16px;
    background: #fafafa;
  }

  .create-time {
    font-size: 12px;
    color: #999;
  }

  .card-actions {
    display: flex;
    gap: 8px;
  }
</style>
