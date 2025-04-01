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
            productor: { id: datosCotizacion.productor || "98289" }, // ID de productor (asegurarse que esté bien configurado)
            
            // Información del tomador
            tomador: {
                tipoDocumento: datosCotizacion.tipoDocumento || "DNI", // Tipo de documento
                numeroDocumento: datosCotizacion.numeroDocumento || "00000000", // Número de documento
                apellido: datosCotizacion.apellido || "Apellido", // Apellido
                nombre: datosCotizacion.nombre || "Nombre", // Nombre
                email: datosCotizacion.email || "correo@example.com", // Email
                telefono: datosCotizacion.telefono || "123456789" // Teléfono
            },
        
            // Información del vehículo
            vehiculo: {
                infoauto: datosCotizacion.codInfoAuto || 120372, // Código del vehículo (Infoauto)
                anio: datosCotizacion.anio || 2011, // Año del vehículo
                marca: datosCotizacion.marca || "RENAULT", // Marca del vehículo
                modelo: datosCotizacion.modelo || "DUSTER", // Modelo del vehículo
                version: datosCotizacion.version || "1.6 4X2 TECH ROAD CON AC, 05 PUERTAS", // Versión
                uso: datosCotizacion.uso || 1, // Uso (1 = particular, etc.)
                gnc: datosCotizacion.gnc === "true" ? true : false,  // Asegurarse que este valor sea booleano
                rastreo: datosCotizacion.rastreo || 0  // Rastreo (0 o 1)
            },
        
            // Información adicional
            comision: datosCotizacion.comision || 20,  // Comisión
            bonificacion: datosCotizacion.bonificacion || 0,  // Bonificación
            periodo: datosCotizacion.periodo || 1,  // Periodo (1 = mensual, etc.)
            cuotas: datosCotizacion.cuotas || 1,  // Cuotas (número de cuotas)
            pago: {
                tipo_pago: datosCotizacion.tipo_pago || "D"  // Tipo de pago (D = débito)
            },
            ajuste_suma: datosCotizacion.ajuste_suma || 25,  // Ajuste de suma
            iva: datosCotizacion.iva || 5,  // IVA
            desglose: datosCotizacion.desglose || true,  // Desglose de la cotización
        
            // Localidad (postal code)
            localidad: {
                codigo_postal: datosCotizacion.codigo_postal || 7600 // Código postal de la localidad
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
