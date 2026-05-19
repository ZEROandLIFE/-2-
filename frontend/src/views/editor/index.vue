<template>
  <div class="editor">
    <div class="editor__header">
      <div class="editor__header-left">
        <button class="editor__back-btn" @click="goBack">
          <span>←</span>
          <span>返回</span>
        </button>

        <div class="editor__tabs">
          <button
            class="editor__tab-btn"
            :class="{ 'editor__tab-btn--active': activeTab === 'design' }"
            @click="activeTab = 'design'"
          >
            表单设计
          </button>
          <button
            class="editor__tab-btn"
            :class="{ 'editor__tab-btn--active': activeTab === 'data' }"
            @click="activeTab = 'data'"
          >
            数据管理
          </button>
        </div>
      </div>

      <div class="editor__header-right" v-if="activeTab === 'design'">
        <div class="editor__form-selector">
          <span class="editor__form-label">选择表单：</span>
          <ElSelect
            v-model="selectedFormId"
            class="editor__form-select"
            placeholder="选择表单"
            @change="handleFormChange"
          >
            <ElOption
              v-for="form in editorStore.forms"
              :key="form._id"
              :label="form.name"
              :value="form._id"
            />
          </ElSelect>
          <button class="editor__create-form-btn" @click="handleCreateForm">
            + 新建表单
          </button>
        </div>
        <button class="editor__action-btn" @click="handleSave">
          <span>💾</span>
          <span>保存</span>
        </button>
      </div>

      <div class="editor__header-right" v-else>
        <button class="editor__action-btn" @click="handleAddData">
          <span>+</span>
          <span>添加数据</span>
        </button>
      </div>
    </div>

    <div class="editor__content" v-if="activeTab === 'design'">
      <ComponentPanel @add-field="handleAddField" />
      <EditorCanvas />
      <PropertyPanel />
    </div>

    <div class="editor__content editor__content--data" v-else>
      <div class="data-panel">
        <div class="data-panel__header">
          <h3 class="data-panel__title">表单列表</h3>
          <button class="data-panel__add-btn" @click="handleCreateForm">
            + 新建表单
          </button>
        </div>
        <div class="data-panel__list">
          <div
            v-for="form in editorStore.forms"
            :key="form._id"
            class="data-panel__item"
            :class="{
              'data-panel__item--selected': selectedFormId === form._id,
            }"
            @click="selectFormForData(form._id)"
          >
            <div class="data-panel__item-icon">📋</div>
            <div class="data-panel__item-info">
              <span class="data-panel__item-name">{{ form.name }}</span>
              <span class="data-panel__item-count"
                >{{ getFormDataCount(form._id) }} 条数据</span
              >
            </div>
          </div>
          <div v-if="editorStore.forms.length === 0" class="data-panel__empty">
            <p>暂无表单</p>
          </div>
        </div>
      </div>

      <div class="data-content">
        <div v-if="selectedFormId" class="data-table-wrapper">
          <div class="data-table-header">
            <h3 class="data-table-title">
              {{ getSelectedFormName() }} - 数据列表
            </h3>
            <div class="data-table-actions">
              <button class="data-table-btn" @click="handleRefresh">
                刷新
              </button>
              <button class="data-table-btn" @click="handleExport">
                导出CSV
              </button>
            </div>
          </div>

          <div class="data-table-toolbar">
            <div class="search-box">
              <ElInput
                v-model="searchKeyword"
                placeholder="搜索数据..."
                clearable
                @keyup.enter="handleSearch"
              >
                <template #prefix>
                  <span>🔍</span>
                </template>
              </ElInput>
            </div>
            <div class="batch-actions" v-if="selectedDataIds.length > 0">
              <span>已选择 {{ selectedDataIds.length }} 条</span>
              <button
                class="batch-btn batch-btn--danger"
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
                  <th class="checkbox-column">
                    <input
                      type="checkbox"
                      :checked="
                        selectedDataIds.length === formDataList.length &&
                        formDataList.length > 0
                      "
                      @change="handleSelectAll"
                    />
                  </th>
                  <th
                    v-for="field in selectedFormFields"
                    :key="field.fieldKey"
                    class="sortable"
                    @click="handleSort(field.fieldKey)"
                  >
                    {{ field.title }}
                    <span v-if="sortField === field.fieldKey" class="sort-icon">
                      {{ sortOrder === "asc" ? "↑" : "↓" }}
                    </span>
                    <span v-else class="sort-icon">↕</span>
                  </th>
                  <th>操作</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="item in formDataList"
                  :key="item._id"
                  :class="{ selected: selectedDataIds.includes(item._id) }"
                  @click="toggleSelect(item._id)"
                >
                  <td class="checkbox-column">
                    <input
                      type="checkbox"
                      :checked="selectedDataIds.includes(item._id)"
                      @click.stop="toggleSelect(item._id)"
                    />
                  </td>
                  <td v-for="field in selectedFormFields" :key="field.fieldKey">
                    {{ getFieldValue(item, field.fieldKey) }}
                  </td>
                  <td class="action-column">
                    <button
                      class="data-table-action"
                      @click.stop="handleEditData(item)"
                    >
                      编辑
                    </button>
                    <button
                      class="data-table-action data-table-action--danger"
                      @click.stop="handleDeleteData(item._id)"
                    >
                      删除
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div v-if="formDataList.length === 0" class="data-empty">
            <div class="empty-state">
              <div class="empty-state__icon">📭</div>
              <h3 class="empty-state__title">暂无数据</h3>
              <p class="empty-state__description">点击上方按钮添加第一条数据</p>
            </div>
          </div>
        </div>

        <div v-else class="data-content__empty">
          <div class="empty-state">
            <div class="empty-state__icon">📋</div>
            <h3 class="empty-state__title">选择表单</h3>
            <p class="empty-state__description">从左侧选择一个表单查看数据</p>
          </div>
        </div>
      </div>
    </div>

    <ElDialog
      v-model="showCreateModal"
      title="新建表单"
      :width="'480px'"
      @close="showCreateModal = false"
    >
      <div class="create-form-modal">
        <div class="form-field">
          <label class="form-field__label">表单名称</label>
          <input
            v-model="newFormName"
            type="text"
            class="form-field__input"
            placeholder="请输入表单名称"
          />
        </div>
        <div class="form-field">
          <label class="form-field__label">表单类型</label>
          <div class="form-field__radio-group">
            <label class="form-field__radio">
              <input type="radio" v-model="newFormType" value="normal" />
              <span>普通表单</span>
            </label>
            <label class="form-field__radio">
              <input type="radio" v-model="newFormType" value="workflow" />
              <span>流程表单</span>
            </label>
          </div>
        </div>
      </div>
      <template #footer>
        <button
          class="modal-btn modal-btn--secondary"
          @click="showCreateModal = false"
        >
          取消
        </button>
        <button
          class="modal-btn modal-btn--primary"
          :disabled="!newFormName.trim()"
          @click="handleSubmitForm"
        >
          创建
        </button>
      </template>
    </ElDialog>
  </div>
