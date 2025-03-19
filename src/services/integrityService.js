const axios = require('axios');
const config = require('../config');

async function enviarSolicitudSOAP(xmlData) {
    const url = config.INTEGRITY_API_URL; // URL del servicio SOAP de Integrity

    const soapEnvelope = `<?xml version="1.0" encoding="utf-8"?>
    <soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xmlns:xsd="http://www.w3.org/2001/XMLSchema"
        xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
        <soap:Body>
            <CotizarString xmlns="http://libertyargentina.com.ar/">
                <XMLString>${xmlData}</XMLString>
            </CotizarString>
        </soap:Body>
    </soap:Envelope>`;

    console.log("Enviando solicitud a Integrity:");
    console.log(soapEnvelope); // Ver el XML que estamos enviando

    try {
        const response = await axios.post(url, soapEnvelope, {
            headers: {
                "Content-Type": "text/xml; charset=utf-8",
                "SOAPAction": "https://www.integritynet.com.ar/LibertyWS/service.asmx"
            }
        });

        console.log(" Respuesta de Integrity:", response.data);
        return response.data;
    } catch (error) {
        console.error("Error en cotización con Integrity:", error.response?.data || error.message);
        throw new Error("Error al obtener la cotización con Integrity");
    }
}

module.exports = { enviarSolicitudSOAP };
