let osm = L.tileLayer.provider('OpenStreetMap.Mapnik');

let map = L.map('map', {
  center: [44.8825, -65.163889],
  zoom: 10,
  layers: [osm]
});

let baseLayers = {
  "Open Street Map": osm
};

// L.PM.initialize({ optIn: true });

map.pm.addControls({
  position: 'topleft',
  drawCircle: false,
  drawCircleMarker: false,
  drawPolyline: false,
  drawPolygon: false,
  drawRectangle: false,
  cutPolygon: false
});

map.on('pm:create', e => {
  $('#exampleModal').modal('show');
  console.log(e); 
});

L.control.scale().addTo(map);
L.control.layers(baseLayers).addTo(map);