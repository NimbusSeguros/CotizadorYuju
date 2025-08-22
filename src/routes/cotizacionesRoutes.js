//BASE DE DATOS
const express = require('express');
const router = express.Router();
const svc = require('../services/cotizacionService');

// Health (verifica conexión sin tocar datos)
router.get('/health', async (req, res) => {
  try {
    const r = await svc.healthCotizacion();
    res.json(r);
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  }
});

// Crear
router.post('/create', async (req, res) => {
  try {
    const data = await svc.crearCotizacion(req.body);
    res.status(201).json(data);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

// Obtener por id
router.get('/get/:id', async (req, res) => {
  try {
    const data = await svc.obtenerCotizacion(req.params.id);
    res.json(data ?? null);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

// Actualizar (parcial)
router.patch('/update', async (req, res) => {
  try {
    const data = await svc.actualizarCotizacion(req.body);
    res.json(data ?? null);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

// Eliminar
router.delete('/delete/:id', async (req, res) => {
  try {
    const ok = await svc.eliminarCotizacion(req.params.id);
    res.json({ ok });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

module.exports = router;
