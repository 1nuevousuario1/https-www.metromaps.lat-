window.calcularRuta = function() {
  const origen = (origenSelect.value || "").trim();
  const destino = (destinoSelect.value || "").trim();

  // Mapa de líneas
  const linea1 = ["Talleres","San Bernabé","Unidad Modelo","Aztlán","Penitenciaría","Alfonso Reyes","Mitras","Simón Bolívar","Hospital","Edison","Central","Cuauhtémoc","Del Golfo","Félix Gómez","Parque Fundidora","Y Griega","Eloy Cavazos","Lerdo de Tejada","Exposición"];
  const linea2 = ["Sendero","Tapia","San Nicolás","Anáhuac","Universidad","Niños Héroes","Regina","General Anaya","Cuauhtémoc","Alameda","Fundadores","Padre Mier","General I. Zaragoza","Hospital Metropolitano","Los Ángeles","Ruiz Cortines","Col. Moderna","Metalúrgica","Col. Obrera","Santa Lucía"];
  const linea3 = ["Hospital Metropolitano","General I. Zaragoza","Félix U. Gómez","Santa Lucía"];

  const lineById = { L1: linea1, L2: linea2, L3: linea3 };
  const lineColorName = { L1: "amarilla", L2: "verde", L3: "roja" };

  // Intercambios válidos por par de líneas
  const intercambios = {
    "L1-L2": "Cuauhtémoc",
    "L2-L1": "Cuauhtémoc",
    "L1-L3": "Félix U. Gómez",
    "L3-L1": "Félix U. Gómez",
    "L2-L3": "General I. Zaragoza",
    "L3-L2": "General I. Zaragoza"
  };

  // Helpers
  const getLineaDe = (est) => {
    if (linea1.includes(est)) return "L1";
    if (linea2.includes(est)) return "L2";
    if (linea3.includes(est)) return "L3";
    return null;
  };
  const tramo = (arr, a, b) => {
    const i1 = arr.indexOf(a);
    const i2 = arr.indexOf(b);
    if (i1 === -1 || i2 === -1) return [];
    const slice = arr.slice(Math.min(i1, i2), Math.max(i1, i2) + 1);
    return i1 <= i2 ? slice : slice.reverse();
  };

  // Validaciones básicas
  if (!origen || !destino) {
    document.getElementById("info").textContent = "Selecciona origen y destino.";
    return;
  }
  if (origen === destino) {
    document.getElementById("info").textContent = "El origen y destino son la misma estación.";
    return;
  }

  const lineaOrigen = getLineaDe(origen);
  const lineaDestino = getLineaDe(destino);
  if (!lineaOrigen || !lineaDestino) {
    document.getElementById("info").textContent = "Alguna estación no pertenece a las líneas definidas.";
    return;
  }

  let pathStations = [];
  let tiempoMin = 0;
  let transbordos = 0;
  let instrucciones = "";

  if (lineaOrigen === lineaDestino) {
    // Ruta directa
    pathStations = tramo(lineById[lineaOrigen], origen, destino);
    const intermedias = pathStations.slice(1, -1);
    tiempoMin = (pathStations.length - 1) * 2;
    instrucciones =
      `Toma la línea ${lineColorName[lineaOrigen]} desde ${origen} hasta ${destino}.` +
      (intermedias.length ? `<br>Pasa por: ${intermedias.join(", ")}.` : "");
  } else {
    // Ruta con transbordo
    const clave = `${lineaOrigen}-${lineaDestino}`;
    const intercambio = intercambios[clave];
    if (!intercambio) {
      document.getElementById("info").textContent = "No se encontró intercambio válido entre las líneas seleccionadas.";
      return;
    }

    const tramo1 = tramo(lineById[lineaOrigen], origen, intercambio);
    const tramo2 = tramo(lineById[lineaDestino], intercambio, destino);

    if (!tramo1.length || !tramo2.length) {
      document.getElementById("info").textContent = "No se pudo construir el tramo con el intercambio seleccionado.";
      return;
    }

    pathStations = tramo1.concat(tramo2.slice(1)); // evita duplicar el intercambio
    transbordos = 1;
    const intermedias1 = tramo1.slice(1, -1);
    const intermedias2 = tramo2.slice(1, -1);

    tiempoMin = (pathStations.length - 1) * 2 + transbordos * 3;

    instrucciones =
      `Toma la línea ${lineColorName[lineaOrigen]} desde ${origen} hasta ${intercambio}.` +
      (intermedias1.length ? `<br>Pasa por: ${intermedias1.join(", ")}.` : "") +
      `<br>Haz transbordo en ${intercambio} a la línea ${lineColorName[lineaDestino]}.` +
      (intermedias2.length ? `<br>Luego pasa por: ${intermedias2.join(", ")}.` : "") +
      `<br>Llega a ${destino}.`;
  }

  // Resumen e historia
  document.getElementById("info").innerHTML =
    `Trayecto: ${pathStations.length} estaciones — ${transbordos} transbordo(s) — Tiempo estimado: ${tiempoMin} minutos`;

  const origenNombre = pathStations[0];
  const destinoNombre = pathStations[pathStations.length - 1];
  const intermediasListado = pathStations.slice(1, -1);
  const listadoCorto = intermediasListado.slice(0, 6).join(", ");
  const hayMas = intermediasListado.length > 6 ? ", entre otras" : "";

  let descripcion = `<h3>📍 Detalles del recorrido</h3>
    <p>Sales de <b>${origenNombre}</b>.</p>
    ${instrucciones}
    ${intermediasListado.length ? `<p>En el trayecto pasas por <b>${listadoCorto}</b>${hayMas}.</p>` : ""}
    <p>Finalmente llegas a <b>${destinoNombre}</b>.</p>
    <p><b>Número de estaciones:</b> ${pathStations.length}.</p>
    <p><b>Tiempo estimado:</b> ${tiempoMin} minutos.</p>`;
  document.getElementById("descripcion").innerHTML = descripcion;

  // Dibujo en mapa: seguir estaciones del path
  const coordsPath = pathStations.map(nombre => {
    const est = estaciones.find(e => e.nombre === nombre);
    if (!est) console.warn("Nombre sin coincidencia:", nombre);
    return est ? est.coords : null;
  }).filter(Boolean);

  if (coordsPath.length < 2) return;

  if (!map.loaded()) {
    // si el estilo aún no está cargado, espera y reintenta rápidamente
    map.once('load', () => window.calcularRuta());
    return;
  }

  if (map.getSource("ruta")) {
    map.removeLayer("ruta");
    map.removeSource("ruta");
  }
  map.addSource("ruta", {
    type: "geojson",
    data: { type: "Feature", geometry: { type: "LineString", coordinates: coordsPath } }
  });
  map.addLayer({
    id: "ruta",
    type: "line",
    source: "ruta",
    layout: { "line-join": "round", "line-cap": "round" },
    paint: { "line-color": "#ff6f00", "line-width": 4 }
  });
};

