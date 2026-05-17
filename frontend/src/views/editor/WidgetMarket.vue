<template>
  <div class="widget-market">
    <div class="widget-market__header">
      <div class="widget-market__title">
        <h1>组件市场</h1>
        <p>浏览和管理可用的组件</p>
      </div>
      <div class="widget-market__actions">
        <button class="widget-market__action-btn" @click="handleExport">
          <span>📥</span>
          <span>导出组件</span>
        </button>
        <button class="widget-market__action-btn widget-market__action-btn--primary" @click="showImportModal = true">
          <span>📤</span>
          <span>导入组件</span>
        </button>
      </div>
    </div>

    <div class="widget-market__toolbar">
      <div class="widget-market__search">
        <input
          v-model="searchQuery"
          type="text"
          class="widget-market__search-input"
          placeholder="搜索组件..."
          @input="handleSearch"
        />
        <button v-if="searchQuery" class="widget-market__search-clear" @click="clearSearch">✕</button>
      </div>
      <div class="widget-market__categories">
        <button
          class="widget-market__category-btn"
          :class="{ 'widget-market__category-btn--active': !activeCategory }"
          @click="activeCategory = null"
        >
          全部
        </button>
        <button
          v-for="category in categories"
          :key="category._id"
          class="widget-market__category-btn"
          :class="{ 'widget-market__category-btn--active': activeCategory === category._id }"
          @click="activeCategory = category._id"
        >
          <span>{{ category.icon }}</span>
          <span>{{ category.name }}</span>
        </button>
      </div>
    </div>

    <div class="widget-market__content">
      <div class="widget-market__grid">
        <WidgetCard
          v-for="widget in filteredWidgets"
          :key="widget._id"
          :widget="widget"
          @add="handleAddWidget"
          @detail="showWidgetDetail"
        />
      </div>

      <div v-if="filteredWidgets.length === 0" class="widget-market__empty">
        <div class="widget-market__empty-icon">📦</div>
        <h3>暂无组件</h3>
        <p>{{ searchQuery ? '未找到匹配的组件' : '点击导入按钮添加组件' }}</p>
      </div>
    </div>

    <WidgetDetail
      v-if="selectedWidget"
      :visible="showDetailModal"
      :widget="selectedWidget"
      @close="showDetailModal = false"
      @add="handleAddWidget"
    />

    <ElDialog
      v-model="showImportModal"
      title="导入组件"
      :width="'500px'"
      @close="showImportModal = false"
    >
      <div class="import-modal">
        <p class="import-modal__desc">选择要导入的组件JSON文件</p>
        <input
          type="file"
          accept=".json"
          class="import-modal__file-input"
          @change="handleFileSelect"
          ref="fileInputRef"
        />
        <button class="import-modal__upload-btn" @click="triggerFileInput">
          <span>📁</span>
          <span>{{ selectedFileName || '选择文件' }}</span>
        </button>
        <pre v-if="importPreview" class="import-modal__preview">{{ importPreview }}</pre>
      </div>
      <template #footer>
        <button class="import-modal__btn" @click="showImportModal = false">取消</button>
        <button
          class="import-modal__btn import-modal__btn--primary"
          :disabled="!importData"
          @click="handleImport"
        >
          导入
        </button>
      </template>
    </ElDialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { ElDialog, ElMessage } from 'element-plus';
import { useWidgetStore } from '@/stores/widgets';
import { useEditorStore } from '@/stores/editor';
import WidgetCard from '@/components/widgets/WidgetCard.vue';
import WidgetDetail from '@/components/widgets/WidgetDetail.vue';
import type { Widget, ExportData } from '@/api/widget';

const widgetStore = useWidgetStore();
const editorStore = useEditorStore();

const searchQuery = ref('');
const activeCategory = ref<string | null>(null);
const showDetailModal = ref(false);
const showImportModal = ref(false);
const selectedWidget = ref<Widget | null>(null);
const fileInputRef = ref<HTMLInputElement | null>(null);
const selectedFileName = ref('');
const importData = ref<{ widgets: ExportData['widgets'] } | null>(null);
const importPreview = ref('');

const categories = computed(() => widgetStore.categories);

const filteredWidgets = computed(() => {
  let result = widgetStore.widgets;

  if (activeCategory.value) {
    result = result.filter((w) => w.category?._id === activeCategory.value);
  }

  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase();
    result = result.filter(
      (w) =>
        w.name.toLowerCase().includes(query) ||
        w.description?.toLowerCase().includes(query),
    );
  }

  return result;
});

onMounted(async () => {
  await widgetStore.loadWidgets();
  await widgetStore.loadCategories();
});

const handleSearch = () => {
  if (searchQuery.value.trim()) {
    widgetStore.searchWidgets(searchQuery.value, activeCategory.value || undefined);
  } else {
    widgetStore.loadWidgets();
  }
};

const clearSearch = () => {
  searchQuery.value = '';
  widgetStore.loadWidgets();
};

const showWidgetDetail = (widget: Widget) => {
  selectedWidget.value = widget;
  showDetailModal.value = true;
};

