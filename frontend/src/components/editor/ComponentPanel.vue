<template>
  <div class="component-panel">
    <div class="component-panel__header">
      <h2 class="component-panel__title">字段组件库</h2>
    </div>

    <div class="component-panel__search">
      <input
        v-model="searchQuery"
        type="text"
        class="component-panel__search-input"
        placeholder="搜索字段..."
      />
    </div>

    <div class="component-panel__categories">
      <button
        class="component-panel__category-btn"
        :class="{
          'component-panel__category-btn--active': activeCategory === null,
        }"
        @click="activeCategory = null"
      >
        <span>📦</span>
        <span>全部</span>
      </button>
      <button
        v-for="category in editorStore.fieldTypes"
        :key="category.category"
        class="component-panel__category-btn"
        :class="{
          'component-panel__category-btn--active':
            activeCategory === category.category,
        }"
        @click="activeCategory = category.category"
      >
        <span>{{ category.category === "常用" ? "⭐" : "🔧" }}</span>
        <span>{{ category.category }}</span>
      </button>
    </div>

    <div class="component-panel__list">
      <div
        v-for="field in filteredFields"
        :key="field.type"
        class="component-panel__item"
        draggable="true"
        @dragstart="handleDragStart($event, field)"
        @click="handleAddField(field.type)"
      >
        <div class="component-panel__item-icon">{{ field.icon }}</div>
        <div class="component-panel__item-info">
          <span class="component-panel__item-name">{{ field.name }}</span>
          <span class="component-panel__item-desc">{{
            field.description
          }}</span>
        </div>
      </div>

      <div v-if="filteredFields.length === 0" class="component-panel__empty">
        <p>暂无字段</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed } from "vue";
  import { useEditorStore } from "@/stores/editor";
  import type { FieldCategory, FieldType } from "@/api/types";

  const emit = defineEmits<{
    (e: "add-field", fieldType: string): void;
  }>();

  const editorStore = useEditorStore();
  const searchQuery = ref("");
  const activeCategory = ref<string | null>(null);

  const allFields = computed(() => {
    return editorStore.fieldTypes.flatMap((cat: FieldCategory) =>
      cat.types.map((type: FieldType) => ({
        ...type,
        category: cat.category,
      })),
    );
  });

  const filteredFields = computed(() => {
    let result = allFields.value;

    if (activeCategory.value) {
      result = result.filter(
        (f: { category: string }) => f.category === activeCategory.value,
      );
    }

    if (searchQuery.value.trim()) {
      const query = searchQuery.value.toLowerCase();
      result = result.filter(
        (f: { name: string; description: string }) =>
          f.name.toLowerCase().includes(query) ||
          f.description.toLowerCase().includes(query),
      );
    }

    return result;
  });

  const handleDragStart = (event: DragEvent, field: { type: string }) => {
    if (event.dataTransfer) {
      event.dataTransfer.setData("text/plain", field.type);
      event.dataTransfer.effectAllowed = "copy";
    }
  };

  const handleAddField = (fieldType: string) => {
    emit("add-field", fieldType);
  };
</script>

<style scoped>
  .component-panel {
    width: 260px;
    background: #ffffff;
    border-right: 1px solid #e8eef3;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  .component-panel__header {
    padding: 16px 20px;
    border-bottom: 1px solid #e8eef3;
  }

  .component-panel__title {
    font-size: 16px;
    font-weight: 600;
    color: #1e2022;
    margin: 0;
  }

  .component-panel__search {
    padding: 12px 16px;
  }

  .component-panel__search-input {
    width: 100%;
    padding: 10px 14px;
    border: 2px solid #e8eef3;
    border-radius: 10px;
    font-size: 13px;
    color: #1e2022;
    outline: none;
    box-sizing: border-box;
    transition: all 0.3s ease;
  }

  .component-panel__search-input:focus {
    border-color: #769fcd;
    box-shadow: 0 0 0 3px rgba(118, 159, 205, 0.1);
  }

  .component-panel__search-input::placeholder {
    color: #9ca8b3;
  }

  .component-panel__categories {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    padding: 0 16px 12px;
    border-bottom: 1px solid #e8eef3;
  }

  .component-panel__category-btn {
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 6px 12px;
    border: none;
    border-radius: 20px;
    background: #f0f5f9;
    font-size: 12px;
    color: #52616b;
    cursor: pointer;
    transition: all 0.3s ease;
  }

  .component-panel__category-btn:hover {
    background: #e8eef3;
  }

  .component-panel__category-btn--active {
    background: #769fcd;
    color: #ffffff;
  }

  .component-panel__list {
    flex: 1;
    overflow-y: auto;
    padding: 8px;
  }

  .component-panel__item {
    display: flex;
    align-items: flex-start;
    gap: 12px;
    padding: 10px 12px;
    border-radius: 10px;
    cursor: pointer;
    transition: all 0.3s ease;
    border: 1px solid transparent;
    margin-bottom: 4px;
  }

  .component-panel__item:hover {
    background: #f7fbfc;
    border-color: #769fcd;
  }

  .component-panel__item-icon {
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

  .component-panel__item-info {
    flex: 1;
    min-width: 0;
  }

  .component-panel__item-name {
    display: block;
    font-size: 14px;
    font-weight: 500;
    color: #1e2022;
    margin-bottom: 2px;
  }

  .component-panel__item-desc {
    display: block;
    font-size: 12px;
    color: #9ca8b3;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .component-panel__empty {
    text-align: center;
    padding: 40px 20px;
    color: #9ca8b3;
  }

  .component-panel__empty p {
    margin: 0;
  }
</style>
