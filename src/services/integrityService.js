// src/services/integrityService.js
const { XMLParser } = require('fast-xml-parser');

/**
 * Arma el XML de negocio (SIN envelope SOAP)
 */
function buildInnerXML(d) {
  // normalizo IVA a 2 dígitos como en los ejemplos (p.ej. "05")
  const situacionIVA = String(d.situacionIVA ?? '05').padStart(2, '0');

  return `
<DatosCotizacion Emitir="N" Ticket="${d.ticket || '1080013347'}" ActualizarMovimiento="S" ModoEjecucionProcesoCalculo="CompletoSinGestion">
  <DatosCliente>
    <Sexo>${d.sexo || 'M'}</Sexo>
    <Provincia>${d.provincia || '01'}</Provincia>
    <Localidad>${d.localidad || '000716'}</Localidad>
    <SituacionIVA>${situacionIVA}</SituacionIVA>
    <CondicionIIBB>${d.condicionIIBB || '4'}</CondicionIIBB>
    <FechaNacimiento>${d.fechaNacimiento || '08/08/2008'}</FechaNacimiento>
    <ClausulaAjuste>${d.clausulaAjuste || '1'}</ClausulaAjuste>
    <TipoDocumento>${d.tipoDocumento || '96'}</TipoDocumento>
    <CodigoPostal>${d.codigoPostal || '1000'}</CodigoPostal>
  </DatosCliente>
  <DatosVehiculo>
    <Marca>${d.marcaCodigo || d.marca || '18'}</Marca>
    <Modelo>${d.modeloCodigo || d.modelo || '759'}</Modelo>
    <Anio>${d.anio || '2023'}</Anio>
    <SumaAsegurada>${d.sumaAsegurada || '53760000'}</SumaAsegurada>
    <Destino>${d.destino || '1'}</Destino>
    <EsRCM>${d.esRCM || 'MA'}</EsRCM>
    <AniosSiniestralidad>${d.aniosSiniestralidad || '0'}</AniosSiniestralidad>
    <Patente>${d.patente || 'A/D'}</Patente>
    <Motor>${d.motor || 'A/D'}</Motor>
    <Chasis>${d.chasis || 'A/D'}</Chasis>
    <Provincia>${d.provinciaVehiculo || d.provincia || '01'}</Provincia>
    <Localidad>${d.localidadVehiculo || d.localidad || '000716'}</Localidad>
    <Carroceria>${d.carroceria || '4'}</Carroceria>
  </DatosVehiculo>
  <DatosPropuesta>
    <Producto>${d.producto || '0053'}</Producto>
    <Productor>${d.productor || '4589247'}</Productor>
    <PlanComercial>${d.planComercial || '14'}</PlanComercial>
    <FormaPago>${d.formaPago || '1019'}</FormaPago>
    <Franquicia>${d.franquicia || '1'}</Franquicia>
    <Cuotas>${d.cuotas || '1'}</Cuotas>
    <FechaVigenciaDesde>${d.fechaVigenciaDesde || d.fechaVigencia || '01-08-2025'}</FechaVigenciaDesde>
    <FechaVigenciaHasta>${d.fechaVigenciaHasta || '01-11-2025'}</FechaVigenciaHasta>
    <VigenciaContrato>${d.vigenciaContrato || '109'}</VigenciaContrato>
    <Descuentos/>
    <PorcentajeDescuento>${d.porcentajeDescuento || '0'}</PorcentajeDescuento>
    <Adicionales>
      <Item Limite="${d.limiteG0 || '100062'}">G0</Item>
      <Item Limite="${d.limiteIN || '100062'}">IN</Item>
      <Item Limite="${d.limitePR || '100062'}">PR</Item>
      <Item>DP</Item>
    </Adicionales>
    <Accesorios/>
    <DatosServiciosEspeciales CodigoServicio="${d.codigoServicio || '1'}" LlevaServicio="${d.llevaServicio || 'SI'}" Prestador="${d.prestador || '2'}"/>
    <IdentificadorCombo/>
  </DatosPropuesta>
</DatosCotizacion>`.trim();
}

/**
 * Envelope SOAP 1.1 con CDATA
 */
function buildEnvelope(innerXml) {
  return `<?xml version="1.0" encoding="utf-8"?>
<soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
               xmlns:xsd="http://www.w3.org/2001/XMLSchema"
               xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
  <soap:Body>
    <CotizarString xmlns="http://libertyargentina.com.ar/">
      <XML><![CDATA[
${innerXml}
      ]]></XML>
    </CotizarString>
  </soap:Body>
</soap:Envelope>`;
}

