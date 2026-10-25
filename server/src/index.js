import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import explainRouter from './routes/explain.js';
import { getHealthInfo } from './services/gemmaService.js';
import { REQUEST_BODY_LIMIT } from './utils/constants.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const app = express();
const PORT = Number(process.env.PORT) || 3001;

app.use(cors({ origin: true }));
app.use(express.json({ limit: REQUEST_BODY_LIMIT }));

app.get('/api/health', (_req, res) => {
  const health = getHealthInfo();
  res.json({
    success: true,
    ...health,
    service: 'explain-it-sideways',
  });
});

app.use('/api/explain', explainRouter);

const clientDist = path.join(__dirname, '..', '..', 'client', 'dist');
app.use(express.static(clientDist));
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) return next();
  res.sendFile(path.join(clientDist, 'index.html'), (err) => {
    if (err) next();
  });
});

app.use((_req, res) => {
  res.status(404).json({ success: false, error: 'Not found' });
});

app.listen(PORT, () => {
  const health = getHealthInfo();
  console.log(`Explain It Sideways server on http://localhost:${PORT}`);
  console.log(`Model: ${health.model} | API key: ${health.apiKeyConfigured ? 'configured' : 'MISSING'}`);
});
