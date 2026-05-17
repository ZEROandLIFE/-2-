<template>
  <div class="app-card">
    <div class="app-card__header">
      <div class="app-card__icon">
        <span>{{ application.name.charAt(0).toUpperCase() }}</span>
      </div>
      <div class="app-card__status" :class="`app-card__status--${application.status}`">
        {{ application.status === 'published' ? '已发布' : '草稿' }}
      </div>
    </div>
    
    <div class="app-card__body">
      <h3 class="app-card__title">{{ application.name }}</h3>
      <p class="app-card__description">{{ application.description || '暂无描述' }}</p>
    </div>
    
    <div class="app-card__footer">
      <span class="app-card__date">{{ formatDate(application.createdAt) }}</span>
      <div class="app-card__actions">
        <button class="app-card__action-btn app-card__action-btn--preview" @click="$emit('preview', application)">
          <span>👁</span>
        </button>
        <button class="app-card__action-btn app-card__action-btn--edit" @click="$emit('edit', application)">
          <span>✏️</span>
        </button>
        <button class="app-card__action-btn app-card__action-btn--delete" @click="$emit('delete', application._id)">
          <span>🗑️</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Application } from '@/api/application';

defineProps<{
  application: Application;
}>();

defineEmits<{
  (e: 'edit', application: Application): void;
  (e: 'delete', id: string): void;
  (e: 'preview', application: Application): void;
}>();

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};
</script>

<style scoped>
.app-card {
  background: #ffffff;
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  transition: all 0.3s ease;
  border: 1px solid #e8eef3;
}

.app-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(118, 159, 205, 0.15);
}

.app-card__header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
}

.app-card__icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: linear-gradient(135deg, #769fcd 0%, #5a85b8 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  font-weight: 700;
  color: #ffffff;
}

.app-card__status {
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
}

.app-card__status--published {
  background: rgba(82, 196, 26, 0.1);
  color: #52c41a;
}

.app-card__status--draft {
  background: rgba(250, 173, 20, 0.1);
  color: #faad14;
}

.app-card__body {
  margin-bottom: 16px;
}

.app-card__title {
  font-size: 16px;
  font-weight: 600;
  color: #1e2022;
  margin: 0 0 8px;
}

.app-card__description {
  font-size: 13px;
  color: #52616b;
  margin: 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.app-card__footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 16px;
  border-top: 1px solid #e8eef3;
}

.app-card__date {
  font-size: 12px;
  color: #9ca8b3;
}

.app-card__actions {
  display: flex;
  gap: 8px;
}

.app-card__action-btn {
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 8px;
  background: #f0f5f9;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 14px;
}

.app-card__action-btn:hover {
  background: #e8eef3;
}

.app-card__action-btn--delete:hover {
  background: rgba(255, 77, 79, 0.1);
}
</style>