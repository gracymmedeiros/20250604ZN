// Inicializa o mapa MapLibre no centro do RS
const map = new maplibregl.Map({
  container: 'map',
  style: 'https://demotiles.maplibre.org/style.json',
  center: [-52.0, -30.7],
  zoom: 6
});

// Adiciona controle de zoom
map.addControl(new maplibregl.NavigationControl());

// Função para alternar tela cheia
function entrarTelaCheia() {
  const elemento = document.documentElement;
  if (elemento.requestFullscreen) {
    elemento.requestFullscreen();
  } else if (elemento.mozRequestFullScreen) {
    elemento.mozRequestFullScreen();
  } else if (elemento.webkitRequestFullscreen) {
    elemento.webkitRequestFullscreen();
  } else if (elemento.msRequestFullscreen) {
    elemento.msRequestFullscreen();
  }
}

function sairTelaCheia() {
  if (document.exitFullscreen) {
    document.exitFullscreen();
  } else if (document.mozCancelFullScreen) {
    document.mozCancelFullScreen();
  } else if (document.webkitExitFullscreen) {
    document.webkitExitFullscreen();
  } else if (document.msExitFullscreen) {
    document.msExitFullscreen();
  }
}

const fullscreenBtn = document.getElementById('fullscreen-btn');
fullscreenBtn.addEventListener('click', () => {
  if (!document.fullscreenElement) {
    entrarTelaCheia();
  } else {
    sairTelaCheia();
  }
});

// Carrega o GeoJSON dos municípios do RS
map.on('load', () => {
fetch("data/RS_Municipios_2024.json")
  .then(response => response.json())
  .then(geojsonData => {
    map.addSource('municipios', {
      type: 'geojson',
      data: geojsonData
    });

    map.addLayer({
      id: 'municipios-fill',
      type: 'fill',
      source: 'municipios',
      paint: {
        'fill-color': '#ccc',
        'fill-opacity': 0.4
      }
    });

    map.addLayer({
      id: 'municipios-border',
      type: 'line',
      source: 'municipios',
      paint: {
        'line-color': '#000',
        'line-width': 1
      }
    });

    // ⬇️ Aqui ele centraliza o mapa automaticamente no RS
    const bounds = new maplibregl.LngLatBounds();
    geojsonData.features.forEach(function(feature) {
      const coords = feature.geometry.coordinates.flat(Infinity);
      coords.forEach(coord => bounds.extend(coord));
    });
    map.fitBounds(bounds, { padding: 20 });
  });


      // Popup ao clicar nos municípios
      map.on('click', 'municipios-fill', (e) => {
        const nome = e.features[0].properties.NOME || 'Município';
        new maplibregl.Popup()
          .setLngLat(e.lngLat)
          .setHTML(`<strong>${nome}</strong>`)
          .addTo(map);
      });

      map.on('mouseenter', 'municipios-fill', () => {
        map.getCanvas().style.cursor = 'pointer';
      });

      map.on('mouseleave', 'municipios-fill', () => {
        map.getCanvas().style.cursor = '';
      });

      // Lista na lateral
      const lista = document.getElementById('municipios-list');
      const nomes = geojsonData.features
        .map(f => f.properties.NOME)
        .filter(Boolean)
        .sort((a, b) => a.localeCompare(b));

      nomes.forEach(nome => {
        const li = document.createElement('li');
        li.textContent = nome;
        li.onclick = () => {
          const feature = geojsonData.features.find(f => f.properties.NOME === nome);
          if (feature) {
            const coords = feature.geometry.coordinates[0][0];
            const lng = coords[0][0];
            const lat = coords[0][1];
            map.flyTo({ center: [lng, lat], zoom: 9 });
          }
        };
        lista.appendChild(li);
      });
    });
});
