const dayjs = require('dayjs');
const customParseFormat = require('dayjs/plugin/customParseFormat');
dayjs.extend(customParseFormat);

const { apiRequest } = require('../services/externalService');
const { getAuthToken } = require('../services/authService');
const config = require('../config');

function formatearFechaVigencia(fecha) {
    const formatosAceptados = ['DD/MM/YYYY', 'DD-MM-YYYY', 'YYYY-MM-DD', 'MM/DD/YYYY'];
    const fechaParseada = dayjs(fecha, formatosAceptados, true);

    if (!fechaParseada.isValid()) {
        console.warn("⚠️ Fecha inválida o ausente. Se usará fecha de mañana.");
        return dayjs().add(1, 'day').format('DD/MM/YYYY');
    }

    return fechaParseada.format('DD/MM/YYYY');
}

async function cotizarExperta(datos) {
    try {
        const token = await getAuthToken('EXPERTA');

        const headers = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
            'api-key': config.EXPERTA_API_KEY
        };

        const url = `${config.EXPERTA_API_URL}/cotizaciones`;

        const payload = {
            codigoPostal: datos.codigoPostal || "5000",
            codInfoAuto: datos.codInfoAuto,
            marca: "AUTO",
            ceroKM: datos.ceroKM || "N",
            modelo: "AUTO",
            anio: datos.anio,
            fechaVigencia: formatearFechaVigencia(datos.fechaVigencia),
            gnc: datos.gnc || "N",
            uso: datos.uso || "1",
            iva: datos.iva || "5",
            modalidad: datos.modalidad || "EX0",
            version: "AUTO",
            productor: datos.productor || "972"
        };

        console.log("📦 Payload EXPERTA:", payload);

        const response = await apiRequest('POST', url, payload, headers);
        return response;
    } catch (error) {
        console.error("❌ Error cotizando con EXPERTA:", error.message);
        throw new Error("No se pudo obtener la cotización de EXPERTA");
    }
}

module.exports = { cotizarExperta };
