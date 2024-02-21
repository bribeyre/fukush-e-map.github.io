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