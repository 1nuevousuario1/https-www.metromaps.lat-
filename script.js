mapboxgl.accessToken = 'pk.eyJ1Ijoic29sb3lveWplaG92YSIsImEiOiJjbWsyZ3FheXcwZnE5M2ZxNHduOTBnM3c2In0.c6ZiIV6kck5DH-pY9ftlTg';

// Inicializar mapa
const map = new mapboxgl.Map({ ... });

// Estaciones de todas las líneas
const estaciones = [
  // Línea 1 (naranja)
  { nombre: "Talleres", coords: [-100.374, 25.749], linea: "L1" },
  ...
  // Línea 2 (verde)
  { nombre: "Sendero", coords: [-100.309, 25.795], linea: "L2" },
  ...
  // Línea 3 (azul)
  { nombre: "Hospital Metropolitano", coords: [-100.310, 25.730], linea: "L3" },
  ...
];

// Poblar selects y marcadores
...
// Función calcularRuta
...
