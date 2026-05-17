import { createRouter, createWebHistory } from "vue-router";
import type { RouteRecordRaw } from "vue-router";

const routes: RouteRecordRaw[] = [
  {
    path: "/",
    redirect: "/dashboard",
  },
  {
    path: "/login",
    redirect: "/auth/login",
  },
  {
    path: "/register",
    redirect: "/auth/register",
  },
  {
    path: "/auth",
    name: "Auth",
    meta: { requiresAuth: false },
    component: () => import("@/views/auth/AuthLayout.vue"),
    children: [
      {
        path: "login",
        name: "Login",
        meta: { requiresAuth: false },
        component: () => import("@/views/auth/Login.vue"),
      },
      {
        path: "register",
        name: "Register",
        meta: { requiresAuth: false },
        component: () => import("@/views/auth/Register.vue"),
      },
    ],
  },
  {
    path: "/dashboard",
    name: "Dashboard",
    meta: { requiresAuth: true },
    component: () => import("@/views/dashboard/index.vue"),
  },
  {
    path: "/editor",
    name: "Editor",
    meta: { requiresAuth: true },
    component: () => import("@/views/editor/index.vue"),
  },
  {
    path: "/app/form-fill",
    name: "FormFill",
    meta: { requiresAuth: true },
    component: () => import("@/views/app/FormFill.vue"),
  },
  {
    path: "/app/data-management",
    name: "DataManagement",
    meta: { requiresAuth: true },
    redirect: (to) => {
      return { path: "/editor", query: { ...to.query, activeTab: "data" } };
    },
  },
  {
    path: "/widget-market",
    name: "WidgetMarket",
    meta: { requiresAuth: true },
    component: () => import("@/views/editor/WidgetMarket.vue"),
  },
  {
    path: "/settings",
    name: "Settings",
    meta: { requiresAuth: true },
    component: () => import("@/views/settings/index.vue"),
  },
  {
    path: "/:pathMatch(.*)*",
    redirect: "/auth/login",
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to) => {
  const token = localStorage.getItem("accessToken");
  const requiresAuth = to.meta.requiresAuth;
  const isAuthenticated = !!token;

  if (requiresAuth && !isAuthenticated) {
    return "/auth/login";
  } else if (!requiresAuth && isAuthenticated && to.path !== "/auth/logout") {
    return "/dashboard";
  }
  return true;
});

export default router;
