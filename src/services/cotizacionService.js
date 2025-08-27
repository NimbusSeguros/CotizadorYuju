const { cotizarRUS } = require('./rusService');
const { cotizarExperta } = require('./expertaService');
const { cotizarMercantilAndina } = require('./maService');
const { cotizarSanCristobal } = require('./scService'); 
const { obtenerCoberturas } = require('../utils/coberturasConfig');
const { formatearCoberturasSanCristobal , formatearCoberturasExperta, formatearCoberturasMercantil, formatRUSToUnified } = require('../formatters/scFormatter');
const { cotizarIntegrity } = require('./integrityService'); 
const { parseStringPromise } = require('xml2js');

function mapEntradaAIntegrity(datos) {
  return {
    codInfoAuto: datos.codInfoAuto,     // InfoAuto (Marca/Modelo en su codificación)
    anio: datos.anio,
    sumaAsegurada: datos.sumaAsegurada || 53760000, // ajustá con tu lógica si aplica
    sexo: 'M',
    provincia: '01',
    localidad: '000716',
    situacionIVA: datos.iva || '5',
    condicionIIBB: '4',
    fechaNacimiento: '08/08/2008',
    clausulaAjuste: '1',
    tipoDocumento: '96',
    codigoPostal: datos.codigoPostal || '1000',

    destino: '1',
    esRCM: 'MA',
    aniosSiniestralidad: '0',
    patente: 'A/D',
    motor: 'A/D',
    chasis: 'A/D',
    carroceria: '4',

    producto: '0053',
    productor: '4589247',
    planComercial: '14',
    formaPago: '1019',
    franquicia: '1',
    cuotas: Number(datos.cuotas) || 1,
    fechaVigenciaDesde: datos.fechaVigencia,  // dd-mm-aaaa (como lo enviás desde el FE)
    fechaVigenciaHasta: '01-11-2025',
    vigenciaContrato: '109',
    porcentajeDescuento: '0',
    limiteG0: '100062',
    limiteIN: '100062',
    limitePR: '100062',
    codigoServicio: '1',
    llevaServicio: 'SI',
    prestador: '2'
  };
}

// --- Helper: parsea el XML de Integrity y devuelve un objeto simple ---
async function parseIntegrityResponse(xml) {
  const parsed = await parseStringPromise(xml, { explicitArray: false });

  const r = parsed?.['soap:Envelope']?.['soap:Body']
    ?.CotizarStringResponse?.CotizarStringResult?.Respuesta;

  if (!r) throw new Error('Respuesta de Integrity inválida');
  if (r.Calculo !== 'S') {
    const msg = r?.Errores ? JSON.stringify(r.Errores) : 'Cálculo fallido';
    throw new Error(`Integrity: ${msg}`);
  }

  return {
    movimiento: r.$?.movimiento || r.movimiento,
    Prima: Number(r.Prima),
    Premio: Number(r.Premio),
    IVA: Number(r.IVA),
    SumaAsegurada: Number(r.SumaAsegurada),
    GrupoEstadoDescripcion: r.GrupoEstadoDescripcion,
    EstadoDescripcion: r.EstadoDescripcion
  };
}

async function cotizarTodasLasCompanias(datos) {
    const resultados = [];

    const cotizaciones = [];

    // ✅ EXPERTA
    try {
        const expertaResponse = await cotizarExperta(datos);

        if (expertaResponse?.planes && Array.isArray(expertaResponse.planes)) {
            const coberturasFormateadas = formatearCoberturasExperta(expertaResponse.planes, datos.anio);
            console.log("✅ Coberturas EXPERTA formateadas:", coberturasFormateadas);

            cotizaciones.push({
                aseguradora: "EXPERTA",
                planes: coberturasFormateadas
            });
        } else {
            console.warn("⚠️ EXPERTA no devolvió productos válidos");
        }
    } catch (err) {
        console.error("❌ Error cotizando con EXPERTA:", err.message);
    }

    // ✅ SAN CRISTÓBAL
    try {
        const sanCristobal = await cotizarSanCristobal(datos);

        if (sanCristobal?.Summaries && Array.isArray(sanCristobal.Summaries)) {
            const coberturasFormateadas = formatearCoberturasSanCristobal(sanCristobal.Summaries);

            cotizaciones.push({
                aseguradora: "SAN CRISTÓBAL",
                planes: coberturasFormateadas
            });
        } else {
            console.warn("⚠️ SAN CRISTÓBAL no devolvió coberturas válidas");
        }
    } catch (err) {
        console.error("❌ Error cotizando con SAN CRISTÓBAL:", err.message);
    }

    // ✅ MERCANTIL ANDINA
    
    try {
    const respuestaMercantil = await cotizarMercantilAndina(datos);

    
    const productos = respuestaMercantil.productos || [];

    console.log("los productos son:" , productos);
    

    //HASTA ACA LLEGA BIEN, EL PROBLEMA ES EN formatearCoberturasMercantil
    
    const coberturasFormateadas = formatearCoberturasMercantil(productos, datos.anio);
    console.log("las coberturas formateadas son" , coberturasFormateadas);
    

    cotizaciones.push({
        aseguradora: "MERCANTIL ANDINA",
        planes: coberturasFormateadas
    });

    } catch (err) {
        console.error("❌ Error cotizando con MERCANTIL ANDINA:", err.message);
    }
    


    try {
    const rusResp = await cotizarRUS(datos);      // devuelve { cantidadTotal, dtoList } en tu caso
    const rusBody = rusResp?.data ?? rusResp;     // por si en el futuro viene como axios

    // Log corto y útil
    console.log('[RUS] cantidadTotal:', rusBody?.cantidadTotal, 'dtoList?', Array.isArray(rusBody?.dtoList));

    const rusStd = formatRUSToUnified(rusBody, datos.cuotas || 1);

    if (rusStd?.planes?.length) {
      cotizaciones.push(rusStd);
    } else {
      console.warn('⚠️ RUS devolvió sin planes utilizables (precio inválido o lista vacía).');
      cotizaciones.push({ aseguradora: 'RUS', planes: [] });
    }
    } catch (err) {
      console.error('❌ Error cotizando con RUS:', err?.message, err?.details || err?.response?.data || '');
      cotizaciones.push({ aseguradora: 'RUS', error: err?.message || 'Error al cotizar' });
    }

      

    // ejemplo dentro de tu handler

    try {
  const datosIntegrity = mapEntradaAIntegrity(datos);

  // Ahora devuelve el objeto normalizado directamente
  const r = await cotizarIntegrity(datosIntegrity);

  const planes = [
    {
      nombre: 'Cobertura Única',
      codigo: 'INT-UNICA',
      precio: r.Premio,                                     // total (premio)
      franquicia: r.Franquicia ? Number(r.Franquicia) || null : null,
      cuotas: Number(datosIntegrity.cuotas) || 1,
    },
  ];

  cotizaciones.push({
    aseguradora: 'INTEGRITY',
    planes,
    meta: {
      movimiento: r.movimiento,
      estado: r.EstadoDescripcion,
      grupo: r.GrupoEstadoDescripcion,
    },
  });
  } catch (e) {
    console.error('❌ INTEGRITY falló:', e?.message);
    cotizaciones.push({ aseguradora: 'INTEGRITY', error: e?.message || 'Error al cotizar' });
  }



    
    return cotizaciones;
}

module.exports = { cotizarTodasLasCompanias };
