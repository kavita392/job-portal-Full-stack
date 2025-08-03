import express from 'express'
import multer from 'multer'
import {
  getUserData,
  applyForJob,
  getUserJobApplications,
  updateUserResume
} from '../controllers/userController.js'

const router = express.Router()
const upload = multer({ dest: 'uploads/' })

router.get('/me', getUserData)
router.post('/apply', applyForJob)


router.get('/applications', getUserJobApplications);


router.post('/resume', upload.single('resume'), updateUserResume);

export default router;








