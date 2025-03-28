const { apiRequest } = require('../services/externalService');
const { getAuthToken } = require('../services/authService');
const config = require('../config');

async function cotizarConExperta(datos) {
    const token = await getAuthToken('EXPERTA');

    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'api-key': config.EXPERTA_API_KEY
    };

    const url = `${config.EXPERTA_API_URL}/cotizaciones`;

    const payload = {
        nombres: datos.nombres || "Ignacio",
        apellido: datos.apellido || "Alcantara",
        email: datos.email || "ignacio.alcantara@alcanatargroup.com.ar",
        codigoPostal: datos.codigoPostal,
        codInfoAuto: datos.codInfoAuto,
        marca: datos.marca,
        ceroKM: datos.ceroKM,
        modelo: datos.modelo,
        anio: datos.anio,
        fechaVigencia: datos.fechaVigencia,
        gnc: datos.gnc,
        uso: datos.uso || "1",
        iva: datos.iva,
        modalidad: datos.modalidad || "EX0",
        version: datos.version,
        productor: datos.productor || "972"
    };

    console.log("\u{1F4E6} Payload Experta:", payload);
    const response = await apiRequest('POST', url, payload, headers);
    return response;
}

module.exports = { cotizarConExperta };
