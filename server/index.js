import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { initializeDatabase } from './db.js';
import standsRouter from './routes/stands.js';
import postersRouter from './routes/posters.js';
import publicationsRouter from './routes/publications.js';
import settingsRouter from './routes/settings.js';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Initialize database
initializeDatabase();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/stands', standsRouter);
app.use('/api/posters', postersRouter);
app.use('/api/publications', publicationsRouter);
app.use('/api/settings', settingsRouter);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});