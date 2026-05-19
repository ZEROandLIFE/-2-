import request from './request'
import type { ApiResponse } from './types'

export interface MemberPermission {
  userId: string
  permissions: string[]
}

export interface FormPermission {
  _id: string
  formId: string
  publishType: 'member' | 'public' | 'both'
  memberPermissions: MemberPermission[]
  publicUrl: string
  publicEnabled: boolean
  publishedAt: string
  createdAt: string
  updatedAt: string
}

export const publishApi = {
  getPermission: (formId: string): Promise<ApiResponse<FormPermission>> => {
    return request.get(`/publish/forms/${formId}/permission`)
  },

  updatePermission: (
    formId: string,
    data: { publishType?: string; publicEnabled?: boolean }
  ): Promise<ApiResponse<FormPermission>> => {
    return request.put(`/publish/forms/${formId}/permission`, data)
  },

  publish: (formId: string): Promise<ApiResponse<{ publicUrl: string; publicEnabled: boolean }>> => {
    return request.post(`/publish/forms/${formId}/publish`)
  },

  unpublish: (formId: string): Promise<ApiResponse<{ publicEnabled: boolean }>> => {
    return request.post(`/publish/forms/${formId}/unpublish`)
  },

  addMember: (
    formId: string,
    userId: string,
    permissions: string[]
  ): Promise<ApiResponse<FormPermission>> => {
    return request.post(`/publish/forms/${formId}/permission/member`, { userId, permissions })
  },

  removeMember: (formId: string, userId: string): Promise<ApiResponse<FormPermission>> => {
    return request.delete(`/publish/forms/${formId}/permission/member/${userId}`)
  },

  getPublicForm: (publicUrl: string): Promise<ApiResponse<any>> => {
    return request.get(`/publish/public/${publicUrl}`)
  }
}
