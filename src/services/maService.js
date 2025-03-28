const { apiRequest } = require('../services/externalService');
const { getAuthToken } = require('./authService'); 
const config = require('../config');

async function cotizarMercantilAndina(datosCotizacion) {
    try {
        const token = await getAuthToken('MERCANTIL_ANDINA'); // ✅ Obtener el token desde authService.js

        // Configurar los headers necesarios
        const headers = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
            'Ocp-Apim-Subscription-Key': config.MERCANTIL_ANDINA_API_SUBSCRIPTION_PRIMARY_KEY
        };

        // Configurar el payload para la solicitud
        const payload = {
            // Información del productor
            sucursal: datosCotizacion.sucursal || "001",
            productor: { id: datosCotizacion.productor || "98289" }, // Asegúrate de que el ID esté bien configurado
        
            // Información del tomador
            tomador: {
                tipoDocumento: datosCotizacion.tipoDocumento || "DNI",
                numeroDocumento: datosCotizacion.numeroDocumento || "00000000",
                apellido: datosCotizacion.apellido || "Apellido",
                nombre: datosCotizacion.nombre || "Nombre",
                email: datosCotizacion.email || "correo@example.com",
                telefono: datosCotizacion.telefono || "123456789"
            },
        
            // Información del vehículo
            vehiculo: {
                infoauto: datosCotizacion.infoauto || 120372, // Asegúrate de tener el código correcto
                anio: datosCotizacion.anio || 2011,
                marca: datosCotizacion.marca || "Toyota",
                modelo: datosCotizacion.modelo || "Corolla",
                version: datosCotizacion.version || "XEI",
                uso: datosCotizacion.uso || "particular",
                gnc: datosCotizacion.gnc === "true" ? true : false,  // Asegúrate que esto sea un booleano
                rastreo: datosCotizacion.rastreo || 0
            },
        
            // Información adicional
            comision: datosCotizacion.comision || 20,
            bonificacion: datosCotizacion.bonificacion || 0,
            periodo: datosCotizacion.periodo || 1,
            cuotas: datosCotizacion.cuotas || 1,
            pago: {
                tipo_pago: datosCotizacion.tipo_pago || "D"  // Pago con débito (D)
            },
            ajuste_suma: datosCotizacion.ajuste_suma || 25,
            iva: datosCotizacion.iva || 5,
            desglose: datosCotizacion.desglose || true,
        
            // Localidad (postal code)
            localidad: {
                codigo_postal: datosCotizacion.codigo_postal || 7600
            }
        };        

        console.log("\u{1F4E6} Payload Mercantil Andina:", payload);

        // Realizar la solicitud a la API de Mercantil Andina
        const response = await apiRequest('POST', config.MERCANTIL_ANDINA_API_URL, payload, headers);

        return response;
    } catch (error) {
        console.error("❌ Error obteniendo cotización de Mercantil Andina:", error.message);
        throw new Error("No se pudo obtener la cotización de Mercantil Andina");
    }
}

module.exports = { cotizarMercantilAndina };
