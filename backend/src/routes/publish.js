import express from 'express'
import {
  getFormPermission,
  updateFormPermission,
  publishForm,
  unpublishForm,
  getPublicForm,
  addMemberPermission,
  removeMemberPermission
} from '../controllers/publishController.js'
import { authenticateToken } from '../middleware/auth.js'

const router = express.Router()

router.get('/forms/:formId/permission', authenticateToken, getFormPermission)
router.put('/forms/:formId/permission', authenticateToken, updateFormPermission)
router.post('/forms/:formId/publish', authenticateToken, publishForm)
router.post('/forms/:formId/unpublish', authenticateToken, unpublishForm)
router.post('/forms/:formId/permission/member', authenticateToken, addMemberPermission)
router.delete('/forms/:formId/permission/member/:userId', authenticateToken, removeMemberPermission)

router.get('/public/:publicUrl', getPublicForm)

export default router
