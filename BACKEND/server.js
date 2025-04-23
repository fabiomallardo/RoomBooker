import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import passport from 'passport';
import 'dotenv/config';
import globalRouter from './router.js';

// --- INIZIALIZZAZIONE SERVER
const server = express();

// --- MIDDLEWARE
server.use(cors());
server.use(express.json());
server.use(passport.initialize());

// --- ROUTING
server.use(globalRouter);

// --- CONNESSIONE AL DB
mongoose.connect(process.env.MONGO_URL)
  .then(() => {
    console.log("✅ Database connesso");

    const PORT = process.env.PORT || 4000;
    server.listen(PORT, () => {
      console.log(`🚀 Server avviato su http://localhost:${PORT}`);
    });
  })
  .catch(error => {
    console.error("❌ Errore connessione DB:", error);
    process.exit(1);
  });
