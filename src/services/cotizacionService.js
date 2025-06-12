const { cotizarRUS } = require('./rusService');
const { cotizarConExperta } = require('./expertaService');
const { cotizarMercantilAndina } = require('./maService');
const { cotizarSanCristobal } = require('./scService'); 
const { cotizarIntegrity } = require('./integrityService'); 

async function cotizarTodasLasCompanias(datos) {
    const resultados = [];

    /*try {
        const rus = await cotizarRUS(datos);
        if (rus) {
            resultados.push({
                aseguradora: "RUS",
                resultado: rus
            });
        }
    } catch (err) {
        console.error("❌ Error en cotización con RUS:", JSON.stringify(error.response?.data || error.message, null, 2));
    }*/
        
    
    try {
        const experta = await cotizarConExperta(datos);
        if (experta) {
            resultados.push({
                aseguradora: "EXPERTA",
                resultado: experta
            });
        }
    } catch (err) {
        console.error("❌ Error cotizando con EXPERTA:", err.message);
    }

    

    try {
        const mercantilAndina = await cotizarMercantilAndina(datos);
        if (mercantilAndina) {
            resultados.push({
                aseguradora: "MERCANTIL ANDINA",
                resultado: mercantilAndina
            });
        }
    } catch (err) {
        console.error("❌ Error cotizando con MERCANTIL ANDINA:", err.message);
    }
        

    
    try {
        const sanCristobal = await cotizarSanCristobal(datos);
        if (sanCristobal) {
            resultados.push({
                aseguradora: "SAN CRISTÓBAL",
                resultado: sanCristobal
            });
        }
    } catch (err) {
        console.error("❌ Error cotizando con SAN CRISTÓBAL:", err.message);
    }
    

    /*try {
        console.log("▶️ Cotizando con INTEGRITY...");
        const integrity = await cotizarIntegrity(datos);
        if (integrity) {
            resultados.push({
                aseguradora: "INTEGRITY",
                resultado: integrity
            });
        }
    } catch (err) {
        console.error("❌ Error cotizando con INTEGRITY:", err);
    }*/

    
    return resultados;
}

module.exports = { cotizarTodasLasCompanias };
