import { Router } from 'express'
import { authenticateToken } from '../middlewares/auth.js'
import { authLimiter, refreshLimiter } from '../middlewares/rateLimiters.js'
import { validateAuth } from '../middlewares/validate.js'
import * as authController from '../controllers/authController.js'

const router = Router()

router.post('/register', authLimiter, validateAuth('register'), authController.register)
router.post('/login', authLimiter, validateAuth('login'), authController.login)
router.post('/refresh', refreshLimiter, authController.refresh)
router.post('/logout', authController.logout)
router.get('/me', authenticateToken, authController.me)

export default router
