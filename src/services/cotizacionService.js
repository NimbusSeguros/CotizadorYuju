const { cotizarRUS } = require('./rusService');
const { cotizarConExperta } = require('./expertaService');
const { cotizarMercantilAndina } = require('./maService');
const { cotizarSanCristobal } = require('./scService'); 
const { cotizarIntegrity } = require('./integrityService'); 
const { supabase } = require('../supabaseClient');


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

//BASE DE DATOS
// CREATE
async function crearCotizacion(payload) {
    // payload: { marca, modelo_version, cp, anio, plan?, aseguradora?, estado? }
    const { data, error } = await supabase.rpc('cotizacion_create', payload);
    if (error) throw new Error(error.message);
    return data;
  }
  
  // GET by id
  async function obtenerCotizacion(id) {
    const { data, error } = await supabase.rpc('cotizacion_get', { id: Number(id) });
    if (error) throw new Error(error.message);
    return data; // puede ser null si no existe
  }
  
  // UPDATE (parcial)
  async function actualizarCotizacion(payload) {
    // payload: { id, marca?, modelo_version?, cp?, anio?, plan?, aseguradora?, estado? }
    const { data, error } = await supabase.rpc('cotizacion_update', payload);
    if (error) throw new Error(error.message);
    return data;
  }
  
  // DELETE
  async function eliminarCotizacion(id) {
    const { data, error } = await supabase.rpc('cotizacion_delete', { id: Number(id) });
    if (error) throw new Error(error.message);
    return data === true;
  }
  
  /**
   * Health check SIN crear funciones en la DB.
   * Cuenta filas de la tabla 'cotizacion'. Si devuelve número (aunque sea 0) => conexión OK.
   */
  async function healthCotizacion() {
    const { count, error } = await supabase
      .from('cotizacion')
      .select('*', { count: 'exact', head: true });
    if (error) throw new Error(error.message);
    return { ok: true, total: count ?? 0 };
  }
  
  module.exports = {
    crearCotizacion,
    obtenerCotizacion,
    actualizarCotizacion,
    eliminarCotizacion,
    healthCotizacion,
  };
  