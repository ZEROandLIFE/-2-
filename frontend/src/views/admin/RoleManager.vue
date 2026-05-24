<template>
  <div class="role-manager">
    <div class="page-header">
      <div class="page-header__left">
        <button class="back-btn" @click="goBack">
          <span>←</span>
          <span>返回</span>
        </button>
        <h1 class="page-title">角色管理</h1>
      </div>
      <div class="page-header__right">
        <ElButton type="primary" @click="showCreateDialog = true">
          <span>+</span>
          <span>新建角色</span>
        </ElButton>
      </div>
    </div>

    <div class="role-content">
      <div class="role-list">
        <div v-if="orgStore.roles.length === 0" class="role-empty">
          暂无角色
        </div>
        <div
          v-for="role in orgStore.roles"
          :key="role._id"
          class="role-card"
          :class="{ 'role-card--selected': selectedRoleId === role._id }"
          @click="handleSelectRole(role)"
        >
          <div class="role-card__header">
            <span class="role-card__name">{{ role.name }}</span>
            <div class="role-card__actions" @click.stop>
              <ElButton size="small" link @click="handleEditRole(role)">
                编辑
              </ElButton>
              <ElButton
                size="small"
                link
                type="danger"
                @click="handleDeleteRole(role)"
              >
                删除
              </ElButton>
            </div>
          </div>
          <div class="role-card__description">
            {{ role.description || "暂无描述" }}
          </div>
          <div class="role-card__permissions">
            <ElTag
              v-for="perm in role.permissions.slice(0, 5)"
              :key="perm"
              size="small"
              type="info"
            >
              {{ getPermissionLabel(perm) }}
            </ElTag>
            <ElTag v-if="role.permissions.length > 5" size="small">
              +{{ role.permissions.length - 5 }}
            </ElTag>
          </div>
        </div>
      </div>

      <div class="role-detail">
        <div v-if="!selectedRoleId" class="detail-empty">
          <div class="empty-icon">🎭</div>
          <h3>选择角色</h3>
          <p>从左侧选择一个角色查看详情</p>
        </div>

        <div v-else class="detail-content">
          <div class="detail-header">
            <h2>{{ selectedRole?.name }}</h2>
            <div class="detail-actions">
              <ElButton @click="handleEditRole(selectedRole!)">编辑</ElButton>
              <ElButton type="primary" @click="openPermissionDialog">
                编辑权限
              </ElButton>
            </div>
          </div>

          <div class="detail-info">
            <div class="info-item">
              <span class="info-label">角色名称：</span>
              <span class="info-value">{{ selectedRole?.name }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">描述：</span>
              <span class="info-value">{{
                selectedRole?.description || "暂无描述"
              }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">权限数量：</span>
              <span class="info-value"
                >{{ selectedRole?.permissions.length }} 个</span
              >
            </div>
            <div class="info-item">
              <span class="info-label">创建时间：</span>
              <span class="info-value">{{
                formatDate(selectedRole?.createdAt)
              }}</span>
            </div>
          </div>

          <div class="permissions-section">
            <h3>权限列表</h3>
            <div class="permissions-grid">
              <div
                v-for="perm in selectedRole?.permissions"
                :key="perm"
                class="permission-item"
              >
                <span class="permission-icon">{{
                  getPermissionIcon(perm)
                }}</span>
                <span class="permission-name">{{
                  getPermissionLabel(perm)
                }}</span>
                <span class="permission-key">{{ perm }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 创建/编辑角色弹窗 -->
    <ElDialog
      v-model="showCreateDialog"
      :title="editingRole ? '编辑角色' : '新建角色'"
      width="500px"
      @close="closeRoleDialog"
    >
      <ElForm :model="roleForm" label-width="100px">
        <ElFormItem label="角色名称">
          <ElInput v-model="roleForm.name" placeholder="请输入角色名称" />
        </ElFormItem>
        <ElFormItem label="描述">
          <ElInput v-model="roleForm.description" type="textarea" rows="3" />
        </ElFormItem>
      </ElForm>
      <template #footer>
        <ElButton @click="closeRoleDialog">取消</ElButton>
        <ElButton type="primary" @click="handleSaveRole">
          {{ editingRole ? "保存" : "创建" }}
        </ElButton>
      </template>
    </ElDialog>

    <!-- 编辑权限弹窗 -->
    <ElDialog v-model="showPermissionDialog" title="编辑权限" width="600px">
      <div class="permission-checkboxes">
        <ElCheckboxGroup v-model="selectedPermissions">
          <ElCheckbox
            v-for="perm in availablePermissions"
            :key="perm.value"
            :label="perm.value"
          >
            <span class="perm-label">
              <span class="perm-icon">{{ perm.icon }}</span>
              {{ perm.label }}
            </span>
          </ElCheckbox>
        </ElCheckboxGroup>
      </div>
      <template #footer>
        <ElButton @click="showPermissionDialog = false">取消</ElButton>
        <ElButton type="primary" @click="handleSavePermissions">保存</ElButton>
      </template>
    </ElDialog>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed, onMounted } from "vue";
  import { useRouter } from "vue-router";
  import { useOrganizationStore } from "@/stores/organization";
  import { ElMessage, ElMessageBox } from "element-plus";
  import type { Role } from "@/api/organization";

  const router = useRouter();
  const orgStore = useOrganizationStore();

  const selectedRoleId = ref<string | null>(null);
  const showCreateDialog = ref(false);
  const showPermissionDialog = ref(false);
  const editingRole = ref<Role | null>(null);

  const roleForm = ref({
    name: "",
    description: "",
  });

  const selectedPermissions = ref<string[]>([]);

  const availablePermissions = [
    { value: "form_create", label: "创建表单", icon: "📝" },
    { value: "form_edit", label: "编辑表单", icon: "✏️" },
    { value: "form_delete", label: "删除表单", icon: "🗑️" },
    { value: "form_publish", label: "发布表单", icon: "🚀" },
    { value: "data_view", label: "查看数据", icon: "👁" },
    { value: "data_edit", label: "编辑数据", icon: "📝" },
    { value: "data_delete", label: "删除数据", icon: "🗑️" },
    { value: "data_export", label: "导出数据", icon: "📤" },
    { value: "data_import", label: "导入数据", icon: "📥" },
    { value: "app_create", label: "创建应用", icon: "➕" },
    { value: "app_edit", label: "编辑应用", icon: "✏️" },
    { value: "app_delete", label: "删除应用", icon: "🗑️" },
    { value: "user_view", label: "查看用户", icon: "👥" },
    { value: "user_edit", label: "编辑用户", icon: "✏️" },
    { value: "dept_view", label: "查看部门", icon: "🏢" },
    { value: "dept_edit", label: "编辑部门", icon: "✏️" },
    { value: "role_view", label: "查看角色", icon: "🎭" },
    { value: "role_edit", label: "编辑角色", icon: "✏️" },
    { value: "workflow_approve", label: "审批流程", icon: "✅" },
    { value: "workflow_submit", label: "提交流程", icon: "📤" },
    { value: "admin", label: "管理员权限", icon: "🔑" },
  ];

  onMounted(async () => {
    await orgStore.loadRoles();
  });

  const selectedRole = computed(() => {
    if (!selectedRoleId.value) return null;
    return orgStore.roles.find((r) => r._id === selectedRoleId.value) || null;
  });

  const goBack = () => {
    router.push("/dashboard");
  };

  const handleSelectRole = (role: Role) => {
    selectedRoleId.value = role._id;
  };

  const openPermissionDialog = () => {
    if (selectedRole.value) {
      selectedPermissions.value = [...selectedRole.value.permissions];
    }
    showPermissionDialog.value = true;
  };

  const handleEditRole = (role: Role) => {
    editingRole.value = role;
    roleForm.value = {
      name: role.name,
      description: role.description || "",
    };
    showCreateDialog.value = true;
  };

  const handleDeleteRole = async (role: Role) => {
    try {
      await ElMessageBox.confirm(`确定要删除角色"${role.name}"吗？`, "提示", {
        type: "warning",
      });
      await orgStore.deleteRole(role._id);
      if (selectedRoleId.value === role._id) {
        selectedRoleId.value = null;
      }
      ElMessage.success("删除成功");
    } catch (error: any) {
      if (error !== "cancel") {
        ElMessage.error(error.message || "删除失败");
      }
    }
  };

  const closeRoleDialog = () => {
    showCreateDialog.value = false;
    editingRole.value = null;
    roleForm.value = {
      name: "",
      description: "",
    };
  };

  const handleSaveRole = async () => {
    if (!roleForm.value.name.trim()) {
      ElMessage.warning("请输入角色名称");
      return;
    }

    try {
      if (editingRole.value) {
        await orgStore.updateRole(editingRole.value._id, {
          name: roleForm.value.name,
          description: roleForm.value.description,
        });
        ElMessage.success("更新成功");
      } else {
        await orgStore.createRole({
          name: roleForm.value.name,
          description: roleForm.value.description,
        });
        ElMessage.success("创建成功");
      }
      closeRoleDialog();
    } catch (error: any) {
      ElMessage.error(error.message || "操作失败");
    }
  };

  const handleSavePermissions = async () => {
    if (!selectedRoleId.value) return;

    try {
      await orgStore.updateRole(selectedRoleId.value, {
        permissions: selectedPermissions.value,
      });
      ElMessage.success("权限更新成功");
      showPermissionDialog.value = false;
    } catch (error: any) {
      ElMessage.error(error.message || "保存失败");
    }
  };

  const getPermissionLabel = (perm: string) => {
    const found = availablePermissions.find((p) => p.value === perm);
    return found ? found.label : perm;
  };

  const getPermissionIcon = (perm: string) => {
    const found = availablePermissions.find((p) => p.value === perm);
    return found ? found.icon : "📋";
  };

  const formatDate = (date?: string) => {
    if (!date) return "-";
    return new Date(date).toLocaleDateString("zh-CN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };
</script>

<style scoped>
  .role-manager {
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

  .role-content {
    display: flex;
    gap: 24px;
  }

  .role-list {
    width: 400px;
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .role-empty {
    background: #ffffff;
    border-radius: 16px;
    padding: 60px 20px;
    text-align: center;
    color: #9ca8b3;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  }

  .role-card {
    background: #ffffff;
    border-radius: 16px;
    padding: 16px;
    cursor: pointer;
    transition: all 0.3s ease;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
    border: 2px solid transparent;
  }

  .role-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }

  .role-card--selected {
    border-color: #769fcd;
  }

  .role-card__header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 8px;
  }

  .role-card__name {
    font-size: 16px;
    font-weight: 600;
    color: #1e2022;
  }

  .role-card__actions {
    display: flex;
    gap: 4px;
  }

  .role-card__description {
    font-size: 13px;
    color: #52616b;
    margin-bottom: 12px;
  }

  .role-card__permissions {
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
  }

  .role-detail {
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
    width: 100px;
  }

  .info-value {
    font-size: 14px;
    color: #1e2022;
  }

  .permissions-section h3 {
    font-size: 14px;
    font-weight: 600;
    color: #1e2022;
    margin: 0 0 16px;
  }

  .permissions-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 12px;
  }

  .permission-item {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 12px;
    background: #f7fbfc;
    border-radius: 10px;
  }

  .permission-icon {
    font-size: 18px;
  }

  .permission-name {
    flex: 1;
    font-size: 13px;
    color: #1e2022;
  }

  .permission-key {
    font-size: 11px;
    color: #9ca8b3;
  }

  .permission-checkboxes {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
  }

  .perm-label {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .perm-icon {
    font-size: 16px;
  }
</style>