</template>

<script setup lang="ts">
  import { ref, onMounted, watch, computed } from "vue";
  import { useRouter, useRoute } from "vue-router";
  import { useEditorStore } from "@/stores/editor";
  import { formDataApi } from "@/api/form";
  import ComponentPanel from "@/components/editor/ComponentPanel.vue";
  import EditorCanvas from "@/components/editor/EditorCanvas.vue";
  import PropertyPanel from "@/components/editor/PropertyPanel.vue";
  import {
    ElSelect,
    ElOption,
    ElDialog,
    ElMessage,
    ElInput,
  } from "element-plus";
  import type { FormData } from "@/api/types";

  const router = useRouter();
  const route = useRoute();
  const editorStore = useEditorStore();

  const showCreateModal = ref(false);
  const newFormName = ref("");
  const newFormType = ref<"normal" | "workflow">("normal");
  const selectedFormId = ref<string | null>(null);
  const activeTab = ref<"design" | "data">("design");
  const formDataList = ref<FormData[]>([]);
  const formDataCountMap = ref<Record<string, number>>({});
  const searchKeyword = ref("");
  const selectedDataIds = ref<string[]>([]);
  const sortField = ref<string | null>(null);
  const sortOrder = ref<"asc" | "desc">("asc");
  const originalFormDataList = ref<FormData[]>([]);

  onMounted(async () => {
    const appId = route.query.appId as string;
    const queryTab = route.query.activeTab as string;

    if (appId) {
      await editorStore.loadFormsByApp(appId);

      if (editorStore.forms.length > 0) {
        selectedFormId.value = editorStore.forms[0]._id;
        await editorStore.loadForm(selectedFormId.value);

        if (queryTab === "data") {
          activeTab.value = "data";
        }
      }
    }
  });

  watch(selectedFormId, async (newVal) => {
    if (newVal) {
      await editorStore.loadForm(newVal);
      if (activeTab.value === "data") {
        await loadFormData(newVal);
      }
    }
  });

  watch(activeTab, async (newTab) => {
    if (newTab === "data" && selectedFormId.value) {
      await loadFormData(selectedFormId.value);
    }
  });

  const goBack = () => {
    router.push("/dashboard");
  };

  const handleSave = async () => {
    if (editorStore.currentForm) {
      await editorStore.saveForm();
      ElMessage.success("保存成功");
    }
  };

  const handleAddField = (fieldType: string) => {
    if (!editorStore.currentForm) {
      ElMessage.warning("请先选择或创建一个表单");
      return;
    }
    editorStore.addField(fieldType);
  };

  const handleCreateForm = () => {
    newFormName.value = "";
    newFormType.value = "normal";
    showCreateModal.value = true;
  };

  const handleSubmitForm = async () => {
    const appId = route.query.appId as string;
    if (!appId || !newFormName.value.trim()) return;

    try {
      const form = await editorStore.createForm({
        name: newFormName.value.trim(),
        applicationId: appId,
      });

      if (form) {
        await editorStore.loadFormsByApp(appId);
        selectedFormId.value = form._id;
        showCreateModal.value = false;
        ElMessage.success("表单创建成功");
      }
    } catch (error) {
      ElMessage.error("创建失败");
    }
  };

  const handleFormChange = async (formId: string) => {
    if (formId) {
      await editorStore.loadForm(formId);
    }
  };

  const selectedFormFields = computed(() => {
    const currentFormFields = editorStore.currentForm?.fields || [];
    if (currentFormFields.length > 0) {
      return currentFormFields.filter(
        (f: { visible?: boolean }) => f.visible !== false,
      );
    }
    const form = editorStore.forms.find((f) => f._id === selectedFormId.value);
    return form?.fields.filter((f) => f.visible) || [];
  });

  const getSelectedFormName = () => {
    const form = editorStore.forms.find((f) => f._id === selectedFormId.value);
    return form?.name || "";
  };

  const getFormDataCount = (formId: string) => {
    return formDataCountMap.value[formId] || 0;
  };

  const selectFormForData = async (formId: string) => {
    selectedFormId.value = formId;
    await loadFormData(formId);
  };

  const loadFormData = async (formId: string) => {
    try {
      const response = await formDataApi.list(formId);
      if (response.code === 200) {
        originalFormDataList.value = response.data;
        formDataList.value = response.data;
        formDataCountMap.value[formId] = response.data.length;
        selectedDataIds.value = [];
        sortField.value = null;
        sortOrder.value = "asc";
        searchKeyword.value = "";
      }
    } catch (error) {
      console.error("Load form data error:", error);
    }
  };

  const handleSearch = () => {
    if (!searchKeyword.value.trim()) {
      formDataList.value = originalFormDataList.value;
      return;
    }
    const keyword = searchKeyword.value.toLowerCase();
    formDataList.value = originalFormDataList.value.filter((item) => {
      return Object.values(item.data).some((val) =>
        String(val).toLowerCase().includes(keyword),
      );
    });
    selectedDataIds.value = [];
  };

  const handleSort = (fieldKey: string) => {
    if (sortField.value === fieldKey) {
      sortOrder.value = sortOrder.value === "asc" ? "desc" : "asc";
    } else {
      sortField.value = fieldKey;
      sortOrder.value = "asc";
    }
    formDataList.value = [...formDataList.value].sort((a, b) => {
      const valA = String(a.data[fieldKey] || "");
      const valB = String(b.data[fieldKey] || "");
      if (sortOrder.value === "asc") {
        return valA.localeCompare(valB, "zh-CN");
      }
      return valB.localeCompare(valA, "zh-CN");
    });
  };

  const toggleSelect = (dataId: string) => {
    const index = selectedDataIds.value.indexOf(dataId);
    if (index > -1) {
      selectedDataIds.value.splice(index, 1);
    } else {
      selectedDataIds.value.push(dataId);
    }
  };

  const handleSelectAll = (event: Event) => {
    const target = event.target as HTMLInputElement;
    if (target.checked) {
      selectedDataIds.value = formDataList.value.map((item) => item._id);
    } else {
      selectedDataIds.value = [];
    }
  };

  const handleBatchDelete = async () => {
    if (selectedDataIds.value.length === 0) return;
    if (!confirm(`确定要删除选中的 ${selectedDataIds.value.length} 条数据吗？`))
      return;

    try {
      for (const dataId of selectedDataIds.value) {
        await formDataApi.delete(selectedFormId.value!, dataId);
      }
      formDataList.value = formDataList.value.filter(
        (item) => !selectedDataIds.value.includes(item._id),
      );
      originalFormDataList.value = originalFormDataList.value.filter(
        (item) => !selectedDataIds.value.includes(item._id),
      );
      if (formDataCountMap.value[selectedFormId.value!]) {
        formDataCountMap.value[selectedFormId.value!] -=
          selectedDataIds.value.length;
      }
      selectedDataIds.value = [];
      ElMessage.success("批量删除成功");
    } catch (error) {
      ElMessage.error("批量删除失败");
    }
  };

  const handleExport = () => {
    if (formDataList.value.length === 0) {
      ElMessage.warning("没有数据可导出");
      return;
    }
    const fields = selectedFormFields.value;
    const headers = fields.map((f) => f.title);
    const rows = formDataList.value.map((item) =>
      fields.map((f) => getFieldValue(item, f.fieldKey)),
    );
    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.join(",")),
    ].join("\n");
    const blob = new Blob(["\uFEFF" + csvContent], {
      type: "text/csv;charset=utf-8;",
    });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `${getSelectedFormName()}_data.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    ElMessage.success("导出成功");
  };

  const handleRefresh = () => {
    if (selectedFormId.value) {
      loadFormData(selectedFormId.value);
    }
  };

  const handleAddData = () => {
    if (!selectedFormId.value) {
      ElMessage.warning("请先选择一个表单");
      return;
    }
    router.push({
      path: "/app/form-fill",
      query: { formId: selectedFormId.value, appId: route.query.appId },
    });
  };

  const handleEditData = (item: FormData) => {
    router.push({
      path: "/app/form-fill",
      query: {
        formId: selectedFormId.value,
        dataId: item._id,
        appId: route.query.appId,
      },
    });
  };

  const handleDeleteData = async (dataId: string) => {
    if (!selectedFormId.value) return;
    try {
      await formDataApi.delete(selectedFormId.value, dataId);
      formDataList.value = formDataList.value.filter(
        (item: FormData) => item._id !== dataId,
      );
      if (formDataCountMap.value[selectedFormId.value]) {
        formDataCountMap.value[selectedFormId.value]--;
      }
      ElMessage.success("删除成功");
    } catch (error) {
      ElMessage.error("删除失败");
    }
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
  .editor {
    display: flex;
    flex-direction: column;
    height: 100vh;
    background: #f0f5f9;
  }

  .editor__header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 20px;
    background: #ffffff;
    border-bottom: 1px solid #e8eef3;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.04);
  }

  .editor__header-left {
    display: flex;
    align-items: center;
    gap: 16px;
  }

  .editor__back-btn {
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

  .editor__back-btn:hover {
    background: #e8eef3;
  }

  .editor__form-selector {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .editor__form-label {
    font-size: 14px;
    color: #52616b;
    white-space: nowrap;
  }

  .editor__form-select {
    width: 200px;
  }

  .editor__create-form-btn {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 8px 14px;
    border: 2px dashed #769fcd;
    border-radius: 8px;
    background: transparent;
    color: #769fcd;
    font-size: 14px;
    cursor: pointer;
    transition: all 0.3s ease;
  }

  .editor__create-form-btn:hover {
    background: rgba(118, 159, 205, 0.1);
  }

  .editor__header-right {
    display: flex;
    gap: 12px;
  }

  .editor__action-btn {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 10px 18px;
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

  .editor__action-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 18px rgba(118, 159, 205, 0.4);
  }

  .editor__tabs {
    display: flex;
    gap: 4px;
    background: #f7fbfc;
    padding: 4px;
    border-radius: 10px;
  }

  .editor__tab-btn {
    padding: 8px 20px;
    border: none;
    border-radius: 8px;
    background: transparent;
    font-size: 14px;
    font-weight: 500;
    color: #52616b;
    cursor: pointer;
    transition: all 0.3s ease;
  }

  .editor__tab-btn:hover {
    background: #e8eef3;
  }

  .editor__tab-btn--active {
    background: #ffffff;
    color: #769fcd;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.06);
  }

  .editor__content {
    flex: 1;
    display: flex;
    overflow: hidden;
  }

  .editor__content--data {
    flex-direction: row;
  }

  .data-panel {
    width: 280px;
    background: #ffffff;
    border-right: 1px solid #e8eef3;
    display: flex;
    flex-direction: column;
  }

  .data-panel__header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px;
    border-bottom: 1px solid #e8eef3;
  }

  .data-panel__title {
    font-size: 14px;
    font-weight: 600;
    color: #1e2022;
    margin: 0;
  }

  .data-panel__add-btn {
    padding: 6px 12px;
    border: 2px dashed #769fcd;
    border-radius: 6px;
    background: transparent;
    color: #769fcd;
    font-size: 12px;
    cursor: pointer;
    transition: all 0.3s ease;
  }

  .data-panel__add-btn:hover {
    background: rgba(118, 159, 205, 0.1);
  }

  .data-panel__list {
    flex: 1;
    overflow-y: auto;
    padding: 8px;
  }

  .data-panel__item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px;
    border-radius: 10px;
    cursor: pointer;
    transition: all 0.3s ease;
    border: 2px solid transparent;
  }

  .data-panel__item:hover {
    background: #f7fbfc;
    border-color: #e8eef3;
  }

  .data-panel__item--selected {
    background: rgba(118, 159, 205, 0.08);
    border-color: #769fcd;
  }

  .data-panel__item-icon {
    width: 36px;
    height: 36px;
    border-radius: 10px;
    background: linear-gradient(135deg, #769fcd 0%, #5a85b8 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 16px;
    flex-shrink: 0;
  }

  .data-panel__item-info {
    flex: 1;
    min-width: 0;
  }

  .data-panel__item-name {
    display: block;
    font-size: 14px;
    font-weight: 500;
    color: #1e2022;
    margin-bottom: 2px;
  }

  .data-panel__item-count {
    display: block;
    font-size: 12px;
    color: #9ca8b3;
  }

  .data-panel__empty {
    text-align: center;
    padding: 40px 20px;
    color: #9ca8b3;
  }

  .data-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    padding: 24px;
    overflow: hidden;
  }

  .data-table-wrapper {
    width: 100%;
    flex: 1;
    display: flex;
    flex-direction: column;
    background: #ffffff;
    border-radius: 16px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
    overflow: hidden;
    min-height: 0;
  }

  .data-table-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px 20px;
    border-bottom: 1px solid #e8eef3;
  }

  .data-table-title {
    font-size: 16px;
    font-weight: 600;
    color: #1e2022;
    margin: 0;
  }

  .data-table-actions {
    display: flex;
    gap: 8px;
  }

  .data-table-btn {
    padding: 8px 16px;
    border: none;
    border-radius: 8px;
    background: #f0f5f9;
    color: #52616b;
    font-size: 13px;
    cursor: pointer;
    transition: all 0.3s ease;
  }

  .data-table-btn:hover {
    background: #e8eef3;
  }

  .data-table-toolbar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px 20px;
    border-bottom: 1px solid #e8eef3;
  }

  .search-box {
    flex: 1;
    max-width: 400px;
  }

  .search-box :deep(.el-input__wrapper) {
    padding: 8px 16px;
    border-radius: 24px;
    box-shadow: 0 0 0 1px #e8eef3;
  }

  .search-box :deep(.el-input__wrapper:hover) {
    box-shadow: 0 0 0 1px #769fcd;
  }

  .search-box :deep(.el-input__wrapper.is-focus) {
    box-shadow: 0 0 0 2px #769fcd;
  }

  .search-box :deep(.el-input__inner) {
    font-size: 14px;
  }

  .search-box :deep(.el-input__prefix) {
    color: #769fcd;
  }

  .data-table-container {
    flex: 1;
    overflow-y: auto;
    min-height: 0;
  }

  .data-table {
    width: 100%;
    border-collapse: collapse;
    table-layout: fixed;
  }

  .data-table th {
    padding: 14px 16px;
    text-align: left;
    font-size: 13px;
    font-weight: 600;
    color: #52616b;
    background: #f7fbfc;
    border-bottom: 1px solid #e8eef3;
    position: sticky;
    top: 0;
    z-index: 1;
  }

  .data-table td {
    padding: 14px 16px;
    border-bottom: 1px solid #e8eef3;
    font-size: 14px;
    color: #1e2022;
  }

  .data-table-action {
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

  .data-table-action:hover {
    background: #e8eef3;
  }

  .data-table-action--danger {
    background: #fef2f2;
    color: #dc2626;
  }

  .data-table-action--danger:hover {
    background: #fee2e2;
  }

  .data-empty {
    padding: 60px 0;
    text-align: center;
  }

  .data-content__empty {
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

  .create-form-modal {
    padding: 16px 0;
  }

  .form-field {
    margin-bottom: 20px;
  }

  .form-field__label {
    display: block;
    font-size: 13px;
    font-weight: 500;
    color: #52616b;
    margin-bottom: 8px;
  }

  .form-field__input {
    width: 100%;
    padding: 10px 14px;
    border: 2px solid #e8eef3;
    border-radius: 10px;
    font-size: 14px;
    color: #1e2022;
    outline: none;
    box-sizing: border-box;
    transition: all 0.3s ease;
  }

  .form-field__input:focus {
    border-color: #769fcd;
    box-shadow: 0 0 0 3px rgba(118, 159, 205, 0.1);
  }

  .form-field__radio-group {
    display: flex;
    gap: 20px;
  }

  .form-field__radio {
    display: flex;
    align-items: center;
    gap: 8px;
    cursor: pointer;
  }

  .form-field__radio input {
    width: 16px;
    height: 16px;
  }

  .form-field__radio span {
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

  .modal-btn--primary {
    background: linear-gradient(135deg, #769fcd 0%, #5a85b8 100%);
    color: #ffffff;
  }

  .modal-btn--primary:hover:not(:disabled) {
    transform: translateY(-2px);
  }

  .modal-btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
</style>
