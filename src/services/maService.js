const { apiRequest } = require('../services/externalService');
const { getAuthToken } = require('./authService');
const config = require('../config');

async function cotizarMercantilAndina(datos) {
    try {
        const token = await getAuthToken('MERCANTIL_ANDINA');

        const headers = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
            'Ocp-Apim-Subscription-Key': config.MERCANTIL_ANDINA_API_SUBSCRIPTION_PRIMARY_KEY
        };

        const payload = {
            sucursal: "001",
            productor: { id: datos.productor || "98289" },
            tomador: {
                tipoDocumento: datos.tipoDocumento || "DNI",
                numeroDocumento: datos.numeroDocumento,
                apellido: datos.apellido,
                nombre: datos.nombre,
                email: datos.email,
                telefono: datos.telefono
            },
            vehiculo: {
                infoauto: datos.codInfoAuto,
                anio: datos.anio,
                marca: datos.marca,
                modelo: datos.modelo,
                version: datos.version,
                uso: parseInt(datos.uso) || 1,  // 👈 ¡Esto lo convertimos a número!
                gnc: datos.gnc === "S" ? true : false,
                rastreo: 0
            },
            comision: datos.comision || 20,
            bonificacion: datos.bonificacion || 0,
            periodo: datos.periodo || 1,
            cuotas: datos.cuotas || 1,
            pago: {
                tipo_pago: datos.tipo_pago || "D"
            },
            ajuste_suma: datos.ajuste_suma || 25,
            iva: datos.iva || 5,
            desglose: datos.desglose !== undefined ? datos.desglose : true,
            localidad: {
                codigo_postal: datos.codigoPostal || 7600
            }
        };

        console.log("📦 Payload MERCANTIL ANDINA:", payload);

        const response = await apiRequest('POST', config.MERCANTIL_ANDINA_API_URL, payload, headers);

        return response;
    } catch (error) {
        console.error("❌ Error obteniendo cotización de Mercantil Andina:", error.message);
        throw new Error("No se pudo obtener la cotización de Mercantil Andina");
    }
}

module.exports = { cotizarMercantilAndina };
