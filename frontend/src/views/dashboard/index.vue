<template>
  <div class="dashboard">
    <div class="dashboard__header">
      <div class="header-left">
        <h1 class="dashboard__title">仪表盘</h1>
        <p class="dashboard__subtitle">欢迎回来，管理您的应用</p>
      </div>
      <div class="header-right">
        <div class="user-info" v-if="authStore.userInfo">
          <span class="user-info__name">{{
            authStore.userInfo.nickname || authStore.userInfo.username
          }}</span>
          <span class="user-info__email">{{ authStore.userInfo.email }}</span>
          <span
            class="user-info__department"
            v-if="authStore.userInfo.department"
          >
            部门: {{ authStore.userInfo.department }}
          </span>
        </div>
        <el-dropdown trigger="click" @command="handleCommand">
          <el-button type="primary" circle>
            {{
              authStore.userInfo?.nickname?.[0] ||
              authStore.userInfo?.username?.[0] ||
              "U"
            }}
          </el-button>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item command="profile">个人资料</el-dropdown-item>
              <el-dropdown-item command="settings">系统设置</el-dropdown-item>
              <el-dropdown-item command="logout" divided
                >退出登录</el-dropdown-item
              >
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
    </div>

    <div class="dashboard__stats">
      <div class="stat-card">
        <div class="stat-card__icon stat-card__icon--total">📊</div>
        <div class="stat-card__content">
          <span class="stat-card__value">{{ appStore.totalCount }}</span>
          <span class="stat-card__label">总应用数</span>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-card__icon stat-card__icon--published">✅</div>
        <div class="stat-card__content">
          <span class="stat-card__value">{{ appStore.publishedCount }}</span>
          <span class="stat-card__label">已发布</span>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-card__icon stat-card__icon--draft">📝</div>
        <div class="stat-card__content">
          <span class="stat-card__value">{{ appStore.draftCount }}</span>
          <span class="stat-card__label">草稿</span>
        </div>
      </div>
    </div>

    <div class="dashboard__section">
      <div class="dashboard__toolbar">
        <h2 class="dashboard__section-title">组织架构</h2>
        <div class="section-actions">
          <button class="btn btn--secondary" @click="goToDepartments">
            <span class="btn__icon">🏢</span>
            <span>部门管理</span>
          </button>
          <button class="btn btn--secondary" @click="goToRoles">
            <span class="btn__icon">🎭</span>
            <span>角色管理</span>
          </button>
        </div>
      </div>
    </div>

    <div class="dashboard__section">
      <div class="dashboard__toolbar">
        <h2 class="dashboard__section-title">流程管理</h2>
        <div class="section-actions">
          <button class="btn btn--secondary" @click="goToWorkflows">
            <span class="btn__icon">📋</span>
            <span>流程列表</span>
          </button>
          <button class="btn btn--secondary" @click="goToApprovals">
            <span class="btn__icon">✅</span>
            <span>我的审批</span>
          </button>
        </div>
      </div>
    </div>

    <div class="dashboard__content">
      <div class="dashboard__toolbar">
        <h2 class="dashboard__section-title">我的应用</h2>
        <button class="btn btn--primary" @click="showCreateModal = true">
          <span class="btn__icon">+</span>
          <span>创建应用</span>
        </button>
      </div>

      <div class="app-grid">
        <AppCard
          v-for="app in appStore.applications"
          :key="app._id"
          :application="app"
          @edit="handleEdit"
          @delete="handleDelete"
          @preview="handlePreview"
          @data="handleData"
        />
      </div>

      <div v-if="appStore.applications.length === 0" class="dashboard__empty">
        <div class="dashboard__empty-icon">📱</div>
        <h3 class="dashboard__empty-title">还没有应用</h3>
        <p class="dashboard__empty-desc">点击上方按钮创建您的第一个应用</p>
      </div>
    </div>

    <ElDialog
      v-model="showCreateModal"
      :title="editingApp ? '编辑应用' : '创建应用'"
      :width="'480px'"
      @close="closeModal"
    >
      <AppForm
        :application="editingApp"
        @submit="handleSubmit"
        @cancel="closeModal"
      />
    </ElDialog>

    <ElDialog v-model="showProfileModal" title="个人资料" width="500px">
      <el-form :model="profileForm" label-width="100px">
        <el-form-item label="用户名">
          <el-input v-model="profileForm.username" disabled />
        </el-form-item>
        <el-form-item label="邮箱">
          <el-input v-model="profileForm.email" disabled />
        </el-form-item>
        <el-form-item label="昵称">
          <el-input v-model="profileForm.nickname" placeholder="请输入昵称" />
        </el-form-item>
        <el-form-item label="部门">
          <el-input v-model="profileForm.department" placeholder="请输入部门" />
        </el-form-item>
        <el-form-item label="角色">
          <el-tag
            :type="authStore.userInfo?.role === 'admin' ? 'danger' : 'info'"
          >
            {{ authStore.userInfo?.role === "admin" ? "管理员" : "普通用户" }}
          </el-tag>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showProfileModal = false">取消</el-button>
        <el-button type="primary" @click="saveProfile">保存</el-button>
      </template>
    </ElDialog>
  </div>
