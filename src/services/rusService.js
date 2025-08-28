const { apiRequest } = require('../services/externalService');
const { getAuthToken } = require('../services/authService');
const config = require('../config');

/** Formatea Date a YYYY-MM-DD en hora LOCAL (evita desfases por UTC) */
function formatYYYYMMDDLocal(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/**
 * Convierte "DD-MM-YYYY" a Date y calcula vigencias (desde/hasta +1 año).
 * Devuelve { desde: 'YYYY-MM-DD', hasta: 'YYYY-MM-DD' } en hora local.
 */
function calcularVigencias(fechaStr) {
  if (!fechaStr || !/^\d{2}-\d{2}-\d{4}$/.test(fechaStr)) {
    const err = new Error('Fecha de vigencia inválida o no provista (formato esperado: DD-MM-YYYY)');
    err.code = 'VIGENCIA_FORMAT_INVALID';
    throw err;
  }

  const [dia, mes, anio] = fechaStr.split('-');
  // Construimos como local time
  const desde = new Date(Number(anio), Number(mes) - 1, Number(dia));
  if (isNaN(desde.getTime())) {
    const err = new Error('No se pudo interpretar la fecha de vigencia');
    err.code = 'VIGENCIA_PARSE_ERROR';
    throw err;
  }

  const hasta = new Date(desde);
  hasta.setFullYear(hasta.getFullYear() + 1);

  return {
    desde: formatYYYYMMDDLocal(desde),
    hasta: formatYYYYMMDDLocal(hasta),
  };
}

/** Mapea el uso a lo que espera RUS (ajustá si tu contrato usa otros códigos) */
function mapUso(valor) {
  // Si te llega "PARTICULAR"/"COMERCIAL" ya está:
  if (valor === 'PARTICULAR' || valor === 'COMERCIAL') return valor;
  // Si te llega booleano o algo raro, forzá un default razonable:
  if (valor === true) return 'PARTICULAR';
  if (valor === false || valor == null) return 'PARTICULAR';
  // Último recurso: cast a string y upper
  return String(valor).toUpperCase();
}

async function cotizarRUS(datos) {
  const ctx = { provider: 'RUS' };

  try {
    const token = await getAuthToken('RUS');
    console.log('🔐 [RUS] Token obtenido (cache/refresh OK)');

    const url = `${config.RUS_API_URL}/api-rus/cotizaciones/autos`;

    const { desde, hasta } = calcularVigencias(datos.fechaVigencia);

    // Normalizamos tipados
    const anio = String(datos.anio ?? '').trim();
    const cp = String(datos.codigoPostal ?? '').trim() || '5000';
    const codia = Number(datos.codInfoAuto);

    const payload = {
      codigoProductor: 9254,
      codigoSolicitante: 9254,
      codigoTipoInteres: 'VEHICULO',
      cuotas: Number(datos.cuotas) || 1,
      numeroSolicitud: 2,
      condicionFiscal: datos.condicionFiscal || 'CF', // ajustable
      tipoVigencia: 'ANUAL',
      vigenciaDesde: desde,
      vigenciaHasta: hasta,
      vigenciaPolizaId: 71, // validar contra catálogo
      vehiculos: [
        {
          anio, // "2021"
          controlSatelital: 'NO',
          cpLocalidadGuarda: cp, // "1407"
          gnc: datos.gnc === 'S' ? 'SI' : 'NO',
          codia, // 180710
          rastreoACargoRUS: 'NO',
          uso: mapUso(datos.uso), // <<< CLAVE: string esperado, no booleano
        },
      ],
    };

    const headers = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Authorization: token,
    };

    console.log('📦 [RUS] Payload →', JSON.stringify(payload, null, 2));
    const response = await apiRequest('PUT', url, payload, headers);

    // Tip: si RUS devuelve metadatos (id de transacción / requestId) loguealos
    const requestId =
      response?.headers?.['x-request-id'] ||
      response?.requestId ||
      response?.data?.traceId;

    console.log('✅ [RUS] 200 OK', requestId ? `requestId=${requestId}` : '');

    return response;
  } catch (err) {
    // Extraer lo más útil posible:
    const status = err?.response?.status;
    const data = err?.response?.data;
    const requestId =
      err?.response?.headers?.['x-request-id'] ||
      err?.response?.data?.traceId;

    console.error(
      `❌ [RUS] Error`,
      status ? `HTTP ${status}` : '',
      requestId ? `requestId=${requestId}` : ''
    );
    if (data) {
      console.error('↪ detalle:', JSON.stringify(data, null, 2));
    } else {
      console.error('↪ mensaje:', err.message);
    }

    // Re-lanzamos con detalles para que el caller pueda mostrar/loguear bien
    const wrapped = new Error(
      status === 409 && data?.validationErrors?.length
        ? `RUS rechazó la cotización: ${data.validationErrors.map(v => v.message).join(' | ')}`
        : `Fallo al cotizar con RUS${status ? ` (HTTP ${status})` : ''}`
    );
    wrapped.name = 'RUSError';
    wrapped.details = {
      status,
      data,
      requestId,
      context: { provider: 'RUS' },
    };
    throw wrapped;
  }
}

module.exports = { cotizarRUS };