const handleAddWidget = (widget: Widget) => {
  editorStore.addComponent(widget);
  ElMessage.success(`已添加 "${widget.name}" 组件`);
};

const handleExport = async () => {
  const data = await widgetStore.exportWidgets(activeCategory.value || undefined);
  if (data) {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `widgets-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }
};

const triggerFileInput = () => {
  fileInputRef.value?.click();
};

const handleFileSelect = (event: Event) => {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];
  if (file) {
    selectedFileName.value = file.name;
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const parsed = JSON.parse(content);
        if (parsed.widgets && Array.isArray(parsed.widgets)) {
          importData.value = { widgets: parsed.widgets };
          importPreview.value = JSON.stringify(parsed.widgets.slice(0, 3), null, 2);
          if (parsed.widgets.length > 3) {
            importPreview.value += `\n... (共 ${parsed.widgets.length} 个组件)`;
          }
        } else {
          ElMessage.error('无效的组件文件格式');
          importData.value = null;
          importPreview.value = '';
        }
      } catch {
        ElMessage.error('无法解析文件内容');
        importData.value = null;
        importPreview.value = '';
      }
    };
    reader.readAsText(file);
  }
};

const handleImport = async () => {
  if (importData.value) {
    await widgetStore.importWidgets(importData.value);
    showImportModal.value = false;
    selectedFileName.value = '';
    importData.value = null;
    importPreview.value = '';
  }
};
</script>

<style scoped>
.widget-market {
  padding: 24px;
  min-height: calc(100vh - 64px);
  background: #f0f5f9;
}

.widget-market__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.widget-market__title h1 {
  font-size: 28px;
  font-weight: 700;
  color: #1e2022;
  margin: 0 0 8px;
}

.widget-market__title p {
  font-size: 14px;
  color: #52616b;
  margin: 0;
}

.widget-market__actions {
  display: flex;
  gap: 12px;
}

.widget-market__action-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 18px;
  border: none;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  background: #ffffff;
  color: #52616b;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.widget-market__action-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.1);
}

.widget-market__action-btn--primary {
  background: linear-gradient(135deg, #769fcd 0%, #5a85b8 100%);
  color: #ffffff;
  box-shadow: 0 4px 12px rgba(118, 159, 205, 0.3);
}

.widget-market__toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #ffffff;
  padding: 16px 20px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  margin-bottom: 20px;
}

.widget-market__search {
  position: relative;
  width: 300px;
}

.widget-market__search-input {
  width: 100%;
  padding: 10px 40px 10px 14px;
  border: 2px solid #e8eef3;
  border-radius: 10px;
  font-size: 14px;
  color: #1e2022;
  outline: none;
  transition: all 0.3s ease;
  box-sizing: border-box;
}

.widget-market__search-input:focus {
  border-color: #769fcd;
  box-shadow: 0 0 0 3px rgba(118, 159, 205, 0.1);
}

.widget-market__search-clear {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: #9ca8b3;
  font-size: 14px;
  cursor: pointer;
  padding: 4px;
}

.widget-market__categories {
  display: flex;
  gap: 8px;
}

.widget-market__category-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  border: none;
  border-radius: 20px;
  background: #f0f5f9;
  font-size: 13px;
  color: #52616b;
  cursor: pointer;
  transition: all 0.3s ease;
}

.widget-market__category-btn:hover {
  background: #e8eef3;
}

.widget-market__category-btn--active {
  background: #769fcd;
  color: #ffffff;
}

.widget-market__content {
  background: #ffffff;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.widget-market__grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(380px, 1fr));
  gap: 16px;
}

.widget-market__empty {
  text-align: center;
  padding: 60px 20px;
}

.widget-market__empty-icon {
  font-size: 56px;
  margin-bottom: 16px;
}

.widget-market__empty h3 {
  font-size: 18px;
  font-weight: 600;
  color: #1e2022;
  margin: 0 0 8px;
}

.widget-market__empty p {
  font-size: 14px;
  color: #52616b;
  margin: 0;
}

.import-modal {
  padding: 16px 0;
}

.import-modal__desc {
  font-size: 14px;
  color: #52616b;
  margin: 0 0 16px;
}

.import-modal__file-input {
  display: none;
}

.import-modal__upload-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  padding: 40px;
  border: 2px dashed #e8eef3;
  border-radius: 12px;
  background: #fafbfc;
  font-size: 14px;
  color: #52616b;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-bottom: 16px;
}

.import-modal__upload-btn:hover {
  border-color: #769fcd;
  background: #f0f7fc;
}

.import-modal__preview {
  background: #1e2022;
  color: #e8eef3;
  padding: 14px;
  border-radius: 10px;
  font-size: 12px;
  overflow-x: auto;
  max-height: 200px;
  overflow-y: auto;
  margin: 0;
}

.import-modal__btn {
  padding: 10px 20px;
  border: none;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-left: 12px;
  background: #f0f5f9;
  color: #52616b;
}

.import-modal__btn:hover:not(:disabled) {
  background: #e8eef3;
}

.import-modal__btn--primary {
  background: linear-gradient(135deg, #769fcd 0%, #5a85b8 100%);
  color: #ffffff;
}

.import-modal__btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>