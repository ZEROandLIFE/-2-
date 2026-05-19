<template>
  <div class="form-publish">
    <div class="publish-header">
      <h1>表单发布</h1>
      <ElButton @click="goBack">返回</ElButton>
    </div>

    <ElCard v-if="formId">
      <template #header>
        <div class="card-header">
          <span>发布设置</span>
          <ElButton
            type="primary"
            :loading="publishStore.isLoading"
            @click="handlePublish"
          >
            {{ isPublished ? "更新发布" : "发布" }}
          </ElButton>
        </div>
      </template>

      <PermissionConfig v-if="formId" :formId="formId" @saved="handleSaved" />
    </ElCard>

    <ElAlert v-else type="warning" :closable="false" class="mt-4">
      未选择表单，请先在编辑器中选择要发布的表单
    </ElAlert>
  </div>
</template>

<script setup lang="ts">
  import { computed, onMounted } from "vue";
  import { useRoute, useRouter } from "vue-router";
  import { ElButton, ElCard, ElAlert, ElMessage } from "element-plus";
  import { usePublishStore } from "@/stores/publish";
  import { useEditorStore } from "@/stores/editor";
  import PermissionConfig from "@/components/editor/PermissionConfig.vue";

  const route = useRoute();
  const router = useRouter();
  const publishStore = usePublishStore();
  const editorStore = useEditorStore();

  const formId = computed(
    () => (route.query.formId as string) || editorStore.currentForm?._id,
  );

  const isPublished = computed(() => publishStore.permission?.publicEnabled);

  onMounted(async () => {
    if (formId.value) {
      await editorStore.loadForm(formId.value);
      await publishStore.loadPermission(formId.value);
    }
  });

  const handlePublish = async () => {
    if (!formId.value) return;
    try {
      if (isPublished.value) {
        await publishStore.unpublish(formId.value);
        ElMessage.success("已取消发布");
      } else {
        await publishStore.publish(formId.value);
        ElMessage.success("发布成功");
      }
    } catch (error) {
      console.error("Publish error:", error);
    }
  };

  const handleSaved = () => {
    ElMessage.success("配置已保存");
  };

  const goBack = () => {
    router.back();
  };
</script>

<style scoped>
  .form-publish {
    padding: 24px;
    min-height: calc(100vh - 64px);
    background: #f0f5f9;
  }

  .publish-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24px;
  }

  .publish-header h1 {
    font-size: 24px;
    font-weight: 600;
    color: #1e2022;
    margin: 0;
  }

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .mt-4 {
    margin-top: 16px;
  }
</style>
