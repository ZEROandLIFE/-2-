<template>
  <div class="form-fill">
    <div class="form-fill__header">
      <div class="form-fill__header-left">
        <button class="form-fill__back-btn" @click="goBack">
          <span>←</span>
          <span>返回</span>
        </button>
        <div>
          <h1 class="form-fill__title">{{ formName }}</h1>
          <p class="form-fill__subtitle">
            {{ isEdit ? "编辑数据" : "填写表单" }}
          </p>
        </div>
      </div>
    </div>

    <div class="form-fill__content">
      <div class="form-container">
        <div class="form-section">
          <div
            v-for="field in visibleFields"
            :key="field.id"
            class="form-field"
            :class="{
              'form-field--required': field.required,
            }"
          >
            <label class="form-field__label">
              {{ field.title }}
              <span v-if="field.required" class="form-field__required">*</span>
            </label>
            <p v-if="field.description" class="form-field__description">
              {{ field.description }}
            </p>

            <input
              v-if="field.type === 'text'"
              v-model="formData[field.fieldKey]"
              type="text"
              class="form-field__input"
              :placeholder="field.placeholder || ''"
              :disabled="!field.editable"
            />

            <textarea
              v-else-if="field.type === 'textarea'"
              v-model="formData[field.fieldKey] as string"
              class="form-field__input form-field__input--textarea"
              :placeholder="field.placeholder || ''"
              :disabled="!field.editable"
              rows="4"
            ></textarea>

            <input
              v-else-if="field.type === 'number'"
              v-model.number="formData[field.fieldKey]"
              type="number"
              class="form-field__input"
              :placeholder="field.placeholder || ''"
              :disabled="!field.editable"
            />

            <input
              v-else-if="field.type === 'datetime'"
              v-model="formData[field.fieldKey]"
              type="datetime-local"
              class="form-field__input"
              :disabled="!field.editable"
            />

            <input
              v-else-if="field.type === 'phone'"
              v-model="formData[field.fieldKey]"
              type="tel"
              class="form-field__input"
              :placeholder="field.placeholder || ''"
              :disabled="!field.editable"
            />

            <div v-else-if="field.type === 'radio'" class="form-field__options">
              <label
                v-for="option in field.options"
                :key="option.value"
                class="form-field__radio"
              >
                <input
                  v-model="formData[field.fieldKey]"
                  type="radio"
                  :value="option.value"
                  :disabled="!field.editable"
                />
                <span>{{ option.label }}</span>
              </label>
            </div>

            <div
              v-else-if="field.type === 'checkbox'"
              class="form-field__options"
            >
              <label
                v-for="option in field.options"
                :key="option.value"
                class="form-field__checkbox"
              >
                <input
                  type="checkbox"
                  :checked="
                    ((formData[field.fieldKey] as string[]) || []).includes(
                      option.value,
                    )
                  "
                  :value="option.value"
                  @change="
                    handleCheckboxChange(field.fieldKey, option.value, $event)
                  "
                  :disabled="!field.editable"
                />
                <span>{{ option.label }}</span>
              </label>
            </div>

            <select
              v-else-if="field.type === 'select'"
              v-model="formData[field.fieldKey]"
              class="form-field__input form-field__input--select"
              :disabled="!field.editable"
            >
              <option value="">请选择...</option>
              <option
                v-for="option in field.options"
                :key="option.value"
                :value="option.value"
              >
                {{ option.label }}
              </option>
            </select>

            <select
              v-else-if="field.type === 'multiselect'"
              multiple
              class="form-field__input form-field__input--select"
              :disabled="!field.editable"
              @change="handleMultiSelectChange(field.fieldKey, $event)"
            >
              <option
                v-for="option in field.options"
                :key="option.value"
                :value="option.value"
                :selected="
                  ((formData[field.fieldKey] as string[]) || []).includes(
                    option.value,
                  )
                "
              >
                {{ option.label }}
              </option>
            </select>

            <div
              v-else-if="field.type === 'image' || field.type === 'file'"
              class="form-field__upload"
            >
              <input
                type="file"
                :accept="field.type === 'image' ? 'image/*' : '*'"
                class="form-field__upload-input"
                @change="handleFileUpload(field.fieldKey, $event)"
                :disabled="!field.editable"
              />
              <div class="form-field__upload-area">
                <span>{{ field.type === "image" ? "📷" : "📎" }}</span>
                <span>{{
                  field.type === "image" ? "点击上传图片" : "点击上传文件"
                }}</span>
              </div>
            </div>

            <div
              v-else-if="field.type === 'serial'"
              class="form-field__input form-field__input--readonly"
            >
              {{ formData[field.fieldKey] || "自动生成" }}
            </div>

            <div
              v-else-if="field.type === 'calculation'"
              class="form-field__input form-field__input--readonly"
            >
              {{ formData[field.fieldKey] || "-" }}
            </div>

            <input
              v-else
              v-model="formData[field.fieldKey]"
              type="text"
              class="form-field__input"
              :placeholder="field.placeholder || ''"
              :disabled="!field.editable"
            />
          </div>
        </div>

        <div class="form-actions">
          <button class="form-btn form-btn--secondary" @click="goBack">
            取消
          </button>
          <button
            class="form-btn form-btn--primary"
            @click="handleSubmit"
            :disabled="isSubmitting"
          >
            {{ isEdit ? "保存修改" : "提交" }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, reactive, computed, onMounted } from "vue";
  import { useRouter, useRoute } from "vue-router";
  import { useEditorStore } from "@/stores/editor";
  import { useFormDataStore } from "@/stores/formData";
  import { ElMessage } from "element-plus";
  import type { FieldConfig } from "@/api/types";

  const router = useRouter();
  const route = useRoute();
  const editorStore = useEditorStore();
  const formDataStore = useFormDataStore();

  const isEdit = computed(() => !!route.query.dataId);
  const formId = computed(() => route.query.formId as string);
  const dataId = computed(() => route.query.dataId as string);

  const formData = reactive<Record<string, unknown>>({});
  const isSubmitting = ref(false);

  const formName = computed(() => {
    const form = editorStore.forms.find((f) => f._id === formId.value);
    return form?.name || "表单";
  });

  const visibleFields = computed((): FieldConfig[] => {
    const form = editorStore.forms.find((f) => f._id === formId.value);
    return form?.fields.filter((f) => f.visible) || [];
  });

  onMounted(async () => {
    if (formId.value) {
      await editorStore.loadFormsByApp(route.query.appId as string);

      const form = editorStore.forms.find((f) => f._id === formId.value);
      if (form) {
        form.fields.forEach((field) => {
          if (field.defaultValue !== undefined) {
            formData[field.fieldKey] = field.defaultValue;
          } else if (
            field.type === "checkbox" ||
            field.type === "multiselect"
          ) {
            formData[field.fieldKey] = [];
          } else {
            formData[field.fieldKey] = "";
          }
        });
      }

      if (isEdit.value && dataId.value) {
        await formDataStore.loadFormData(formId.value, dataId.value);
        if (formDataStore.currentFormData) {
          Object.assign(formData, formDataStore.currentFormData.data);
        }
      }
    }
  });

  const goBack = () => {
    router.push({
      path: "/editor",
      query: { appId: route.query.appId, activeTab: "data" },
    });
  };

  const handleCheckboxChange = (
    fieldKey: string,
    value: string,
    event: Event,
  ) => {
    const target = event.target as HTMLInputElement;
    const currentValue = (formData[fieldKey] as string[]) || [];
    if (target.checked) {
      currentValue.push(value);
    } else {
      const index = currentValue.indexOf(value);
      if (index !== -1) {
        currentValue.splice(index, 1);
      }
    }
    formData[fieldKey] = currentValue;
  };

  const handleMultiSelectChange = (fieldKey: string, event: Event) => {
    const target = event.target as HTMLSelectElement;
    const values = Array.from(target.selectedOptions).map(
      (option) => option.value,
    );
    formData[fieldKey] = values;
  };

  const handleFileUpload = (fieldKey: string, event: Event) => {
    const target = event.target as HTMLInputElement;
    const file = target.files?.[0];
    if (file) {
      formData[fieldKey] = file.name;
    }
  };

  const validateForm = () => {
    for (const field of visibleFields.value) {
      if (field.required && !formData[field.fieldKey]) {
        ElMessage.warning(`${field.title}为必填项`);
        return false;
      }
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    isSubmitting.value = true;
    try {
      if (isEdit.value && dataId.value) {
        await formDataStore.updateFormData(formId.value, dataId.value, {
          ...formData,
        });
        ElMessage.success("更新成功");
      } else {
        await formDataStore.createFormData(formId.value, { ...formData });
        ElMessage.success("提交成功");
      }
      goBack();
    } catch (error) {
      ElMessage.error("操作失败");
    } finally {
      isSubmitting.value = false;
    }
  };
</script>

<style scoped>
  .form-fill {
    min-height: calc(100vh - 64px);
    background: #f0f5f9;
  }

  .form-fill__header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px 24px;
    background: #ffffff;
    border-bottom: 1px solid #e8eef3;
  }

  .form-fill__header-left {
    display: flex;
    align-items: center;
    gap: 16px;
  }

  .form-fill__back-btn {
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

  .form-fill__back-btn:hover {
    background: #e8eef3;
  }

  .form-fill__title {
    font-size: 20px;
    font-weight: 600;
    color: #1e2022;
    margin: 0 0 4px;
  }

  .form-fill__subtitle {
    font-size: 13px;
    color: #52616b;
    margin: 0;
  }

  .form-fill__content {
    padding: 24px;
    display: flex;
    justify-content: center;
  }

  .form-container {
    width: 100%;
    max-width: 800px;
    background: #ffffff;
    border-radius: 16px;
    padding: 32px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  }

  .form-section {
    margin-bottom: 24px;
  }

  .form-field {
    margin-bottom: 24px;
  }

  .form-field--required .form-field__label {
    color: #1e2022;
  }

  .form-field__label {
    display: block;
    font-size: 14px;
    font-weight: 600;
    color: #52616b;
    margin-bottom: 8px;
  }

  .form-field__required {
    color: #dc2626;
    margin-left: 4px;
  }

  .form-field__description {
    font-size: 13px;
    color: #9ca8b3;
    margin: 0 0 12px;
  }

  .form-field__input {
    width: 100%;
    padding: 12px 16px;
    border: 2px solid #e8eef3;
    border-radius: 12px;
    font-size: 14px;
    color: #1e2022;
    outline: none;
    box-sizing: border-box;
    transition: all 0.3s ease;
    background: #ffffff;
  }

  .form-field__input:focus {
    border-color: #769fcd;
    box-shadow: 0 0 0 3px rgba(118, 159, 205, 0.1);
  }

  .form-field__input:disabled {
    background: #f7fbfc;
    cursor: not-allowed;
    opacity: 0.7;
  }

  .form-field__input--textarea {
    resize: vertical;
    min-height: 100px;
  }

  .form-field__input--select {
    background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e");
    background-position: right 12px center;
    background-repeat: no-repeat;
    background-size: 16px;
    padding-right: 40px;
    appearance: none;
  }

  .form-field__input--readonly {
    background: #f7fbfc;
    color: #9ca8b3;
    padding: 12px 16px;
    border-radius: 12px;
    border: 2px solid #e8eef3;
  }

  .form-field__options {
    display: flex;
    flex-wrap: wrap;
    gap: 16px;
  }

  .form-field__radio,
  .form-field__checkbox {
    display: flex;
    align-items: center;
    gap: 8px;
    cursor: pointer;
    font-size: 14px;
    color: #1e2022;
  }

  .form-field__radio input,
  .form-field__checkbox input {
    width: 18px;
    height: 18px;
    accent-color: #769fcd;
  }

  .form-field__radio input:disabled,
  .form-field__checkbox input:disabled {
    cursor: not-allowed;
  }

  .form-field__upload {
    position: relative;
  }

  .form-field__upload-input {
    position: absolute;
    width: 100%;
    height: 100%;
    opacity: 0;
    cursor: pointer;
  }

  .form-field__upload-area {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 32px;
    border: 2px dashed #c9d6df;
    border-radius: 12px;
    background: #f7fbfc;
    cursor: pointer;
    transition: all 0.3s ease;
  }

  .form-field__upload-area:hover {
    border-color: #769fcd;
    background: rgba(118, 159, 205, 0.05);
  }

  .form-field__upload-area span {
    font-size: 14px;
    color: #52616b;
  }

  .form-field__upload-area span:first-child {
    font-size: 32px;
    margin-bottom: 8px;
  }

  .form-actions {
    display: flex;
    justify-content: flex-end;
    gap: 16px;
    padding-top: 24px;
    border-top: 1px solid #e8eef3;
  }

  .form-btn {
    padding: 12px 28px;
    border: none;
    border-radius: 12px;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.3s ease;
  }

  .form-btn--secondary {
    background: #f0f5f9;
    color: #52616b;
  }

  .form-btn--secondary:hover {
    background: #e8eef3;
  }

  .form-btn--primary {
    background: linear-gradient(135deg, #769fcd 0%, #5a85b8 100%);
    color: #ffffff;
    box-shadow: 0 4px 12px rgba(118, 159, 205, 0.3);
  }

  .form-btn--primary:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 6px 18px rgba(118, 159, 205, 0.4);
  }

  .form-btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
</style>
