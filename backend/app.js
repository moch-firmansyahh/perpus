import cors from 'cors';
import express from 'express';
import { errorHandler } from './middleware/errorHandler.js';
import anggotaRoutes from './routes/anggota.routes.js';
import authRoutes from './routes/auth.routes.js';
import bukuRoutes from './routes/buku.routes.js';
import healthRoutes from './routes/health.routes.js';
import peminjamanRoutes from './routes/peminjaman.routes.js';
import sirkulasiRoutes from './routes/sirkulasi.routes.js';

const app = express();

const allowedOrigins = (process.env.CORS_ORIGIN || 'http://localhost:3001')
  .split(',')
  .map((o) => o.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: allowedOrigins.includes('*') ? '*' : allowedOrigins,
    credentials: !allowedOrigins.includes('*'),
  })
);

app.use(express.json());

app.use('/health', healthRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/buku', bukuRoutes);
app.use('/api/anggota', anggotaRoutes);
app.use('/api/peminjaman', peminjamanRoutes);
app.use('/api/sirkulasi', sirkulasiRoutes);

app.use((_req, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint tidak ditemukan',
  });
});

app.use(errorHandler);

export default app;
