// services/infoautoService.js

import fetch from "node-fetch"

const INFOAUTO_AUTH_URL = "https://api.infoauto.com.ar/cars/auth/login"
const INFOAUTO_MARCAS_URL = "https://api.infoauto.com.ar/cars/pub/brands"

const usuario = "valentin.schutt@nimbusseguros.com"
const password = "Cl9iXaYwU5It2EhT"

let token = null
let lastFetch = null

export async function getToken() {
  const now = Date.now();
  if (token && lastFetch && now - lastFetch < 10 * 60 * 1000) {
    console.log("🔁 Token reutilizado");
    return token;
  }

  const credentials = Buffer.from(`${usuario}:${password}`).toString("base64");
  console.log("🔐 Enviando login a InfoAuto...");

  const response = await fetch(INFOAUTO_AUTH_URL, {
    method: "POST",
    headers: {
      "Authorization": `Basic ${credentials}`
    }
  });

  const text = await response.text();
  console.log("🧾 Respuesta cruda del login:", text);

  let data;
  try {
    data = JSON.parse(text);
  } catch (e) {
    console.error("❌ Error al parsear JSON del login:", e);
    throw new Error("Respuesta no válida al hacer login");
  }

  if (!data.access_token) {
    console.error("🚫 No se recibió access_token:", data);
    throw new Error("No se pudo obtener token de InfoAuto");
  }

  token = data.access_token;
  lastFetch = now;
  console.log("✅ Token obtenido:", token);
  return token;
}


export async function getMarcas() {
  const token = await getToken();
  let allMarcas = [];
  let page = 1;
  let hasMore = true;

  while (hasMore) {
    const response = await fetch(`https://api.infoauto.com.ar/cars/pub/brands?page=${page}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    const data = await response.json();

    if (!response.ok) {
      console.error(`Error en página ${page}:`, data);
      throw new Error("Error al obtener marcas");
    }

    if (!Array.isArray(data) || data.length === 0) {
      hasMore = false; // no hay más marcas
    } else {
      allMarcas.push(...data);
      page++;
    }
  }

 return allMarcas.map((marca) => ({
  id: marca.id,
  name: marca.name
}));
}

export async function getModelos(marcaId) {
  let token = await getToken();
  const headers = () => ({ Authorization: `Bearer ${token}` });

  const all = [];
  const seen = new Set();
  let page = 1;
  let hasMore = true;

  while (hasMore) {
    const url = `https://api.infoauto.com.ar/cars/pub/brands/${encodeURIComponent(marcaId)}/models?page=${page}`;
    const resp = await fetch(url, { headers: headers() });
    const text = await resp.text();

    let data = [];
    try { data = text ? JSON.parse(text) : []; } catch {}

    console.log("📄 modelos", { page, status: resp.status, count: Array.isArray(data) ? data.length : 'non-array' });

    if (!resp.ok) {
      // Si caducó el token, intentá 1 vez renovar y repetir la página
      if (resp.status === 401) {
        token = await getToken(true); // true => fuerza refresco si lo tenés implementado
        continue; // vuelve a pedir la MISMA página con token nuevo
      }
      console.error(`Error en página ${page}:`, text?.slice(0, 300));
      throw new Error("Error al obtener modelos");
    }

    if (!Array.isArray(data) || data.length === 0) {
      hasMore = false;
    } else {
      for (const m of data) {
        const id = m?.codia ?? m?.id ?? m?.code;
        const name = m?.description ?? m?.name ?? m?.descripcion;
        if (id != null && name) {
          const k = String(id);
          if (!seen.has(k)) {
            seen.add(k);
            all.push({ id, name: String(name).trim() });
          }
        }
      }
      page++;
    }
  }

  all.sort((a, b) => a.name.localeCompare(b.name, 'es'));
  return all;
}


