<template>
  <div class="data-management">
    <div class="data-management__header">
      <div class="data-management__header-left">
        <button class="data-management__back-btn" @click="goBack">
          <span>←</span>
          <span>返回</span>
        </button>
        <div>
          <h1 class="data-management__title">{{ formName }}</h1>
          <p class="data-management__subtitle">管理表单数据</p>
        </div>
      </div>
      <div class="data-management__header-right">
        <button class="data-management__action-btn" @click="handleAdd">
          <span>+</span>
          <span>添加数据</span>
        </button>
      </div>
    </div>

    <div class="data-management__content">
      <div class="data-management__toolbar">
        <div class="data-management__search">
          <ElInput
            v-model="searchQuery"
            placeholder="搜索数据..."
            clearable
            @input="handleSearch"
          >
            <template #prefix>
              <span>🔍</span>
            </template>
          </ElInput>
        </div>
        <div class="data-management__actions">
          <button class="data-management__btn" @click="handleExport">
            导出
          </button>
          <button
            class="data-management__btn data-management__btn--danger"
            :disabled="selectedIds.length === 0"
            @click="handleBatchDelete"
          >
            批量删除
          </button>
        </div>
      </div>

      <div class="data-table-container">
        <table class="data-table">
          <thead>
            <tr>
              <th class="data-table__checkbox-col">
                <input
                  type="checkbox"
                  :checked="
                    selectedIds.length === formDataStore.formDataList.length
                  "
                  @change="handleSelectAll"
                />
              </th>
              <th
                v-for="field in displayFields"
                :key="field.fieldKey"
                class="data-table__col"
              >
                {{ field.title }}
              </th>
              <th class="data-table__col data-table__col--actions">操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in formDataStore.formDataList" :key="item._id">
              <td class="data-table__checkbox-col">
                <input
                  type="checkbox"
                  :checked="selectedIds.includes(item._id)"
                  @change="handleSelect(item._id)"
                />
              </td>
              <td
                v-for="field in displayFields"
                :key="field.fieldKey"
                class="data-table__col"
              >
                <template
                  v-if="field.type === 'image' && item.data[field.fieldKey]"
                >
                  <el-image
                    :src="String(item.data[field.fieldKey])"
                    :preview-src-list="[String(item.data[field.fieldKey])]"
                    fit="cover"
                    style="
                      width: 60px;
                      height: 60px;
                      border-radius: 4px;
                      cursor: pointer;
                    "
                  />
                </template>
                <template
                  v-else-if="field.type === 'file' && item.data[field.fieldKey]"
                >
                  <a
                    :href="String(item.data[field.fieldKey])"
                    target="_blank"
                    class="file-link"
                  >
                    📎 查看文件
                  </a>
                </template>
                <span v-else class="data-table__cell">{{
                  getFieldValue(item, field.fieldKey)
                }}</span>
              </td>
              <td class="data-table__col data-table__col--actions">
                <button
                  class="data-table__action-btn"
                  @click="handleView(item)"
                >
                  查看
                </button>
                <button
                  class="data-table__action-btn"
                  @click="handleEdit(item)"
                >
                  编辑
                </button>
                <button
                  class="data-table__action-btn data-table__action-btn--danger"
                  @click="handleDelete(item._id)"
                >
                  删除
                </button>
              </td>
            </tr>
          </tbody>
        </table>

        <div
          v-if="formDataStore.formDataList.length === 0"
          class="data-management__empty"
        >
          <div class="empty-state">
            <div class="empty-state__icon">📭</div>
            <h3 class="empty-state__title">暂无数据</h3>
            <p class="empty-state__description">点击上方按钮添加第一条数据</p>
          </div>
        </div>
      </div>

      <div
        class="data-management__pagination"
        v-if="formDataStore.pagination.total > 0"
      >
        <ElPagination
          :current-page="formDataStore.pagination.page"
          :page-size="formDataStore.pagination.limit"
          :total="formDataStore.pagination.total"
          @current-change="handlePageChange"
          layout="prev, pager, next, jumper"
        />
      </div>
    </div>

    <ElDialog
      v-model="showDetailModal"
      :title="detailTitle"
      :width="'600px'"
      @close="showDetailModal = false"
    >
      <div v-if="currentData" class="data-detail">
        <div
          v-for="field in displayFields"
          :key="field.fieldKey"
          class="data-detail__item"
        >
          <label class="data-detail__label">{{ field.title }}</label>
          <span class="data-detail__value">{{
            getFieldValue(currentData, field.fieldKey)
          }}</span>
        </div>
      </div>
      <template #footer>
        <button
          class="modal-btn modal-btn--secondary"
          @click="showDetailModal = false"
        >
          关闭
        </button>
      </template>
    </ElDialog>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed, onMounted, watch } from "vue";
  import { useRouter, useRoute } from "vue-router";
  import { useFormDataStore } from "@/stores/formData";
  import { useEditorStore } from "@/stores/editor";
  import {
    ElMessage,
    ElPagination,
    ElDialog,
    ElInput,
    ElImage,
  } from "element-plus";
  import type { FormData, FieldConfig } from "@/api/types";

  const router = useRouter();
  const route = useRoute();
  const formDataStore = useFormDataStore();
  const editorStore = useEditorStore();

  const searchQuery = ref("");
  const selectedIds = ref<string[]>([]);
  const showDetailModal = ref(false);
  const currentData = ref<FormData | null>(null);
  const detailTitle = ref("数据详情");

  const formId = computed(() => route.query.formId as string);
  const formName = computed(() => {
    const form = editorStore.forms.find((f) => f._id === formId.value);
    return form?.name || "表单数据";
  });

  const displayFields = computed((): FieldConfig[] => {
    const form = editorStore.forms.find((f) => f._id === formId.value);
    return form?.fields.filter((f) => f.visible) || [];
  });

  onMounted(async () => {
    if (formId.value) {
      await editorStore.loadFormsByApp(route.query.appId as string);
      await formDataStore.loadFormDataList(formId.value);
    }
  });

  watch(formId, async (newId) => {
    if (newId) {
      await formDataStore.loadFormDataList(newId);
    }
  });

  const goBack = () => {
    router.push(`/editor?appId=${route.query.appId}`);
  };

  const handleAdd = () => {
    router.push({
      path: "/app/form-fill",
      query: { formId: formId.value, appId: route.query.appId },
    });
  };

  const handleSearch = () => {
    formDataStore.loadFormDataList(
      formId.value,
      1,
      formDataStore.pagination.limit,
    );
  };

  const handleExport = () => {
    ElMessage.info("导出功能开发中");
  };

  const handleSelectAll = (event: Event) => {
    const target = event.target as HTMLInputElement;
    if (target.checked) {
      selectedIds.value = formDataStore.formDataList.map((item) => item._id);
    } else {
      selectedIds.value = [];
    }
  };

  const handleSelect = (id: string) => {
    const index = selectedIds.value.indexOf(id);
    if (index === -1) {
      selectedIds.value.push(id);
    } else {
      selectedIds.value.splice(index, 1);
    }
  };

  const handleBatchDelete = async () => {
    for (const id of selectedIds.value) {
      await formDataStore.deleteFormData(formId.value, id);
    }
    await formDataStore.loadFormDataList(formId.value);
    selectedIds.value = [];
    ElMessage.success("删除成功");
  };

  const handleView = (item: FormData) => {
    currentData.value = item;
    detailTitle.value = "数据详情";
    showDetailModal.value = true;
  };

  const handleEdit = (item: FormData) => {
    router.push({
      path: "/app/form-fill",
      query: {
        formId: formId.value,
        dataId: item._id,
        appId: route.query.appId,
      },
    });
  };

  const handleDelete = async (id: string) => {
    try {
      await formDataStore.deleteFormData(formId.value, id);
      await formDataStore.loadFormDataList(formId.value);
      ElMessage.success("删除成功");
    } catch (error) {
      ElMessage.error("删除失败");
    }
  };

  const handlePageChange = (page: number) => {
    formDataStore.loadFormDataList(
      formId.value,
      page,
      formDataStore.pagination.limit,
    );
  };

  const getFieldValue = (item: FormData, fieldKey: string) => {
    const value = item.data[fieldKey];
    if (value === undefined || value === null) {
      return "-";
    }
    if (Array.isArray(value)) {
      return value.join(", ");
    }
    return String(value);
  };
