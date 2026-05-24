<template>
  <div class="department-tree">
    <div v-for="dept in data" :key="dept._id" class="tree-node">
      <div
        class="tree-node__item"
        :class="{ 'tree-node__item--selected': selectedId === dept._id }"
        :style="{ paddingLeft: `${level * 16 + 8}px` }"
        @click="$emit('select', dept)"
      >
        <span
          v-if="dept.children?.length"
          class="tree-node__expand"
          @click.stop="toggleExpand(dept._id)"
        >
          {{ isExpanded(dept._id) ? "▼" : "▶" }}
        </span>
        <span v-else class="tree-node__expand"></span>
        <span class="tree-node__icon">🏢</span>
        <span class="tree-node__name">{{ dept.name }}</span>
        <span v-if="dept.leaderId" class="tree-node__leader">
          {{
            (dept.leaderId as any).nickname || (dept.leaderId as any).username
          }}
        </span>
        <div class="tree-node__actions" @click.stop>
          <button class="action-btn" @click="$emit('edit', dept)" title="编辑">
            ✏️
          </button>
          <button
            class="action-btn action-btn--danger"
            @click="$emit('delete', dept)"
            title="删除"
          >
            🗑️
          </button>
        </div>
      </div>
      <DepartmentTree
        v-if="dept.children?.length && isExpanded(dept._id)"
        :data="dept.children"
        :selected-id="selectedId"
        :level="level + 1"
        :expanded-ids="expandedIds"
        @select="$emit('select', $event)"
        @edit="$emit('edit', $event)"
        @delete="$emit('delete', $event)"
        @toggle-expand="toggleExpand"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
  import { computed } from "vue";
  import type { Department } from "@/api/organization";

  const props = withDefaults(
    defineProps<{
      data: Department[];
      selectedId?: string | null;
      level?: number;
      expandedIds?: string[];
    }>(),
    {
      level: 0,
      selectedId: null,
      expandedIds: () => [],
    },
  );

  const emit = defineEmits<{
    (e: "select", dept: Department): void;
    (e: "edit", dept: Department): void;
    (e: "delete", dept: Department): void;
    (e: "toggleExpand", id: string): void;
  }>();

  const isExpanded = computed(
    () => (id: string) => props.expandedIds?.includes(id) ?? false,
  );

  const toggleExpand = (id: string) => {
    emit("toggleExpand", id);
  };
</script>

<style scoped>
  .department-tree {
    font-size: 14px;
  }

  .tree-node__item {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 12px;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .tree-node__item:hover {
    background: #f0f5f9;
  }

  .tree-node__item--selected {
    background: rgba(118, 159, 205, 0.15);
    border: 1px solid #769fcd;
  }

  .tree-node__expand {
    width: 16px;
    font-size: 10px;
    color: #9ca8b3;
    flex-shrink: 0;
  }

  .tree-node__icon {
    font-size: 16px;
    flex-shrink: 0;
  }

  .tree-node__name {
    flex: 1;
    color: #1e2022;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .tree-node__leader {
    font-size: 12px;
    color: #769fcd;
    max-width: 80px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .tree-node__actions {
    display: none;
    gap: 4px;
  }

  .tree-node__item:hover .tree-node__actions {
    display: flex;
  }

  .action-btn {
    width: 24px;
    height: 24px;
    border: none;
    border-radius: 4px;
    background: transparent;
    cursor: pointer;
    font-size: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background 0.2s;
  }

  .action-btn:hover {
    background: rgba(0, 0, 0, 0.1);
  }

  .action-btn--danger:hover {
    background: rgba(220, 38, 38, 0.1);
  }
</style>
