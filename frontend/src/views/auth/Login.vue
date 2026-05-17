<template>
  <div class="auth-container">
    <div class="auth-card">
      <div class="auth-card__header">
        <div class="auth-card__logo">
          <span class="auth-card__logo-icon">L</span>
        </div>
        <h1 class="auth-card__title">欢迎回来</h1>
        <p class="auth-card__subtitle">登录您的账户，开始创建精彩应用</p>
      </div>

      <el-form :model="form" :rules="rules" ref="formRef" class="auth-form">
        <div class="auth-form__group">
          <label class="auth-form__label" for="email">邮箱地址</label>
          <div class="auth-form__input-wrapper">
            <span class="auth-form__icon">@</span>
            <el-input
              id="email"
              v-model="form.email"
              placeholder="请输入邮箱"
              class="auth-form__input"
              :disabled="authStore.isLoading"
            />
          </div>
        </div>

        <div class="auth-form__group">
          <label class="auth-form__label" for="password">密码</label>
          <div class="auth-form__input-wrapper">
            <span class="auth-form__icon">*</span>
            <el-input
              id="password"
              type="password"
              v-model="form.password"
              placeholder="请输入密码"
              class="auth-form__input"
              :disabled="authStore.isLoading"
            />
          </div>
        </div>

        <div class="auth-form__options">
          <label class="auth-form__checkbox">
            <el-checkbox v-model="rememberMe" />
            <span>记住我</span>
          </label>
          <button type="button" class="auth-form__link">忘记密码?</button>
        </div>

        <button
          type="submit"
          class="auth-form__submit"
          :class="{ 'auth-form__submit--loading': authStore.isLoading }"
          @click.prevent="handleLogin"
        >
          <span v-if="!authStore.isLoading">登录</span>
          <span v-else>登录中...</span>
        </button>
      </el-form>

      <div class="auth-card__footer">
        <span>还没有账户?</span>
        <router-link to="/auth/register" class="auth-card__link"
          >立即注册</router-link
        >
      </div>
    </div>

    <div class="auth-decoration">
      <div class="auth-decoration__circle auth-decoration__circle--1"></div>
      <div class="auth-decoration__circle auth-decoration__circle--2"></div>
      <div class="auth-decoration__circle auth-decoration__circle--3"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { reactive, ref } from "vue";
  import { useRouter } from "vue-router";
  import { useAuthStore } from "@/stores/auth";
  import { ElMessage } from "element-plus";

  const router = useRouter();
  const authStore = useAuthStore();
  const formRef = ref();
  const rememberMe = ref(false);

  const form = reactive({
    email: "",
    password: "",
  });

  const rules = {
    email: [
      { required: true, message: "请输入邮箱", trigger: "blur" },
      { type: "email", message: "请输入正确的邮箱格式", trigger: "blur" },
    ],
    password: [
      { required: true, message: "请输入密码", trigger: "blur" },
      { min: 6, message: "密码长度不能少于6位", trigger: "blur" },
    ],
  };

  const handleLogin = async () => {
    if (!formRef.value) return;
    formRef.value.validate(async (valid: boolean) => {
      if (valid) {
        try {
          await authStore.login(form.email, form.password);
          ElMessage.success("登录成功");
          router.push("/dashboard");
        } catch (error: unknown) {
          const errorMessage =
            error instanceof Error ? error.message : "登录失败";
          ElMessage.error(errorMessage);
        }
      }
    });
  };
</script>

