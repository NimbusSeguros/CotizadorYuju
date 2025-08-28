// src/services/infoAutoService.js (CJS)
const { cacheGet, cacheSet } = require('../lib/cache');

const INFOAUTO_AUTH_URL = 'https://api.infoauto.com.ar/cars/auth/login';
const INFOAUTO_MARCAS_URL = 'https://api.infoauto.com.ar/cars/pub/brands';

const CACHE_TTL = Number(process.env.MODELOS_TTL_SECONDS || 86400);    // 1 día
const STALE_TTL = Number(process.env.MODELOS_STALE_SECONDS || 604800); // 7 días
const CONCURRENCY = 5;
const PAGE_SIZE = 100; // si lo soporta la API
const REQUEST_TIMEOUT_MS = 15000;
const RETRIES = 2;
const RETRY_BACKOFF_MS = [250, 800];

let token = null;
let lastFetch = 0;
const inflight = new Map(); // marcaId -> Promise

function delay(ms) { return new Promise(r => setTimeout(r, ms)); }

async function fetchWithRetry(url, options = {}) {
  let attempt = 0;
  let lastErr;
  while (attempt <= RETRIES) {
    const controller = new AbortController();
    const t = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
    try {
      const resp = await fetch(url, { ...options, signal: controller.signal });
      clearTimeout(t);
      if ([502,503,504].includes(resp.status) && attempt < RETRIES) {
        await delay(RETRY_BACKOFF_MS[attempt] ?? 1000);
        attempt++;
        continue;
      }
      return resp;
    } catch (e) {
      clearTimeout(t);
      lastErr = e;
      if (attempt < RETRIES) {
        await delay(RETRY_BACKOFF_MS[attempt] ?? 1000);
        attempt++;
        continue;
      }
      throw lastErr;
    }
  }
  throw lastErr;
}

function assertCreds() {
  if (!process.env.INFOAUTO_USER || !process.env.INFOAUTO_PASSWORD) {
    throw new Error('Faltan INFOAUTO_USER/INFOAUTO_PASSWORD en .env');
  }
}

async function getToken(force = false) {
  assertCreds();

  const now = Date.now();
  if (!force && token && (now - lastFetch) < 10 * 60 * 1000) return token;

  const basic = Buffer.from(`${process.env.INFOAUTO_USER}:${process.env.INFOAUTO_PASSWORD}`).toString('base64');

  const resp = await fetch(INFOAUTO_AUTH_URL, {
    method: 'POST',
    headers: { Authorization: `Basic ${basic}`, Accept: 'application/json' }
  });

  const raw = await resp.text();
  let data;
  try { data = raw ? JSON.parse(raw) : {}; } catch {
    throw new Error(`Login InfoAuto devolvió contenido no-JSON (status ${resp.status}).`);
  }
  if (!resp.ok) {
    const msg = data?.message || data?.error || JSON.stringify(data).slice(0,200);
    throw new Error(`Login InfoAuto falló (${resp.status}): ${msg}`);
  }
  if (!data.access_token) throw new Error('Login InfoAuto OK pero sin access_token.');

  token = data.access_token;
  lastFetch = now;
  return token;
}

async function getMarcas() {
  const t = await getToken();
  const all = [];
  let page = 1;

  while (true) {
    const url = `${INFOAUTO_MARCAS_URL}?page=${page}`;
    const resp = await fetchWithRetry(url, { headers: { Authorization: `Bearer ${t}` } });
    const data = await resp.json();
    if (!resp.ok) throw new Error(`Error al obtener marcas (página ${page})`);
    if (!Array.isArray(data) || data.length === 0) break;
    all.push(...data);
    page++;
  }

  return all.map(m => ({ id: m.id, name: (m.name || '').toString().trim() }));
}

async function fetchPage(marcaId, page, t) {
  const qp = PAGE_SIZE ? `&pagesize=${PAGE_SIZE}` : '';
  const url = `https://api.infoauto.com.ar/cars/pub/brands/${encodeURIComponent(marcaId)}/models?page=${page}${qp}`;
  const resp = await fetchWithRetry(url, { headers: { Authorization: `Bearer ${t}` } });
  const text = await resp.text();
  if (resp.status === 401) {
    const e = new Error('Unauthorized'); e.code = 401; e.raw = text; throw e;
  }
  if (!resp.ok) throw new Error(`Upstream ${resp.status}: ${text?.slice(0,200)}`);
  return text ? JSON.parse(text) : [];
}

async function _fetchModelosUpstream(marcaId) {
  let t = await getToken();
  const all = [];
  const seen = new Set();

  let start = 1;
  while (true) {
    const tasks = [];
    for (let p = start; p < start + CONCURRENCY; p++) {
      tasks.push((async () => {
        try { return await fetchPage(marcaId, p, t); }
        catch (e) {
          if (e.code === 401) {
            t = await getToken(true);
            return await fetchPage(marcaId, p, t);
          }
          throw e;
        }
      })());
    }

    const results = await Promise.all(tasks);
    if (results.every(r => !Array.isArray(r) || r.length === 0)) break;

    for (const data of results) {
      if (!Array.isArray(data) || data.length === 0) continue;
      for (const m of data) {
        const id = m?.codia ?? m?.id ?? m?.code;
        const name = m?.description ?? m?.name ?? m?.descripcion;
        if (id != null && name) {
          const k = String(id);
          if (!seen.has(k)) { seen.add(k); all.push({ id, name: String(name).trim() }); }
        }
      }
    }
    start += CONCURRENCY;
  }

  all.sort((a,b) => a.name.localeCompare(b.name, 'es', { sensitivity: 'base', numeric: true }));
  return all;
}

async function refreshInBackground(marcaId, cacheKey) {
  const items = await _fetchModelosUpstream(marcaId);
  await cacheSet(cacheKey, { items, refreshedAt: Date.now() }, CACHE_TTL);
}

async function getModelos(marcaId, { forceRefresh = false } = {}) {
  const cacheKey = `infoauto:modelos:${marcaId}`;
  const cached = await cacheGet(cacheKey);

  if (cached?.items?.length && !forceRefresh) {
    const ageMs = Date.now() - (cached.refreshedAt || 0);
    if (ageMs > CACHE_TTL * 1000) {
      // SWR
      refreshInBackground(marcaId, cacheKey).catch(() => {});
      await cacheSet(cacheKey, cached, STALE_TTL); // mantener “stale” sirviendo
    }
    return cached.items;
  }

  if (!inflight.has(marcaId)) {
    inflight.set(marcaId, (async () => {
      try {
        const items = await _fetchModelosUpstream(marcaId);
        await cacheSet(cacheKey, { items, refreshedAt: Date.now() }, CACHE_TTL);
        return items;
      } finally {
        inflight.delete(marcaId);
      }
    })());
  }
  return inflight.get(marcaId);
}

module.exports = { getToken, getMarcas, getModelos };
