const { apiRequest } = require('../services/externalService'); 
const config = require('../config');

async function obtenerTokenSanCristobal() {
    try {
        const authResponse = await apiRequest('POST', config.SAN_CRISTOBAL_API_LOGIN_URL, {
            username: config.SAN_CRISTOBAL_API_USERNAME,
            password: config.SAN_CRISTOBAL_API_PASSWORD
        });

        if (!authResponse || !authResponse.token) {
            throw new Error("Respuesta inválida al obtener el token de San Cristóbal");
        }

        return authResponse.token;
    } catch (error) {
        console.error("Error obteniendo el token JWT de San Cristóbal:", error.response?.data || error.message);
        throw new Error("No se pudo autenticar en San Cristóbal Seguros");
    }
}

async function obtenerCotizacionSanCristobal(datosCotizacion) {
    try {
        const token = await obtenerTokenSanCristobal();

        const response = await apiRequest('POST', `${config.SAN_CRISTOBAL_API_URL}/api/Quoted/QuoteCA7`, {
            code: config.SAN_CRISTOBAL_API_CODE,
            marca: datosCotizacion.marca,
            modelo: datosCotizacion.modelo,
            anio: datosCotizacion.anio,
            uso: datosCotizacion.uso,
            sumaAsegurada: datosCotizacion.sumaAsegurada,
            tipoCobertura: datosCotizacion.tipoCobertura,
            datosTomador: {
                tipoDocumento: datosCotizacion.tipoDocumento,
                numeroDocumento: datosCotizacion.numeroDocumento,
                nombre: datosCotizacion.nombre,
                apellido: datosCotizacion.apellido,
                email: datosCotizacion.email,
                telefono: datosCotizacion.telefono
            }
        }, {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
        });

        return response;
    } catch (error) {
        console.error("Error al obtener la cotización de San Cristóbal:", error.response?.data || error.message);
        throw new Error("No se pudo obtener la cotización de San Cristóbal");
    }
}

module.exports = { obtenerCotizacionSanCristobal };
