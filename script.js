// Token de Mapbox
mapboxgl.accessToken = 'TU_TOKEN_DE_MAPBOX';

// Inicializar mapa
const map = new mapboxgl.Map({
  container: 'map',
  style: 'mapbox://styles/mapbox/streets-v11',
  center: [-100.3161, 25.6866],
  zoom: 11
});

// Estaciones (ejemplo con varias líneas)
const estaciones = [
  { nombre: "Talleres", coords: [-100.374, 25.749], linea: "L1" },
  { nombre: "San Bernabé", coords: [-100.360, 25.744], linea: "L1" },
  { nombre: "Cuauhtémoc", coords: [-100.309, 25.675], linea: "L1" },
  { nombre: "Y Griega", coords: [-100.293, 25.666], linea: "L1" },
  { nombre: "Sendero", coords: [-100.309, 25.795], linea: "L2" },
  { nombre: "Universidad", coords: [-100.309, 25.755], linea: "L2" },
  { nombre: "Hospital Metropolitano", coords: [-100.312, 25.730], linea: "L3" },
  { nombre: "Topochico", coords: [-100.380, 25.800], linea: "L3" }
];

// Poblar selects y marcadores
const origenSelect = document.getElementById("origen");
const destinoSelect = document.getElementById("destino");

estaciones.forEach(est => {
  const opt1 = document.createElement("option");
  opt1.value = est.nombre;
  opt1.textContent = est.nombre;
  origenSelect.appendChild(opt1);

  const opt2 = document.createElement("option");
  opt2.value = est.nombre;
  opt2.textContent = est.nombre;
  destinoSelect.appendChild(opt2);

  // Color por línea
  let color = "orange";
  if (est.linea === "L2") color = "green";
  if (est.linea === "L3") color = "blue";

  new mapboxgl.Marker({ color })
    .setLngLat(est.coords)
    .setPopup(new mapboxgl.Popup().setText(est.nombre))
    .addTo(map);
});

// Función para calcular ruta (expuesta globalmente)
window.calcularRuta = function() {
  const origen = estaciones.find(e => e.nombre === origenSelect.value);
  const destino = estaciones.find(e => e.nombre === destinoSelect.value);

  if (!origen || !destino) {
    document.getElementById("info").textContent = "Selecciona origen y destino.";
    return;
  }

  document.getElementById("info").textContent =
    `Ruta calculada de ${origen.nombre} a ${destino.nombre}.`;

  if (map.getSource("ruta")) {
    map.removeLayer("ruta");
    map.removeSource("ruta");
  }

  map.addSource("ruta", {
    type: "geojson",
    data: {
      type: "Feature",
      geometry: {
        type: "LineString",
        coordinates: [origen.coords, destino.coords]
      }
    }
  });

  map.addLayer({
    id: "ruta",
    type: "line",
    source: "ruta",
    layout: { "line-join": "round", "line-cap": "round" },
    paint: { "line-color": "#ff6f00", "line-width": 4 }
  });
};
