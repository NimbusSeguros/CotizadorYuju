const express = require('express');
const router = express.Router();
const { fetchDataFromAPI } = require('../services/externalService');
const { fetchDataWithJWT } = require('../services/externalJWTService');
const config = require('../config');

router.get('/datos', async (req, res) => {
    try {
        const data1 = await fetchDataFromAPI(config.EXTERNAL_API_1);
        const data2 = await fetchDataFromAPI(config.EXTERNAL_API_2);

        // 🔹 Formateo de datos para estandarizarlos
        const formattedData = {
            source1: data1,
            source2: data2,
        };

        res.json(formattedData);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.get('/', (req, res) => {
    res.send('¡La API Gateway está funcionando correctamente!');
});

router.get('/jwt-data', async (req, res) => {
    try {
        const data = await fetchDataWithJWT();
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