<style scoped>
  .auth-container {
    /* min-height: 100vh; */
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, #f7fbfc 0%, #d6e6f2 100%);
    position: relative;
    overflow: hidden;
    padding: 20px;
  }

  .auth-card {
    width: 100%;
    max-width: 800px;
    background: rgba(255, 255, 255, 0.9);
    border-radius: 20px;
    padding: 40px;
    box-shadow: 0 20px 60px rgba(118, 159, 205, 0.15);
    position: relative;
    z-index: 1;
    backdrop-filter: blur(10px);
  }

  .auth-card__header {
    text-align: center;
    margin-bottom: 32px;
  }

  .auth-card__logo {
    width: 64px;
    height: 64px;
    margin: 0 auto 20px;
    background: linear-gradient(135deg, #769fcd 0%, #5a85b8 100%);
    border-radius: 18px;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 6px 20px rgba(118, 159, 205, 0.3);
  }

  .auth-card__logo-icon {
    color: #ffffff;
    font-size: 28px;
    font-weight: 700;
  }

  .auth-card__title {
    font-size: 28px;
    font-weight: 700;
    color: #1e2022;
    margin: 0 0 8px;
    letter-spacing: -0.5px;
  }

  .auth-card__subtitle {
    font-size: 14px;
    color: #52616b;
    margin: 0;
  }

  .auth-form__group {
    margin-bottom: 20px;
  }

  .auth-form__label {
    display: block;
    font-size: 13px;
    font-weight: 600;
    color: #1e2022;
    margin-bottom: 6px;
  }

  .auth-form__input-wrapper {
    position: relative;
  }

  .auth-form__icon {
    position: absolute;
    left: 14px;
    top: 50%;
    transform: translateY(-50%);
    color: #52616b;
    font-size: 15px;
  }

  .auth-form__input {
    width: 100%;
    height: 48px;
    padding: 0 14px 0 46px;
    border: 2px solid rgba(118, 159, 205, 0.3);
    border-radius: 12px;
    font-size: 14px;
    color: #1e2022;
    background: transparent;
    transition: all 0.3s ease;
    outline: none;

    &:focus {
      border-color: #769fcd;
      box-shadow: 0 0 0 3px rgba(118, 159, 205, 0.1);
    }

    &::placeholder {
      color: #9ca8b3;
    }
  }

  .auth-form__options {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24px;
  }

  .auth-form__checkbox {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 13px;
    color: #52616b;
    cursor: pointer;
  }

  .auth-form__link {
    font-size: 13px;
    color: #769fcd;
    font-weight: 500;
    background: none;
    border: none;
    cursor: pointer;
    padding: 0;

    &:hover {
      text-decoration: underline;
    }
  }

  .auth-form__submit {
    width: 100%;
    height: 48px;
    background: linear-gradient(135deg, #769fcd 0%, #5a85b8 100%);
    border: none;
    border-radius: 12px;
    color: #ffffff;
    font-size: 15px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    box-shadow: 0 4px 12px rgba(118, 159, 205, 0.3);

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 18px rgba(118, 159, 205, 0.4);
    }

    &:active {
      transform: translateY(0);
    }

    &--loading {
      opacity: 0.7;
      cursor: not-allowed;
    }
  }

  .auth-card__footer {
    text-align: center;
    font-size: 14px;
    color: #52616b;
    margin-top: 28px;
  }

  .auth-card__link {
    color: #769fcd;
    font-weight: 600;
    text-decoration: none;
    margin-left: 4px;

    &:hover {
      text-decoration: underline;
    }
  }

  .auth-decoration {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    overflow: hidden;
    pointer-events: none;
  }

  .auth-decoration__circle {
    position: absolute;
    border-radius: 50%;
    opacity: 0.25;

    &--1 {
      width: 350px;
      height: 350px;
      background: #b9d7ea;
      top: -80px;
      right: -80px;
      animation: float1 8s ease-in-out infinite;
    }

    &--2 {
      width: 260px;
      height: 260px;
      background: #769fcd;
      bottom: -40px;
      left: -40px;
      animation: float2 6s ease-in-out infinite;
    }

    &--3 {
      width: 180px;
      height: 180px;
      background: #d6e6f2;
      top: 50%;
      right: 25%;
      animation: float3 7s ease-in-out infinite;
    }
  }

  @keyframes float1 {
    0%,
    100% {
      transform: translate(0, 0);
    }
    50% {
      transform: translate(-15px, 15px);
    }
  }

  @keyframes float2 {
    0%,
    100% {
      transform: translate(0, 0);
    }
    50% {
      transform: translate(15px, -15px);
    }
  }

  @keyframes float3 {
    0%,
    100% {
      transform: translate(0, 0) scale(1);
    }
    50% {
      transform: translate(-12px, 12px) scale(1.08);
    }
  }
</style>
