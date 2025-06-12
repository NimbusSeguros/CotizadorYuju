const { apiRequest } = require('../services/externalService');
const { getAuthToken } = require('../services/authService');
const config = require('../config');

/**
 * Convierte una fecha en formato "DD-MM-YYYY" a objeto Date y calcula vigencia hasta +1 año.
 */
function calcularVigencias(fechaStr) {
    if (!fechaStr || !/^\d{2}-\d{2}-\d{4}$/.test(fechaStr)) {
        throw new Error("❌ Fecha de vigencia inválida o no provista (formato esperado: DD-MM-YYYY)");
    }

    const [dia, mes, anio] = fechaStr.split('-');
    const desde = new Date(`${anio}-${mes}-${dia}`);
    if (isNaN(desde.getTime())) {
        throw new Error("❌ No se pudo interpretar la fecha de vigencia");
    }

    const hasta = new Date(desde);
    hasta.setFullYear(hasta.getFullYear() + 1);

    // Convertimos a formato YYYY-MM-DD
    const format = (fecha) => fecha.toISOString().split('T')[0];

    return {
        desde: format(desde),
        hasta: format(hasta)
    };
}

async function cotizarRUS(datos) {
    try {
        const token = await getAuthToken('RUS');
        console.log("🔐 Token recibido:", token);

        const url = `${config.RUS_API_URL_TEST}/api-rus/cotizaciones/autos`;

        const { desde, hasta } = calcularVigencias(datos.fechaVigencia);

        const payload = {
            codigoProductor: 9254,
            codigoSolicitante: 9254,
            codigoTipoInteres: "VEHICULO",
            cuotas: datos.cuotas || 1,
            numeroSolicitud: 2,
            condicionFiscal: "CF",
            tipoVigencia: "ANUAL",
            vigenciaDesde: desde,
            vigenciaHasta: hasta,
            vigenciaPolizaId: 71,
            vehiculos: [
                {
                    anio: datos.anio.toString(),
                    controlSatelital: "NO",
                    cpLocalidadGuarda: datos.codigoPostal || 5000,
                    gnc: datos.gnc === "S" ? "SI" : "NO",
                    codia: datos.codInfoAuto,
                    rastreoACargoRUS: "NO",
                    uso: datos.uso === "1" ? "PARTICULAR" : "COMERCIAL"
                }
            ]
        };

        const headers = {
            "Content-Type": "application/json",
            "Accept": "application/json",
            "Authorization": token
        };

        console.log("📦 Payload RUS:", JSON.stringify(payload, null, 2));

        const response = await apiRequest('PUT', url, payload, headers);
        console.log("✅ Respuesta de RUS:", response);

        return response;
    } catch (error) {
        console.error("❌ Error en cotización con RUS:", error.response?.data || error.message);
        throw new Error("Error al obtener la cotización con RUS");
    }
}

module.exports = { cotizarRUS };
