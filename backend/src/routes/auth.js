import express from 'express'
import { register, login, refreshToken, getMe, logout } from '../controllers/authController.js'
import { authenticateToken } from '../middleware/auth.js'

const router = express.Router()

router.post('/register', register)
router.post('/login', login)
router.post('/refresh', refreshToken)
router.get('/me', authenticateToken, getMe)
router.post('/logout', authenticateToken, logout)

export default router
