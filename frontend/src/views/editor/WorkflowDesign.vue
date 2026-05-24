<template>
  <div class="workflow-design">
    <div class="page-header">
      <div class="page-header__left">
        <button class="back-btn" @click="goBack">
          <span>←</span>
          <span>返回</span>
        </button>
        <h1 class="page-title">流程设计</h1>
      </div>
      <div class="page-header__right">
        <ElButton @click="handleSave">保存</ElButton>
        <ElButton type="primary" @click="handleActivate">
          {{ workflow?.isActive ? "停用" : "启用" }}
        </ElButton>
      </div>
    </div>

    <div class="workflow-content">
      <!-- 左侧面板 -->
      <div class="left-panel">
        <!-- 表单选择区 -->
        <div class="form-select-section">
          <h3>选择表单</h3>
          <div class="form-select-wrapper">
            <ElSelect
              v-model="selectedFormId"
              placeholder="请选择表单"
              class="form-select"
              @change="handleFormSelect"
              :disabled="workflow && workflow.nodes.length > 0"
            >
              <ElOption
                v-for="form in forms"
                :key="form._id"
                :label="getFormLabel(form)"
                :value="form._id"
                :disabled="
                  isFormHasWorkflow(form._id) && !isEditingWorkflow(form._id)
                "
              />
            </ElSelect>
          </div>
          <div v-if="selectedForm" class="selected-form-info">
            <span class="form-name">{{ selectedForm.name }}</span>
            <span class="form-hint" v-if="isEditingWorkflow(selectedForm._id)">
              正在编辑此表单的流程
            </span>
            <span class="form-hint" v-else>已选择此表单创建流程</span>
          </div>
          <div
            v-if="workflow && workflow.nodes.length > 0"
            class="form-warning"
          >
            ⚠️ 已有节点，无法更换表单
          </div>
        </div>

        <!-- 节点选择区 -->
        <div class="node-panel">
          <h3>节点类型</h3>
          <div class="node-list">
            <div
              v-for="nodeType in nodeTypes"
              :key="nodeType.type"
              class="node-item"
              draggable="true"
              @dragstart="handleDragStart($event, nodeType)"
            >
              <span class="node-icon">{{ nodeType.icon }}</span>
              <span class="node-name">{{ nodeType.name }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 流程设计区 -->
      <div class="design-canvas" @drop="handleDrop" @dragover.prevent>
        <div v-if="!workflow" class="canvas-empty">
          <div class="empty-icon">📋</div>
          <h3>拖拽节点到此处设计流程</h3>
        </div>
        <div v-else class="canvas-content">
          <!-- 已有的连线 -->
          <svg class="connections-layer">
            <defs>
              <!-- 连接线中间的箭头 -->
              <marker
                id="arrow-mid"
                markerWidth="12"
                markerHeight="12"
                refX="6"
                refY="6"
                orient="auto"
                markerUnits="userSpaceOnUse"
              >
                <path
                  d="M 0 4 L 6 10 L 12 4 M 6 10 L 6 0"
                  fill="none"
                  stroke="#769fcd"
                  stroke-width="1.5"
                  stroke-linecap="round"
                />
              </marker>
            </defs>
            <g
              v-for="(connection, index) in getConnections()"
              :key="'line-' + index"
            >
              <!-- 连线主体 -->
              <path
                :d="connection.path"
                stroke="#769fcd"
                stroke-width="2"
                fill="none"
              />
              <!-- 中间箭头 -->
              <path
                v-if="connection.midArrowPath"
                :d="connection.midArrowPath"
                stroke="transparent"
                stroke-width="2"
                fill="none"
                marker-mid="url(#arrow-mid)"
              />
            </g>
          </svg>

          <!-- 正在绘制的连线 -->
          <svg v-if="connecting && connectingFromNode" class="connecting-line">
            <defs>
              <!-- 虚线中间的箭头 -->
              <marker
                id="arrow-mid-dash"
                markerWidth="12"
                markerHeight="12"
                refX="6"
                refY="6"
                orient="auto"
                markerUnits="userSpaceOnUse"
              >
                <path
                  d="M 0 4 L 6 10 L 12 4 M 6 10 L 6 0"
                  fill="none"
                  stroke="#409eff"
                  stroke-width="1.5"
                  stroke-linecap="round"
                />
              </marker>
            </defs>
            <g>
              <path
                :d="getConnectingPath()"
                stroke="#409eff"
                stroke-width="2"
                stroke-dasharray="5,5"
                fill="none"
              />
              <path
                :d="getConnectingMidArrowPath()"
                stroke="transparent"
                stroke-width="2"
                fill="none"
                marker-mid="url(#arrow-mid-dash)"
              />
            </g>
          </svg>

          <div
            v-for="node in workflow.nodes"
            :key="node.id"
            class="canvas-node"
            :class="[
              `canvas-node--${node.type}`,
              { 'canvas-node--dragging': draggingNode?.id === node.id },
            ]"
            :style="getNodeStyle(node)"
            :data-node-id="node.id"
            @click="selectNode(node)"
            @mousedown="onNodeMouseDown($event, node)"
          >
            <div class="node-header">
              <span class="node-title">{{ node.title }}</span>
              <button class="node-delete" @click.stop="deleteNode(node.id)">
                ×
              </button>
            </div>
            <div class="node-body">
              <span class="node-type">{{ getNodeTypeName(node.type) }}</span>
              <div v-if="node.type === 'approval'" class="node-assignees">
                {{ getAssigneeLabel(node) }}
              </div>
            </div>
            <div class="node-connections">
              <div class="connection-point connection-point--top"></div>
              <div
                class="connection-point connection-point--bottom connection-point--draggable"
                @mousedown.stop="startConnecting($event, node)"
              ></div>
            </div>
          </div>
        </div>
      </div>

      <!-- 属性设置区 -->
      <div class="property-panel">
        <h3>属性设置</h3>
        <div v-if="selectedNode" class="property-content">
          <!-- 节点类型说明 -->
          <div class="node-type-info">
            <span class="type-label">节点类型：</span>
            <span class="type-value">{{
              getNodeTypeName(selectedNode.type)
            }}</span>
            <span class="type-desc">{{
              getNodeTypeDescription(selectedNode.type)
            }}</span>
          </div>

          <ElForm :model="selectedNode" label-width="80px">
            <ElFormItem label="节点标题">
              <ElInput v-model="selectedNode.title" />
            </ElFormItem>

            <!-- 开始节点配置 -->
            <template v-if="selectedNode.type === 'start'">
              <ElFormItem label="表单数据">
                <ElInput
                  disabled
                  :value="workflow?.formId?.name || '未选择表单'"
                />
              </ElFormItem>
              <ElFormItem label="下一节点">
                <ElSelect
                  v-model="selectedNode.nextNodes"
                  :multiple="false"
                  placeholder="选择下一节点"
                >
                  <ElOption
                    v-for="node in getAvailableNextNodes(selectedNode)"
                    :key="node.id"
                    :label="node.title"
                    :value="node.id"
                  />
                </ElSelect>
              </ElFormItem>
            </template>

            <!-- 审批节点配置 -->
            <template v-if="selectedNode.type === 'approval'">
              <ElFormItem label="审批人类型">
                <ElSelect
                  v-model="selectedNode.assigneeType"
                  @change="onAssigneeTypeChange"
                >
                  <ElOption label="指定用户" value="user" />
                  <ElOption label="角色" value="role" />
                  <ElOption label="部门" value="department" />
                  <ElOption label="部门负责人" value="leader" />
                </ElSelect>
              </ElFormItem>

              <!-- 指定用户 -->
              <ElFormItem
                v-if="selectedNode.assigneeType === 'user'"
                label="选择用户"
              >
                <ElSelect
                  v-model="selectedNode.assignees"
                  multiple
                  placeholder="选择审批用户"
                >
                  <ElOption
                    v-for="user in availableUsers"
                    :key="user._id"
                    :label="user.nickname || user.username"
                    :value="user._id"
                  />
                </ElSelect>
              </ElFormItem>

              <!-- 角色 -->
              <ElFormItem
                v-if="selectedNode.assigneeType === 'role'"
                label="选择角色"
              >
                <ElSelect
                  v-model="selectedNode.assignees"
                  multiple
                  placeholder="选择审批角色"
                >
                  <ElOption
                    v-for="role in availableRoles"
                    :key="role._id"
                    :label="role.name"
                    :value="role._id"
                  />
                </ElSelect>
              </ElFormItem>

              <!-- 部门 -->
              <ElFormItem
                v-if="selectedNode.assigneeType === 'department'"
                label="选择部门"
              >
                <ElSelect
                  v-model="selectedNode.assignees"
                  multiple
                  placeholder="选择审批部门"
                >
                  <ElOption
                    v-for="dept in availableDepartments"
                    :key="dept._id"
                    :label="dept.name"
                    :value="dept._id"
                  />
                </ElSelect>
              </ElFormItem>

              <!-- 部门负责人 -->
              <ElFormItem
                v-if="selectedNode.assigneeType === 'leader'"
                label="选择部门"
              >
                <ElSelect
                  v-model="selectedNode.assignees"
                  multiple
                  placeholder="选择部门负责人"
                >
                  <ElOption
                    v-for="dept in availableDepartments"
                    :key="dept._id"
                    :label="dept.name + ' 负责人'"
                    :value="dept._id"
                  />
                </ElSelect>
              </ElFormItem>

              <ElFormItem label="是否需要审批意见">
                <ElSwitch
                  v-model="selectedNode.config.commentRequired"
                  active-text="需要"
                  inactive-text="不需要"
                />
              </ElFormItem>
              <ElFormItem label="下一节点">
                <ElSelect
                  v-model="selectedNode.nextNodes"
                  :multiple="false"
                  placeholder="选择下一节点"
                >
                  <ElOption
                    v-for="node in getAvailableNextNodes(selectedNode)"
                    :key="node.id"
                    :label="node.title"
                    :value="node.id"
                  />
                </ElSelect>
              </ElFormItem>
            </template>

            <!-- 条件节点配置 -->
            <template v-if="selectedNode.type === 'condition'">
              <ElFormItem label="条件字段">
                <ElSelect
                  v-model="selectedNode.config.conditionField"
                  placeholder="选择条件字段"
                >
                  <ElOption label="金额" value="amount" />
                  <ElOption label="状态" value="status" />
                  <ElOption label="优先级" value="priority" />
                  <ElOption label="自定义字段" value="custom" />
                </ElSelect>
              </ElFormItem>
              <ElFormItem label="条件表达式">
                <ElInput
                  v-model="selectedNode.config.conditionExpr"
                  placeholder="例如：金额 > 1000"
                />
              </ElFormItem>
              <ElFormItem label="满足条件时">
                <ElSelect
                  v-model="selectedNode.config.trueBranch"
                  placeholder="选择满足条件的下一节点"
                >
                  <ElOption
                    v-for="node in getAvailableNextNodes(selectedNode)"
                    :key="node.id"
                    :label="node.title"
                    :value="node.id"
                  />
                </ElSelect>
              </ElFormItem>
              <ElFormItem label="不满足条件时">
                <ElSelect
                  v-model="selectedNode.config.falseBranch"
                  placeholder="选择不满足条件的下一节点"
                >
                  <ElOption
                    v-for="node in getAvailableNextNodes(selectedNode)"
                    :key="node.id"
                    :label="node.title"
                    :value="node.id"
                  />
                </ElSelect>
              </ElFormItem>
            </template>

            <!-- 分支节点配置 -->
            <template v-if="selectedNode.type === 'branch'">
              <ElFormItem label="分支名称" prop="branchName">
                <ElInput
                  v-model="selectedNode.config.branchName"
                  placeholder="分支名称"
                />
              </ElFormItem>
              <ElFormItem label="并行分支">
                <ElSelect
                  v-model="selectedNode.nextNodes"
                  multiple
                  placeholder="选择并行执行的节点"
                >
                  <ElOption
                    v-for="node in getAvailableNextNodes(selectedNode)"
                    :key="node.id"
                    :label="node.title"
                    :value="node.id"
                  />
                </ElSelect>
              </ElFormItem>
              <ElFormItem label="汇聚节点">
                <ElSelect
                  v-model="selectedNode.config.mergeNode"
                  placeholder="选择汇聚节点"
                >
                  <ElOption
                    v-for="node in getAvailableNextNodes(selectedNode)"
                    :key="node.id"
                    :label="node.title"
                    :value="node.id"
                  />
                </ElSelect>
              </ElFormItem>
            </template>

            <!-- 结束节点配置 -->
            <template v-if="selectedNode.type === 'end'">
              <ElFormItem label="结束动作">
                <ElSelect v-model="selectedNode.config.endAction">
                  <ElOption label="提交表单" value="submit" />
                  <ElOption label="返回修改" value="reject" />
                  <ElOption label="归档" value="archive" />
                </ElSelect>
              </ElFormItem>
              <ElFormItem label="通知设置">
                <ElSwitch
                  :model-value="selectedNode.config.notify === true"
                  @change="
                    selectedNode.config.notify = !selectedNode.config.notify
                  "
                />
              </ElFormItem>
              <ElFormItem
                v-if="selectedNode.config.notify === true"
                label="通知方式"
              >
                <ElSelect
                  v-model="selectedNode.config.notifyType"
                  multiple
                  placeholder="选择通知方式"
                >
                  <ElOption label="邮件" value="email" />
                  <ElOption label="短信" value="sms" />
                  <ElOption label="站内消息" value="message" />
                </ElSelect>
              </ElFormItem>
            </template>
          </ElForm>

          <!-- 删除按钮 -->
          <div class="delete-node-btn">
            <ElButton
              type="danger"
              @click="deleteNode(selectedNode.id)"
              :disabled="selectedNode.type === 'start'"
            >
              删除节点
            </ElButton>
          </div>
        </div>
        <div v-else class="property-empty">选择节点以编辑属性</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, onMounted, onBeforeUnmount, computed } from "vue";
  import { useRouter, useRoute } from "vue-router";
  import { ElMessage, ElSwitch } from "element-plus";
  import { useWorkflowStore } from "@/stores/workflow";
  import { useEditorStore } from "@/stores/editor";
  import type { Workflow, WorkflowNode } from "@/api/workflow";

  const router = useRouter();
  const route = useRoute();
  const workflowStore = useWorkflowStore();
  const editorStore = useEditorStore();

  // 组件卸载标志
  let isComponentMounted = true;

  const workflow = ref<Workflow | null>(null);
  const selectedNode = ref<WorkflowNode | null>(null);
  const forms = ref<any[]>([]);
  const workflows = ref<Workflow[]>([]);
  const availableUsers = ref<any[]>([]);
  const availableRoles = ref<any[]>([]);
  const availableDepartments = ref<any[]>([]);
  const selectedFormId = ref<string | null>(null);

  // 节点拖动相关
  const draggingNode = ref<WorkflowNode | null>(null);
  const dragOffset = ref({ x: 0, y: 0 });
  const isDragging = ref(false);

  // 连线相关
  const connecting = ref(false);
  const connectingFromNode = ref<WorkflowNode | null>(null);
  const connectingLine = ref({ x: 0, y: 0 });

  const nodeTypes = [
    { type: "start", name: "开始节点", icon: "▶" },
    { type: "approval", name: "审批节点", icon: "👤" },
    { type: "condition", name: "条件节点", icon: "❓" },
    { type: "branch", name: "分支节点", icon: "↗" },
    { type: "end", name: "结束节点", icon: "■" },
  ];

  const goBack = () => {
    // 清理组件状态
    isComponentMounted = false;
    // 尝试返回上一页，如果失败则跳转到流程列表
    if (window.history.length > 1) {
      router.back();
    } else {
      router.push("/admin/workflows");
    }
  };

  const handleDragStart = (
    event: DragEvent,
    nodeType: { type: string; name: string },
  ) => {
    if (event.dataTransfer) {
      event.dataTransfer.setData("nodeType", JSON.stringify(nodeType));
    }
  };

  const handleDrop = (event: DragEvent) => {
    if (!workflow.value) {
      ElMessage.warning("请先在左侧选择表单");
      return;
    }

    const data = event.dataTransfer?.getData("nodeType");
    if (!data) return;

    const nodeType = JSON.parse(data);
    const newNode: WorkflowNode = {
      id: `node_${Date.now()}`,
      type: nodeType.type as WorkflowNode["type"],
      title: nodeType.name,
      assignees: [],
      assigneeType: "user",
      config: {},
      nextNodes: [],
      x: (event as any).offsetX || 100,
      y: (event as any).offsetY || 100,
    };

    workflow.value.nodes.push(newNode);
  };

  const selectNode = (node: WorkflowNode) => {
    // 确保 config 有必要的默认值
    if (!node.config) {
      node.config = {};
    }
    // 根据节点类型初始化 config 的默认值
    if (node.type === "condition") {
      if (!node.config.conditionField) node.config.conditionField = "";
      if (!node.config.conditionExpr) node.config.conditionExpr = "";
      if (!node.config.trueBranch) node.config.trueBranch = "";
      if (!node.config.falseBranch) node.config.falseBranch = "";
    } else if (node.type === "branch") {
      if (!node.config.branchName) node.config.branchName = "";
      if (!node.config.mergeNode) node.config.mergeNode = "";
    } else if (node.type === "approval") {
      if (!node.assigneeType) node.assigneeType = "user";
      if (!node.assignees) node.assignees = [];
      // 确保 commentRequired 是布尔值
      if (typeof node.config.commentRequired !== "boolean") {
        node.config.commentRequired = false;
      }
    } else if (node.type === "end") {
      if (node.config.notify === undefined) node.config.notify = false;
      if (!node.config.endAction) node.config.endAction = "submit";
      if (!node.config.notifyType) node.config.notifyType = [];
    }
    selectedNode.value = node;
  };

  // 审批人类型变更时清空已选审批人
  const onAssigneeTypeChange = () => {
    if (selectedNode.value && selectedNode.value.type === "approval") {
      selectedNode.value.assignees = [];
    }
  };

  const onNodeMouseDown = (event: MouseEvent, node: WorkflowNode) => {
    if (event.button !== 0) return;
    event.stopPropagation();
    event.preventDefault();

    draggingNode.value = node;
    isDragging.value = true;

    const canvas = (event.target as HTMLElement).closest(".design-canvas");
    if (!canvas) return;

    const canvasRect = canvas.getBoundingClientRect();
    dragOffset.value = {
      x: event.clientX - canvasRect.left - (node.x || 0),
      y: event.clientY - canvasRect.top - (node.y || 0),
    };

    document.addEventListener("mousemove", onMouseMove, { passive: true });
    document.addEventListener("mouseup", onMouseUp);
    document.addEventListener("mouseleave", onMouseUp);
  };

  const onMouseMove = (event: MouseEvent) => {
    if (
      !isComponentMounted ||
      !isDragging.value ||
      !draggingNode.value ||
      !workflow.value
    )
      return;

    const canvas = document.querySelector(".design-canvas");
    if (!canvas) {
      onMouseUp();
      return;
    }

    const canvasRect = canvas.getBoundingClientRect();
    const newX = Math.max(
      0,
      event.clientX - canvasRect.left - dragOffset.value.x,
    );
    const newY = Math.max(
      0,
      event.clientY - canvasRect.top - dragOffset.value.y,
    );

    const nodeIndex = workflow.value.nodes.findIndex(
      (n) => n.id === draggingNode.value!.id,
    );
    if (nodeIndex !== -1) {
      workflow.value.nodes[nodeIndex].x = newX;
      workflow.value.nodes[nodeIndex].y = newY;
    }
  };

  const onMouseUp = () => {
    if (!isComponentMounted) return;
    if (isDragging.value) {
      isDragging.value = false;
      draggingNode.value = null;
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
      document.removeEventListener("mouseleave", onMouseUp);
    }
  };

  // 连线相关方法
  const startConnecting = (event: MouseEvent, node: WorkflowNode) => {
    event.stopPropagation();
    connecting.value = true;
    connectingFromNode.value = node;
    updateConnectingLine(event);

    document.addEventListener("mousemove", updateConnectingLine);
    document.addEventListener("mouseup", endConnecting);
    document.addEventListener("mouseleave", endConnecting);
  };

  const updateConnectingLine = (event: MouseEvent) => {
    if (!connecting.value) return;

    const canvas = document.querySelector(".design-canvas");
    if (!canvas) return;

    const canvasRect = canvas.getBoundingClientRect();
    connectingLine.value = {
      x: event.clientX - canvasRect.left,
      y: event.clientY - canvasRect.top,
    };
  };

  const endConnecting = (event: MouseEvent) => {
    if (!connecting.value || !connectingFromNode.value || !workflow.value) {
      connecting.value = false;
      connectingFromNode.value = null;
      document.removeEventListener("mousemove", updateConnectingLine);
      document.removeEventListener("mouseup", endConnecting);
      document.removeEventListener("mouseleave", endConnecting);
      return;
    }

    // 检查是否点击到另一个节点
    const elements = document.elementsFromPoint(event.clientX, event.clientY);
    const targetNodeElement = elements.find((el) =>
      el.classList.contains("canvas-node"),
    );

    if (targetNodeElement) {
      const targetNodeId = targetNodeElement.getAttribute("data-node-id");
      if (targetNodeId && targetNodeId !== connectingFromNode.value.id) {
        // 添加连线
        const fromNode = workflow.value.nodes.find(
          (n) => n.id === connectingFromNode.value!.id,
        );
        if (fromNode && !fromNode.nextNodes.includes(targetNodeId)) {
          fromNode.nextNodes.push(targetNodeId);
          ElMessage.success("连线成功");
        }
      }
    }

    connecting.value = false;
    connectingFromNode.value = null;
    document.removeEventListener("mousemove", updateConnectingLine);
    document.removeEventListener("mouseup", endConnecting);
    document.removeEventListener("mouseleave", endConnecting);
  };

  const deleteNode = (nodeId: string) => {
    if (!workflow.value) return;
    workflow.value.nodes = workflow.value.nodes.filter((n) => n.id !== nodeId);
    workflow.value.nodes.forEach((n) => {
      n.nextNodes = n.nextNodes.filter((id) => id !== nodeId);
    });
    if (selectedNode.value?.id === nodeId) {
      selectedNode.value = null;
    }
  };

  const getAssigneeLabel = (node: WorkflowNode) => {
    if (!node.assignees.length) return "未设置";
    const labels: Record<string, string> = {
      user: "指定用户",
      role: "角色",
      department: "部门",
      leader: "部门负责人",
    };
    return `${labels[node.assigneeType]}: ${node.assignees.length}人`;
  };

  const getAvailableNextNodes = (currentNode: WorkflowNode) => {
    if (!workflow.value) return [];
    return workflow.value.nodes.filter((n) => n.id !== currentNode.id);
  };

  const getNodeStyle = (node: WorkflowNode) => {
    return {
      left: `${node.x || 50}px`,
      top: `${node.y || 50}px`,
    };
  };

  // 当前选中的表单
  const selectedForm = computed(() => {
    if (!selectedFormId.value) return null;
    return forms.value.find((f) => f._id === selectedFormId.value);
  });

  // 表单选择处理
  const handleFormSelect = (formId: string) => {
    const form = forms.value.find((f) => f._id === formId);
    if (form) {
      // 检查是否已有流程
      const existingWorkflow = workflows.value.find(
        (w) => w.formId._id === formId,
      );
      if (existingWorkflow) {
        // 加载已有流程
        workflow.value = existingWorkflow;
        ElMessage.success(`已加载表单 "${form.name}" 的流程`);
      } else {
        // 创建新流程
        workflow.value = {
          _id: "",
          formId: { _id: form._id, name: form.name },
          name: `${form.name}流程`,
          description: "",
          nodes: [],
          isActive: false,
          createdAt: "",
          updatedAt: "",
        };
        ElMessage.success(`已选择表单：${form.name}`);
      }
    }
  };

  // 检查表单是否已有流程
  const isFormHasWorkflow = (formId: string): boolean => {
    return workflows.value.some((w) => w.formId._id === formId);
  };

  // 检查是否正在编辑该表单的流程
  const isEditingWorkflow = (formId: string): boolean => {
    if (!workflow.value || !workflow.value.formId) {
      return false;
    }
    return workflow.value.formId._id === formId;
  };

  // 获取表单显示标签（包含流程状态）
  const getFormLabel = (form: any): string => {
    const hasWorkflow = isFormHasWorkflow(form._id);
    if (hasWorkflow) {
      return `${form.name} ✓`;
    }
    return form.name;
  };

  // 获取节点类型名称
  const getNodeTypeName = (type: string): string => {
    const typeNames: Record<string, string> = {
      start: "开始节点",
      approval: "审批节点",
      condition: "条件节点",
      branch: "分支节点",
      end: "结束节点",
    };
    return typeNames[type] || type;
  };

  // 获取节点类型描述
  const getNodeTypeDescription = (type: string): string => {
    const descriptions: Record<string, string> = {
      start: "流程的起始点，表单提交后从此开始流转",
      approval: "指定审批人员对表单进行审批操作",
      condition: "根据条件判断决定流程走向",
      branch: "并行执行多个分支任务",
      end: "流程的结束点，完成整个审批流程",
    };
    return descriptions[type] || "";
  };

  // 连线辅助方法
  const getNodeById = (nodeId: string): WorkflowNode | undefined => {
    if (!workflow.value) return undefined;
    return workflow.value.nodes.find((n) => n.id === nodeId);
  };

  const NODE_WIDTH = 180;
  const NODE_HEIGHT = 80;

  const getNodeCenterX = (node: WorkflowNode): number => {
    return (node.x || 50) + NODE_WIDTH / 2;
  };

  const getNodeTopY = (node: WorkflowNode): number => {
    return node.y || 50;
  };

  const getNodeBottomY = (node: WorkflowNode): number => {
    return (node.y || 50) + NODE_HEIGHT;
  };

  // 生成横平竖直的连线路径 (Manhattan路径)
  const generateManhattanPath = (
    x1: number,
    y1: number,
    x2: number,
    y2: number,
  ): { path: string; midArrowPath: string } => {
    // 从起点向下延伸一段距离
    const downOffset = 20;
    const startY = y1 + downOffset;

    // 计算控制点
    const midX = (x1 + x2) / 2;

    // 如果垂直距离大于水平距离，先水平后垂直；否则先垂直后水平
    const verticalDiff = Math.abs(y2 - startY);
    const horizontalDiff = Math.abs(x2 - x1);

    let path: string;
    let midArrowPath: string;

    if (verticalDiff > horizontalDiff) {
      // 先水平到中间，再垂直到目标上方，再水平到目标
      path = `M ${x1} ${startY} L ${midX} ${startY} L ${midX} ${y2} L ${x2} ${y2}`;
      // 箭头放在垂直段的中间
      midArrowPath = `M ${midX} ${startY + 20} L ${midX} ${y2 - 20}`;
    } else {
      // 先垂直到目标高度，再水平到目标
      path = `M ${x1} ${startY} L ${x1} ${y2} L ${x2} ${y2}`;
      // 箭头放在水平段的中间
      midArrowPath = `M ${x1 + 20} ${y2} L ${x2 - 20} ${y2}`;
    }

    return { path, midArrowPath };
  };

  const getConnections = () => {
    if (!workflow.value) return [];
    const connections: { path: string; midArrowPath: string }[] = [];

    workflow.value.nodes.forEach((node) => {
      node.nextNodes.forEach((targetId) => {
        const targetNode = getNodeById(targetId);
        if (targetNode) {
          const x1 = getNodeCenterX(node);
          const y1 = getNodeBottomY(node);
          const x2 = getNodeCenterX(targetNode);
          const y2 = getNodeTopY(targetNode);
          const result = generateManhattanPath(x1, y1, x2, y2);
          connections.push({
            path: result.path,
            midArrowPath: result.midArrowPath,
          });
        }
      });
    });

    return connections;
  };

  // 获取正在绘制的连线路径
  const getConnectingPath = () => {
    if (!connectingFromNode.value) return "";
    const x1 = getNodeCenterX(connectingFromNode.value);
    const y1 = getNodeBottomY(connectingFromNode.value);
    const x2 = connectingLine.value.x;
    const y2 = connectingLine.value.y;
    return generateManhattanPath(x1, y1, x2, y2).path;
  };

  // 获取正在绘制的连线中间箭头路径
  const getConnectingMidArrowPath = () => {
    if (!connectingFromNode.value) return "";
    const x1 = getNodeCenterX(connectingFromNode.value);
    const y1 = getNodeBottomY(connectingFromNode.value);
    const x2 = connectingLine.value.x;
    const y2 = connectingLine.value.y;
    return generateManhattanPath(x1, y1, x2, y2).midArrowPath;
  };
  const handleSave = async () => {
    if (!workflow.value) {
      ElMessage.warning("请先选择表单");
      return;
    }

    try {
      if (workflow.value._id) {
        await workflowStore.updateWorkflow(workflow.value._id, {
          name: workflow.value.name,
          description: workflow.value.description,
          nodes: workflow.value.nodes,
        });
      } else {
        await workflowStore.createWorkflow({
          formId: workflow.value.formId._id,
          name: workflow.value.name,
          description: workflow.value.description,
          nodes: workflow.value.nodes,
        });
      }
      ElMessage.success("保存成功");
    } catch (error: any) {
      ElMessage.error(error.message || "保存失败");
    }
  };

  const handleActivate = async () => {
    if (!workflow.value?._id) {
      ElMessage.warning("请先保存流程");
      return;
    }

    try {
      await workflowStore.updateWorkflow(workflow.value._id, {
        isActive: !workflow.value.isActive,
      });
      workflow.value.isActive = !workflow.value.isActive;
      ElMessage.success(workflow.value.isActive ? "已启用" : "已停用");
    } catch (error: any) {
      ElMessage.error(error.message || "操作失败");
    }
  };

  onMounted(async () => {
    await editorStore.loadForms();
    forms.value = editorStore.forms;

    // 加载所有流程，用于检查表单绑定状态
    await workflowStore.loadWorkflows();
    workflows.value = workflowStore.workflows || [];

    // 加载用户、角色和部门列表，用于审批人选择
    try {
      const { userApi, roleApi, departmentApi } =
        await import("@/api/organization");
      const [usersRes, rolesRes, deptsRes] = await Promise.all([
        userApi.list(),
        roleApi.list(),
        departmentApi.list(),
      ]);
      if (usersRes.code === 200 && usersRes.data) {
        availableUsers.value = usersRes.data;
      }
      if (rolesRes.code === 200 && rolesRes.data) {
        availableRoles.value = rolesRes.data;
      }
      if (deptsRes.code === 200 && deptsRes.data) {
        availableDepartments.value = deptsRes.data;
      }
    } catch (error) {
      console.error("加载组织数据失败:", error);
    }

    const workflowId = route.params.id;
    const formIdFromQuery = route.query.formId as string;

    if (workflowId) {
      // 编辑已有流程
      const data = await workflowStore.loadWorkflow(workflowId as string);
      workflow.value = data || null;
      if (workflow.value && workflow.value.formId) {
        selectedFormId.value = workflow.value.formId._id;
        // 初始化所有节点的 config
        if (workflow.value.nodes) {
          workflow.value.nodes.forEach((node) => {
            // 确保每个节点都有 config 对象
            if (!node.config) {
              node.config = {};
            }
            // 根据节点类型初始化默认值
            if (node.type === "condition") {
              if (!node.config.conditionField) node.config.conditionField = "";
              if (!node.config.conditionExpr) node.config.conditionExpr = "";
              if (!node.config.trueBranch) node.config.trueBranch = "";
              if (!node.config.falseBranch) node.config.falseBranch = "";
            } else if (node.type === "branch") {
              if (!node.config.branchName) node.config.branchName = "";
              if (!node.config.mergeNode) node.config.mergeNode = "";
            } else if (node.type === "approval") {
              if (!node.assigneeType) node.assigneeType = "user";
              if (!node.assignees) node.assignees = [];
              // 确保 commentRequired 是布尔值
              if (typeof node.config.commentRequired !== "boolean") {
                node.config.commentRequired = false;
              }
            } else if (node.type === "end") {
              if (node.config.notify === undefined) node.config.notify = false;
              if (!node.config.endAction) node.config.endAction = "submit";
              if (!node.config.notifyType) node.config.notifyType = [];
            }
          });
        }
      }
    } else if (formIdFromQuery) {
      // 从表单进入，检查是否已有流程
      selectedFormId.value = formIdFromQuery;
      const existingWorkflow = workflows.value.find(
        (w) => w.formId._id === formIdFromQuery,
      );
      if (existingWorkflow) {
        // 加载已有流程
        workflow.value = existingWorkflow;
      } else {
        // 创建新流程
        const form = forms.value.find((f) => f._id === formIdFromQuery);
        if (form) {
          workflow.value = {
            _id: "",
            formId: { _id: form._id, name: form.name },
            name: `${form.name}流程`,
            description: "",
            nodes: [],
            isActive: false,
            createdAt: "",
            updatedAt: "",
          };
        }
      }
    }
  });

  onBeforeUnmount(() => {
    isComponentMounted = false;
    // 清理事件监听器
    document.removeEventListener("mousemove", onMouseMove);
    document.removeEventListener("mouseup", onMouseUp);
    document.removeEventListener("mouseleave", onMouseUp);
    document.removeEventListener("mousemove", updateConnectingLine);
    document.removeEventListener("mouseup", endConnecting);
    document.removeEventListener("mouseleave", endConnecting);
  });
