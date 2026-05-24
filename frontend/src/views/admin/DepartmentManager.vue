<template>
  <div class="department-manager">
    <div class="page-header">
      <div class="page-header__left">
        <button class="back-btn" @click="goBack">
          <span>←</span>
          <span>返回</span>
        </button>
        <h1 class="page-title">部门管理</h1>
      </div>
      <div class="page-header__right">
        <ElButton type="primary" @click="showCreateDialog = true">
          <span>+</span>
          <span>新建部门</span>
        </ElButton>
      </div>
    </div>

    <div class="department-content">
      <div class="department-tree">
        <div class="tree-header">
          <h3>组织架构</h3>
        </div>
        <div class="tree-body">
          <div v-if="orgStore.departments.length === 0" class="tree-empty">
            暂无部门
          </div>
          <DepartmentTree
            v-else
            :data="orgStore.departments"
            :selected-id="selectedDepartmentId"
            :expanded-ids="expandedIds"
            @select="handleSelectDepartment"
            @edit="handleEditDepartment"
            @delete="handleDeleteDepartment"
            @toggle-expand="handleToggleExpand"
          />
        </div>
      </div>

      <div class="department-detail">
        <div v-if="!selectedDepartmentId" class="detail-empty">
          <div class="empty-icon">🏢</div>
          <h3>选择部门</h3>
          <p>从左侧选择一个部门查看详情</p>
        </div>

        <div v-else class="detail-content">
          <div class="detail-header">
            <h2>{{ selectedDepartment?.name }}</h2>
            <div class="detail-actions">
              <ElButton
                size="small"
                @click="handleEditDepartment(selectedDepartment!)"
              >
                编辑
              </ElButton>
              <ElButton
                size="small"
                type="primary"
                @click="showAddMemberDialog = true"
              >
                添加成员
              </ElButton>
              <ElButton
                size="small"
                type="primary"
                @click="handleAddChildDepartment(selectedDepartment!)"
              >
                添加子部门
              </ElButton>
            </div>
          </div>

          <div class="detail-info">
            <div class="info-item">
              <span class="info-label">部门负责人：</span>
              <span class="info-value">
                {{
                  selectedDepartment?.leaderId?.nickname ||
                  selectedDepartment?.leaderId?.username ||
                  "未设置"
                }}
              </span>
            </div>
            <div class="info-item">
              <span class="info-label">描述：</span>
              <span class="info-value">{{
                selectedDepartment?.description || "暂无描述"
              }}</span>
            </div>
          </div>

          <div class="members-section">
            <h3>部门成员 ({{ orgStore.departmentMembers.length }})</h3>
            <div class="members-list">
              <div
                v-for="member in orgStore.departmentMembers"
                :key="member._id"
                class="member-item"
              >
                <div class="member-avatar">
                  {{
                    (member.userId.nickname || member.userId.username).charAt(0)
                  }}
                </div>
                <div class="member-info">
                  <span class="member-name">
                    {{ member.userId.nickname || member.userId.username }}
                    <ElTag v-if="member.isPrimary" size="small" type="primary"
                      >主部门</ElTag
                    >
                  </span>
                  <span class="member-email">{{ member.userId.email }}</span>
                </div>
                <ElButton
                  size="small"
                  type="danger"
                  link
                  @click="handleRemoveMember(member)"
                >
                  移除
                </ElButton>
              </div>
              <div
                v-if="orgStore.departmentMembers.length === 0"
                class="members-empty"
              >
                暂无成员
              </div>
            </div>
          </div>

          <div class="applications-section">
            <h3>加入申请 ({{ orgStore.departmentApplications.length }})</h3>
            <div class="applications-list">
              <div
                v-for="app in orgStore.departmentApplications"
                :key="app._id"
                class="application-item"
              >
                <div class="application-user">
                  <span class="user-name">{{
                    app.userId.nickname || app.userId.username
                  }}</span>
                  <span class="user-email">{{ app.userId.email }}</span>
                </div>
                <div class="application-reason">{{ app.reason || "无" }}</div>
                <div class="application-actions">
                  <ElButton
                    size="small"
                    type="success"
                    @click="handleApprove(app._id)"
                  >
                    批准
                  </ElButton>
                  <ElButton
                    size="small"
                    type="danger"
                    @click="handleReject(app._id)"
                  >
                    拒绝
                  </ElButton>
                </div>
              </div>
              <div
                v-if="orgStore.departmentApplications.length === 0"
                class="applications-empty"
              >
                暂无待审批申请
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 创建/编辑部门弹窗 -->
    <ElDialog
      v-model="showCreateDialog"
      :title="editingDepartment ? '编辑部门' : '新建部门'"
      width="500px"
      @close="closeDepartmentDialog"
    >
      <ElForm :model="departmentForm" label-width="100px">
        <ElFormItem label="部门名称">
          <ElInput v-model="departmentForm.name" placeholder="请输入部门名称" />
        </ElFormItem>
        <ElFormItem label="上级部门">
          <ElSelect
            v-model="departmentForm.parentId"
            placeholder="选择上级部门"
            clearable
          >
            <ElOption
              v-for="dept in flatDepartments"
              :key="dept._id"
              :label="dept.name"
              :value="dept._id"
            />
          </ElSelect>
        </ElFormItem>
        <ElFormItem label="部门负责人">
          <ElSelect
            v-model="departmentForm.leaderId"
            placeholder="选择负责人"
            clearable
            filterable
          >
            <ElOption
              v-for="user in orgStore.allUsers"
              :key="user._id"
              :label="user.nickname || user.username"
              :value="user._id"
            >
              <span>{{ user.nickname || user.username }}</span>
              <span class="user-email-option">{{ user.email }}</span>
            </ElOption>
          </ElSelect>
        </ElFormItem>
        <ElFormItem label="描述">
          <ElInput
            v-model="departmentForm.description"
            type="textarea"
            :rows="3"
          />
        </ElFormItem>
      </ElForm>
      <template #footer>
        <ElButton @click="closeDepartmentDialog">取消</ElButton>
        <ElButton type="primary" @click="handleSaveDepartment">
          {{ editingDepartment ? "保存" : "创建" }}
        </ElButton>
      </template>
    </ElDialog>

    <!-- 添加成员弹窗 -->
    <ElDialog v-model="showAddMemberDialog" title="添加成员" width="500px">
      <ElForm :model="memberForm" label-width="100px">
        <ElFormItem label="选择用户">
          <ElSelect
            v-model="memberForm.userId"
            placeholder="选择用户"
            filterable
          >
            <ElOption
              v-for="user in availableUsers"
              :key="user._id"
              :label="user.nickname || user.username"
              :value="user._id"
            >
              <span>{{ user.nickname || user.username }}</span>
              <span class="user-email-option">{{ user.email }}</span>
            </ElOption>
          </ElSelect>
        </ElFormItem>
        <ElFormItem label="设为主部门">
          <ElSwitch v-model="memberForm.isPrimary" />
        </ElFormItem>
      </ElForm>
      <template #footer>
        <ElButton @click="showAddMemberDialog = false">取消</ElButton>
        <ElButton type="primary" @click="handleAddMember">添加</ElButton>
      </template>
    </ElDialog>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed, onMounted } from "vue";
  import { useRouter } from "vue-router";
  import { useOrganizationStore } from "@/stores/organization";
  import { ElMessage, ElMessageBox } from "element-plus";
  import type { Department } from "@/api/organization";
  import DepartmentTree from "./DepartmentTree.vue";

  const router = useRouter();
  const orgStore = useOrganizationStore();

  const selectedDepartmentId = ref<string | null>(null);
  const expandedIds = ref<string[]>([]);
  const showCreateDialog = ref(false);
  const showAddMemberDialog = ref(false);
  const editingDepartment = ref<Department | null>(null);

  const departmentForm = ref({
    name: "",
    parentId: "",
    leaderId: "",
    description: "",
  });

  const memberForm = ref({
    userId: "",
    isPrimary: false,
  });

  onMounted(async () => {
    await Promise.all([orgStore.loadDepartments(), orgStore.loadAllUsers()]);
  });

  const selectedDepartment = computed(() => {
    if (!selectedDepartmentId.value) return null;
    return findDepartmentById(orgStore.departments, selectedDepartmentId.value);
  });

  const flatDepartments = computed(() => {
    const result: Department[] = [];
    const flatten = (depts: Department[]) => {
      for (const dept of depts) {
        result.push(dept);
        if (dept.children?.length) {
          flatten(dept.children);
        }
      }
    };
    flatten(orgStore.departments);
    return result;
  });

  const availableUsers = computed(() => {
    const memberIds = orgStore.departmentMembers.map((m) => m.userId._id);
    return orgStore.allUsers.filter((u) => !memberIds.includes(u._id));
  });

  const findDepartmentById = (
    depts: Department[],
    id: string,
  ): Department | null => {
    for (const dept of depts) {
      if (dept._id === id) return dept;
      if (dept.children?.length) {
        const found = findDepartmentById(dept.children, id);
        if (found) return found;
      }
    }
    return null;
  };

  const goBack = () => {
    router.push("/dashboard");
  };

  const handleToggleExpand = (deptId: string) => {
    const index = expandedIds.value.indexOf(deptId);
    if (index > -1) {
      expandedIds.value.splice(index, 1);
    } else {
      expandedIds.value.push(deptId);
    }
  };

  const handleSelectDepartment = (dept: Department) => {
    selectedDepartmentId.value = dept._id;
    orgStore.loadDepartmentMembers(dept._id);
    orgStore.loadDepartmentApplications(dept._id);
  };

  const handleEditDepartment = (dept: Department) => {
    editingDepartment.value = dept;
    departmentForm.value = {
      name: dept.name,
      parentId: dept.parentId || "",
      leaderId: (dept.leaderId as any)?._id || "",
      description: dept.description || "",
    };
    showCreateDialog.value = true;
  };

  const handleAddChildDepartment = (dept: Department) => {
    editingDepartment.value = null;
    departmentForm.value = {
      name: "",
      parentId: dept._id,
      leaderId: "",
      description: "",
    };
    showCreateDialog.value = true;
  };

  const handleDeleteDepartment = async (dept: Department) => {
    try {
      await ElMessageBox.confirm(`确定要删除部门"${dept.name}"吗？`, "提示", {
        type: "warning",
      });
      await orgStore.deleteDepartment(dept._id);
      if (selectedDepartmentId.value === dept._id) {
        selectedDepartmentId.value = null;
      }
      ElMessage.success("删除成功");
    } catch (error: any) {
      if (error !== "cancel") {
        ElMessage.error(error.message || "删除失败");
      }
    }
  };

  const closeDepartmentDialog = () => {
    showCreateDialog.value = false;
    editingDepartment.value = null;
    departmentForm.value = {
      name: "",
      parentId: "",
      leaderId: "",
      description: "",
    };
  };

  const handleSaveDepartment = async () => {
    if (!departmentForm.value.name.trim()) {
      ElMessage.warning("请输入部门名称");
      return;
    }

    const parentId = departmentForm.value.parentId || null;
    const leaderId = departmentForm.value.leaderId || null;

    try {
      if (editingDepartment.value) {
        await orgStore.updateDepartment(editingDepartment.value._id, {
          name: departmentForm.value.name,
          parentId,
          leaderId,
          description: departmentForm.value.description,
        });
        ElMessage.success("更新成功");
      } else {
        await orgStore.createDepartment({
          name: departmentForm.value.name,
          parentId,
          leaderId,
          description: departmentForm.value.description,
        });
        ElMessage.success("创建成功");
      }
      closeDepartmentDialog();
    } catch (error: any) {
      ElMessage.error(error.message || "操作失败");
    }
  };

  const handleAddMember = async () => {
    if (!memberForm.value.userId) {
      ElMessage.warning("请选择用户");
      return;
    }

    try {
      await orgStore.addDepartmentMember(
        selectedDepartmentId.value!,
        memberForm.value.userId,
        memberForm.value.isPrimary,
      );
      ElMessage.success("添加成功");
      showAddMemberDialog.value = false;
      memberForm.value = { userId: "", isPrimary: false };
    } catch (error: any) {
      ElMessage.error(error.message || "添加失败");
    }
  };

  const handleRemoveMember = async (member: any) => {
    try {
      await ElMessageBox.confirm("确定要移除该成员吗？", "提示", {
        type: "warning",
      });
      await orgStore.removeDepartmentMember(
        selectedDepartmentId.value!,
        member.userId._id,
      );
      ElMessage.success("移除成功");
    } catch (error: any) {
      if (error !== "cancel") {
        ElMessage.error(error.message || "移除失败");
      }
    }
  };

  const handleApprove = async (applicationId: string) => {
    try {
      await orgStore.reviewApplication(applicationId, "approved");
      ElMessage.success("已批准");
      await Promise.all([
        orgStore.loadDepartmentMembers(selectedDepartmentId.value!),
        orgStore.loadDepartmentApplications(selectedDepartmentId.value!),
      ]);
    } catch (error: any) {
      ElMessage.error(error.message || "操作失败");
    }
  };

  const handleReject = async (applicationId: string) => {
    try {
      await orgStore.reviewApplication(applicationId, "rejected");
      ElMessage.success("已拒绝");
      await orgStore.loadDepartmentApplications(selectedDepartmentId.value!);
    } catch (error: any) {
      ElMessage.error(error.message || "操作失败");
    }
  };
