import './config/instrument.js'
import express from 'express'
import cors from 'cors'
import 'dotenv/config'

import connectDB from './config/db.js'
import * as Sentry from "@sentry/node";

import { clerkWebhooks } from './controllers/webhooks.js'
import companyRoutes from './routes/companyRoutes.js'

import connectCloudinary from './config/cloudinary.js'
import jobRoutes from './routes/jobRoutes.js'
import userRoutes from './routes/userRoutes.js'

import { clerkMiddleware } from '@clerk/express'



const app = express()


connectDB()

await connectCloudinary()


const allowedOrigins = [
    'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:5175',
   'https://your-frontend.vercel.app'
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));

// Middleware
app.use(express.json())
app.use(clerkMiddleware())

// Routes
app.get('/', (req, res) => res.send("API Working"))
app.get("/debug-sentry", function mainHandler(req, res) {
  throw new Error("My first Sentry error!");
});
app.post('/webhooks', clerkWebhooks)
app.use('/api/company', companyRoutes)
app.use('/api/job', jobRoutes)
app.use('/api/users', userRoutes)

// Port
const PORT = process.env.PORT || 5000

Sentry.setupExpressErrorHandler(app)

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`)
})
