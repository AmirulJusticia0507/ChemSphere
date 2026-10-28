import { Router } from 'express'
import * as ionController from '../controllers/ionController.js'

const router = Router()

router.get('/', ionController.getIons)
router.get('/:id', ionController.getIonById)

export default router
