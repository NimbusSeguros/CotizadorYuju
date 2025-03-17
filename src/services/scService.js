const { apiRequest } = require('../services/externalService'); 
const config = require('../config');

async function obtenerTokenSanCristobal() {
    try {
        console.log("🔄 Obteniendo token JWT de San Cristóbal...");

        const authResponse = await apiRequest('POST', config.SAN_CRISTOBAL_API_LOGIN_URL, {
            username: config.SAN_CRISTOBAL_API_USERNAME,
            password: config.SAN_CRISTOBAL_API_PASSWORD
        });

        if (!authResponse || !authResponse.token) {
            throw new Error("Respuesta inválida al obtener el token de San Cristóbal");
        }

        console.log("🔐 Token JWT obtenido:", authResponse.token);
        return authResponse.token;
    } catch (error) {
        console.error("❌ Error obteniendo el token JWT de San Cristóbal:", error.response?.data || error.message);
        throw new Error("No se pudo autenticar en San Cristóbal Seguros");
    }
}

async function obtenerCotizacionSanCristobal(marca, modelo, anio, uso) {
    try {
        const token = await obtenerTokenSanCristobal(); // Obtener el token antes de la petición

        const response = await apiRequest('POST', `${config.SAN_CRISTOBAL_API_URL}/cotizacion`, { //Verificar URL correcta
            marca,
            modelo,
            anio,
            uso,
            code: config.SAN_CRISTOBAL_API_CODE // Solo se envía aquí, verificar si es el lugar correcto o si va en los headers
        }, {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
        });

        return response;
    } catch (error) {
        console.error("❌ Error al obtener la cotización de San Cristóbal:", error.response?.data || error.message);
        throw new Error("No se pudo obtener la cotización de San Cristóbal");
    }
}

module.exports = { obtenerCotizacionSanCristobal };
