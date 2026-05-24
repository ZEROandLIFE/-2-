<template>
  <div class="workflow-approval">
    <div class="page-header">
      <div class="page-header__left">
        <button class="back-btn" @click="goBack">
          <span>←</span>
          <span>返回</span>
        </button>
        <h1 class="page-title">流程审批</h1>
      </div>
      <div class="page-header__right">
        <ElButton
          v-for="tab in tabs"
          :key="tab.value"
          :type="activeTab === tab.value ? 'primary' : ''"
          @click="activeTab = tab.value"
        >
          {{ tab.label }}
          <span v-if="getTabCount(tab.value)" class="badge">{{
            getTabCount(tab.value)
          }}</span>
        </ElButton>
      </div>
    </div>

    <div class="approval-content">
      <!-- 审批列表 -->
      <div class="approval-list">
        <div v-if="filteredApprovals.length === 0" class="list-empty">
          <div class="empty-icon">📋</div>
          <h3>
            暂无{{
              activeTab === "my"
                ? "待审批"
                : activeTab === "running"
                  ? "进行中"
                  : "已完成"
            }}的流程
          </h3>
        </div>
        <div v-else class="list-content">
          <div
            v-for="instance in filteredApprovals"
            :key="instance._id"
            class="approval-item"
            :class="{
              'approval-item--active': selectedInstanceId === instance._id,
            }"
            @click="selectInstance(instance)"
          >
            <div class="item-header">
              <h4>{{ instance.workflowId.name }}</h4>
              <span
                class="status-badge"
                :class="`status-badge--${instance.status}`"
              >
                {{ getStatusLabel(instance.status) }}
              </span>
            </div>
            <div class="item-meta">
              <span>提交时间：{{ formatTime(instance.createdAt) }}</span>
            </div>
            <div class="item-history">
              <div
                v-for="(item, index) in instance.history.slice(-3)"
                :key="index"
                class="history-item"
              >
                <span class="history-action">{{
                  getActionLabel(item.action)
                }}</span>
                <span class="history-operator">{{
                  item.operator.nickname || item.operator.username
                }}</span>
                <span class="history-time">{{
                  formatTime(item.timestamp)
                }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 审批详情 -->
      <div class="approval-detail">
        <div v-if="!selectedInstance" class="detail-empty">
          <div class="empty-icon">👆</div>
          <h3>选择流程查看详情</h3>
        </div>
        <div v-else class="detail-content">
          <div class="detail-header">
            <h2>{{ selectedInstance.workflowId.name }}</h2>
            <span
              class="status-badge"
              :class="`status-badge--${selectedInstance.status}`"
            >
              {{ getStatusLabel(selectedInstance.status) }}
            </span>
          </div>

          <!-- 流程状态 -->
          <div class="status-section">
            <h3>流程状态</h3>
            <div class="status-flow">
              <div
                v-for="(node, index) in getWorkflowNodes()"
                :key="node.id"
                class="flow-node"
                :class="{
                  'flow-node--completed': isNodeCompleted(node.id),
                  'flow-node--current':
                    node.id === selectedInstance.currentNodeId,
                  'flow-node--pending':
                    !isNodeCompleted(node.id) &&
                    node.id !== selectedInstance.currentNodeId,
                }"
              >
                <div class="flow-node__icon">{{ getNodeIcon(node.type) }}</div>
                <div class="flow-node__label">{{ node.title }}</div>
                <div
                  v-if="index < getWorkflowNodes().length - 1"
                  class="flow-connector"
                ></div>
              </div>
            </div>
          </div>

          <!-- 审批历史 -->
          <div class="history-section">
            <h3>审批历史</h3>
            <div class="history-list">
              <div
                v-for="(item, index) in selectedInstance.history"
                :key="index"
                class="history-row"
              >
                <div class="history-timeline">
                  <div
                    class="timeline-dot"
                    :class="`timeline-dot--${item.action}`"
                  ></div>
                  <div
                    v-if="index < selectedInstance.history.length - 1"
                    class="timeline-line"
                  ></div>
                </div>
                <div class="history-content">
                  <div class="history-title">
                    {{ item.nodeTitle }} - {{ getActionLabel(item.action) }}
                  </div>
                  <div class="history-info">
                    <span>{{
                      item.operator.nickname || item.operator.username
                    }}</span>
                    <span>{{ formatTime(item.timestamp) }}</span>
                  </div>
                  <div v-if="item.comment" class="history-comment">
                    {{ item.comment }}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 审批操作 -->
          <div
            v-if="selectedInstance.status === 'running'"
            class="action-section"
          >
            <h3>审批操作</h3>
            <ElForm :model="approvalForm" label-width="60px">
              <ElFormItem label="意见">
                <ElInput
                  v-model="approvalForm.comment"
                  type="textarea"
                  :rows="3"
                  placeholder="请输入审批意见（可选）"
                />
              </ElFormItem>
              <div class="action-buttons">
                <ElButton type="danger" @click="handleReject">拒绝</ElButton>
                <ElButton type="primary" @click="handleApprove">通过</ElButton>
              </div>
            </ElForm>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed, onMounted, watch } from "vue";
  import { useRouter } from "vue-router";
  import { ElMessage, ElMessageBox } from "element-plus";
  import { useWorkflowStore } from "@/stores/workflow";
  import type { Workflow, WorkflowInstance } from "@/api/workflow";

  const router = useRouter();
  const workflowStore = useWorkflowStore();

  const activeTab = ref("my");
  const selectedInstanceId = ref<string | null>(null);
  const selectedInstance = ref<WorkflowInstance | null>(null);
  const approvalForm = ref({
    comment: "",
  });

  const tabs = [
    { label: "我的审批", value: "my" },
    { label: "进行中", value: "running" },
    { label: "已完成", value: "completed" },
  ];

  const filteredApprovals = computed(() => {
    if (activeTab.value === "my") {
      return workflowStore.myApprovals;
    } else if (activeTab.value === "running") {
      return workflowStore.instances.filter((i) => i.status === "running");
    } else {
      return workflowStore.instances.filter((i) => i.status !== "running");
    }
  });

  const goBack = () => {
    router.push("/admin/workflows");
  };

  const getTabCount = (tab: string) => {
    if (tab === "my") return workflowStore.myApprovals.length;
    if (tab === "running")
      return workflowStore.instances.filter((i) => i.status === "running")
        .length;
    return workflowStore.instances.filter((i) => i.status !== "running").length;
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      running: "进行中",
      completed: "已完成",
      rejected: "已拒绝",
    };
    return labels[status] || status;
  };

  const getActionLabel = (action: string) => {
    const labels: Record<string, string> = {
      submit: "提交",
      approve: "通过",
      reject: "拒绝",
    };
    return labels[action] || action;
  };

  const getNodeIcon = (type: string) => {
    const icons: Record<string, string> = {
      start: "▶",
      approval: "👤",
      condition: "❓",
      branch: "↗",
      end: "■",
    };
    return icons[type] || "●";
  };

  const formatTime = (time: string) => {
    return new Date(time).toLocaleString("zh-CN");
  };

  const selectInstance = (instance: WorkflowInstance) => {
    selectedInstanceId.value = instance._id;
    selectedInstance.value = instance;
  };

  const getWorkflowNodes = () => {
    if (!selectedInstance.value) return [];
    const workflowId = selectedInstance.value.workflowId as Workflow;
    return workflowId?.nodes || [];
  };

  const isNodeCompleted = (nodeId: string) => {
    if (!selectedInstance.value) return false;
    return selectedInstance.value.history.some((h) => h.nodeId === nodeId);
  };

  const handleApprove = async () => {
    if (!selectedInstance.value) return;

    try {
      await workflowStore.approveWorkflow(
        selectedInstance.value._id,
        "approve",
        approvalForm.value.comment,
      );
      ElMessage.success("审批通过");
      approvalForm.value.comment = "";
      await loadData();
    } catch (error: any) {
      ElMessage.error(error.message || "审批失败");
    }
  };

  const handleReject = async () => {
    if (!selectedInstance.value) return;

    try {
      await ElMessageBox.confirm("确定要拒绝此流程吗？", "提示", {
        type: "warning",
      });
      await workflowStore.approveWorkflow(
        selectedInstance.value._id,
        "reject",
        approvalForm.value.comment,
      );
      ElMessage.success("已拒绝");
      approvalForm.value.comment = "";
      await loadData();
    } catch (error: any) {
      if (error !== "cancel") {
        ElMessage.error(error.message || "操作失败");
      }
    }
  };

  const loadData = async () => {
    await Promise.all([
      workflowStore.loadMyApprovals(),
      workflowStore.loadInstances(),
    ]);
  };

  watch(activeTab, () => {
    selectedInstanceId.value = null;
    selectedInstance.value = null;
  });

  onMounted(async () => {
    await loadData();
  });
