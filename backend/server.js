import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import mongoose from 'mongoose';
import weddingRoutes from './routes/weddingRoutes.js';
import authRoutes from './routes/authRoutes.js';

dotenv.config();

const app = express();

// Connect to MongoDB
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/wedding-planner';
mongoose.connect(MONGO_URI)
  .then(() => console.log('✅ Connected to Local MongoDB!'))
  .catch((err) => console.error('❌ MongoDB Connection Error:', err));

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/wedding', weddingRoutes);

app.get('/', (req, res) => {
  res.json({
    status: 'running',
    service: 'Smart Wedding Planner - Multi-Agent API',
    agents: [
      'Supervisor (Gemini)',
      'Cultural Consultant (Groq/Llama)',
      'Treasurer (Gemini)',
      'Logistics Scout (Cohere)',
      'Vendor Orchestrator (Groq/Llama)',
      'Catering Director (Groq/Llama)',
    ],
  });
});

const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
  console.log(`\n🎊 Smart Wedding Planner API running on port ${PORT}`);
  console.log(`   Agents: Gemini + Groq + Cohere\n`);
});
