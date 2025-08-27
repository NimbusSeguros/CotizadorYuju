const {
    obtenerCodigosPermitidosSanCristobal,
    obtenerCodigosPermitidosMercantil,
    obtenerCodigosPermitidosExperta
} = require('./validaciones');

function obtenerCoberturas(aseguradora, anioAuto = new Date().getFullYear()) {
    switch (aseguradora.toUpperCase()) {
        case "SAN_CRISTOBAL":
            return obtenerCodigosPermitidosSanCristobal(anioAuto);
        case "MERCANTIL":
            return ["A", "B", "C", "D", "E", "M", "MPLUS", "D2 0040", "D2 0041"];
            //return obtenerCodigosPermitidosMercantil(anioAuto);
        case "EXPERTA":
            return obtenerCodigosPermitidosExperta(anioAuto);
        default:
            return [];
    }
}

module.exports = { obtenerCoberturas };
