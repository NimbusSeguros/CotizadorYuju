const { cotizarRUS } = require('./rusService');
const { cotizarConExperta } = require('./expertaService');
const { cotizarMercantilAndina } = require('./maService');
const { cotizarSanCristobal } = require('./scService'); 

async function cotizarTodasLasCompanias(datos) {
    const resultados = [];

    try {
        const rus = await cotizarRUS(datos);
        if (rus) {
            resultados.push({
                aseguradora: "RUS",
                resultado: rus
            });
        }
    } catch (err) {
        console.error("❌ Error cotizando con RUS:", err.message);
    }

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

    // try {
    //     const sanCristobal = await cotizarSanCristobal(datos);
    //     if (sanCristobal) {
    //         resultados.push({
    //             aseguradora: "SAN CRISTÓBAL",
    //             resultado: sanCristobal
    //         });
    //     }
    // } catch (err) {
    //     console.error("❌ Error cotizando con SAN CRISTÓBAL:", err.message);
    // }

    return resultados;
}

module.exports = { cotizarTodasLasCompanias };