</template>

<script setup lang="ts">
  import { ref, reactive, onMounted } from "vue";
  import { useRouter } from "vue-router";
  import { useApplicationStore } from "@/stores/application";
  import { useAuthStore } from "@/stores/auth";
  import AppCard from "@/components/common/AppCard.vue";
  import AppForm from "@/components/common/AppForm.vue";
  import { ElMessage, ElMessageBox } from "element-plus";
  import type { Application } from "@/api/application";

  const router = useRouter();
  const appStore = useApplicationStore();
  const authStore = useAuthStore();

  const showCreateModal = ref(false);
  const showProfileModal = ref(false);
  const editingApp = ref<Application | null>(null);

  const profileForm = reactive({
    username: "",
    email: "",
    nickname: "",
    department: "",
  });

  onMounted(() => {
    appStore.loadApplications();
    appStore.loadStats();
    loadUserProfile();
  });

  const loadUserProfile = () => {
    if (authStore.userInfo) {
      profileForm.username = authStore.userInfo.username || "";
      profileForm.email = authStore.userInfo.email || "";
      profileForm.nickname = authStore.userInfo.nickname || "";
      profileForm.department = authStore.userInfo.department || "";
    }
  };

  const handleCommand = (command: string) => {
    switch (command) {
      case "profile":
        loadUserProfile();
        showProfileModal.value = true;
        break;
      case "settings":
        router.push("/settings");
        break;
      case "logout":
        handleLogout();
        break;
    }
  };

  const handleLogout = async () => {
    try {
      await ElMessageBox.confirm("确定要退出登录吗？", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      });
      await authStore.logoutApi();
      router.push("/auth/login");
    } catch {
      // 用户取消
    }
  };

  const saveProfile = async () => {
    // TODO: 调用API保存用户资料
    ElMessage.success("资料已保存（接口待实现）");
    showProfileModal.value = false;
  };

  const handleSubmit = async (data: {
    name: string;
    description?: string;
    status?: "draft" | "published";
  }) => {
    try {
      if (!data.name.trim()) {
        ElMessage.warning("请输入应用名称");
        return;
      }

      if (editingApp.value) {
        await appStore.updateApplication(editingApp.value._id, data);
        ElMessage.success("应用更新成功");
      } else {
        await appStore.createApplication(data);
        ElMessage.success("应用创建成功");
      }
      closeModal();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "操作失败";
      ElMessage.error(errorMessage);
    }
  };

  const handleEdit = (app: Application) => {
    editingApp.value = app;
    showCreateModal.value = true;
  };

  const handleDelete = async (id: string) => {
    try {
      await appStore.deleteApplication(id);
      ElMessage.success("删除成功");
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "删除失败";
      ElMessage.error(errorMessage);
    }
  };

  const handlePreview = (app: Application) => {
    router.push(`/editor?appId=${app._id}`);
  };

  const handleData = (app: Application) => {
    router.push(`/editor?appId=${app._id}&activeTab=data`);
  };

  const goToDepartments = () => {
    router.push("/admin/departments");
  };

  const goToRoles = () => {
    router.push("/admin/roles");
  };

  const goToWorkflows = () => {
    router.push("/admin/workflows");
  };

  const goToApprovals = () => {
    router.push("/admin/approvals");
  };

  const closeModal = () => {
    showCreateModal.value = false;
    editingApp.value = null;
  };
