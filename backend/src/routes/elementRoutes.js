import { Router } from 'express'
import * as elementController from '../controllers/elementController.js'

const router = Router()

router.get('/', elementController.getElements)
router.get('/:id', elementController.getElementById)

export default router
