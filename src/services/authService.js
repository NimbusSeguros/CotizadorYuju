const axios = require('axios');
const config = require('../config');

let cachedToken = null;

async function getAuthToken() {
    if (cachedToken) {
        return cachedToken;
    }

    try {
        const response = await axios.post(config.JWT_API_LOGIN, {
            email: config.JWT_USER, // Reqres usa "email" en vez de "username"
            password: config.JWT_PASS,
        });

        cachedToken = response.data.token;
        console.log("🔐 Token JWT obtenido:", cachedToken);
        return cachedToken;
    } catch (error) {
        console.error("❌ Error obteniendo el token JWT:", error.response?.data || error.message);
        throw new Error("No se pudo autenticar en la API externa");
    }
}

module.exports = { getAuthToken };