</script>

<style scoped>
  .department-manager {
    padding: 24px;
    min-height: calc(100vh - 64px);
    background: #f0f5f9;
  }

  .page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24px;
  }

  .page-header__left {
    display: flex;
    align-items: center;
    gap: 16px;
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

  .page-title {
    font-size: 24px;
    font-weight: 600;
    color: #1e2022;
    margin: 0;
  }

  .department-content {
    display: flex;
    gap: 24px;
  }

  .department-tree {
    width: 320px;
    background: #ffffff;
    border-radius: 16px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
    overflow: hidden;
  }

  .tree-header {
    padding: 16px 20px;
    border-bottom: 1px solid #e8eef3;
  }

  .tree-header h3 {
    font-size: 14px;
    font-weight: 600;
    color: #1e2022;
    margin: 0;
  }

  .tree-body {
    padding: 12px;
    max-height: calc(100vh - 200px);
    overflow-y: auto;
  }

  .tree-empty {
    text-align: center;
    padding: 40px 20px;
    color: #9ca8b3;
  }

  .department-detail {
    flex: 1;
    background: #ffffff;
    border-radius: 16px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
    overflow: hidden;
  }

  .detail-empty {
    text-align: center;
    padding: 100px 20px;
  }

  .empty-icon {
    font-size: 48px;
    margin-bottom: 16px;
  }

  .detail-empty h3 {
    font-size: 18px;
    font-weight: 600;
    color: #1e2022;
    margin: 0 0 8px;
  }

  .detail-empty p {
    font-size: 14px;
    color: #52616b;
    margin: 0;
  }

  .detail-content {
    padding: 24px;
  }

  .detail-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24px;
    padding-bottom: 16px;
    border-bottom: 1px solid #e8eef3;
  }

  .detail-header h2 {
    font-size: 20px;
    font-weight: 600;
    color: #1e2022;
    margin: 0;
  }

  .detail-info {
    margin-bottom: 24px;
  }

  .info-item {
    display: flex;
    margin-bottom: 12px;
  }

  .info-label {
    font-size: 14px;
    color: #52616b;
    width: 80px;
  }

  .info-value {
    font-size: 14px;
    color: #1e2022;
  }

  .members-section,
  .applications-section {
    margin-bottom: 24px;
  }

  .members-section h3,
  .applications-section h3 {
    font-size: 14px;
    font-weight: 600;
    color: #1e2022;
    margin: 0 0 16px;
  }

  .members-list,
  .applications-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .member-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px;
    background: #f7fbfc;
    border-radius: 10px;
  }

  .member-avatar {
    width: 40px;
    height: 40px;
    border-radius: 10px;
    background: linear-gradient(135deg, #769fcd 0%, #5a85b8 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 16px;
    font-weight: 600;
    color: #ffffff;
    flex-shrink: 0;
  }

  .member-info {
    flex: 1;
    min-width: 0;
  }

  .member-name {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 14px;
    font-weight: 500;
    color: #1e2022;
  }

  .member-email {
    display: block;
    font-size: 12px;
    color: #9ca8b3;
  }

  .members-empty,
  .applications-empty {
    text-align: center;
    padding: 24px;
    color: #9ca8b3;
    font-size: 14px;
  }

  .application-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px;
    background: #f7fbfc;
    border-radius: 10px;
  }

  .application-user {
    flex: 1;
  }

  .application-user .user-name {
    display: block;
    font-size: 14px;
    font-weight: 500;
    color: #1e2022;
  }

  .application-user .user-email {
    display: block;
    font-size: 12px;
    color: #9ca8b3;
  }

  .application-reason {
    flex: 1;
    font-size: 13px;
    color: #52616b;
  }

  .application-actions {
    display: flex;
    gap: 8px;
  }

  .user-email-option {
    margin-left: 8px;
    font-size: 12px;
    color: #9ca8b3;
  }
</style>