</script>

<style scoped>
  .data-management {
    min-height: calc(100vh - 64px);
    background: #f0f5f9;
  }

  .data-management__header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px 24px;
    background: #ffffff;
    border-bottom: 1px solid #e8eef3;
  }

  .data-management__header-left {
    display: flex;
    align-items: center;
    gap: 16px;
  }

  .data-management__back-btn {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 8px 14px;
    border: none;
    border-radius: 8px;
    background: #f0f5f9;
    color: #52616b;
    font-size: 14px;
    cursor: pointer;
    transition: all 0.3s ease;
  }

  .data-management__back-btn:hover {
    background: #e8eef3;
  }

  .data-management__title {
    font-size: 20px;
    font-weight: 600;
    color: #1e2022;
    margin: 0 0 4px;
  }

  .data-management__subtitle {
    font-size: 13px;
    color: #52616b;
    margin: 0;
  }

  .data-management__header-right {
    display: flex;
    gap: 12px;
  }

  .data-management__action-btn {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px 20px;
    border: none;
    border-radius: 10px;
    background: linear-gradient(135deg, #769fcd 0%, #5a85b8 100%);
    color: #ffffff;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.3s ease;
    box-shadow: 0 4px 12px rgba(118, 159, 205, 0.3);
  }

  .data-management__action-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 18px rgba(118, 159, 205, 0.4);
  }

  .data-management__content {
    padding: 24px;
  }

  .data-management__toolbar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
  }

  .data-management__search {
    flex: 1;
    max-width: 400px;
  }

  .data-management__search :deep(.el-input__wrapper) {
    padding: 8px 16px;
    border-radius: 24px;
    box-shadow: 0 0 0 1px #e8eef3;
  }

  .data-management__search :deep(.el-input__wrapper:hover) {
    box-shadow: 0 0 0 1px #769fcd;
  }

  .data-management__search :deep(.el-input__wrapper.is-focus) {
    box-shadow: 0 0 0 2px #769fcd;
  }

  .data-management__search :deep(.el-input__inner) {
    font-size: 14px;
  }

  .data-management__search :deep(.el-input__prefix) {
    color: #769fcd;
  }

  .data-management__actions {
    display: flex;
    gap: 12px;
  }

  .data-management__btn {
    padding: 8px 16px;
    border: none;
    border-radius: 8px;
    background: #f0f5f9;
    color: #52616b;
    font-size: 13px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .data-management__btn:hover {
    background: #e8eef3;
    color: #1e2022;
  }

  .data-management__btn--danger {
    background: #fef2f2;
    color: #dc2626;
  }

  .data-management__btn--danger:hover {
    background: #fee2e2;
  }

  .data-management__btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .data-table-container {
    background: #ffffff;
    border-radius: 16px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
    overflow: hidden;
  }

  .data-table {
    width: 100%;
    border-collapse: collapse;
  }

  .data-table thead {
    background: #f7fbfc;
  }

  .data-table th {
    padding: 14px 16px;
    text-align: left;
    font-size: 13px;
    font-weight: 600;
    color: #52616b;
    border-bottom: 1px solid #e8eef3;
  }

  .data-table__checkbox-col {
    width: 50px;
  }

  .data-table__col--actions {
    width: 200px;
  }

  .data-table td {
    padding: 14px 16px;
    border-bottom: 1px solid #e8eef3;
  }

  .data-table__cell {
    font-size: 14px;
    color: #1e2022;
  }

  .file-link {
    color: #769fcd;
    text-decoration: none;
    font-size: 13px;
  }

  .file-link:hover {
    text-decoration: underline;
  }

  .data-table__action-btn {
    padding: 6px 12px;
    border: none;
    border-radius: 6px;
    background: #f0f5f9;
    color: #52616b;
    font-size: 12px;
    cursor: pointer;
    transition: all 0.3s ease;
    margin-right: 8px;
  }

  .data-table__action-btn:hover {
    background: #e8eef3;
  }

  .data-table__action-btn--danger {
    background: #fef2f2;
    color: #dc2626;
  }

  .data-table__action-btn--danger:hover {
    background: #fee2e2;
  }

  .data-management__empty {
    padding: 60px 0;
    text-align: center;
  }

  .empty-state {
    text-align: center;
  }

  .empty-state__icon {
    font-size: 48px;
    margin-bottom: 16px;
  }

  .empty-state__title {
    font-size: 18px;
    font-weight: 600;
    color: #1e2022;
    margin: 0 0 8px;
  }

  .empty-state__description {
    font-size: 14px;
    color: #52616b;
    margin: 0;
  }

  .data-management__pagination {
    display: flex;
    justify-content: center;
    margin-top: 24px;
  }

  .data-detail {
    padding: 16px 0;
  }

  .data-detail__item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 0;
    border-bottom: 1px solid #e8eef3;
  }

  .data-detail__label {
    font-size: 13px;
    font-weight: 500;
    color: #52616b;
  }

  .data-detail__value {
    font-size: 14px;
    color: #1e2022;
  }

  .modal-btn {
    padding: 10px 20px;
    border: none;
    border-radius: 8px;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.3s ease;
  }

  .modal-btn--secondary {
    background: #f0f5f9;
    color: #52616b;
  }

  .modal-btn--secondary:hover {
    background: #e8eef3;
  }
</style>
