<template>
  <div class="editor-canvas">
    <div class="editor-canvas__header">
      <span class="editor-canvas__label">表单设计区</span>
    </div>

    <div class="editor-canvas__container">
      <div
        class="editor-canvas__content"
        @drop="handleDrop"
        @dragover.prevent
        @click="handleCanvasClick"
      >
        <div v-if="editorStore.currentForm" class="form-fields">
          <div
            v-for="(field, index) in editorStore.currentForm.fields"
            :key="field.id"
            class="form-field"
            :class="{
              'form-field--selected': editorStore.selectedFieldId === field.id,
            }"
            :style="getFieldWidthStyle(field.width)"
            draggable="true"
            @dragstart="handleFieldDragStart($event, index)"
            @dragover.prevent
            @drop="handleFieldDrop($event, index)"
            @click.stop="handleFieldClick(field.id)"
          >
            <div class="form-field__header">
              <div class="form-field__drag-handle">⋮⋮</div>
              <span class="form-field__title">{{ field.title }}</span>
              <span v-if="field.required" class="form-field__required">*</span>
              <button
                class="form-field__delete"
                @click.stop="deleteField(field.id)"
              >
                ×
              </button>
            </div>
            <div class="form-field__body">
              <component :is="getFieldRenderer(field.type)" :field="field" />
            </div>
            <div class="form-field__width-indicator">
              {{ getWidthLabel(field.width) }}
            </div>
          </div>

          <div
            v-if="editorStore.currentForm.fields.length === 0"
            class="form-fields__empty"
          >
            <div class="empty-state">
              <div class="empty-state__icon">📋</div>
              <h3 class="empty-state__title">开始设计表单</h3>
              <p class="empty-state__description">
                从左侧字段库拖拽字段到此处，或点击字段添加
              </p>
            </div>
          </div>
        </div>

        <div v-else class="editor-canvas__empty">
          <div class="empty-state">
            <div class="empty-state__icon">🎨</div>
            <h3 class="empty-state__title">选择或创建表单</h3>
            <p class="empty-state__description">请先在应用中创建一个表单</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref } from "vue";
  import { useEditorStore } from "@/stores/editor";
  import type { FieldWidth } from "@/api/types";

  const editorStore = useEditorStore();
  const draggingIndex = ref<number | null>(null);

  const getFieldWidthStyle = (width: FieldWidth) => {
    const widthMap: Record<FieldWidth, string> = {
      "1/4": "25%",
      "1/3": "33.33%",
      "1/2": "50%",
      "2/3": "66.66%",
      "3/4": "75%",
      full: "100%",
    };
    return {
      width: widthMap[width],
    };
  };

  const getWidthLabel = (width: FieldWidth) => {
    const labelMap: Record<FieldWidth, string> = {
      "1/4": "1/4宽",
      "1/3": "1/3宽",
      "1/2": "1/2宽",
      "2/3": "2/3宽",
      "3/4": "3/4宽",
      full: "整行",
    };
    return labelMap[width];
  };

  const handleDrop = (event: DragEvent) => {
    if (event.dataTransfer && editorStore.currentForm) {
      try {
        const fieldType = event.dataTransfer.getData("text/plain");
        if (fieldType) {
          editorStore.addField(fieldType);
        }
      } catch (error) {
        console.error("Failed to parse field data:", error);
      }
    }
  };

  const handleCanvasClick = () => {
    editorStore.clearSelection();
  };

  const handleFieldClick = (id: string) => {
    editorStore.selectField(id);
  };

  const deleteField = (id: string) => {
    editorStore.deleteField(id);
  };

  const handleFieldDragStart = (event: DragEvent, index: number) => {
    draggingIndex.value = index;
    if (event.dataTransfer) {
      event.dataTransfer.effectAllowed = "move";
    }
  };

  const handleFieldDrop = (_event: DragEvent, toIndex: number) => {
    if (draggingIndex.value !== null && draggingIndex.value !== toIndex) {
      editorStore.moveField(draggingIndex.value, toIndex);
    }
    draggingIndex.value = null;
  };

  const getFieldRenderer = (type: string) => {
    const renderers: Record<string, () => any> = {
      text: () => ({
        template:
          '<input class="field-renderer field-renderer--text" placeholder="请输入..." />',
      }),
      textarea: () => ({
        template:
          '<textarea class="field-renderer field-renderer--textarea" placeholder="请输入..."></textarea>',
      }),
      number: () => ({
        template:
          '<input class="field-renderer field-renderer--number" type="number" placeholder="请输入数字..." />',
      }),
      datetime: () => ({
        template:
          '<input class="field-renderer field-renderer--datetime" type="datetime-local" />',
      }),
      radio: () => ({
        template:
          '<div class="field-renderer field-renderer--radio"><label><input type="radio" name="radio" /> 选项1</label><label><input type="radio" name="radio" /> 选项2</label></div>',
      }),
      checkbox: () => ({
        template:
          '<div class="field-renderer field-renderer--checkbox"><label><input type="checkbox" /> 选项1</label><label><input type="checkbox" /> 选项2</label></div>',
      }),
      select: () => ({
        template:
          '<select class="field-renderer field-renderer--select"><option value="">请选择...</option><option value="1">选项1</option><option value="2">选项2</option></select>',
      }),
      multiselect: () => ({
        template:
          '<select class="field-renderer field-renderer--select" multiple><option value="1">选项1</option><option value="2">选项2</option></select>',
      }),
      image: () => ({
        template:
          '<div class="field-renderer field-renderer--image"><span>📷 点击上传图片</span></div>',
      }),
      file: () => ({
        template:
          '<div class="field-renderer field-renderer--file"><span>📎 点击上传文件</span></div>',
      }),
      address: () => ({
        template:
          '<input class="field-renderer field-renderer--address" placeholder="请输入地址..." />',
      }),
      location: () => ({
        template:
          '<div class="field-renderer field-renderer--location"><span>📍 点击选择位置</span></div>',
      }),
      subform: () => ({
        template:
          '<div class="field-renderer field-renderer--subform"><span>📊 子表单区域</span></div>',
      }),
      lookup: () => ({
        template:
          '<input class="field-renderer field-renderer--lookup" placeholder="搜索关联数据..." />',
      }),
      serial: () => ({
        template:
          '<input class="field-renderer field-renderer--serial" readonly placeholder="自动生成" />',
      }),
      phone: () => ({
        template:
          '<input class="field-renderer field-renderer--phone" placeholder="请输入手机号..." />',
      }),
      calculation: () => ({
        template:
          '<input class="field-renderer field-renderer--calculation" readonly placeholder="计算结果" />',
      }),
      richtext: () => ({
        template:
          '<div class="field-renderer field-renderer--richtext"><span>✏️ 富文本编辑器</span></div>',
      }),
    };

    return (
      renderers[type]?.() || {
        template: `<span class="field-renderer field-renderer--unknown">${type}</span>`,
      }
    );
  };
