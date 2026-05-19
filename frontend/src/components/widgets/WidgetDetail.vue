<template>
  <ElDialog
    :model-value="visible"
    title="组件详情"
    :width="'500px'"
    @close="$emit('close')"
    @update:model-value="$emit('update:visible', $event)"
  >
    <div v-if="widget" class="widget-detail">
      <div class="widget-detail__header">
        <div class="widget-detail__icon">{{ widget.icon || "📦" }}</div>
        <div class="widget-detail__info">
          <h2 class="widget-detail__name">{{ widget.name }}</h2>
          <span class="widget-detail__category">{{
            widget.category?.name
          }}</span>
        </div>
      </div>

      <div class="widget-detail__section">
        <h3 class="widget-detail__section-title">描述</h3>
        <p class="widget-detail__description">
          {{ widget.description || "暂无描述" }}
        </p>
      </div>

      <div class="widget-detail__section">
        <h3 class="widget-detail__section-title">默认属性</h3>
        <pre class="widget-detail__code">{{
          JSON.stringify(widget.props, null, 2)
        }}</pre>
      </div>

      <div class="widget-detail__section">
        <h3 class="widget-detail__section-title">默认样式</h3>
        <pre class="widget-detail__code">{{
          JSON.stringify(widget.defaultStyle, null, 2)
        }}</pre>
      </div>

      <div class="widget-detail__footer">
        <button
          class="widget-detail__btn widget-detail__btn--primary"
          @click="handleAdd"
        >
          添加到画布
        </button>
        <button class="widget-detail__btn" @click="$emit('close')">关闭</button>
      </div>
    </div>
  </ElDialog>
</template>

<script setup lang="ts">
  import { ElDialog } from "element-plus";
  import type { Widget } from "@/api/widget";

  const props = defineProps<{
    visible: boolean;
    widget: Widget | null;
  }>();

  const emit = defineEmits<{
    (e: "close"): void;
    (e: "add", widget: Widget): void;
    (e: "update:visible", value: boolean): void;
  }>();

  const handleAdd = () => {
    if (props.widget) {
      emit("add", props.widget);
      emit("close");
    }
  };
</script>

<style scoped>
  .widget-detail {
    padding: 8px 0;
  }

  .widget-detail__header {
    display: flex;
    gap: 16px;
    padding-bottom: 16px;
    border-bottom: 1px solid #e8eef3;
    margin-bottom: 16px;
  }

  .widget-detail__icon {
    width: 56px;
    height: 56px;
    border-radius: 14px;
    background: linear-gradient(135deg, #769fcd 0%, #5a85b8 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 24px;
  }

  .widget-detail__info {
    flex: 1;
  }

  .widget-detail__name {
    font-size: 20px;
    font-weight: 600;
    color: #1e2022;
    margin: 0 0 8px;
  }

  .widget-detail__category {
    display: inline-block;
    padding: 4px 12px;
    border-radius: 14px;
    background: #f0f5f9;
    color: #52616b;
    font-size: 12px;
  }

  .widget-detail__section {
    margin-bottom: 20px;
  }

  .widget-detail__section-title {
    font-size: 14px;
    font-weight: 600;
    color: #1e2022;
    margin: 0 0 10px;
  }

  .widget-detail__description {
    font-size: 13px;
    color: #52616b;
    line-height: 1.6;
    margin: 0;
  }

  .widget-detail__code {
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

  .widget-detail__footer {
    display: flex;
    justify-content: flex-end;
    gap: 12px;
    padding-top: 16px;
    border-top: 1px solid #e8eef3;
  }

  .widget-detail__btn {
    padding: 10px 20px;
    border: none;
    border-radius: 10px;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.3s ease;
  }

  .widget-detail__btn--primary {
    background: linear-gradient(135deg, #769fcd 0%, #5a85b8 100%);
    color: #ffffff;
    box-shadow: 0 4px 12px rgba(118, 159, 205, 0.3);
  }

  .widget-detail__btn--primary:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 18px rgba(118, 159, 205, 0.4);
  }

  .widget-detail__btn:not(.widget-detail__btn--primary) {
    background: #f0f5f9;
    color: #52616b;
  }

  .widget-detail__btn:not(.widget-detail__btn--primary):hover {
    background: #e8eef3;
  }
</style>
