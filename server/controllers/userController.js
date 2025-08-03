import Job from "../models/Job.js"
import JobApplication from "../models/JobApplication.js"
import User from "../models/User.js"
import { v2 as cloudinary } from "cloudinary"
import * as Sentry from '@sentry/node'

// ✅ Optional: Attach user context to Sentry events
const attachSentryUser = (req) => {
  if (req.auth && req.auth.userId) {
    Sentry.setUser({ id: req.auth.userId })
  }
}

// ✅ Get Logged-In User Data
export const getUserData = async (req, res) => {
  try {
    attachSentryUser(req)

    const userId = req.auth.userId
    const user = await User.findById(userId)

    if (!user) {
      return res.status(404).json({ success: false, message: 'User Not Found' })
    }

    res.json({ success: true, user })
  } catch (error) {
    Sentry.captureException(error)
    res.status(500).json({ success: false, message: error.message })
  }
}

// ✅ Apply for a Job
export const applyForJob = async (req, res) => {
  try {
    attachSentryUser(req)
    const { jobId } = req.body
    
    const userId = req.auth.userId

    if (!jobId) {
      return res.status(400).json({ success: false, message: "Job ID is required" })
    }

    const alreadyApplied = await JobApplication.findOne({ jobId, userId })
    if (alreadyApplied) {
      return res.status(400).json({ success: false, message: 'Already Applied' })
    }

    const job = await Job.findById(jobId)
    if (!job) {
      return res.status(404).json({ success: false, message: 'Job Not Found' })
    }

    await JobApplication.create({
      companyId: job.companyId,
      userId,
      jobId,
      date: Date.now()
    })

    res.json({ success: true, message: 'Applied Successfully' })
  } catch (error) {
    Sentry.captureException(error)
    res.status(500).json({ success: false, message: error.message })
  }
}

// ✅ Get All Jobs Applied by the User
export const getUserJobApplications = async (req, res) => {
  try {
    attachSentryUser(req)
    const userId = req.auth.userId

    const applications = await JobApplication.find({ userId })
      .populate('companyId', 'name email image')
      .populate('jobId', 'title description location category level salary')

    res.json({ success: true, applications })
  } catch (error) {
    Sentry.captureException(error)
    res.status(500).json({ success: false, message: error.message })
  }
}

// ✅ Upload / Update Resume
export const updateUserResume = async (req, res) => {
  try {
    attachSentryUser(req)
    const userId = req.auth.userId
    const resumeFile = req.file

    if (!resumeFile) {
      return res.status(400).json({ success: false, message: 'Resume file is missing' })
    }

    const user = await User.findById(userId)
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' })
    }

    const uploaded = await cloudinary.uploader.upload(resumeFile.path)
    user.resume = uploaded.secure_url
    await user.save()

    res.json({ success: true, message: 'Resume Updated' })
  } catch (error) {
    Sentry.captureException(error)
    res.status(500).json({ success: false, message: error.message })
  }
}
