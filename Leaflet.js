
var map = L.map('map').setView([36.2048, 138.2529], 5);

var sidebar = L.control.sidebar({ container: 'sidebar' }).addTo(map);

// ajout du fond de carte : "ESRI imagerie satellite"
var Esri_WorldImagery = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
    attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
}).addTo(map);


// Création d'un contrôle personnalisé pour le bouton de plein écran
var fullscreenControl = L.Control.extend({
    onAdd: function(map) {
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
  
      button.onclick = function() {
        toggleFullScreen();
      }
  
      return container;
    },
  });
  
  // Ajout du contrôle personnalisé à la carte Leaflet
  map.addControl(new fullscreenControl({position: 'topleft'}));
  
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

// Fonction pour récupérer et afficher les données GeoJSON
function DisplayHeatmap(url) {
  fetch(url)
      .then(response => response.json())
      .then(data => {
          // Création d'un tableau pour stocker les données de la carte de chaleur
          var heatData = [];

          // Parcourir les features du GeoJSON
          data.features.forEach(feature => {
              // Extraire les coordonnées de la géométrie de la feature
              var coordinates = feature.geometry.coordinates;

              // Vérifier le type de géométrie (MultiPoint, Point, etc.)
              if (feature.geometry.type === 'MultiPoint') {
                  coordinates.forEach(coord => {
                      // Ajouter les coordonnées et la valeur de radiation à la liste des données de chaleur
                      heatData.push([coord[1], coord[0], feature.properties.radiation]);
                  });
              } else if (feature.geometry.type === 'Point') {
                  // Ajouter les coordonnées et la valeur de radiation à la liste des données de chaleur
                  heatData.push([coordinates[1], coordinates[0], feature.properties.radiation]);
              }
          });

          // Création de la couche de chaleur avec les données récupérées
          var heatLayer = L.heatLayer(heatData, {
              radius: 25,
              blur: 15,
              maxZoom: 18,
          }).addTo(map);
      })
}


// Appel de la fonction fetchGeoJSONAndDisplayHeatmap avec l'URL de votre fichier GeoJSON
DisplayHeatmap('data/Heatmap-japon.geojson');

