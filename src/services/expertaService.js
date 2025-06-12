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
        codigoPostal: datos.codigoPostal || "5000",
        codInfoAuto: datos.codInfoAuto,
        marca: datos.marca,
        ceroKM: datos.ceroKM || "N",
        modelo: datos.modelo,
        anio: datos.anio,
        fechaVigencia: datos.fechaVigencia || "22/04/2025",
        gnc: datos.gnc || "N",
        uso: datos.uso || "1",
        iva: datos.iva || "5",
        modalidad: datos.modalidad || "EX0",
        version: datos.version,
        productor: datos.productor || "972"
    };

    console.log("📦 Payload EXPERTA:", payload);

    const response = await apiRequest('POST', url, payload, headers);
    return response;
}

module.exports = { cotizarConExperta };