</script>

<style scoped>
  .workflow-approval {
    height: calc(100vh - 60px);
    display: flex;
    flex-direction: column;
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

  .approval-content {
    flex: 1;
    display: flex;
    gap: 16px;
    padding: 16px;
    overflow: hidden;
  }

  .approval-list {
    width: 360px;
    background: #f5f5f5;
    border-radius: 8px;
    overflow: hidden;
    display: flex;
    flex-direction: column;
  }

  .list-empty {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 40px;
  }

  .empty-icon {
    font-size: 48px;
    margin-bottom: 16px;
  }

  .list-content {
    padding: 12px;
    overflow-y: auto;
  }

  .approval-item {
    background: white;
    border-radius: 8px;
    padding: 12px;
    margin-bottom: 12px;
    cursor: pointer;
    border: 2px solid transparent;
    transition: all 0.2s;
  }

  .approval-item:hover {
    border-color: #e0e0e0;
  }

  .approval-item--active {
    border-color: #409eff;
  }

  .item-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 8px;
  }

  .item-header h4 {
    margin: 0;
    font-size: 14px;
    font-weight: 600;
  }

  .status-badge {
    font-size: 12px;
    padding: 2px 8px;
    border-radius: 12px;
  }

  .status-badge--running {
    background: #e8f4fd;
    color: #409eff;
  }

  .status-badge--completed {
    background: #e8f8e8;
    color: #67c23a;
  }

  .status-badge--rejected {
    background: #fef0f0;
    color: #f56c6c;
  }

  .item-meta {
    font-size: 12px;
    color: #999;
    margin-bottom: 8px;
  }

  .item-history {
    border-top: 1px solid #f0f0f0;
    padding-top: 8px;
  }

  .history-item {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 11px;
    color: #666;
    margin-bottom: 4px;
  }

  .history-action {
    padding: 1px 6px;
    background: #f0f0f0;
    border-radius: 4px;
  }

  .approval-detail {
    flex: 1;
    background: #f5f5f5;
    border-radius: 8px;
    overflow: hidden;
    display: flex;
    flex-direction: column;
  }

  .detail-empty {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
  }

  .detail-content {
    flex: 1;
    overflow-y: auto;
    padding: 20px;
  }

  .detail-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    padding-bottom: 16px;
    border-bottom: 1px solid #e0e0e0;
  }

  .detail-header h2 {
    margin: 0;
  }

  .status-section,
  .history-section,
  .action-section {
    background: white;
    border-radius: 8px;
    padding: 16px;
    margin-bottom: 16px;
  }

  .status-section h3,
  .history-section h3,
  .action-section h3 {
    margin: 0 0 16px 0;
    font-size: 14px;
    font-weight: 600;
  }

  .status-flow {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-wrap: wrap;
  }

  .flow-node {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 12px;
    border-radius: 6px;
    background: #f5f5f5;
  }

  .flow-node--completed {
    background: #e8f8e8;
  }

  .flow-node--current {
    background: #e8f4fd;
    border: 1px solid #409eff;
  }

  .flow-node--pending {
    opacity: 0.5;
  }

  .flow-node__icon {
    font-size: 16px;
  }

  .flow-node__label {
    font-size: 12px;
  }

  .history-list {
    position: relative;
  }

  .history-row {
    display: flex;
    gap: 12px;
    margin-bottom: 16px;
  }

  .history-timeline {
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 20px;
  }

  .timeline-dot {
    width: 12px;
    height: 12px;
    border-radius: 50%;
    background: #ddd;
  }

  .timeline-dot--submit {
    background: #409eff;
  }

  .timeline-dot--approve {
    background: #67c23a;
  }

  .timeline-dot--reject {
    background: #f56c6c;
  }

  .timeline-line {
    width: 2px;
    flex: 1;
    background: #ddd;
    margin: 4px 0;
  }

  .history-content {
    flex: 1;
    padding-bottom: 16px;
  }

  .history-title {
    font-size: 13px;
    font-weight: 500;
    margin-bottom: 4px;
  }

  .history-info {
    font-size: 12px;
    color: #999;
    margin-bottom: 4px;
  }

  .history-comment {
    font-size: 12px;
    color: #666;
    padding: 8px;
    background: #f9f9f9;
    border-radius: 4px;
  }

  .action-buttons {
    display: flex;
    gap: 12px;
    justify-content: flex-end;
    margin-top: 16px;
  }

  .badge {
    background: #f56c6c;
    color: white;
    font-size: 11px;
    padding: 1px 5px;
    border-radius: 10px;
    margin-left: 4px;
  }
</style>
