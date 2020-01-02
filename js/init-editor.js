// const geoJsonSql = 'SELECT * FROM food2018_v3_ll';
// let selectUrl = `https://ederd.cartodb.com/api/v2/sql?format=geojson&q=${geoJsonSql}`;

// const selectSql = 'SELECT * FROM markers';
const selectSql = 'SELECT cartodb_id, the_geom, name, description, category, contributor, TO_CHAR(date, \'YYYY-MM-DD\') AS date FROM markers';
const selectUrl = `https://geomo.carto.com/api/v2/sql?format=geojson&q=${selectSql}`;

let cartodb = L.tileLayer.provider('CartoDB.Positron');

// let drawingLayer = new L.FeatureGroup();
let clusters = L.markerClusterGroup({
  showCoverageOnHover: false
});
// https://support.flaticon.com/hc/en-us/articles/207248209-How-I-must-insert-the-attribution-
clusters.getAttribution = () => 'Icons made by <a href="https://www.flaticon.com/authors/vectors-market" title="Vectors Market">Vectors Market</a> from <a href="https://www.flaticon.com/" title="Flaticon">www.flaticon.com</a>';

let map = L.map('map', {
  center: [44.8825, -65.163889],
  zoom: 10,
  layers: [cartodb, clusters]
});

map.attributionControl.setPrefix('<a href="https://www.nscc.ca/explorenscc/campuses/cogs/" target="_blank">COGS</a>/<a href="https://www.geomo.ch" target="_blank">Thomas Zuberbühler</a>');

// let baseLayers = {
//   'Basemap': cartodb
// };
// let layers = {
//   'Markers': drawingLayer
// };
// let layerProperties = {
//   collapsed: false
// };
// L.control.layers(baseLayers, layers, layerProperties).addTo(map);

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
L.control.locate({
  flyTo: true,
  icon: 'fa fa-location-arrow fa-xs'
}).addTo(map);
L.Control.geocoder().addTo(map);

const editor = new Editor('editModal', clusters);

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
      if (markerIcons[feature.properties.category] != undefined) {
        return L.marker(latLong, { icon: markerIcons[feature.properties.category] });
      }
      return L.marker(latLong);
    }
  }).addTo(clusters);

  editor.setAlternativeDrawingLayer(geoJsonLayer);

});
