const axios = require('axios');
const config = require('../config');

// Función para obtener datos de API externa
async function fetchDataFromAPI(apiUrl) {
    try {
        const response = await axios.get(apiUrl);
        return response.data;
    } catch (error) {
        console.error(`Error al consumir ${apiUrl}:`, error.message);
        throw new Error(`Error obteniendo datos de ${apiUrl}`);
    }
}


module.exports = { fetchDataFromAPI };
