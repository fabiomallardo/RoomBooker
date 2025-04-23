import express from 'express'
import mongoose from 'mongoose'
import cors from 'cors'
import passport from 'passport'
import 'dotenv/config'
import globalRouter from './router.js'

import path from 'path'
import { fileURLToPath } from 'url'

// === Inizializzazioni
const server = express()
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// === Middleware
server.use(cors())
server.use(express.json())
server.use(passport.initialize())

// ✅ Servire gli upload
server.use('/uploads', express.static(path.join(__dirname, 'uploads')))

// === Routing
server.use(globalRouter)

// === Connessione al DB
mongoose.connect(process.env.MONGO_URL)
  .then(() => {
    console.log("✅ Database connesso")
    const PORT = process.env.PORT || 4000
    server.listen(PORT, () => {
      console.log(`🚀 Server avviato su http://localhost:${PORT}`)
    })
  })
  .catch(error => {
    console.error("❌ Errore connessione DB:", error)
    process.exit(1)
  })
