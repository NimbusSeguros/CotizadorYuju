const axios = require('axios');
const config = require('../config');
const { getAuthToken } = require('./authService');

async function fetchDataWithJWT() {
    try {
        const token = await getAuthToken(); // Obtenemos el token
        const response = await axios.get(config.JWT_API_DATA, {
            headers: { Authorization: `Bearer ${token}` }, // Enviamos el token en la cabecera
        });

        return response.data;
    } catch (error) {
        console.error("Error al consumir la API con JWT:", error.message);
        throw new Error("No se pudo obtener datos de la API protegida");
    }
}

module.exports = { fetchDataWithJWT };
