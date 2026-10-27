import { Router } from 'express'
import { authenticateToken } from '../middlewares/auth.js'
import { requireActiveUser } from '../middlewares/role.js'
import * as userController from '../controllers/userController.js'

const router = Router()

router.use(authenticateToken)
router.use(requireActiveUser)

// Profil pengguna yang sedang masuk.
router.put('/me', userController.updateOwnProfile)

export default router
