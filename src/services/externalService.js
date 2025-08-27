// services/externalService.js
const axios = require('axios');

async function apiRequest(method, url, data = {}, headers = {}) {
    try {
        const response = await axios({
            method,
            url,
            data,
            headers
        });

        return response.data;
    } catch (error) {
        // Mostrar info detallada del error
        if (error.response) {
            console.error(`❌ Error en API (${url}) → ${error.response.status}:`, error.response.data);
        } else {
            console.error(`❌ Error sin respuesta en API (${url}):`, error.message);
        }

        // 🔥 IMPORTANTE: lanzar el error en vez de retornar null
        throw error;
    }
}

module.exports = { apiRequest };
