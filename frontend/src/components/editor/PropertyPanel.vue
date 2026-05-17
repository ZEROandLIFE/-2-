<template>
  <div class="property-panel">
    <div class="property-panel__header">
      <h2 class="property-panel__title">属性设置</h2>
    </div>

    <div v-if="editorStore.selectedField" class="property-panel__content">
      <div class="property-panel__section">
        <h3 class="property-panel__section-title">基本属性</h3>

        <div class="property-panel__field">
          <label class="property-panel__field-label">字段标题</label>
          <input
            type="text"
            class="property-panel__field-input"
            :value="editorStore.selectedField.title"
            @input="
              updateField('title', ($event.target as HTMLInputElement).value)
            "
            placeholder="请输入字段标题"
          />
        </div>

        <div class="property-panel__field">
          <label class="property-panel__field-label">字段标识</label>
          <input
            type="text"
            class="property-panel__field-input property-panel__field-input--mono"
            :value="editorStore.selectedField.fieldKey"
            @input="
              updateField('fieldKey', ($event.target as HTMLInputElement).value)
            "
            placeholder="field_key"
          />
          <span class="property-panel__field-hint">用于数据存储的唯一标识</span>
        </div>

        <div class="property-panel__field">
          <label class="property-panel__field-label">描述信息</label>
          <textarea
            class="property-panel__field-input property-panel__field-input--textarea"
            :value="editorStore.selectedField.description"
            @input="
              updateField(
                'description',
                ($event.target as HTMLTextAreaElement).value,
              )
            "
            placeholder="字段的详细说明"
          ></textarea>
        </div>

        <div class="property-panel__field" v-if="!isFileField">
          <label class="property-panel__field-label">提示文字</label>
          <input
            type="text"
            class="property-panel__field-input"
            :value="editorStore.selectedField.placeholder"
            @input="
              updateField(
                'placeholder',
                ($event.target as HTMLInputElement).value,
              )
            "
            placeholder="请输入提示文字"
          />
        </div>
      </div>

      <div class="property-panel__section">
        <h3 class="property-panel__section-title">字段宽度</h3>
        <div class="property-panel__width-options">
          <button
            v-for="option in editorStore.fieldWidthOptions"
            :key="option.value"
            class="property-panel__width-btn"
            :class="{
              'property-panel__width-btn--active':
                editorStore.selectedField.width === option.value,
            }"
            :style="{ width: option.width }"
            @click="updateFieldWidth(option.value)"
          >
            {{ option.label }}
          </button>
        </div>
      </div>

      <div v-if="isTextType" class="property-panel__section">
        <h3 class="property-panel__section-title">文本设置</h3>

        <div class="property-panel__field">
          <label class="property-panel__field-label">最大字符数</label>
          <input
            type="number"
            class="property-panel__field-input"
            :value="editorStore.selectedField.maxLength || ''"
            @input="
              updateField(
                'maxLength',
                parseInt(($event.target as HTMLInputElement).value) || null,
              )
            "
            placeholder="不限制"
          />
        </div>
      </div>

      <div v-if="isNumberType" class="property-panel__section">
        <h3 class="property-panel__section-title">数字设置</h3>

        <div class="property-panel__field">
          <label class="property-panel__field-label">最小值</label>
          <input
            type="number"
            class="property-panel__field-input"
            :value="editorStore.selectedField.minValue || ''"
            @input="
              updateField(
                'minValue',
                parseFloat(($event.target as HTMLInputElement).value) || null,
              )
            "
            placeholder="不限制"
          />
        </div>

        <div class="property-panel__field">
          <label class="property-panel__field-label">最大值</label>
          <input
            type="number"
            class="property-panel__field-input"
            :value="editorStore.selectedField.maxValue || ''"
            @input="
              updateField(
                'maxValue',
                parseFloat(($event.target as HTMLInputElement).value) || null,
              )
            "
            placeholder="不限制"
          />
        </div>

        <div class="property-panel__field">
          <label class="property-panel__field-label">小数位数</label>
          <input
            type="number"
            class="property-panel__field-input"
            :value="editorStore.selectedField.decimalPlaces || ''"
            @input="
              updateField(
                'decimalPlaces',
                parseInt(($event.target as HTMLInputElement).value) || null,
              )
            "
            placeholder="0"
          />
        </div>
      </div>

      <div v-if="isFileField" class="property-panel__section">
        <h3 class="property-panel__section-title">文件设置</h3>

        <div class="property-panel__field">
          <label class="property-panel__field-label">最大文件大小(MB)</label>
          <input
            type="number"
            class="property-panel__field-input"
            :value="editorStore.selectedField.maxFileSize || ''"
            @input="
              updateField(
                'maxFileSize',
                parseInt(($event.target as HTMLInputElement).value) || null,
              )
            "
            placeholder="10"
          />
        </div>

        <div class="property-panel__field">
          <label class="property-panel__field-label">允许的文件类型</label>
          <input
            type="text"
            class="property-panel__field-input"
            :value="editorStore.selectedField.acceptTypes || ''"
            @input="
              updateField(
                'acceptTypes',
                ($event.target as HTMLInputElement).value,
              )
            "
            placeholder="如: image/jpeg,image/png"
          />
        </div>
      </div>

      <div v-if="isDateTimeType" class="property-panel__section">
        <h3 class="property-panel__section-title">日期时间设置</h3>

        <div class="property-panel__field">
          <label class="property-panel__field-label">日期格式</label>
          <select
            class="property-panel__field-input"
            :value="
              editorStore.selectedField.dateFormat || 'YYYY-MM-DD HH:mm:ss'
            "
            @change="
              updateField(
                'dateFormat',
                ($event.target as HTMLSelectElement).value,
              )
            "
          >
            <option value="YYYY-MM-DD">仅日期 (YYYY-MM-DD)</option>
            <option value="YYYY-MM-DD HH:mm">
              日期时间 (YYYY-MM-DD HH:mm)
            </option>
            <option value="YYYY-MM-DD HH:mm:ss">
              完整时间 (YYYY-MM-DD HH:mm:ss)
            </option>
            <option value="HH:mm:ss">仅时间 (HH:mm:ss)</option>
          </select>
        </div>
      </div>

      <div v-if="showOptions" class="property-panel__section">
        <h3 class="property-panel__section-title">选项设置</h3>

        <div class="property-panel__options-list">
          <div
            v-for="(option, index) in editorStore.selectedField.options"
            :key="index"
            class="property-panel__option-item"
          >
            <input
              type="text"
              class="property-panel__field-input property-panel__field-input--small"
              :value="option.label"
              @input="
                updateOptionLabel(
                  index,
                  ($event.target as HTMLInputElement).value,
                )
              "
              placeholder="显示文本"
            />
            <input
              type="text"
              class="property-panel__field-input property-panel__field-input--small"
              :value="option.value"
              @input="
                updateOptionValue(
                  index,
                  ($event.target as HTMLInputElement).value,
                )
              "
              placeholder="值"
            />
            <button
              v-if="editorStore.selectedField.options.length > 1"
              class="property-panel__option-delete"
              @click="removeOption(index)"
            >
              ×
            </button>
          </div>
        </div>

        <button class="property-panel__add-option-btn" @click="addOption">
          + 添加选项
        </button>
      </div>

      <div class="property-panel__section">
        <h3 class="property-panel__section-title">验证规则</h3>

        <div class="property-panel__checkbox">
          <input
            type="checkbox"
            id="required"
            :checked="editorStore.selectedField.required"
            @change="
              updateField(
                'required',
                ($event.target as HTMLInputElement).checked,
              )
            "
          />
          <label for="required">必填</label>
        </div>

        <div class="property-panel__checkbox" v-if="!isFileField">
          <input
            type="checkbox"
            id="unique"
            :checked="editorStore.selectedField.unique"
            @change="
              updateField('unique', ($event.target as HTMLInputElement).checked)
            "
          />
          <label for="unique">不允许重复值</label>
        </div>
      </div>

      <div class="property-panel__section">
        <h3 class="property-panel__section-title">字段权限</h3>

        <div class="property-panel__checkbox">
          <input
            type="checkbox"
            id="visible"
            :checked="editorStore.selectedField.visible"
            @change="
              updateField(
                'visible',
                ($event.target as HTMLInputElement).checked,
              )
            "
          />
          <label for="visible">可见</label>
        </div>

        <div class="property-panel__checkbox">
          <input
            type="checkbox"
            id="editable"
            :checked="editorStore.selectedField.editable"
            @change="
              updateField(
                'editable',
                ($event.target as HTMLInputElement).checked,
              )
            "
          />
          <label for="editable">可编辑</label>
        </div>
      </div>

      <div class="property-panel__actions">
        <button
          class="property-panel__action-btn property-panel__action-btn--delete"
          @click="deleteSelected"
        >
          删除字段
        </button>
      </div>
    </div>

    <div v-else class="property-panel__empty">
      <div class="empty-state">
        <div class="empty-state__icon">👆</div>
        <h3 class="empty-state__title">选择字段</h3>
        <p class="empty-state__description">点击画布上的字段以编辑其属性</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { computed } from "vue";
  import { useEditorStore } from "@/stores/editor";
  import type { FieldWidth, FieldOption } from "@/api/types";

  const editorStore = useEditorStore();

  const showOptions = computed(() => {
    if (!editorStore.selectedField) return false;
    const typesWithOptions = ["radio", "checkbox", "select", "multiselect"];
    return typesWithOptions.includes(editorStore.selectedField.type);
  });

  const isTextType = computed(() => {
    if (!editorStore.selectedField) return false;
    const textTypes = ["text", "textarea", "address", "phone", "richtext"];
    return textTypes.includes(editorStore.selectedField.type);
  });

  const isNumberType = computed(() => {
    if (!editorStore.selectedField) return false;
    return editorStore.selectedField.type === "number";
  });

  const isFileField = computed(() => {
    if (!editorStore.selectedField) return false;
    const fileTypes = ["image", "file"];
    return fileTypes.includes(editorStore.selectedField.type);
  });

  const isDateTimeType = computed(() => {
    if (!editorStore.selectedField) return false;
    return editorStore.selectedField.type === "datetime";
  });

  const updateField = (key: string, value: unknown) => {
    if (editorStore.selectedFieldId) {
      editorStore.updateField(editorStore.selectedFieldId, { [key]: value });
    }
  };

  const updateFieldWidth = (width: FieldWidth) => {
    if (editorStore.selectedFieldId) {
      editorStore.updateFieldWidth(editorStore.selectedFieldId, width);
    }
  };

  const updateOptionLabel = (index: number, label: string) => {
    if (!editorStore.selectedField) return;
    const options = [...editorStore.selectedField.options];
    options[index] = { ...options[index], label };
    editorStore.updateField(editorStore.selectedFieldId!, { options });
  };

  const updateOptionValue = (index: number, value: string) => {
    if (!editorStore.selectedField) return;
    const options = [...editorStore.selectedField.options];
    options[index] = { ...options[index], value };
    editorStore.updateField(editorStore.selectedFieldId!, { options });
  };

  const addOption = () => {
    if (!editorStore.selectedField) return;
    const newOption: FieldOption = {
      label: `选项${editorStore.selectedField.options.length + 1}`,
      value: `${editorStore.selectedField.options.length + 1}`,
    };
    const options = [...editorStore.selectedField.options, newOption];
    editorStore.updateField(editorStore.selectedFieldId!, { options });
  };

  const removeOption = (index: number) => {
    if (!editorStore.selectedField) return;
    const options = editorStore.selectedField.options.filter(
      (_: unknown, i: number) => i !== index,
    );
    editorStore.updateField(editorStore.selectedFieldId!, { options });
  };

  const deleteSelected = () => {
    if (editorStore.selectedFieldId) {
      editorStore.deleteField(editorStore.selectedFieldId);
    }
  };
