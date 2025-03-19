const { apiRequest } = require('../services/externalService');
const { getAuthToken } = require('./authService');
const config = require('../config');

async function obtenerCotizacionSanCristobal(datosCotizacion) {
    try {
        const token = await getAuthToken('SAN_CRISTOBAL'); // Obtener el token desde authService.js

        const response = await apiRequest('POST', config.SAN_CRISTOBAL_API_URL, {
            code: config.SAN_CRISTOBAL_API_CODE, // ✅ Código solo para la cotización
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
