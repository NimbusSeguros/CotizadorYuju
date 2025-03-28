const { cotizarRUS } = require('./rusService');
const { cotizarConExperta } = require('./expertaService');

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

    return resultados;
}

module.exports = { cotizarTodasLasCompanias };
