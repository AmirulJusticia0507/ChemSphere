import { Router } from 'express'
import { authenticateToken } from '../middlewares/auth.js'
import { requireActiveUser } from '../middlewares/role.js'
import * as bookmarkController from '../controllers/bookmarkController.js'
import * as quizController from '../controllers/quizController.js'

const router = Router()

router.use(authenticateToken)
router.use(requireActiveUser)

// Simpanan unsur
router.get('/bookmarks', bookmarkController.listBookmarks)
router.post('/bookmarks', bookmarkController.addBookmark)
router.delete('/bookmarks/:elementId', bookmarkController.removeBookmark)

// Progres belajar
router.get('/progress', bookmarkController.getProgress)

// Kuis
router.post('/quiz/start', quizController.startQuiz)
router.post('/quiz/submit', quizController.submitQuiz)
router.get('/quiz/attempts', quizController.listAttempts)

export default router
