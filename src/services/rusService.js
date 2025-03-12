const { apiRequest } = require('../services/externalService'); 
const config = require('../config');

async function obtenerCotizacionRUS(marca, modelo, anio, tipo) {
    const url = `${config.RUS_API_URL}/cotizacion/auto`;

    const authResponse = await apiRequest('POST', `${config.RUS_API_URL}/auth/login`, {
        username: config.RUS_API_USERNAME,
        password: config.RUS_API_PASSWORD
    });

    if (!authResponse || !authResponse.token) {
        throw new Error('No se pudo autenticar en RUS Seguros');
    }

    const token = authResponse.token;

    const response = await apiRequest('POST', url, {
        tipo,
        marca,
        modelo,
        anio
    }, {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json"
    });

    return response;
}

module.exports = { obtenerCotizacionRUS };