</script>

<style scoped>
  .dashboard {
    padding: 24px;
    min-height: calc(100vh - 64px);
    background: #f0f5f9;
  }

  .dashboard__header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 32px;
  }

  .header-left {
    flex: 1;
  }

  .dashboard__title {
    font-size: 28px;
    font-weight: 700;
    color: #1e2022;
    margin: 0 0 8px;
  }

  .dashboard__subtitle {
    font-size: 14px;
    color: #52616b;
    margin: 0;
  }

  .header-right {
    display: flex;
    align-items: center;
    gap: 16px;
  }

  .user-info {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 2px;
  }

  .user-info__name {
    font-size: 14px;
    font-weight: 600;
    color: #1e2022;
  }

  .user-info__email {
    font-size: 12px;
    color: #52616b;
  }

  .user-info__department {
    font-size: 12px;
    color: #769fcd;
  }

  .dashboard__stats {
    display: flex;
    gap: 20px;
    margin-bottom: 32px;
  }

  .stat-card {
    flex: 1;
    background: #ffffff;
    border-radius: 16px;
    padding: 20px;
    display: flex;
    align-items: center;
    gap: 16px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
    border: 1px solid #e8eef3;
  }

  .stat-card__icon {
    width: 48px;
    height: 48px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 24px;
  }

  .stat-card__icon--total {
    background: linear-gradient(135deg, #769fcd 0%, #5a85b8 100%);
  }

  .stat-card__icon--published {
    background: linear-gradient(135deg, #52c41a 0%, #389e0d 100%);
  }

  .stat-card__icon--draft {
    background: linear-gradient(135deg, #faad14 0%, #d48806 100%);
  }

  .stat-card__content {
    display: flex;
    flex-direction: column;
  }

  .stat-card__value {
    font-size: 24px;
    font-weight: 700;
    color: #1e2022;
  }

  .stat-card__label {
    font-size: 13px;
    color: #52616b;
  }

  .dashboard__content {
    background: #ffffff;
    border-radius: 16px;
    padding: 24px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  }

  .dashboard__toolbar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24px;
  }

  .section-actions {
    display: flex;
    gap: 12px;
  }

  .dashboard__section {
    background: #ffffff;
    border-radius: 16px;
    padding: 20px 24px;
    margin-bottom: 24px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  }

  .dashboard__section-title {
    font-size: 18px;
    font-weight: 600;
    color: #1e2022;
    margin: 0;
  }

  .btn {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 10px 20px;
    border: none;
    border-radius: 10px;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.3s ease;
  }

  .btn--primary {
    background: linear-gradient(135deg, #769fcd 0%, #5a85b8 100%);
    color: #ffffff;
    box-shadow: 0 4px 12px rgba(118, 159, 205, 0.3);
  }

  .btn--primary:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 18px rgba(118, 159, 205, 0.4);
  }

  .btn--secondary {
    background: #ffffff;
    color: #52616b;
    border: 1px solid #e8eef3;
  }

  .btn--secondary:hover {
    background: #f0f5f9;
    border-color: #769fcd;
    color: #769fcd;
  }

  .btn__icon {
    font-size: 16px;
  }

  .app-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 20px;
  }

  .dashboard__empty {
    text-align: center;
    padding: 60px 0;
  }

  .dashboard__empty-icon {
    font-size: 48px;
    margin-bottom: 16px;
  }

  .dashboard__empty-title {
    font-size: 18px;
    font-weight: 600;
    color: #1e2022;
    margin: 0 0 8px;
  }

  .dashboard__empty-desc {
    font-size: 14px;
    color: #52616b;
    margin: 0;
  }
</style>
