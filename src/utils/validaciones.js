function obtenerCodigosPermitidosSanCristobal(anioAuto) {
    const year = new Date().getFullYear();
    const antiguedad = year - anioAuto;

    const reglas = [
        { max: 7, codigos: ["CA7_A", "CA7_B", "CA7_C", "CA7_CPlus", "CA7_CM", "CA7_D"] },
        { max: 15, codigos: ["CA7_A", "CA7_B", "CA7_C", "CA7_CPlus", "CA7_CM"] },
        { max: 20, codigos: ["CA7_A", "CA7_B", "CA7_C"] },
        { max: 30, codigos: ["CA7_A", "CA7_B"] },
        { max: 35, codigos: ["CA7_A"] }
    ];

    for (const regla of reglas) {
        if (antiguedad <= regla.max) return regla.codigos;
    }

    return [];
}

function obtenerCodigosPermitidosMercantil(anioAuto) {
    if (anioAuto >= 2023) {
        return ["D2 0040", "D2 0041", "D2 0042", "D2 0050"];
    } else if (anioAuto >= 2018) {
        return ["D2 0040", "D2 0041"];
    } else {
        return ["D2 0040"];
    }
}


function obtenerCodigosPermitidosExperta(anioAuto) {
    const year = new Date().getFullYear();
    const antiguedad = year - anioAuto;

    const reglas = [
        { max: 10, codigos: ["23", "961", "942", "24", "150", "170"] }, // RC, TC, B, B1, E
        { max: 24, codigos: ["23", "24", "150", "170"] },               // RC, B, B1, E
        { max: 34, codigos: ["23"] }                                    // Solo RC
    ];

    for (const regla of reglas) {
        if (antiguedad <= regla.max) return regla.codigos;
    }

    return [];
}

module.exports = {
    obtenerCodigosPermitidosSanCristobal,
    obtenerCodigosPermitidosMercantil,
    obtenerCodigosPermitidosExperta
};
