// Code Citation:
// https://bl.ocks.org/d3noob/9150014
function createMap() {
    
    var map = L.map('map').setView([41.8781, -87.6298], 12);
    mapLink = 
        '<a href="http://openstreetmap.org">OpenStreetMap</a>';
    L.tileLayer(
        'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; ' + mapLink + ' Contributors',
        maxZoom: 18,
        }).addTo(map);

    
    for (var i = 0; i < coordinates.length; i++) {
        marker = new L.marker([coordinates[i][1],coordinates[i][2]])
            .bindPopup(coordinates[i][0])
            .addTo(map);
    }
}
 // load chart when window loads
function init() {
    createMap();
}

window.onload = init;