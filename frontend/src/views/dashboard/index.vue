<template>
  <div class="dashboard">
    <div class="dashboard__header">
      <h1 class="dashboard__title">仪表盘</h1>
      <p class="dashboard__subtitle">欢迎回来，管理您的应用</p>
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
  </div>
</template>

<script setup lang="ts">
  import { ref, onMounted } from "vue";
  import { useRouter } from "vue-router";
  import { useApplicationStore } from "@/stores/application";
  import AppCard from "@/components/common/AppCard.vue";
  import AppForm from "@/components/common/AppForm.vue";
  import { ElMessage, ElDialog } from "element-plus";
  import type { Application } from "@/api/application";

  const router = useRouter();
  const appStore = useApplicationStore();

  const showCreateModal = ref(false);
  const editingApp = ref<Application | null>(null);

  onMounted(() => {
    appStore.loadApplications();
    appStore.loadStats();
  });

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
    margin-bottom: 32px;
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
