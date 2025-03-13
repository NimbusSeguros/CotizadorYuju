const express = require('express');
const router = express.Router();
const { fetchDataFromAPI } = require('../services/externalService');
const { fetchDataWithJWT } = require('../services/externalJWTService');
const { obtenerCotizacionRUS } = require('../services/rusService');
const { obtenerCotizacionMercantilAndina } = require('../services/maService');
const config = require('../config');

router.post('/cotizacion/auto', async (req, res) => {
    try {
        const { marca, modelo, anio, tipo } = req.body;
        const cotizacionRUS = await obtenerCotizacionRUS(marca, modelo, anio, tipo);
        res.json({ rus: cotizacionRUS });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.post('/mercantil-andina/cotizacion-auto', async (req, res) => {
    const datosCotizacion = req.body; // Recibe el JSON completo desde la petición

    try {
        const cotizacion = await obtenerCotizacionMercantilAndina(datosCotizacion);
        res.json(cotizacion);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

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

// Así se tomarían los parámetros sueltos del front y se armaría la request para Mercantil Andina
router.post('/cotizacion-auto/unificada', async (req, res) => {
    const {
        sucursal, productor, tipoDocumento, numeroDocumento, apellido, nombre, email, telefono,
        anio, marca, modelo, version, uso
    } = req.body;

    try {
        // 🔄 Construcción del objeto para Mercantil Andina
        const datosCotizacion = {
            sucursal: sucursal || "001", // Valor por defecto si no se recibe
            productor: productor || "0000", // Valor por defecto si no se recibe
            tomador: {
                tipoDocumento: tipoDocumento || "DNI",
                numeroDocumento: numeroDocumento || "00000000",
                apellido: apellido || "Apellido",
                nombre: nombre || "Nombre",
                email: email || "correo@example.com",
                telefono: telefono || "123456789"
            },
            vehiculo: {
                anio: anio || 2023,
                marca: marca || "Toyota",
                modelo: modelo || "Corolla",
                version: version || "XEI",
                uso: uso || "particular"
            }
        };

        // 🔥 Enviar solicitud a Mercantil Andina
        const cotizacion = await obtenerCotizacionMercantilAndina(datosCotizacion);
        res.json(cotizacion);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
