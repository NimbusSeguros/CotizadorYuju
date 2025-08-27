const {
    obtenerCodigosPermitidosSanCristobal,
    obtenerCodigosPermitidosMercantil,
    obtenerCodigosPermitidosExperta
} = require('../utils/validaciones');

// SAN CRISTÓBAL
function formatearCoberturasSanCristobal(summaries = [], anioAuto = 2022) {
    const codigosPermitidos = obtenerCodigosPermitidosSanCristobal(anioAuto);

    return summaries
        .filter(c => codigosPermitidos.includes(c.ProductCodeExtra || c.ProductCode))
        .map(cobertura => {
            const nombre = cobertura.DeductibleTypeFullDescription || `Cobertura ${cobertura.ProductOffering || cobertura.ProductCode}`;
            const codigo = cobertura.ProductCodeExtra || cobertura.ProductCode;
            const precio = cobertura.TotalPremium?.Amount || 0;
            const franquicia = cobertura.DeductibleValue ? `${cobertura.DeductibleValue}%` : null;
            const cuotas = 6;

            return {
                nombre,
                codigo,
                precio,
                franquicia,
                cuotas
            };
        });
}

function formatearCoberturasMercantil(productos = [], anioAuto = 2022) {
    console.log("🔍 Productos MERCANTIL recibidos:", productos.map(p => p.producto));

    const antiguedad = new Date().getFullYear() - anioAuto;

    const filtradas = productos.filter(p => {
        const cod = String(p.producto || "").toUpperCase();

        if (["A", "B"].includes(cod)) return antiguedad <= 30;
        if (["M", "MBASICA", "M BASICA", "M PLUS"].includes(cod)) return antiguedad <= 20;
        if (cod.startsWith("D2")) return antiguedad <= 8;
        if (cod === "C") return antiguedad <= 20;

        return false;
    });

    console.log("✅ Coberturas filtradas:", filtradas.map(p => p.producto));

    return filtradas.map(p => ({
        nombre: p.descripcion || p.titulo || "Cobertura sin nombre",
        codigo: p.codigo_producto,
        precio: p.costo || p.precio_total || 0,
        franquicia: p.franquicia || null,
        cuotas: p.cantidad_cuotas || 1
    }));
}


// EXPERTA
function formatearCoberturasExperta(planes = [], anioAuto = 2022) {
    const codigosValidos = obtenerCodigosPermitidosExperta(anioAuto);
    console.log("📄 Modalidades devueltas por EXPERTA:", planes.map(p => p.codigo));

    return planes
        .filter(p => codigosValidos.includes(p.codigo))
        .map(p => ({
            nombre: p.descripcion || p.planMostrar || "Cobertura sin nombre",
            codigo: p.codigo,
            precio: parseFloat(p.prima) || 0,
            franquicia: parseFloat(p.franquicia) || null,
            cuotas: p.duracion || 1
        }));
}

// --- INTEGRITY ---
function formatearCoberturasIntegrity(parsedIntegrity = {}, cuotas = 1) {
    // `parsedIntegrity` debería venir ya parseado del XML (Premio, Prima, etc.)
    // Si en algún momento Integrity empieza a devolver franquicia, la mapeamos acá.
    const precio = Number(parsedIntegrity.premio || parsedIntegrity.Premio || 0);

    return [
        {
            nombre: 'Cobertura Única',
            codigo: 'INT-UNICA',
            precio,
            franquicia: null,
            cuotas
        }
    ];
}

// utils/rusFormatter.js
function stripHtml(s) {
  if (!s) return null;
  return String(s)
    .replace(/<[^>]*>/g, ' ')      // quita tags
    .replace(/&nbsp;?/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Convierte el body de RUS { cantidadTotal, dtoList } a:
 * { aseguradora: 'RUS', planes: [{ nombre, codigo, precio, franquicia, cuotas }] }
 * - precio  -> usa dto.premio (fallback dto.prima)
 * - codigo  -> dto.codigoCasco || dto.codigoRC
 * - nombre  -> dto.descripcionComercial || codigoCasco || codigoRC
 * - franquicia -> null si 0 o falsy
 * - cuotas -> default que vos pases (ej: req.body.cuotas || 1)
 */
function formatRUSToUnified(rusBody, cuotasDefault = 1) {
  const lista = Array.isArray(rusBody?.dtoList) ? rusBody.dtoList : [];

  const planes = lista
    .map(dto => {
      const nombre =
        stripHtml(dto.descripcionComercial) ||
        dto.codigoCasco ||
        dto.codigoRC ||
        'Responsabilidad Civil';

      const codigo = dto.codigoCasco || dto.codigoRC || null;

      const precio = Number(
        dto.premio !== undefined ? dto.premio
          : dto.prima !== undefined ? dto.prima
          : NaN
      );

      const franquiciaNum = Number(dto.franquicia || 0);
      const franquicia = franquiciaNum > 0 ? franquiciaNum : null;

      return {
        nombre,
        codigo,
        precio,
        franquicia,
        cuotas: Number.isFinite(cuotasDefault) ? Number(cuotasDefault) : 1,
      };
    })
    // quedate solo con los que traen precio válido/positivo
    .filter(p => Number.isFinite(p.precio) && p.precio > 0);

  return {
    aseguradora: 'RUS',
    planes,
  };
}



module.exports = {
    formatearCoberturasSanCristobal,
    formatearCoberturasMercantil,
    formatearCoberturasExperta,
    formatearCoberturasIntegrity,
    formatRUSToUnified 
};
