let map = L.map('mapContainer1', {
  zoomControl: false
}).setView([36.2048, 138.2529], 5);
L.control.scale({
  position: 'topright'
}).addTo(map);
L.control.zoom({
  position: 'bottomright'
}).addTo(map);

const sidepanelLeft = L.control.sidepanel('mySidepanelLeft', {
  tabsPosition: 'left',
  startTab: 'tab-1'
}).addTo(map);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);
// Création d'un contrôle personnalisé pour le bouton de plein écran
var fullscreenControl = L.Control.extend({
  onAdd: function () {
    var container = L.DomUtil.create('div', 'leaflet-bar leaflet-control');
    var button = L.DomUtil.create('a', 'leaflet-bar-part leaflet-control-custom', container);
    button.innerHTML = '<i class="fas fa-expand"></i>'; // icône pour entrer en plein écran par défaut
    button.href = '#';
    button.role = 'button';
    button.style.backgroundColor = 'white';
    button.style.width = '30px';
    button.style.height = '30px';
    button.style.borderRadius = '5px';
    button.style.boxShadow = '0 1px 4px rgba(0, 0, 0, 0.3)';
    button.style.textAlign = 'center';
    button.style.lineHeight = '30px';
    button.style.textDecoration = 'none';
    button.style.color = '#333';
    button.style.fontFamily = 'sans-serif';
    button.style.fontSize = '12px';
    button.style.fontWeight = 'bold';

    button.onclick = function () {
      toggleFullScreen();
    }

    return container;
  },
});

// Ajout du contrôle personnalisé à la carte Leaflet
map.addControl(new fullscreenControl({ position: 'bottomright' }));

// Fonction pour mettre la carte en plein écran
function toggleFullScreen() {
  var elem = document.getElementById('map-container-wrapper');
  var button = document.querySelector('.leaflet-control-custom');

  if (!document.fullscreenElement) {
    elem.requestFullscreen().catch(err => {
      alert(`Error attempting to enable full-screen mode: ${err.message} (${err.name})`);
    });
    button.innerHTML = '<i class="fas fa-compress"></i>'; // icône pour sortir du plein écran
  } else {
    if (document.exitFullscreen) {
      document.exitFullscreen();
    }
    button.innerHTML = '<i class="fas fa-expand"></i>'; // icône pour entrer en plein écran
  }
}


// ZOOM TO JAPAN
function zoomToJapan() {
  map.setView([36.2048, 138.2529], 5);
  // Centrer et zoomer sur l'ensemble du Japon
  map.fitBounds(bounds, { padding: [50, 50] }); // Vous pouvez ajuster le padding selon vos besoins
}

function zoomToFukushima() {
  map.flyTo([37.402725, 140.296440], 10, {
    duration: 1, // Durée du déplacement en secondes
    easeLinearity: 0. // Facteur de linéarité de l'animation
  });
}


var geojsonLayer = L.geoJSON().addTo(map);

// Utiliser Fetch pour charger le fichier GeoJSON
function addGeoJSONLayer(url) {
  // Utiliser Fetch pour charger le fichier GeoJSON depuis l'URL spécifiée
  fetch(url)
    .then(response => {
      // Vérifier si la réponse est OK (code de statut 200)
      if (!response.ok) {
        throw new Error('Erreur lors du chargement du fichier GeoJSON');
      }
      // Convertir la réponse en JSON
      return response.json();
    })
    .then(data => {
      // Ajouter les données GeoJSON à la couche GeoJSON
      geojsonLayer.addData(data);
    })
    .catch(error => {
      // Gérer les erreurs
      console.error('Erreur Fetch:', error);
    });
}


var geojsonLayer; // Déclaration de la variable pour stocker la couche GeoJSON
var data; // Déclaration de la variable data

// Utilisez fetch pour charger les données depuis un fichier local
fetch('data/individus.geojson')
  .then(response => response.json())
  .then(jsonData => {
    // Stocker les données dans la variable data globale
    data = jsonData;

    // Événement de changement sur le formulaire de sélection d'année
    document.getElementById('id_dilemSelect').addEventListener('change', function () {
      var selectedid_dilem = this.value;
      // Vérifier si une option a été sélectionnée
      if (selectedid_dilem !== "") {
        // Supprimer la couche GeoJSON existante s'il y en a une
        if (geojsonLayer) {
          map.removeLayer(geojsonLayer);
        }
        // Création de la couche GeoJSON si une option est sélectionnée
        geojsonLayer = L.geoJSON(data, {
          pointToLayer: function (feature, latlng) {
            // Personnalisez le marqueur pour chaque point
            return L.circleMarker(latlng, {
              radius: 8,
              fillColor: 'blue',
              color: '#000',
              weight: 1,
              opacity: 1,
              fillOpacity: 0.8
            });
          },
          onEachFeature: function (feature, layer) {
            // Ajout d'une popup à chaque élément de la couche GeoJSON
            if (feature.properties && feature.properties.ID_DILEM) {
              var statut = feature.properties.Statut ? feature.properties.Statut : "";
              layer.bindPopup(feature.properties.ID_DILEM + '<br>' + feature.properties.Annee + '<br>' + statut);
            }
          }
        }).addTo(map);

        // Mettre à jour les éléments de la couche GeoJSON en fonction de l'année sélectionnée
        updateData(selectedid_dilem);
      } else {
        // Si aucune option n'est sélectionnée, supprimer la couche GeoJSON de la carte
        if (geojsonLayer) {
          map.removeLayer(geojsonLayer);
        }
      }
    });
  })
  .catch(error => {
    console.error('Erreur de chargement des données :', error);
  });

