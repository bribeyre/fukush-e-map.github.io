const map = L.map('map', {
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
  onAdd: function (map) {
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
  var elem = document.getElementById('map');
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


  var prefectureVisible = true;
  var municipaliteVisible = true;
  
  document.getElementById('togglePrefecture').addEventListener('click', function () {
    toggleLayer(prefectureLayer, 'togglePrefecture');
  });
  
  document.getElementById('toggleMunicipalite').addEventListener('click', function () {
    toggleLayer(municipaliteLayer, 'toggleMunicipalite');
  });
  
  function toggleLayer(layer, buttonId) {
    if (map.hasLayer(layer)) {
      map.removeLayer(layer);
      if (buttonId === 'togglePrefecture') {
        prefectureVisible = false;
      } else if (buttonId === 'toggleMunicipalite') {
        municipaliteVisible = false;
      }
      document.getElementById(buttonId).textContent = 'Afficher ' + buttonId.split('toggle')[1];
    } else {
      layer.addTo(map);
      if (buttonId === 'togglePrefecture') {
        prefectureVisible = true;
      } else if (buttonId === 'toggleMunicipalite') {
        municipaliteVisible = true;
      }
      document.getElementById(buttonId).textContent = 'Masquer ' + buttonId.split('toggle')[1];
    }
  }
  
  // Fetch pour récupérer les données des municipalités
  fetch('data/municipalite.geojson')
    .then(response => response.json())
    .then(data => {
      municipaliteLayer = L.geoJSON(data, {
        style: function (feature) {
          return {
            fillColor: 'white',
            fillOpacity: 0.3,
            color: 'white',
            weight: 1
          };
        },
        onEachFeature: function (feature, layer) {
          var popupmunicipalite = "<b>Nom municipalitée: </b>" + feature.properties.commune + "<br>" +
            "<b>Résidant en 2011: </b>" + feature.properties['2011'] + "<br>" +
            "<b>Résidant en 2013: </b>" + feature.properties['2013'] + "<br>" +
            "<b>Résidant en 2014: </b>" + feature.properties['2014'] + "<br>" +
            "<b>Résidant en 2015: </b>" + feature.properties['2015'] + "<br>" +
            "<b>Résidant en 2016: </b>" + feature.properties['2016'] + "<br>" +
            "<b>Résidant en 2017: </b>" + feature.properties['2017'];
          layer.bindPopup(popupmunicipalite);
        }
      }).addTo(map);
    })
    .catch(error => {
      console.error('Erreur lors du chargement des données des municipalités:', error);
    });
  
  // Fetch pour récupérer les données des préfectures
  fetch('data/prefecture.geojson')
    .then(response => response.json())
    .then(data => {
      prefectureLayer = L.geoJSON(data, {
        style: function (feature) {
          return {
            fillColor: 'white',
            fillOpacity: 0,
            color: 'grey',
            weight: 2
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
  

// Fin code julien