import { defineStore } from 'pinia'
import { ref } from 'vue'

export interface App {
  id: string
  name: string
  description: string
  thumbnail: string
  status: 'draft' | 'published'
  owner: string
  createdAt: string
  updatedAt: string
}

export const useAppStore = defineStore('app', () => {
  const apps = ref<App[]>([])
  const currentApp = ref<App | null>(null)

  const setApps = (list: App[]) => {
    apps.value = list
  }

  const setCurrentApp = (app: App | null) => {
    currentApp.value = app
  }

  return {
    apps,
    currentApp,
    setApps,
    setCurrentApp
  }
})
