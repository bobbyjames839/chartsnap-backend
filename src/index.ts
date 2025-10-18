import express from 'express';
import cors = require('cors');
import dotenv from 'dotenv';
import './config/firebase'; 

import googleAuthRoutes from './routes/auth/googleAuth';
import appleAuthRoutes from './routes/auth/appleAuth';
import chartAnalysisRoutes from './routes/analysis/chartAnalysis';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:8081',
  credentials: true,
}));
app.use(express.json());



app.use('/api/auth', googleAuthRoutes);
app.use('/api/auth', appleAuthRoutes);
app.use('/api/analysis', chartAnalysisRoutes);

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

export default app;
