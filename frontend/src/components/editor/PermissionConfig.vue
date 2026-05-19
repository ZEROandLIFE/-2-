<template>
  <ElForm :model="formData" label-width="120px">
    <ElFormItem label="发布类型">
      <ElSelect v-model="formData.publishType" placeholder="请选择发布类型" class="w-full">
        <ElOption v-for="option in publishStore.publishTypeOptions" :key="option.value" :label="option.label" :value="option.value" />
      </ElSelect>
    </ElFormItem>

    <ElFormItem label="公开发布">
      <ElCheckbox v-model="formData.publicEnabled">启用公开访问链接</ElCheckbox>
    </ElFormItem>

    <ElFormItem v-if="formData.publicEnabled && publishStore.publicLink" label="公开链接">
      <div class="flex items-center gap-2">
        <ElInput :value="publishStore.publicLink" readonly class="flex-1" />
        <ElButton @click="copyLink">复制链接</ElButton>
      </div>
    </ElFormItem>

    <div class="border-t border-gray-200 mt-6 pt-6">
      <h4 class="text-lg font-semibold mb-4">团队成员权限</h4>

      <div class="bg-gray-50 rounded-lg p-4 mb-4">
        <div class="flex flex-wrap gap-4">
          <div class="flex-1 min-w-48">
            <ElInput v-model="newMemberEmail" placeholder="输入成员邮箱" class="mb-2" />
          </div>
          <div class="flex-1 min-w-120">
            <ElCheckboxGroup v-model="newMemberPermissions">
              <ElCheckbox v-for="option in publishStore.permissionOptions" :key="option.value" :label="option.value">
                {{ option.label }}
              </ElCheckbox>
            </ElCheckboxGroup>
          </div>
          <ElButton type="primary" @click="addMember">添加成员</ElButton>
        </div>
      </div>

      <table class="w-full border-collapse">
        <thead>
          <tr>
            <th class="border border-gray-200 px-4 py-2 text-left">成员</th>
            <th class="border border-gray-200 px-4 py-2 text-left">权限</th>
            <th class="border border-gray-200 px-4 py-2 text-center">操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="member in formData.memberPermissions" :key="member.userId">
            <td class="border border-gray-200 px-4 py-2">{{ member.userId }}</td>
            <td class="border border-gray-200 px-4 py-2">{{ getPermissionLabels(member.permissions) }}</td>
            <td class="border border-gray-200 px-4 py-2 text-center">
              <ElButton type="danger" size="small" @click="removeMember(member.userId)">删除</ElButton>
            </td>
          </tr>
          <tr v-if="!formData.memberPermissions.length">
            <td colspan="3" class="border border-gray-200 px-4 py-8 text-center text-gray-400">
              暂无成员权限配置
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <ElFormItem class="mt-6">
      <ElButton type="primary" @click="savePermission">保存配置</ElButton>
    </ElFormItem>
  </ElForm>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";
import { ElForm, ElFormItem, ElSelect, ElOption, ElCheckboxGroup, ElCheckbox, ElButton, ElInput, ElMessage } from "element-plus";
import { usePublishStore } from "../../stores/publish";

const props = defineProps<{
  formId: string;
}>();

const emit = defineEmits<{
  (e: "saved"): void;
}>();

const publishStore = usePublishStore();

const formData = ref({
  publishType: "member",
  publicEnabled: false,
  memberPermissions: [] as { userId: string; permissions: string[] }[],
});

const newMemberEmail = ref("");
const newMemberPermissions = ref<string[]>(["submit", "view"]);

watch(
  () => publishStore.permission,
  (newPermission) => {
    if (newPermission) {
      formData.value = {
        publishType: newPermission.publishType,
        publicEnabled: newPermission.publicEnabled,
        memberPermissions: newPermission.memberPermissions || [],
      };
    }
  },
  { immediate: true }
);

const savePermission = async () => {
  try {
    await publishStore.savePermission(props.formId, formData.value);
    ElMessage.success("保存成功");
    emit("saved");
  } catch (error) {
    console.error("Save permission error:", error);
  }
};

const addMember = async () => {
  if (!newMemberEmail.value.trim()) {
    ElMessage.warning("请输入成员邮箱");
    return;
  }
  try {
    formData.value.memberPermissions.push({
      userId: newMemberEmail.value,
      permissions: newMemberPermissions.value,
    });
    newMemberEmail.value = "";
    newMemberPermissions.value = ["submit", "view"];
  } catch (error) {
    console.error("Add member error:", error);
  }
};

const removeMember = (userId: string) => {
  formData.value.memberPermissions = formData.value.memberPermissions.filter(
    (m) => m.userId !== userId
  );
};

const copyLink = () => {
  if (publishStore.publicLink) {
    navigator.clipboard.writeText(publishStore.publicLink);
    ElMessage.success("链接已复制");
  }
};

const getPermissionLabels = (permissions: string[]) => {
  return permissions
    .map((p) => {
      const option = publishStore.permissionOptions.find((o) => o.value === p);
      return option ? option.label : p;
    })
    .join(", ");
};
</script>

<style scoped>
.w-full {
  width: 100%;
}
</style>
