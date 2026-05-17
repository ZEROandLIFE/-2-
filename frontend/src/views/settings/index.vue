<template>
  <div class="settings-page">
    <el-container>
      <el-header>
        <div class="header-content">
          <h1>系统设置</h1>
          <div class="user-info">
            <el-button type="primary" size="small" @click="goDashboard"
              >返回仪表盘</el-button
            >
            <el-button type="danger" size="small" @click="handleLogout"
              >退出登录</el-button
            >
          </div>
        </div>
      </el-header>
      <el-main>
        <el-card>
          <template #header>
            <span>基本设置</span>
          </template>
          <el-form :model="form" label-width="120px">
            <el-form-item label="系统名称">
              <el-input v-model="form.systemName" placeholder="输入系统名称" />
            </el-form-item>
            <el-form-item label="主题颜色">
              <el-color-picker v-model="form.themeColor" />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="save">保存设置</el-button>
            </el-form-item>
          </el-form>
        </el-card>
      </el-main>
    </el-container>
  </div>
</template>

<script setup lang="ts">
  import { reactive } from "vue";
  import { useRouter } from "vue-router";
  import { useAuthStore } from "@/stores/auth";
  import { ElMessage } from "element-plus";

  const router = useRouter();
  const authStore = useAuthStore();

  const form = reactive({
    systemName: "低代码平台",
    themeColor: "#769fcd",
  });

  const goDashboard = () => {
    router.push("/dashboard");
  };

  const handleLogout = () => {
    authStore.logoutApi();
    router.push("/auth/login");
  };

  const save = () => {
    ElMessage.success("设置已保存");
  };
</script>

<style scoped>
  .settings-page {
    min-height: 100vh;
  }

  .el-header {
    background-color: #fff;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }

  .header-content {
    display: flex;
    justify-content: space-between;
    align-items: center;
    height: 100%;
  }

  .header-content h1 {
    margin: 0;
    font-size: 20px;
    color: #1e2022;
  }

  .user-info {
    display: flex;
    align-items: center;
    gap: 12px;
  }
</style>
