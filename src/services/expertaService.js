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
        codigoPostal: datos.codigoPostal || "1419000",
        codInfoAuto: datos.codInfoAuto || 360720,
        marca: datos.marca || "RENAULT",
        ceroKM: datos.ceroKM || "N",
        modelo: datos.modelo || "DUSTER",
        anio: datos.anio || 2013,
        fechaVigencia: datos.fechaVigencia || "21/04/2025",
        gnc: datos.gnc || "N",
        uso: datos.uso || "1", // 1 = Particular
        iva: datos.iva || "5", // 5 = Responsable Inscripto
        modalidad: datos.modalidad || "EX0",
        version: datos.version || "1.6 4X2 TECH ROAD CON AC, 05 PUERTAS",
        productor: datos.productor || "972"
    };

    console.log("\u{1F4E6} Payload Experta:", payload);
    const response = await apiRequest('POST', url, payload, headers);
    return response;
}

module.exports = { cotizarConExperta };