</script>

<style scoped>
  .editor-canvas {
    flex: 1;
    display: flex;
    flex-direction: column;
    background: #e8eef3;
    overflow: hidden;
  }

  .editor-canvas__header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 20px;
    background: #ffffff;
    border-bottom: 1px solid #d0d7de;
  }

  .editor-canvas__label {
    font-size: 14px;
    font-weight: 500;
    color: #52616b;
  }

  .editor-canvas__container {
    flex: 1;
    overflow: auto;
    padding: 20px;
  }

  .editor-canvas__content {
    width: 100%;
    max-width: 1200px;
    min-height: calc(100vh - 140px);
    margin: 0 auto;
    background: #ffffff;
    border-radius: 16px;
    padding: 24px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
    position: relative;
    box-sizing: border-box;
  }

  .form-fields {
    display: flex;
    flex-wrap: wrap;
    gap: 16px;
  }

  .form-field {
    border: 2px solid #e8eef3;
    border-radius: 12px;
    padding: 12px;
    transition: all 0.3s ease;
    position: relative;
    background: #ffffff;
    box-sizing: border-box;
  }

  .form-field:hover {
    border-color: #769fcd;
  }

  .form-field--selected {
    border-color: #769fcd;
    box-shadow: 0 0 0 3px rgba(118, 159, 205, 0.15);
  }

  .form-field__header {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 8px;
  }

  .form-field__drag-handle {
    cursor: move;
    color: #9ca8b3;
    font-size: 16px;
    padding: 2px 4px;
    border-radius: 4px;
    transition: all 0.3s ease;
  }

  .form-field__drag-handle:hover {
    background: #f0f5f9;
    color: #52616b;
  }

  .form-field__title {
    font-size: 14px;
    font-weight: 500;
    color: #1e2022;
  }

  .form-field__required {
    color: #dc2626;
    font-size: 14px;
  }

  .form-field__delete {
    margin-left: auto;
    width: 24px;
    height: 24px;
    border: none;
    border-radius: 6px;
    background: #fef2f2;
    color: #dc2626;
    font-size: 16px;
    cursor: pointer;
    transition: all 0.3s ease;
    opacity: 0;
  }

  .form-field:hover .form-field__delete {
    opacity: 1;
  }

  .form-field__delete:hover {
    background: #fee2e2;
  }

  .form-field__body {
    min-height: 40px;
  }

  .form-field__width-indicator {
    position: absolute;
    bottom: 4px;
    right: 8px;
    font-size: 11px;
    color: #9ca8b3;
    background: #f0f5f9;
    padding: 2px 6px;
    border-radius: 4px;
  }

  .form-fields__empty {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 400px;
  }

  .editor-canvas__empty {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 400px;
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

  .field-renderer {
    width: 100%;
    padding: 10px 14px;
    border: 2px solid #e8eef3;
    border-radius: 8px;
    font-size: 14px;
    color: #1e2022;
    background: #ffffff;
    box-sizing: border-box;
  }

  .field-renderer:focus {
    outline: none;
    border-color: #769fcd;
  }

  .field-renderer--text {
    min-height: 40px;
  }

  .field-renderer--textarea {
    min-height: 80px;
    resize: vertical;
  }

  .field-renderer--number {
    min-height: 40px;
  }

  .field-renderer--datetime {
    min-height: 40px;
  }

  .field-renderer--radio,
  .field-renderer--checkbox {
    display: flex;
    gap: 16px;
    padding: 8px;
    border: none;
  }

  .field-renderer--radio label,
  .field-renderer--checkbox label {
    display: flex;
    align-items: center;
    gap: 6px;
    cursor: pointer;
  }

  .field-renderer--select {
    min-height: 40px;
    background: #ffffff;
  }

  .field-renderer--image,
  .field-renderer--file,
  .field-renderer--location,
  .field-renderer--subform,
  .field-renderer--richtext {
    min-height: 80px;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 2px dashed #c9d6df;
    color: #9ca8b3;
    cursor: pointer;
  }

  .field-renderer--image:hover,
  .field-renderer--file:hover,
  .field-renderer--location:hover,
  .field-renderer--subform:hover,
  .field-renderer--richtext:hover {
    border-color: #769fcd;
    color: #769fcd;
  }

  .field-renderer--address {
    min-height: 40px;
  }

  .field-renderer--lookup {
    min-height: 40px;
  }

  .field-renderer--serial {
    min-height: 40px;
    background: #f7fbfc;
    color: #9ca8b3;
  }

  .field-renderer--phone {
    min-height: 40px;
  }

  .field-renderer--calculation {
    min-height: 40px;
    background: #f7fbfc;
    color: #9ca8b3;
  }

  .field-renderer--unknown {
    color: #9ca8b3;
    font-style: italic;
  }
</style>