/**
 * POST al .asmx con fetch nativo (Node 18+)
 */
async function postSoap(envelope) {
  const url = 'https://www.integritynet.com.ar/LibertyWS/service.asmx';
  const headers = {
    'Content-Type': 'text/xml; charset=utf-8',
    'SOAPAction': '"http://libertyargentina.com.ar/CotizarString"',
  };

  const controller = new AbortController();
  const to = setTimeout(() => controller.abort(), 15000);

  try {
    const res = await fetch(url, { method: 'POST', headers, body: envelope, signal: controller.signal });
    const text = await res.text();
    clearTimeout(to);
    return { ok: res.ok, status: res.status, text };
  } catch (e) {
    clearTimeout(to);
    throw e;
  }
}

/**
 * Parser SOAP robusto con fast-xml-parser
 */
const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: '',
  removeNSPrefix: true,   // quita soap:, etc
  trimValues: true,
  parseTagValue: true,
  parseAttributeValue: true,
});

function parseSoap(text) {
  const soap = parser.parse(text);

  // Envelope -> Body -> CotizarStringResponse -> CotizarStringResult
  const node = soap?.Envelope?.Body?.CotizarStringResponse?.CotizarStringResult;

  let respuesta;
  if (typeof node === 'string') {
    // caso: Result como string XML
    const inner = parser.parse(node);
    respuesta = inner?.Respuesta ?? inner;
  } else if (node?.Respuesta) {
    // caso: Result ya viene como nodo
    respuesta = node.Respuesta;
  } else {
    return { raw: text, respuesta: null };
  }

  return { raw: text, respuesta };
}

/**
 * Servicio principal
 * Devuelve el nodo <Respuesta> normalizado (valores numéricos convertidos)
 */
async function cotizarIntegrity(datos) {
  // ⚠️ Integrity necesita códigos numéricos de marca/modelo (no descripciones).
  const d = {
    ...datos,
    marcaCodigo: datos.marcaCodigo ?? datos.marcaCodigoNum ?? datos.marca ?? '18',
    modeloCodigo: datos.modeloCodigo ?? datos.modeloCodigoNum ?? datos.modelo ?? '759',
  };

  const inner = buildInnerXML(d);
  const envelope = buildEnvelope(inner);

  // Log útil para debug
  console.log('🧾 Envelope enviado a INTEGRITY:\n', envelope);

  const resp = await postSoap(envelope);
  if (!resp.ok) {
    console.error('Integrity non-2xx:', resp.status, resp.text.slice(0, 1500));
    throw new Error(`integrity_http_${resp.status}`);
  }

  // Log de respuesta (acotado)
  console.log('📨 SOAP response (primeros 1200 chars):\n', resp.text.slice(0, 1200));

  const parsed = parseSoap(resp.text);
  if (!parsed.respuesta) {
    // devolvé crudo para inspección si querés:
    // console.error('SOAP completo:', resp.text);
    throw new Error('integrity_invalid_result');
  }

  // Normalizo numéricos
  const r = parsed.respuesta;
  const num = (v) => (v == null || v === '' ? null : Number(v));

  const normalized = {
    movimiento: r.movimiento ?? r.movimiento ?? null, // atributo
    TiempoMS: num(r.TiempoMS),
    Calculo: r.Calculo,
    Prima: num(r.Prima),
    Premio: num(r.Premio),
    IVA: num(r.IVA),
    SumaAsegurada: num(r.SumaAsegurada),
    Franquicia: r.Franquicia ?? '',
    Rastreador: r.Rastreador,
    GrupoEstado: num(r.GrupoEstado),
    GrupoEstadoDescripcion: r.GrupoEstadoDescripcion,
    Estado: num(r.Estado),
    EstadoDescripcion: r.EstadoDescripcion,
    Errores: r.Errores ?? null,
    OtrasRespuestas: r.OtrasRespuestas ?? null,
  };

  if (normalized.Calculo !== 'S') {
    console.error('⚠️ Calculo != S (detalles):', {
      Estado: normalized.Estado,
      EstadoDescripcion: normalized.EstadoDescripcion,
      GrupoEstado: normalized.GrupoEstado,
      GrupoEstadoDescripcion: normalized.GrupoEstadoDescripcion,
      Errores: normalized.Errores,
      OtrasRespuestas: normalized.OtrasRespuestas,
    });
    throw new Error('integrity_invalid_result');
  }

  return normalized;
}

module.exports = { cotizarIntegrity };
