<template>
  <el-form :model="form" :rules="rules" ref="formRef" label-width="80px">
    <el-form-item label="邮箱" prop="email">
      <el-input 
        v-model="form.email" 
        placeholder="请输入邮箱"
        :disabled="isLoading"
      />
    </el-form-item>
    <el-form-item label="密码" prop="password">
      <el-input 
        type="password" 
        v-model="form.password" 
        placeholder="请输入密码"
        :disabled="isLoading"
      />
    </el-form-item>
    <el-form-item>
      <el-button 
        type="primary" 
        @click="handleSubmit" 
        :loading="isLoading" 
        style="width: 100%"
      >
        {{ isLoading ? '登录中...' : '登录' }}
      </el-button>
    </el-form-item>
  </el-form>
</template>

<script setup lang="ts">
import { reactive, ref, watch } from 'vue'
import type { FormRules } from 'element-plus'

const props = defineProps<{
  modelValue?: { email: string; password: string }
  isLoading?: boolean
}>()

const emit = defineEmits<{
  (e: 'submit', data: { email: string; password: string }): void
}>()

const formRef = ref()

const form = reactive({
  email: '',
  password: ''
})

const rules: FormRules = {
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能少于6位', trigger: 'blur' }
  ]
}

watch(() => props.modelValue, (val) => {
  if (val) {
    form.email = val.email
    form.password = val.password
  }
}, { immediate: true, deep: true })

const handleSubmit = async () => {
  if (!formRef.value) return
  formRef.value.validate(async (valid: boolean) => {
    if (valid) {
      emit('submit', { ...form })
    }
  })
}
</script>
