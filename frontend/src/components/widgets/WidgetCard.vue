<template>
  <div class="widget-card" @click="$emit('click', widget)">
    <div class="widget-card__icon">{{ widget.icon || '📦' }}</div>
    <div class="widget-card__content">
      <h3 class="widget-card__name">{{ widget.name }}</h3>
      <p class="widget-card__description">{{ widget.description || '暂无描述' }}</p>
      <span class="widget-card__category">{{ widget.category?.name }}</span>
    </div>
    <div class="widget-card__actions">
      <button class="widget-card__action-btn" @click.stop="$emit('add', widget)">
        <span>➕</span>
      </button>
      <button class="widget-card__action-btn" @click.stop="$emit('detail', widget)">
        <span>ℹ️</span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Widget } from '@/api/widget';

defineProps<{
  widget: Widget;
}>();

defineEmits<{
  (e: 'click', widget: Widget): void;
  (e: 'add', widget: Widget): void;
  (e: 'detail', widget: Widget): void;
}>();
</script>

<style scoped>
.widget-card {
  background: #ffffff;
  border-radius: 12px;
  padding: 16px;
  display: flex;
  gap: 14px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  border: 1px solid #e8eef3;
  transition: all 0.3s ease;
  cursor: pointer;
}

.widget-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(118, 159, 205, 0.15);
  border-color: #769fcd;
}

.widget-card__icon {
  width: 44px;
  height: 44px;
  border-radius: 10px;
  background: linear-gradient(135deg, #769fcd 0%, #5a85b8 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  flex-shrink: 0;
}

.widget-card__content {
  flex: 1;
  min-width: 0;
}

.widget-card__name {
  font-size: 14px;
  font-weight: 600;
  color: #1e2022;
  margin: 0 0 6px;
}

.widget-card__description {
  font-size: 12px;
  color: #52616b;
  margin: 0 0 8px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.widget-card__category {
  display: inline-block;
  padding: 3px 10px;
  border-radius: 12px;
  background: #f0f5f9;
  color: #52616b;
  font-size: 11px;
}

.widget-card__actions {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.widget-card__action-btn {
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

.widget-card__action-btn:hover {
  background: #769fcd;
}
</style>