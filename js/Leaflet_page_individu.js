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

// PLEIN ECRAN
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

// PLEIN ECRAN FIN


// DEBUT ZOOM TO JAPAN
function zoomToJapan() {
  // Définir une étendue qui couvre l'ensemble du Japon
  var bounds = [
    [20.0, 122.0], // Coin sud-ouest
    [45.0, 155.0]  // Coin nord-est
  ];

  // Centrer et zoomer sur l'ensemble du Japon
  map.fitBounds(bounds, { padding: [50, 50] ,maxZoom: 6}); // Vous pouvez ajuster le padding selon vos besoins
}

function zoomToFukushima() {
  map.flyTo([37.41209716212062, 140.11240156125362], 10,{
    duration: 1, // Durée du déplacement en secondes
    easeLinearity: 0. // Facteur de linéarité de l'animation
  }); // Centrer sur Fukushima
}
// FIN ZOOM TO JAPAN FIN

// DEBUT PREFECTURE

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

// FIN PREFECTURE

// FIN CODE COMMUN A CHAQUE PAGE

// CODE PAGE INDIVIDUELLE

var toggleButton1 = document.getElementById('toggleLayer1');
var toggleButton2 = document.getElementById('toggleLayer2');

// État initial des couches (visibles)
var layer1Visible = true;
var layer2Visible = true;

// Ajout d'un écouteur d'événements au clic sur le bouton de bascule
toggleButton1.addEventListener('click', function () {
  if (layer1Visible) {
    // Masquer la couche 1 si elle est actuellement visible
    map.removeLayer(individusLayer);
    map.removeLayer(polyline); // Supprimer la polyligne lorsque la couche est masquée
    layer1Visible = false;
    // Mettre à jour l'icône du bouton
    toggleButton1.innerHTML = '<i class="far fa-eye-slash"></i>';
  } else {
    // Afficher la couche 1 si elle est actuellement masquée
    individusLayer.addTo(map);
    if (polyline) {
      map.addLayer(polyline); // Ajouter la polyligne lorsque la couche est affichée
    }
    layer1Visible = true;
    // Mettre à jour l'icône du bouton
    toggleButton1.innerHTML = '<i class="far fa-eye"></i>';
  }
});

// Ajout d'un écouteur d'événements au clic sur le bouton de bascule pour la couche 2
toggleButton2.addEventListener('click', function () {
  if (layer2Visible) {
    // Masquer la couche 2 si elle est actuellement visible
    map.removeLayer(fukushimaLayer);
    layer2Visible = false;
    // Mettre à jour l'icône du bouton
    toggleButton2.innerHTML = '<i class="far fa-eye-slash"></i>';
  } else {
    // Afficher la couche 2 si elle est actuellement masquée
    fukushimaLayer.addTo(map);
    layer2Visible = true;
    // Mettre à jour l'icône du bouton
    toggleButton2.innerHTML = '<i class="far fa-eye"></i>';
  }
});



// Couche INDIVIDU 



var individusLayer = L.geoJSON().addTo(map);
var polyline = null; // Déclaration de la variable globale pour la polyligne

