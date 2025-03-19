const { apiRequest } = require('../services/externalService');
const { getAuthToken } = require('./authService'); 
const config = require('../config');

async function obtenerCotizacionMercantilAndina(datosCotizacion) {
    try {
        const token = await getAuthToken('MERCANTIL_ANDINA'); // ✅ Obtener el token desde authService.js

        const response = await apiRequest('POST', config.MERCANTIL_ANDINA_API_URL, datosCotizacion, {
            Authorization: `Bearer ${token}`,
            "Ocp-Apim-Subscription-Key": config.MERCANTIL_ANDINA_API_SUBSCRIPTION_PRIMARY_KEY,
            "Content-Type": "application/json"
        });

        return response;
    } catch (error) {
        console.error("Error al obtener la cotización de Mercantil Andina:", error.response?.data || error.message);
        throw new Error("No se pudo obtener la cotización de Mercantil Andina");
    }
}

module.exports = { obtenerCotizacionMercantilAndina };
