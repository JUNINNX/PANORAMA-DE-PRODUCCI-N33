import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import authRouter from './routes/auth.js';

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT || 3001);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const frontendPath = path.join(__dirname, 'frontend');

// API: permite peticiones del frontend cuando se publique por separado.
const corsOrigin = process.env.CORS_ORIGIN || true;
app.use(cors({
  origin: corsOrigin,
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json({ limit: '50kb' }));

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, service: 'panorama-produccion' });
});

app.use('/api/auth', authRouter);

// En local, el mismo backend sirve login.html y panorama.html.
// Esto evita poner http://localhost:3001 dentro del HTML.
app.use(express.static(frontendPath));

app.get('/', (_req, res) => {
  res.sendFile(path.join(frontendPath, 'index.html'));
});

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ message: 'Error interno del servidor.' });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Servidor ejecutándose en puerto ${PORT}`);
});
