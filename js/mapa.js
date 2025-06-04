// Inicializa o mapa no centro com um nível de zoom
const mapa = L.map('map', {
  attributionControl: false
}).setView([-30.7, -52.0], 7);

L.tileLayer('https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
  maxZoom: 20
}).addTo(mapa);

// Função para ativar a tela cheia
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

// Função para sair da tela cheia
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

// Alternar tela cheia ao clicar no botão
const fullscreenBtn = document.getElementById('fullscreen-btn');
fullscreenBtn.addEventListener('click', () => {
  if (!document.fullscreenElement) {
    entrarTelaCheia();
  } else {
    sairTelaCheia();
  }
});

// Lista de arquivos CSV e cores
const arquivos = [
  { nome: "jaguarao.csv", cor: "#e6194b" },
  { nome: "camaqua.csv", cor: "#3cb44b" },
  { nome: "cachoeiradosul.csv", cor: "#4363d8"},
  { nome: "cangucu.csv", cor: "#f58231"},
  { nome: "chuvisca.csv", cor: "#9a6324"},
  { nome: "cristal.csv", cor: "#42d4f4"},
  { nome: "domfeliciano.csv", cor: "#f032e6"},
  { nome: "pedroosorio.csv", cor: "#ffe119"},
  { nome: "pelotas.csv", cor: "#3e227a"},
  { nome: "portoalegre.csv", cor: "#911eb4"},
  { nome: "santavitoriadopalmar.csv", cor: "#6dbf2e"},
  { nome: "saojosedonorte.csv", cor: "#469990"},
  { nome: "saolourencodosul.csv", cor: "#fa1616"},
  { nome: "vacaria.csv", cor: "#008080"},
  { nome: "votosmunicipios2.csv", cor: "#5e5e5e"},
  { nome: "arroiogrande.csv", cor: "#800000"},
  { nome: "palmaresdosul.csv", cor: "#091e4f"},
  { nome: "amaralferrador.csv", cor: "#f2ea07"},
  { nome: "dompedrito.csv", cor: "#26bf91"},
  { nome: "capaodoleao.csv", cor: "#de12ae"},
  { nome: "canoas.csv", cor: "#13780a"},
  { nome: "cerrograndedosul.csv", cor: "#150f61"},
  { nome: "esteio.csv", cor: "#0a4a78"},
  { nome: "turucu.csv", cor: "#54b807"}
];

const camadasLocais = L.layerGroup();
const camadaMunicipios = L.layerGroup();

// Carrega locais de votação
arquivos.forEach(arquivo => {
  Papa.parse(`data/${arquivo.nome}`, {
    download: true,
    header: true,
    delimiter: ";",
    complete: function(results) {
      results.data.forEach(linha => {
        const votos = parseInt(linha.Votos);
        const lat = parseFloat(linha.Latitude);
        const lon = parseFloat(linha.Longitude);

        if (!isNaN(lat) && !isNaN(lon) && !isNaN(votos) && votos > 0) {
          const marcador = L.circleMarker([lat, lon], {
            radius: Math.sqrt(votos),
            color: arquivo.cor,
            fillColor: arquivo.cor,
            fillOpacity: 0.7,
            weight: 10,     // borda invisível mais grossa
            opacity: 0,     // invisível mas interativa
            interactive: true
          }).addTo(camadasLocais);

          marcador.bindPopup(`<strong>${linha.Local}</strong><br>Votos: ${votos}`);
        }
      });
    }
  });
});

// Cores por município
const coresPorMunicipio = {
  "PELOTAS": "#3e227a",
  "CAMAQUÃ": "#3cb44b",
  "JAGUARÃO": "#e6194b",
  "CACHOEIRA DO SUL": "#4363d8",
  "CANGUÇU": "#f58231",
  "CHUVISCA": "#9a6324",
  "CRISTAL": "#42d4f4",
  "DOM FELICIANO": "#f032e6",
  "PEDRO OSÓRIO": "#ffe119",
  "PORTO ALEGRE": "#911eb4",
  "SANTA VITÓRIA DO PALMAR": "#6dbf2e",
  "SÃO JOSÉ DO NORTE": "#469990",
  "SÃO LOURENÇO DO SUL": "#fa1616",
  "VACARIA": "#008080",
  "ARROIO GRANDE": "#800000",
  "PALMARES DO SUL": "#091e4f",
  "AMARAL FERRADOR": "#f2ea07",
  "DOM PEDRITO": "#26bf91",
  "CAPÃO DO LEÃO": "#de12ae",
  "CANOAS": "#13780a",
  "CERRO GRANDE DO SUL": "#150f61",
  "ESTEIO": "#0a4a78",
  "TURUÇU": "#54b807"
};
const corPadrao = "#5e5e5e";

// Carrega CSV de municípios
Papa.parse("data/municipios.csv", {
  download: true,
  header: true,
  delimiter: ";",
  complete: function(results) {
    const municipiosData = [];
    results.data.forEach(linha => {
      const votos = parseInt(linha.Votos);
      const lat = parseFloat(linha.Latitude);
      const lon = parseFloat(linha.Longitude);
      const nome = linha.Local;

      if (!isNaN(lat) && !isNaN(lon) && !isNaN(votos)) {
        const cor = coresPorMunicipio[nome] || corPadrao;
        municipiosData.push({ nome, votos, lat, lon, cor });

        const marcador = L.circleMarker([lat, lon], {
          radius: Math.sqrt(votos) * 0.5,
          color: cor,
          fillColor: cor,
          fillOpacity: 0.7,
          weight: 1
        }).addTo(camadaMunicipios);

        marcador.bindPopup(`<strong>${nome}</strong><br><b>Total:</b> ${votos} votos`);
      }
    });

    municipiosData.sort((a, b) => b.votos - a.votos);

    const listaMunicipios = document.getElementById("municipios-list");
    municipiosData.forEach(municipio => {
      const li = document.createElement("li");
      li.textContent = `${municipio.nome} | ${municipio.votos}`;
      li.onclick = function() {
        mapa.setView([municipio.lat, municipio.lon], 11);
      };
      listaMunicipios.appendChild(li);
    });
  }
});

// Atualiza camadas conforme o zoom
function atualizarCamadas() {
  const zoom = mapa.getZoom();

  if (zoom <= 9) {
    if (!mapa.hasLayer(camadaMunicipios)) mapa.addLayer(camadaMunicipios);
    if (mapa.hasLayer(camadasLocais)) mapa.removeLayer(camadasLocais);
  } else {
    if (!mapa.hasLayer(camadasLocais)) mapa.addLayer(camadasLocais);
    if (mapa.hasLayer(camadaMunicipios)) mapa.removeLayer(camadaMunicipios);
  }
}

// Carrega o mapa GeoJSON com os limites dos municípios do RS
fetch("data/RS_Municipios_2024.json")
  .then(response => response.json())
  .then(geojsonData => {
    L.geoJSON(geojsonData, {
      style: function (feature) {
        const nome = feature.properties.NOME?.toUpperCase();
        return {
          color: "#000", // borda preta
          weight: 1,
          fillColor: coresPorMunicipio[nome] || "#cccccc",
          fillOpacity: 0.3
        };
      },
      onEachFeature: function (feature, layer) {
        const nome = feature.properties.NOME || "Município";
        layer.bindPopup(`<strong>${nome}</strong>`);
      }
    }).addTo(mapa);
  });
