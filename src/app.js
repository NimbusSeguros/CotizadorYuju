// src/app.js
const express = require('express');
const cors = require('cors');

const app = express();

const ALLOWED_ORIGINS = (process.env.CORS_ORIGINS || 'http://localhost:5173')
  .split(',')
  .map(s => s.trim())
  .filter(Boolean);

const corsOptions = {
  origin(origin, callback) {
    // Permitir requests sin Origin (Postman, curl, health checks)
    if (!origin) return callback(null, true);
    if (ALLOWED_ORIGINS.includes(origin)) return callback(null, true);
    return callback(new Error(`Not allowed by CORS: ${origin}`), false);
  },
  methods: ['GET','HEAD','POST','PUT','PATCH','DELETE','OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'apikey',
    'x-client-info',
    'x-requested-with'
  ],
  credentials: true,   // si no usás cookies/credenciales podés poner false
  maxAge: 86400        // cache del preflight
};

// Middlewares 
app.use(cors(corsOptions));
// Manejar explícitamente el preflight
app.options('*', cors(corsOptions));

app.use(express.json());

// Rutas
const apiRoutes = require('./routes/api.routes');
app.use('/api', apiRoutes);

app.get('/', (req, res) => {
  res.send('¡La API Gateway está funcionando correctamente!');
});

module.exports = app;