// Fonction pour mettre à jour les éléments de la couche GeoJSON en fonction de l'ID sélectionné
function updateData(id_dilem) {
  geojsonLayer.clearLayers();
  var filteredFeatures = data.features.filter(function (feature) {
    console.log('Feature ID_DILEM:', feature.properties.ID_DILEM, ' | Selected ID_DILEM:', id_dilem);
    // Comparaison des ID en tant que chaînes de caractères
    return feature.properties.ID_DILEM === id_dilem;
  });
  console.log('Nombre d\'entités filtrées pour l\'ID', id_dilem, ':', filteredFeatures.length);
  geojsonLayer.addData({ type: 'FeatureCollection', features: filteredFeatures });
}

// ajout julien 

// On importe la futur symbologie de la centrale nucléaire qui sera une image
var customIcon = L.icon({
  iconUrl: 'img/centrale.png',
  iconSize: [32, 32]
});

// Ajout de la couche GeoJSON de la centrale et d'une popup affichant son nom au click
function ChargerCentrale() {
  return fetch('data/centrale.geojson')
    .then(response => response.json());
}

ChargerCentrale()
  .then(data => {
    L.geoJSON(data, {
      pointToLayer: function (feature, latlng) {
        var marker = L.marker(latlng, { icon: customIcon });
        var popupContent = feature.properties.Nom;
        marker.bindPopup(popupContent);
        return marker;
      }
    }).addTo(map);
  })
  .catch(error => {
    console.error('Erreur lors du chargement des données:', error);
  });

// Affichage de la prefecture
var prefectureVisible = true;

document.getElementById('togglePrefecture').addEventListener('click', function () {
  toggleLayer(prefectureLayer, 'togglePrefecture');
});

function toggleLayer(layer, buttonId) {
  var button = document.getElementById(buttonId);
  if (map.hasLayer(layer)) {
    map.removeLayer(layer);
    prefectureVisible = false;
    button.innerHTML = '<i class="fas fa-eye"></i> Afficher ' + buttonId.split('toggle')[1];
  } else {
    layer.addTo(map);
    prefectureVisible = true;
    button.innerHTML = '<i class="fas fa-eye-slash"></i> Masquer ' + buttonId.split('toggle')[1];
  }
}


// Fetch pour récupérer les données des préfectures
fetch('data/prefecture.geojson')
  .then(response => response.json())
  .then(data => {
    prefectureLayer = L.geoJSON(data, {
      style: function (feature) {
        return {
          fillColor: 'white',
          fillOpacity: 0.3,
          color: 'grey',
          weight: 1.25
        };
      },
      onEachFeature: function (feature, layer) {
        var popupprefecture = "<b>Nom préfecture: </b>" + feature.properties.prefecture + "<br>" +
          "<b>Résidant en 2011: </b>" + feature.properties['2011'] + "<br>" +
          "<b>Résidant en 2013: </b>" + feature.properties['2013'] + "<br>" +
          "<b>Résidant en 2014: </b>" + feature.properties['2014'] + "<br>" +
          "<b>Résidant en 2015: </b>" + feature.properties['2015'] + "<br>" +
          "<b>Résidant en 2016: </b>" + feature.properties['2016'] + "<br>" +
          "<b>Résidant en 2017: </b>" + feature.properties['2017'];
        layer.bindPopup(popupprefecture);
      }
    }).addTo(map);
  })
  .catch(error => {
    console.error('Erreur lors du chargement des données des préfectures:', error);
  });


// AJOUTER BASTIEN HEATMAP
 var map2;


    // Fonction pour créer et afficher la deuxième carte et la heatmap
    function showSecondMapAndHeatmap() {
      // Afficher ou cacher la deuxième carte en fonction de l'état de la checkbox
      var mapContainer2 = document.getElementById('mapContainer2');
      mapContainer2.style.display = document.getElementById('showSecondMapCheckbox').checked ? 'block' : 'none';

      // Si la carte est affichée, créer une carte Leaflet centrée sur New York, USA
      if (mapContainer2.style.display === 'block') {
        map2 = L.map('mapContainer2').setView([36.2048, 138.2529], 5);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(map2);

        // Si la checkbox est cochée, afficher la heatmap
        if (document.getElementById('showSecondMapCheckbox').checked) {
          fetchHeatmapData(map2);
        }

        // Synchroniser les mouvements des deux cartes
        syncMaps();
      }
    }

    // Fonction pour récupérer les données de la heatmap et afficher la heatmap sur map2
    function fetchHeatmapData(map2) {
      fetch('data/Heatmap.geojson')
        .then(response => response.json())
        .then(data => {
          var heatData = [];
          var features = data.features;
          features.forEach(function (feature) {
            var coordinates = feature.geometry.coordinates;
            var radiationValue = feature.properties.radiation;
            heatData.push([coordinates[0][1], coordinates[0][0], radiationValue]);
          });
          // Créer la heatmap avec les données et l'ajouter à map2
          var heat = L.heatLayer(heatData, {
            radius: 20,
            gradient: {
              0.25: 'blue',   // Low values
              0.5: 'lime',    // Moderate values
              0.75: 'yellow', // High values
              1: 'red'        // Maximum values
            }
          }).addTo(map2);
        })
        .catch(error => {
          console.error('Erreur lors du chargement des données de la heatmap:', error);
        });
    }

    // Fonction pour synchroniser les mouvements des deux cartes
    function syncMaps() {
      map.on('move', function () {
        map2.setView(map.getCenter(), map.getZoom(), { animate: false });
      });
      map2.on('move', function () {
        map.setView(map2.getCenter(), map2.getZoom(), { animate: false });
      });
    }

    // Ajouter un écouteur d'événements au changement de l'état de la checkbox pour la deuxième carte et la heatmap
    document.getElementById('showSecondMapCheckbox').addEventListener('change', function () {
      showSecondMapAndHeatmap();
    });
// FIN AJOUT HEAMAP