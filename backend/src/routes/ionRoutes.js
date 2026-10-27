import { Router } from 'express'
import * as ionController from '../controllers/ionController.js'

const router = Router()

router.get('/', ionController.getIons)

export default router
