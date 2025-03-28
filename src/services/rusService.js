const { apiRequest } = require('../services/externalService');
const { getAuthToken } = require('../services/authService');
const config = require('../config');

async function cotizarRUS() {
    try {
        const token = await getAuthToken('RUS');
        console.log("🔐 Token recibido:", token);

        const url = `${config.RUS_API_URL_TEST}/api-rus/cotizaciones/autos`;

        const payload = {
            codigoProductor: 9254,
            codigoSolicitante: 4998,
            codigoTipoInteres: "VEHICULO",
            cuotas: 1,
            numeroSolicitud: 2,
            condicionFiscal: "CF",
            tipoVigencia: "ANUAL",
            vigenciaDesde: "2025-03-28",
            vigenciaHasta: "2026-03-27",
            vigenciaPolizaId: 71,
            vehiculos: [
                {
                    anio: "2022",
                    controlSatelital: "NO",
                    cpLocalidadGuarda: 5000,
                    gnc: "NO",
                    codia: 170838,
                    rastreoACargoRUS: "NO",
                    uso: "PARTICULAR"
                }
            ]
        };

        const headers = {
            "Content-Type": "application/json",
            "Accept": "application/json",
            "Authorization": `${token}`
        };

        console.log("📦 Payload:", JSON.stringify(payload, null, 2));
        console.log("📨 Headers:", headers);

        const response = await apiRequest('PUT', url, payload, headers);
        console.log("✅ Respuesta de RUS:", response);

        return response;
    } catch (error) {
        console.error("❌ Error en cotización con RUS:", error.response?.data || error.message);
        throw new Error("Error al obtener la cotización con RUS");
    }
}


module.exports = { cotizarRUS };