// Utiliser Fetch pour charger le fichier GeoJSON
function addindividusLayer(url) {
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
    .then(jsonData => {
      // Stocker les données dans la variable data globale
      data = jsonData;

      // Événement de changement sur le formulaire de sélection d'année
      document.getElementById('id_dilemSelect').addEventListener('change', function () {
        var selectedid_dilem = this.value;
        // Vérifier si une option a été sélectionnée
        if (selectedid_dilem !== "") {
          // Supprimer la couche GeoJSON existante s'il y en a une
          if (individusLayer) {
            map.removeLayer(individusLayer);
          }
          // Création de la couche GeoJSON si une option est sélectionnée
          individusLayer = L.geoJSON(data, {
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
          if (individusLayer) {
            map.removeLayer(individusLayer);
          }
          // Appeler updateData() avec un argument vide pour supprimer les lignes
          updateData("");
        }
      });
    })
    .catch(error => {
      console.error('Erreur de chargement des données :', error);
    });
}


// Fonction pour mettre à jour les éléments de la couche GeoJSON en fonction de l'ID sélectionné
function updateData(id_dilem) {
  individusLayer.clearLayers();
  var filteredFeatures = data.features.filter(function (feature) {
    return feature.properties.ID_DILEM === id_dilem;
  });
  console.log('Nombre de points filtrés par l\'ID', id_dilem, ':', filteredFeatures.length);
  individusLayer.addData({ type: 'FeatureCollection', features: filteredFeatures });

  // Supprimer la polyligne si elle existe
  if (polyline) {
    map.removeLayer(polyline);
    polyline = null;
  }

  // Créer une nouvelle polyligne entre les points avec des flèches
  var points = [];
  individusLayer.eachLayer(function (layer) {
    points.push(layer.getLatLng());
  });

  polyline = L.polyline(points, {
    color: 'red',
    weight: 2,
    opacity: 0.7,
    dashArray: '5, 10' // Optionnel : un trait en pointillés
  });

  if (layer1Visible) {
    // Ajouter la polyligne si la couche est actuellement affichée
    polyline.addTo(map);
  }
}
// Appel de la fonction addindividusLayer avec l'URL de votre fichier GeoJSON
addindividusLayer("data/individus.geojson");





// AJOUT FUKUSHIMA LAYER



var fukushimaLayer = L.geoJSON().addTo(map);
var dataFukushima; // Déclaration de la variable dataFukushima

function addFukushimaLayer(url) {
  fetch(url)
    .then(response => {
      if (!response.ok) {
        throw new Error('Erreur lors du chargement du fichier GeoJSON');
      }
      return response.json();
    })
    .then(jsonData => {
      dataFukushima = jsonData;

      // Événement de changement sur le formulaire de sélection d'année
      document.getElementById('id_dilemSelect').addEventListener('change', function () {
        var selectedid_dilem = this.value;
        if (selectedid_dilem !== "") {
          if (fukushimaLayer) {
            map.removeLayer(fukushimaLayer);
          }
          fukushimaLayer = L.geoJSON(dataFukushima, {
            style: function (feature) {
              return {
                fillColor: feature.properties.Zone === 1 ? 'lightgreen' : 'darkred',
                color: '#000',
                weight: 2,
                opacity: 1,
                fillOpacity: 0.5
              };
            }
          });

          // Mettre à jour les entités Fukushima lors de la sélection d'une option
          updateFukushima(selectedid_dilem);
        }
      });
    })
    .catch(error => {
      console.error('Erreur de chargement des données :', error);
    });
}

// Fonction pour mettre à jour les entités de Fukushima en fonction de l'ID sélectionné et de l'année
function updateFukushima(id_dilem, selectedYear) {
  selectedYear = selectedYear || 2013;
  if (!fukushimaLayer) {
    return; // Sortie si la couche Fukushima n'a pas été ajoutée
  }

  fukushimaLayer.clearLayers();
  var filteredFeatures = dataFukushima.features.filter(function (feature) {
    return feature.properties.ID_DILEM === id_dilem && feature.properties.Annee === selectedYear; // Filtrer par l'année spécifiée
  });
  console.log('Nombre de dessins filtrés par l\'ID', id_dilem, 'et année', selectedYear, ':', filteredFeatures.length);
  fukushimaLayer.addData({ type: 'FeatureCollection', features: filteredFeatures });

  // Ajouter la couche Fukushima à la carte si elle n'est pas déjà ajoutée
  if (!map.hasLayer(fukushimaLayer)) {
    fukushimaLayer.addTo(map);
  }
}

// Événement de changement sur le curseur de sélection d'année
document.getElementById('slider').addEventListener('input', function () {
  var selectedYear = parseInt(this.value); // Récupérer la nouvelle année sélectionnée
  var selectedid_dilem = document.getElementById('id_dilemSelect').value; // Récupérer l'ID_DILEM actuellement sélectionné
  updateFukushima(selectedid_dilem, selectedYear); // Mettre à jour les entités Fukushima avec la nouvelle année
});

// Appel de la fonction addFukushimaLayer avec l'URL de votre fichier GeoJSON
addFukushimaLayer("data/fukushima.geojson");


// FIN PAGE INDIVIDUELLE

// TEST LEGENDE 

// Créer et ajouter une légende en bas à droite
var legendIndividu = L.control({position: 'bottomright'});

legendIndividu.onAdd = function (map) {
  var div = L.DomUtil.create('div', 'legendIndiv');
  div.innerHTML += '<h5>Perception du risques</h5>';

  // Ajouter deux carrés de couleur avec des légendes
  div.innerHTML += '<div style="background-color: #afe9ad; width: 20px; height: 20px; display: inline-block; margin-right: 5px;"></div> Zone sure <br>';
  div.innerHTML += '<div style="background-color: #ae7264; width: 20px; height: 20px; display: inline-block; margin-right: 5px;"></div> Zon dangereuse <br>';

  return div;
};

legendIndividu.addTo(map);


// MASQUER LA TRAJECTOIRE 
document.getElementById('id_dilemSelect').addEventListener('change', function() {
  var selectedValue = this.value;
  var trajectoireSection = document.getElementById('individu_section');
  var fukushimaDataSection = document.getElementById('fukushima_section');

  // Si une option est sélectionnée, afficher la section de trajectoire et la couche Fukushima
  // Sinon, les masquer
  if (selectedValue !== '') {
      trajectoireSection.style.display = 'block';
      fukushimaDataSection.style.display = 'block';
  } else {
      trajectoireSection.style.display = 'none';
      fukushimaDataSection.style.display = 'none';
      // Masquer la trajectoire
      if (polyline) {
        map.removeLayer(polyline);
      }
      // Masquer la couche Fukushima
      if (map.hasLayer(fukushimaLayer)) {
        map.removeLayer(fukushimaLayer);
      }
  }
});
