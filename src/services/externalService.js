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
        console.error(`❌ Error en API (${url}):`, error.response?.data || error.message);
        return null;
    }
}

module.exports = { apiRequest };