</script>

<style scoped>
  .property-panel {
    width: 300px;
    background: #ffffff;
    border-left: 1px solid #e8eef3;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  .property-panel__header {
    padding: 16px 20px;
    border-bottom: 1px solid #e8eef3;
  }

  .property-panel__title {
    font-size: 16px;
    font-weight: 600;
    color: #1e2022;
    margin: 0;
  }

  .property-panel__content {
    flex: 1;
    overflow-y: auto;
    padding: 16px;
  }

  .property-panel__section {
    margin-bottom: 24px;
  }

  .property-panel__section-title {
    font-size: 13px;
    font-weight: 600;
    color: #52616b;
    margin: 0 0 12px;
    padding-bottom: 8px;
    border-bottom: 1px solid #e8eef3;
  }

  .property-panel__field {
    margin-bottom: 14px;
  }

  .property-panel__field-label {
    display: block;
    font-size: 12px;
    font-weight: 500;
    color: #52616b;
    margin-bottom: 6px;
  }

  .property-panel__field-input {
    width: 100%;
    padding: 8px 12px;
    border: 2px solid #e8eef3;
    border-radius: 8px;
    font-size: 13px;
    color: #1e2022;
    outline: none;
    box-sizing: border-box;
    transition: all 0.3s ease;
  }

  .property-panel__field-input:focus {
    border-color: #769fcd;
    box-shadow: 0 0 0 3px rgba(118, 159, 205, 0.1);
  }

  .property-panel__field-input--mono {
    font-family: "Monaco", "Consolas", monospace;
  }

  .property-panel__field-input--textarea {
    min-height: 80px;
    resize: vertical;
  }

  .property-panel__field-input--small {
    flex: 1;
    min-width: 0;
  }

  .property-panel__field-hint {
    display: block;
    font-size: 11px;
    color: #9ca8b3;
    margin-top: 4px;
  }

  .property-panel__width-options {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }

  .property-panel__width-btn {
    padding: 8px 12px;
    border: 2px solid #e8eef3;
    border-radius: 8px;
    background: #ffffff;
    font-size: 12px;
    color: #52616b;
    cursor: pointer;
    transition: all 0.3s ease;
    text-align: center;
  }

  .property-panel__width-btn:hover {
    border-color: #769fcd;
  }

  .property-panel__width-btn--active {
    background: #769fcd;
    border-color: #769fcd;
    color: #ffffff;
  }

  .property-panel__checkbox {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 10px;
  }

  .property-panel__checkbox input {
    width: 16px;
    height: 16px;
    cursor: pointer;
  }

  .property-panel__checkbox label {
    font-size: 13px;
    color: #1e2022;
    cursor: pointer;
  }

  .property-panel__options-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
    margin-bottom: 12px;
  }

  .property-panel__option-item {
    display: flex;
    gap: 8px;
    align-items: center;
  }

  .property-panel__option-delete {
    width: 28px;
    height: 32px;
    border: none;
    border-radius: 6px;
    background: #fef2f2;
    color: #dc2626;
    font-size: 16px;
    cursor: pointer;
    flex-shrink: 0;
  }

  .property-panel__option-delete:hover {
    background: #fee2e2;
  }

  .property-panel__add-option-btn {
    width: 100%;
    padding: 8px;
    border: 2px dashed #c9d6df;
    border-radius: 8px;
    background: transparent;
    font-size: 12px;
    color: #769fcd;
    cursor: pointer;
    transition: all 0.3s ease;
  }

  .property-panel__add-option-btn:hover {
    border-color: #769fcd;
    background: rgba(118, 159, 205, 0.05);
  }

  .property-panel__actions {
    margin-top: 24px;
    padding-top: 16px;
    border-top: 1px solid #e8eef3;
  }

  .property-panel__action-btn {
    width: 100%;
    padding: 10px;
    border: none;
    border-radius: 8px;
    font-size: 13px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.3s ease;
  }

  .property-panel__action-btn--delete {
    background: #fef2f2;
    color: #dc2626;
  }

  .property-panel__action-btn--delete:hover {
    background: #fee2e2;
  }

  .property-panel__empty {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 40px 20px;
  }

  .empty-state {
    text-align: center;
  }

  .empty-state__icon {
    font-size: 36px;
    margin-bottom: 12px;
  }

  .empty-state__title {
    font-size: 15px;
    font-weight: 500;
    color: #1e2022;
    margin: 0 0 6px;
  }

  .empty-state__description {
    font-size: 12px;
    color: #9ca8b3;
    margin: 0;
  }
</style>
