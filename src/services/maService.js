const { apiRequest } = require('../services/externalService'); 
const config = require('../config');

async function obtenerCotizacionMercantilAndina(datosCotizacion) {
    const url = `${config.MERCANTIL_ANDINA_API_URL}`;

    // 🔄 Obtener el token JWT de Mercantil Andina
    const authResponse = await apiRequest('POST', config.MERCANTIL_ANDINA_API_LOGIN_URL, {
        email: config.MERCANTIL_ANDINA_API_USERNAME,
        password: config.MERCANTIL_ANDINA_API_PASSWORD
    });

    if (!authResponse || !authResponse.token) {
        throw new Error('No se pudo autenticar en Mercantil Andina');
    }

    const token = authResponse.token;

    // 🔥 Enviar la solicitud con el token en los headers
    const response = await apiRequest('POST', url, datosCotizacion, {
        Authorization: `Bearer ${token}`,
        "Ocp-Apim-Subscription-Key": config.MERCANTIL_ANDINA_API_SUBSCRIPTION_PRIMARY_KEY,
        "Content-Type": "application/json"
    });

    return response;
}

module.exports = { obtenerCotizacionMercantilAndina };
