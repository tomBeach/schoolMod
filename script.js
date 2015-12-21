$(document).ready(function() {
    console.log('initObjects');

    // ======= map object =======
    var map = L.map('map').setView(new L.LatLng(38.89, -77.00), 11);
    var geoJsonLayer;


    // ======= tile layer =======
    L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    // ======= get map geojson data =======
    // == flat file source
    $.ajax({
        dataType: "json",
        url: "hs_district_geo.geojson",
    }).done(function(jsonData){
        console.log("*** ajax success ***");
        console.dir(jsonData);

        // == styles/behaviors for map
        L.geoJson(jsonData).addTo(map);
        geoJsonLayer = L.geoJson(jsonData, {
            style: style,
            onEachFeature: onEachFeature
        }).addTo(map);

        // == add id to active areas
        geoJsonLayer.eachLayer(function (layer) {
            console.log("addId");
            layer._leaflet_id = layer.feature.properties.GIS_ID;
        });

    // == errors/fails
    }).fail(function(){
        console.log("*** ajax fail ***");
    }).error(function() {
        console.log("*** ajax error ***");
    });


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

        var whichDistrict, featureData, tableString;

        // == zoom to the district
        whichDistrict = e.target._leaflet_id;
        map.fitBounds(e.target.getBounds());

        // == get selected school data to create data panel
        getAllSchoolData(whichDistrict);
    }

    // ======= ======= ======= getAllSchoolData ======= ======= =======
    function getAllSchoolData(whichDistrict) {
        console.log("getAllSchoolData");

        // == get school profile data from file
        $.ajax({
            dataType: "text",
            url: "Public_Schools_dev.csv",
        }).done(function(textData){
            console.log("*** ajax success ***");
            var jsonData = CSV2JSON(textData);
            console.dir(jsonData);

            // == get data for selected school
            schoolData = getSchoolData(jsonData, whichDistrict)
            makeDataPanel(schoolData);
            makeDataGraph(schoolData);

            // == errors/fails
            }).fail(function(){
                console.log("*** ajax fail ***");
            }).error(function() {
                console.log("*** ajax error ***");
        });
    }

    // ======= ======= ======= getSchoolData ======= ======= =======
    function getSchoolData(jsonData, whichDistrict) {
        console.log("getSchoolData");

        for (var i = 0; i < jsonData.length; i++) {
            nextItem = jsonData[i];
            nextGis_id = nextItem.gis_id;
            if (nextGis_id == whichDistrict) {
                return nextItem;
            }
        }
    }

    // ======= ======= ======= makeDataPanel ======= ======= =======
    function makeDataPanel(schoolData) {
        console.log("makeDataPanel");

        tableString = "<div><table>";
        tableString += "<tr><td class='label'>school</td>";
        tableString += "<td class='value'> " + schoolData.name;
        tableString += "</td></tr>";
        tableString += "<tr><td class='label'>address</td>";
        tableString += "<td class='value'> " + schoolData.address + " " + schoolData.zip_code;
        tableString += "</td></tr>";
        tableString += "</table></div>";
        $("#profileData").children().remove();
        $("#profileData").append(tableString);
    }

    // ======= ======= ======= makeDataGraph ======= ======= =======
    function makeDataGraph(schoolData) {
        console.log("makeDataGraph");

        schoolName = schoolData.name;
        population_2008 = schoolData.population_2008;
        population_enrolled = schoolData.population_enrolled;
        population_planned = schoolData.population_planned;
        population_atRisk = schoolData.population_atRisk;
        population_specEd = schoolData.population_specEd;
        population_grad = schoolData.population_grad;

        schoolDataArray = [{"key": "2008", "value": population_2008}, {"key": "current", "value": population_enrolled}, {"key": "future", "value": population_planned}, {"key": "atRisk", "value": population_atRisk}, {"key": "specEd", "value": population_specEd}, {"key": "graduates", "value": population_grad}];

        initHorizontalChart(schoolName, schoolDataArray);

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


    // ======= ======= ======= UTILITIES ======= ======= =======
    // ======= ======= ======= UTILITIES ======= ======= =======
    // ======= ======= ======= UTILITIES ======= ======= =======



    // ======= ======= ======= CSVToArray ======= ======= =======
    function CSVToArray(strData, strDelimiter) {
        console.log("CSVToArray");
        // Check to see if the delimiter is defined. If not, then default to comma.
        strDelimiter = (strDelimiter || ",");
        // Create a regular expression to parse the CSV values.
        var objPattern = new RegExp((
            // Delimiters.
            "(\\" + strDelimiter + "|\\r?\\n|\\r|^)" +
            // Quoted fields.
            "(?:\"([^\"]*(?:\"\"[^\"]*)*)\"|" +
            // Standard fields.
            "([^\"\\" + strDelimiter + "\\r\\n]*))"), "gi");
        // Create an array to hold our data with default empty first row.
        var arrData = [[]];
        // Create an array to hold our individual pattern matching groups.
        var arrMatches = null;
        // Loop over regular expression matches until we can no longer find a match.
        while (arrMatches = objPattern.exec(strData)) {
            // Get the delimiter that was found.
            var strMatchedDelimiter = arrMatches[1];
            // Check to see if the given delimiter has a length
            // (is not the start of string) and if it matches
            // field delimiter. If id does not, then we know
            // that this delimiter is a row delimiter.
            if (strMatchedDelimiter.length && (strMatchedDelimiter != strDelimiter)) {
                // Since new row of data, add empty row to data array.
                arrData.push([]);
            }
            // Check kind of value captured (quoted or unquoted).
            if (arrMatches[2]) {
                // Quoted value: unescape any double quotes.
                var strMatchedValue = arrMatches[2].replace(
                new RegExp("\"\"", "g"), "\"");
            } else {
                // Non-quoted value.
                var strMatchedValue = arrMatches[3];
            }
            // Add value string to the data array.
            // console.log("  strMatchedValue: " + strMatchedValue);
            arrData[arrData.length - 1].push(strMatchedValue);
        }
        // Return the parsed data.
        return (arrData);
    }

    // ======= ======= ======= CSV2JSON ======= ======= =======
    function CSV2JSON(csv) {
        console.log("CSV2JSON");
        var array = CSVToArray(csv);
        var objArray = [];
        for (var i = 1; i < array.length; i++) {
            objArray[i - 1] = {};
            for (var k = 0; k < array[0].length && k < array[i].length; k++) {
                var key = array[0][k];
                objArray[i - 1][key] = array[i][k]
            }
        }

        var json = JSON.stringify(objArray);
        var json2 = JSON.parse(json)
        return json2;
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

})
