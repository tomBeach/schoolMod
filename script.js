

// ======= map object =======
var map = L.map('map').setView(new L.LatLng(38.89, -77.00), 11);
var geoJsonLayer;


// ======= tile layer =======
L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);


// ======= hs attendance zones =======

$.ajax({
    dataType: "json",
    url: "attendance_hs.geojson",
}).done(function(jsonData){
    console.log("*** ajax success ***");
    console.dir(jsonData);

    L.geoJson(jsonData).addTo(map);

    geoJsonLayer = L.geoJson(jsonData, {
        style: style,
        onEachFeature: onEachFeature
    }).addTo(map);
    geoJsonLayer.eachLayer(function (layer) {
        console.log("addId");
        layer._leaflet_id = layer.feature.properties.GIS_ID;
    });

}).fail(function(){
    console.log("*** ajax fail ***");
}).error(function() {
    console.log("*** ajax error ***");
});


// ======= ======= ======= STYLES ======= ======= =======
// ======= ======= ======= STYLES ======= ======= =======
// ======= ======= ======= STYLES ======= ======= =======


// ======= ======= ======= getColor ======= ======= =======
function getColor(schoolname) {
    // console.log("getColor");

    // == returns a color based on population density
    switch (schoolname) {
        case 'Anacostia': return "#800026";
        case 'Coolidge': return "orange";      // #BD0026
        case 'Eastern': return "#E31A1C";
        case 'Roosevelt': return "green";      // #FC4E2A
        case 'Spingarn': return "#FD8D3C";
        case 'Woodson, H.D.': return "chartreuse";    // #FEB24C
        case 'Wilson, W.': return "cornflowerblue ";    // "#FEB24C"
        case 'Ballou': return "blue";          // #FFEDA0
        case 'Cardozo': return "#ff0000";
        case 'Dunbar': return "purple";       // #0000ff
    }
}

// ======= ======= ======= style ======= ======= =======
function style(feature) {
    // console.log("style");

    // == fillColor for school zones
    return {
        fillColor: getColor(feature.properties.SCHOOLNAME),
        weight: 1,
        opacity: 1,
        color: 'white',
        dashArray: '',
        fillOpacity: 0.5
    };
}


// ======= ======= ======= BEHAVIORS ======= ======= =======
// ======= ======= ======= BEHAVIORS ======= ======= =======
// ======= ======= ======= BEHAVIORS ======= ======= =======


// ======= ======= ======= onEachFeature ======= ======= =======
function onEachFeature(feature, layer) {
    console.log("onEachFeature");

    // == add listeners on state layers
    layer.on({
        mouseover: highlightFeature,
        mouseout: resetHighlight,
        click: zoomToFeature
    });
}

// ======= ======= ======= zoomToFeature ======= ======= =======
function zoomToFeature(e) {
    console.log("zoomToFeature");

    var tableString;

    $.ajax({
        dataType: "json",
        url: "attendance_hs.geojson",
    }).done(function(jsonData){
        console.log("*** ajax success ***");
        console.dir(jsonData);

        // == zoom to the district
        map.fitBounds(e.target.getBounds());
        var whichDistrict = e.target._leaflet_id;

        var featureData = jsonData.features;

        // == create data panel
        tableString = "<div><table>";
        for (var i = 0; i < featureData.length; i++) {
            nextGIS = featureData[i].properties.GIS_ID;
            if (nextGIS == whichDistrict) {
                tableString += "<tr><td class='label'>SCHOOLNAME</td>";
                tableString += "<td class='value'> " + jsonData.features[i].properties.SCHOOLNAME;
                tableString += "</td></tr>";
                tableString += "<tr><td class='label'>BLDG_NUM</td>";
                tableString += "<td class='value'> " + jsonData.features[i].properties.BLDG_NUM;
                tableString += "</td></tr>";
                tableString += "<tr><td class='label'>GIS_ID</td>";
                tableString += "<td class='value'> " + jsonData.features[i].properties.GIS_ID;
                tableString += "</td></tr>";
                break;
            }

        }
        tableString += "</table></div>";
        $("#profileData").children().remove();
        $("#profileData").append(tableString);

    }).fail(function(){
        console.log("*** ajax fail ***");
    }).error(function() {
        console.log("*** ajax error ***");
    });
}

// ======= ======= ======= highlightFeature ======= ======= =======
function highlightFeature(e) {
    console.log("highlightFeature");

    // == define event listener for layer mouseover event
    var layer = e.target;
    layer.setStyle({
        weight: 5,
        color: 'red',
        dashArray: '',
        fillOpacity: 0.8
    });

    // == IE and Opera have difficulty with bringToFront method
    if (!L.Browser.ie && !L.Browser.opera) {
        layer.bringToFront();
    }

    // == update info control]
    info.update(layer.feature.properties);
}

// ======= ======= ======= resetHighlight ======= ======= =======
function resetHighlight(e) {
    console.log("resetHighlight");

    // == restore on mouseout (default state defined by style function)
    geoJsonLayer.resetStyle(e.target);

    // == update info control]
    info.update();
}


// ======= ======= ======= CONTROLS ======= ======= =======
// ======= ======= ======= CONTROLS ======= ======= =======
// ======= ======= ======= CONTROLS ======= ======= =======


var info = L.control();

info.onAdd = function (map) {
    console.log("info.onAdd");
    this._div = L.DomUtil.create('div', 'info');
    this.update();
    return this._div;
};

// update control based on feature properties passed
info.update = function (props) {
    console.log("info.update");
    this._div.innerHTML = '<h4>DC Highschool Zones</h4>' +  (props ?
        '<b>' + props.SCHOOLNAME + '</b><br />building #: ' + props.BLDG_NUM
        : 'Hover over a district');
};

info.addTo(map);
