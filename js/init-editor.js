// const geoJsonSql = 'SELECT * FROM food2018_v3_ll';
// let selectUrl = `https://ederd.cartodb.com/api/v2/sql?format=geojson&q=${geoJsonSql}`;

// const selectSql = 'SELECT * FROM markers';
const selectSql = 'SELECT cartodb_id, the_geom, name, description, category, contributor, TO_CHAR(date, \'YYYY-MM-DD\') AS date FROM markers';
const selectUrl = `https://geomo.carto.com/api/v2/sql?format=geojson&q=${selectSql}`;

let cartodb = L.tileLayer.provider('CartoDB.Positron');
let cartodbMinimap = L.tileLayer.provider('CartoDB.Positron');

// let geonames = L.tileLayer.wms('https://nsgiwa.novascotia.ca/arcgis/services/BASE/BASE_NS_GeoNAMES_pnt_UT83/MapServer/WmsServer?', {
//   layers: 'Municipalities',
//   format: 'png8',
//   transparent: true,
//   attribution: "GeoNova",
//   maxZoom: 50,
//   minZoom: 3,
// });

// let drawingLayer = new L.FeatureGroup();
let clusters = L.markerClusterGroup({
  showCoverageOnHover: false
});
// icon attribution
clusters.getAttribution = () => 'Icons made by <a href="https://www.flaticon.com/authors/vectors-market" title="Vectors Market">Vectors Market</a> from <a href="https://www.flaticon.com/" title="Flaticon">www.flaticon.com</a>';

const markerContextMenu = [{
  text: 'Edit',
  index: 0,
  callback: (e) => editor.startUpdateFeature(e.relatedTarget)
}, {
  text: 'Delete',
  index: 1,
  callback: (e) => {
    editor.selectedLayer = e.relatedTarget;
    editor.delete();
  }
}, {
  separator: true,
  index: 2
}];

let map = L.map('map', {
  center: [44.8825, -65.163889],
  zoom: 10,
  layers: [cartodb, clusters],
  contextmenu: true,
  contextmenuItems: [{
    text: 'Create',
    index: 4,
    callback: (e) => editor.startCreateFeature(new L.Marker([e.latlng.lat, e.latlng.lng], {
      contextmenu: true,
      contextmenuItems: markerContextMenu
    }))
  }]
});
map.attributionControl.setPrefix('Web Application by Ed Symons (<a href="https://www.nscc.ca/explorenscc/campuses/cogs/" target="_blank">COGS</a>) and <a href="https://www.geomo.ch" target="_blank">Thomas Zuberbühler</a>');

L.control.scale().addTo(map);
new L.Control.MiniMap(cartodbMinimap).addTo(map);

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

map.on(L.Draw.Event.CREATED, (e) => {
  // recreating a marker in order to add context menu
  editor.startCreateFeature(new L.Marker([e.layer._latlng.lat, e.layer._latlng.lng], {
    contextmenu: true,
    contextmenuItems: markerContextMenu
  }));
});

// map.on(L.Draw.Event.DRAWSTOP, e => {
//   editor.startUpdateFeature(e.layer);
// });

$.getJSON(selectUrl, data => {

  geoJsonLayer = L.geoJson(data, {
    onEachFeature: (feature, layer) => {
      layer.on('click', () => editor.startUpdateFeature(layer));
      layer.bindTooltip(`<b>${feature.properties.name}</b>`, {
        direction: 'top',
        offset: L.point(-2, -17)
      });
    },
    pointToLayer: (feature, latLong) => {
      if (markerIcons[feature.properties.category] != undefined) {
        return L.marker(latLong, {
          icon: markerIcons[feature.properties.category],
          contextmenu: true,
          contextmenuItems: markerContextMenu
        });
      }
      return L.marker(latLong, {
        contextmenu: true,
        contextmenuItems: markerContextMenu
      });
    }
  }).addTo(clusters);

  editor.setAlternativeDrawingLayer(geoJsonLayer);

});
