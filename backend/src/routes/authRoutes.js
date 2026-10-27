import { Router } from 'express'
import { authenticateToken } from '../middlewares/auth.js'
import { validateAuth } from '../middlewares/validate.js'
import * as authController from '../controllers/authController.js'

const router = Router()

router.post('/register', validateAuth('register'), authController.register)
router.post('/login', validateAuth('login'), authController.login)
router.get('/me', authenticateToken, authController.me)

export default router
