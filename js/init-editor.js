// const geoJsonSql = 'SELECT * FROM food2018_v3_ll';
// let selectUrl = `https://ederd.cartodb.com/api/v2/sql?format=geojson&q=${geoJsonSql}`;

const selectSql = 'SELECT * FROM markers';
const selectUrl = `https://geomo.carto.com/api/v2/sql?format=geojson&q=${selectSql}`;

let osm = L.tileLayer.provider('OpenStreetMap.Mapnik');
let cartodb = L.tileLayer.provider('CartoDB.Voyager');

let drawingLayer = new L.FeatureGroup();

let map = L.map('map', {
  center: [44.8825, -65.163889],
  zoom: 10,
  layers: [osm, drawingLayer]
});

let baseLayers = {
  'Open Street Map': osm,
  'CartoDB Voyager': cartodb
};

let layers = {
  'Drawing Layer': drawingLayer
};

let layerProperties = {
  collapsed: false
};

L.control.layers(baseLayers, layers, layerProperties).addTo(map);
L.control.scale().addTo(map);

map.addControl(new L.Control.Draw({
  edit: false,
  delete: false,
  draw: {
    circle: false,
    polygon: false,
    polyline: false,
    rectangle: false,
    circlemarker: false
  }
}));

const editor = new Editor('editModal', drawingLayer);

map.on(L.Draw.Event.CREATED, e => {
  editor.startCreateFeature(e.layer);
});

// map.on(L.Draw.Event.DRAWSTOP, e => {
//   editor.startUpdateFeature(e.layer);
// });

$.getJSON(selectUrl, data => {
  
  geoJsonLayer = L.geoJson(data, {
    onEachFeature: (feature, layer) => {
      layer.on('click', () => editor.startUpdateFeature(layer));
      layer.bindTooltip(feature.properties.name);
    },
    pointToLayer: (feature, latLong) => {
      return L.marker(latLong);
    }
  }).addTo(drawingLayer);
  
  editor.setAlternativeDrawingLayer(geoJsonLayer);

});
