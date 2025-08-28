// src/app.js
const express = require('express');

const app = express();

// Middleware
app.use(express.json());

// Rutas
const apiRoutes = require('./routes/api.routes');
app.use('/api', apiRoutes);

app.get('/', (req, res) => {
  res.send('¡La API Gateway está funcionando correctamente!');
});

module.exports = app;
