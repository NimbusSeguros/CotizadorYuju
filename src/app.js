// src/app.js
const express = require('express');
const cors = require('cors');

const app = express();

app.use(express.json());

/**
 * Activa CORS en Express SOLO si estás en local.
 * - LOCAL_CORS=true  => habilita CORS en Express (dev)
 * - LOCAL_CORS=false => NO habilita CORS en Express (prod con Nginx manejando CORS)
 *
 * Tip: en el server (producción) dejalo en false o directamente no definas la var.
 */
const ENABLE_LOCAL_CORS = String(process.env.LOCAL_CORS).toLowerCase() === 'true';

if (ENABLE_LOCAL_CORS) {
  const ALLOWED_ORIGINS = (process.env.CORS_ORIGINS || 'http://localhost:5173,http://localhost:3000')
    .split(',')
    .map(s => s.trim())
    .filter(Boolean);

  const corsOptions = {
    origin(origin, cb) {
      if (!origin) return cb(null, true); // Postman/curl
      if (ALLOWED_ORIGINS.includes(origin)) return cb(null, true);
      return cb(new Error(`Not allowed by CORS: ${origin}`), false);
    },
    methods: ['GET','HEAD','POST','PUT','PATCH','DELETE','OPTIONS'],
    allowedHeaders: ['Content-Type','Authorization','apikey','x-client-info','x-requested-with'],
    credentials: true,
    maxAge: 86400,
  };

  app.use(cors(corsOptions));
  app.options('*', cors(corsOptions));
  console.log('🔓 CORS habilitado en Express (modo local). Orígenes permitidos:', ALLOWED_ORIGINS);
} else {
  console.log('🔒 CORS manejado por Nginx (Express sin CORS).');
}

// Rutas
const apiRoutes = require('./routes/api.routes');
app.use('/api', apiRoutes);

app.get('/', (_req, res) => res.send('¡La API Gateway está funcionando correctamente!'));

module.exports = app;
