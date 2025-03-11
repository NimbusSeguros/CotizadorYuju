const express = require('express');
const cors = require('cors');

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Rutas
const apiRoutes = require('./routes/api.routes');
app.use('/api', apiRoutes);

app.get('/', (req, res) => {
    res.send('¡La API Gateway está funcionando correctamente!');
});

module.exports = app;
