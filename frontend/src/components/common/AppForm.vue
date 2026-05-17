<template>
  <div class="form-container">
    <div class="form-group">
      <label class="form-label" for="app-name">应用名称</label>
      <input
        id="app-name"
        v-model="form.name"
        type="text"
        class="form-input"
        placeholder="请输入应用名称"
        required
      />
    </div>

    <div class="form-group">
      <label class="form-label" for="app-description">应用描述</label>
      <textarea
        id="app-description"
        v-model="form.description"
        class="form-textarea"
        placeholder="请输入应用描述（可选）"
        rows="3"
      />
    </div>

    <div class="form-group">
      <label class="form-label">应用状态</label>
      <div class="form-radio-group">
        <label class="form-radio">
          <input
            type="radio"
            v-model="form.status"
            value="draft"
          />
          <span>草稿</span>
        </label>
        <label class="form-radio">
          <input
            type="radio"
            v-model="form.status"
            value="published"
          />
          <span>已发布</span>
        </label>
      </div>
    </div>

    <div class="form-actions">
      <button class="form-btn form-btn--secondary" @click="handleCancel">
        取消
      </button>
      <button 
        class="form-btn form-btn--primary" 
        @click="handleSubmit"
        :disabled="!form.name.trim()"
      >
        {{ isEdit ? '保存修改' : '创建应用' }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, computed, watch } from 'vue';
import type { Application } from '@/api/application';

const props = defineProps<{
  application?: Application | null;
}>();

const emit = defineEmits<{
  (e: 'submit', data: { name: string; description?: string; status?: 'draft' | 'published' }): void;
  (e: 'cancel'): void;
}>();

const form = reactive({
  name: '',
  description: '',
  status: 'draft' as 'draft' | 'published'
});

const isEdit = computed(() => !!props.application);

const resetForm = () => {
  if (props.application) {
    form.name = props.application.name;
    form.description = props.application.description || '';
    form.status = props.application.status;
  } else {
    form.name = '';
    form.description = '';
    form.status = 'draft';
  }
};

watch(() => props.application, resetForm, { immediate: true });

const handleSubmit = () => {
  if (!form.name.trim()) return;

  emit('submit', {
    name: form.name.trim(),
    description: form.description.trim() || undefined,
    status: form.status
  });
  
  resetForm();
};

const handleCancel = () => {
  emit('cancel');
};

defineExpose({
  form,
  submit: handleSubmit,
  reset: resetForm,
  cancel: handleCancel
});
</script>

<style scoped>
.form-container {
  padding: 8px 0;
}

.form-group {
  margin-bottom: 20px;
}

.form-label {
  display: block;
  font-size: 13px;
  font-weight: 600;
  color: #1e2022;
  margin-bottom: 8px;
}

.form-input,
.form-textarea {
  width: 100%;
  padding: 12px 14px;
  border: 2px solid #e8eef3;
  border-radius: 10px;
  font-size: 14px;
  color: #1e2022;
  transition: all 0.3s ease;
  outline: none;
  box-sizing: border-box;
}

.form-input:focus,
.form-textarea:focus {
  border-color: #769fcd;
  box-shadow: 0 0 0 3px rgba(118, 159, 205, 0.1);
}

.form-textarea {
  resize: vertical;
  min-height: 80px;
}

.form-radio-group {
  display: flex;
  gap: 24px;
}

.form-radio {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  font-size: 14px;
  color: #1e2022;
}

.form-radio input[type="radio"] {
  width: 18px;
  height: 18px;
  accent-color: #769fcd;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 24px;
  padding-top: 16px;
  border-top: 1px solid #e8eef3;
}

.form-btn {
  padding: 10px 24px;
  border: none;
  border-radius: 10px;
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
  opacity: 0.5;
  cursor: not-allowed;
}
</style>