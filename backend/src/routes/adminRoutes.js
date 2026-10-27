import { Router } from 'express'
import { authenticateToken } from '../middlewares/auth.js'
import { requireRole } from '../middlewares/role.js'
import * as elementController from '../controllers/elementController.js'
import * as categoryController from '../controllers/categoryController.js'
import * as ionController from '../controllers/ionController.js'

const router = Router()

router.use(authenticateToken)
router.use(requireRole('admin'))

router.get('/elements', elementController.getElements)
router.post('/elements', elementController.createElement)
router.put('/elements/:id', elementController.updateElement)
router.delete('/elements/:id', elementController.deleteElement)

router.get('/categories', categoryController.getCategories)
router.post('/categories', categoryController.createCategory)
router.put('/categories/:id', categoryController.updateCategory)
router.delete('/categories/:id', categoryController.deleteCategory)

router.get('/ions', ionController.getIons)
router.post('/ions', ionController.createIon)
router.put('/ions/:id', ionController.updateIon)
router.delete('/ions/:id', ionController.deleteIon)

export default router