</script>

<style scoped>
  .workflow-design {
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

  .workflow-content {
    flex: 1;
    display: flex;
    gap: 16px;
    padding: 16px;
    overflow: hidden;
  }

  .left-panel {
    width: 200px;
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .form-select-section {
    background: #f5f5f5;
    border-radius: 8px;
    padding: 12px;
  }

  .form-select-section h3 {
    font-size: 14px;
    margin-bottom: 12px;
    padding-bottom: 8px;
    border-bottom: 1px solid #eee;
    color: #333;
  }

  .form-select-wrapper {
    margin-bottom: 12px;
  }

  .form-select {
    width: 100%;
  }

  .selected-form-info {
    padding: 8px 10px;
    background: #e8f8e8;
    border-radius: 6px;
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .form-name {
    font-size: 13px;
    font-weight: 600;
    color: #67c23a;
  }

  .form-hint {
    font-size: 11px;
    color: #666;
  }

  .form-warning {
    margin-top: 8px;
    padding: 8px 10px;
    background: #fff7e6;
    border-radius: 6px;
    font-size: 12px;
    color: #e6a23c;
    text-align: center;
  }

  .node-panel {
    flex: 1;
    background: #f5f5f5;
    border-radius: 8px;
    padding: 12px;
  }

  .node-panel h3 {
    font-size: 14px;
    margin-bottom: 12px;
    padding-bottom: 8px;
    border-bottom: 1px solid #eee;
  }

  .node-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .node-item {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px 12px;
    background: white;
    border-radius: 6px;
    cursor: grab;
    border: 1px solid #ddd;
  }

  .node-item:hover {
    border-color: #409eff;
  }

  .node-icon {
    font-size: 18px;
  }

  .node-name {
    font-size: 13px;
  }

  .design-canvas {
    flex: 1;
    background: #fafafa;
    border-radius: 8px;
    border: 2px dashed #ddd;
    position: relative;
    overflow: auto;
  }

  .canvas-empty {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    text-align: center;
  }

  .empty-icon {
    font-size: 48px;
    margin-bottom: 16px;
  }

  .canvas-content {
    position: relative;
    min-height: 100%;
  }

  .canvas-node {
    position: absolute;
    width: 180px;
    background: white;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    cursor: pointer;
    transition: all 0.2s;
  }

  .canvas-node:hover {
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
  }

  .canvas-node--start {
    border-left: 4px solid #67c23a;
  }

  .canvas-node--approval {
    border-left: 4px solid #409eff;
  }

  .canvas-node--condition {
    border-left: 4px solid #e6a23c;
  }

  .canvas-node--branch {
    border-left: 4px solid #909399;
  }

  .canvas-node--end {
    border-left: 4px solid #f56c6c;
  }

  .canvas-node--dragging {
    cursor: grabbing;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
    z-index: 100;
    opacity: 0.9;
  }

  .connections-layer {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    z-index: 1;
  }

  .connecting-line {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    z-index: 50;
  }

  .node-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px 12px;
    border-bottom: 1px solid #eee;
  }

  .node-title {
    font-size: 13px;
    font-weight: 600;
  }

  .node-delete {
    width: 20px;
    height: 20px;
    border: none;
    background: #f5f5f5;
    border-radius: 50%;
    cursor: pointer;
    font-size: 14px;
    color: #999;
  }

  .node-delete:hover {
    background: #f56c6c;
    color: white;
  }

  .node-body {
    padding: 10px 12px;
  }

  .node-type {
    font-size: 12px;
    color: #666;
  }

  .node-type-info {
    padding: 12px;
    background: #f8f9fa;
    border-radius: 8px;
    margin-bottom: 16px;
    border-left: 4px solid #409eff;
  }

  .type-label {
    font-size: 12px;
    color: #666;
    margin-right: 8px;
  }

  .type-value {
    font-size: 14px;
    font-weight: 600;
    color: #333;
    margin-right: 8px;
  }

  .type-desc {
    font-size: 12px;
    color: #999;
    display: block;
    margin-top: 4px;
    margin-left: 60px;
  }

  .delete-node-btn {
    margin-top: 16px;
    padding-top: 16px;
    border-top: 1px solid #eee;
  }

  .node-assignees {
    font-size: 11px;
    color: #409eff;
    margin-top: 4px;
  }

  .node-connections {
    position: absolute;
    left: 50%;
    transform: translateX(-50%);
    width: 100%;
  }

  .connection-point {
    position: absolute;
    width: 12px;
    height: 12px;
    background: #409eff;
    border-radius: 50%;
    left: 50%;
    transform: translateX(-50%);
    cursor: pointer;
  }

  .connection-point--draggable {
    cursor: crosshair;
    animation: pulse 2s infinite;
  }

  .connection-point--draggable:hover {
    transform: translateX(-50%) scale(1.3);
    box-shadow: 0 0 8px rgba(64, 158, 255, 0.6);
  }

  @keyframes pulse {
    0%,
    100% {
      opacity: 1;
    }
    50% {
      opacity: 0.6;
    }
  }

  .connection-point--top {
    top: -6px;
  }

  .connection-point--bottom {
    bottom: -6px;
  }

  .property-panel {
    width: 280px;
    background: #f5f5f5;
    border-radius: 8px;
    padding: 12px;
  }

  .property-panel h3 {
    font-size: 14px;
    margin-bottom: 12px;
    padding-bottom: 8px;
    border-bottom: 1px solid #eee;
  }

  .property-content {
    background: white;
    border-radius: 6px;
    padding: 12px;
  }

  .property-empty {
    text-align: center;
    padding: 40px 20px;
    color: #999;
    font-size: 13px;
  }
</style>
