$(document).ready(function() {
    console.log('initObjects');

    var map, infoWindow;
    var schoolFilters = [];
    var studentFilters = [];
    var geographyFilters = [];

    // ======= ======= ======= initMap ======= ======= =======
    function initMap() {
        console.log('initMap');

        // ======= map styles =======
        var styleArray = [
            { featureType: "all",
                stylers: [
                    { saturation: -80 }
                ]
            },
            { featureType: "road.arterial",
                elementType: "geometry",
                stylers: [
                    { hue: "#00ffee" },
                    { saturation: 50 }
                ]
            },
            { featureType: "poi.business",
                elementType: "labels",
                stylers: [
                    { visibility: "off" }
                ]
            }
        ];

        // ======= map object =======
        map = new google.maps.Map(document.getElementById('map'), {
            center: {lat: 38.89, lng: -77.00},
            scrollwheel: false,
            styles: styleArray,     // styles for map tiles
            zoom: 11
        });

        // ======= Info Window =======
        infoWindow = new google.maps.InfoWindow({
          content: ""
        });
    }

    // ======= ======= ======= activateFilterDivs ======= ======= =======
    function activateFilterDivs() {
        console.log('activateFilterDivs');

        // == activate filter menu div click functions
        var filterDivs = $(".filterDivs");
        for (i = 0; i < $(filterDivs).children().length; i++) {
            nextDiv = $(filterDivs).children()[i];

            $(nextDiv).on('click', function() {
                console.log("clickFilter");
                console.log("  this.id: " + this.id);
                getZoneData(this.id);
            });
        }
    }

    // ======= ======= ======= getZoneData ======= ======= =======
    function getZoneData(zoneType) {
        console.log("getZoneData");
        console.log("  map: " + map);
        console.log("  zoneType: " + zoneType);

        var url, nextFeature;
        var fillColors = ["green", "red", "orange", "purple", "salmon", "blue", "yellow", "tomato", "darkkhaki", "goldenrod"];

        switch(zoneType) {
            case "wards":
                url = "GeoData/Ward__2012.geojson";
                break;
            case "feeders":
                url = "GeoData/School_Attendance_Zones_Senior_High.geojson";
                break;
        }

        // ======= get map geojson data =======
        $.ajax({
            dataType: "json",
            url: url
        }).done(function(geoJsonData, featureArray){
            console.log("*** ajax success ***");
            console.dir(geoJsonData);

            // ======= clear previous geojson layer =======
            map.data.forEach(function(feature) {
                map.data.remove(feature);
            });

            // ======= add geojson layer =======
            map.data.addGeoJson(geoJsonData);

            // ======= add index property to each feature =======
            var featureIndex = -1;
            map.data.forEach(function(feature) {
                featureIndex++;
                feature.setProperty('index', featureIndex);
            });

            // ======= colorize each feature based on colorList =======
            var colorIndex = -1;
            map.data.setStyle(function(feature) {
                colorIndex++;
                return {
                  fillColor: fillColors[colorIndex],
                  strokeColor: "purple",
                  strokeWeight: 1
                };
            });

            // ======= mouseover/out event listeners =======
            map.data.addListener('mouseover', function(event) {
                // console.log("--- mouseover ---");
                map.data.overrideStyle(event.feature, {
                    fillColor: "gray",
                    strokeWeight: 4
                });
            });
            map.data.addListener('mouseout', function(event) {
                // console.log("--- mouseout ---");
                featureIndex = event.feature.getProperty('index');
                map.data.overrideStyle(event.feature, {
                    fillColor: fillColors[featureIndex],
                    strokeWeight: 1
                });
            });

            // ======= click event listeners =======
            switch(zoneType) {
                case "wards":
                    map.data.addListener('click', function(event) {
                        console.log("--- click wards ---");
                        var name = event.feature.getProperty('NAME');
                        console.log("  name: " + name);
                    });
                    break;
                case "feeders":
                    map.data.addListener('click', function(event) {
                        console.log("--- click feeders ---");
                        var gis_id = event.feature.getProperty('GIS_ID');
                        var schoolName = event.feature.getProperty('SCHOOLNAME');
                    });
                    break;
            }

        // == errors/fails
        }).fail(function(){
            console.log("*** ajax fail ***");
        }).error(function() {
            console.log("*** ajax error ***");
        });
    }


    // ======= ======= ======= initFilterDivs ======= ======= =======
    function initFilterDivs(zoneType) {
        console.log("initFilterDivs");

        var nextCategory, nextStudentFilter, nextSchoolFilter, nextGeoFilter, filterHtml;

        // ======= filter menu contents =======
        var categories = ["years", "students", "schools", "geography"];
        var timeFilters = ["start", "end"];
        var schoolFilters = [
            ["type", "Public", "Charter", "Independent"],
            ["level", "Elementary", "Middle_School", "High_School", "Youth_Engagement"],
            ["size", "capacity", "square_footage", "population_now", "population_future"],
            "name"];
        var studentFilters = ["At_Risk", "Spec_Ed", "Graduated"];
        var geographyFilters = ["ward", "feeder", "quadrant"];
        var filters = [timeFilters, studentFilters, schoolFilters, geographyFilters];

        // ======= menus by category =======
        var menuHtml = "";
        var getDataHtml = "<div><input type='button' id='getDataButton' value='get data'></div>";
        for (var i = 0; i < categories.length; i++) {
            nextCategory = categories[i];
            nextFilters = filters[i];
            nextFilterCat = nextCategory.substring(0, 3);
            menuHtml += "<div id='" + nextCategory + "' class='category'>" + nextCategory + "</div>";
            menuHtml += makeFilterMenu(nextFilterCat, nextFilters);
        }

        // ======= append menus to DOM =======
        $("#mainNav").empty;
        $("#mainNav").append(menuHtml);
        activateFilterMenu();
        $("#mainNav").append(getDataHtml);

        $("#getDataButton").off("click").on("click", function(){
            console.log("-- -- -- getData -- -- -- ");
        });

        // ======= makeFilterMenu =======
        function makeFilterMenu(whichFilterCat, whichFilters) {
            console.log("makeFilterMenu");
            filterHtml = "";
            filterHtml += "<ul>";
            for (var j = 0; j < whichFilters.length; j++) {
                nextFilter = whichFilters[j];
                console.log("  nextFilter: " + nextFilter);
                if (Array.isArray(nextFilter)) {
                    for (var k = 0; k < nextFilter.length; k++) {
                        nextSubFilter = nextFilter[k];
                        nextFilterId = nextSubFilter + "_" + whichFilterCat;
                        console.log("  nextSubFilter: " + nextSubFilter);
                        if (k == 0) {
                            filterHtml += "<li id='" + nextFilterId + "' class='filterType'><a href='#'>" + nextSubFilter + "</a>";
                            filterHtml += "<ul>";
                        } else {
                            filterHtml += "<li id='" + nextSubFilter + "_" + whichFilterCat + "' class='activeFilter'><a href='#'>" + nextSubFilter + "</a></li>";
                        }
                    }
                    filterHtml += "</ul></li>";
                } else {
                    filterHtml += "<li id='" + nextFilter + "_" + whichFilterCat + "' class='activeFilter'><a href='#'>" + nextFilter + "</a></li>";
                }
            }
            filterHtml += "</ul>";
            return filterHtml;
        }

        // ======= activateFilterMenu =======
        function activateFilterMenu() {
            console.log("activateFilterMenu");

            for (var i = 0; i < categories.length; i++) {
                nextCategory = categories[i];
                // console.log("  nextCategory: " + nextCategory);
                nextFilterList = filters[i];
                nextFilterCat = nextCategory.substring(0, 3);
                for (var j = 0; j < nextFilterList.length; j++) {
                    nextFilter = nextFilterList[j];
                    // console.log("  nextFilter: " + nextFilter);
                    if (Array.isArray(nextFilter)) {
                        for (var k = 0; k < nextFilter.length; k++) {
                            nextSubFilter = nextFilter[k];
                            nextFilterId = nextSubFilter + "_" + nextFilterCat;
                            // console.log("  nextFilterId: " + nextFilterId);
                            activateFilter(nextFilterId, true);
                        }
                    } else {
                        nextFilterId = nextFilter + "_" + nextFilterCat;
                        // console.log("  nextFilterId: " + nextFilterId);
                        activateFilter(nextFilterId);
                    }
                }
            }
        }

        // ======= activateFilter =======
        function activateFilter(filterId, subMenu) {
            console.log("activateFilter");
            console.log("  filterId: " + filterId);
            console.log("  subMenu: " + subMenu);

            // switch(filterId) {
            //     case "start", "end", "type", "Public", "Charter", "Independent", "level", "Elementary", "Middle School", "High School", "Youth Engagement", "size", "capacity", "square footage", "population_now", "population_future", "name", "At Risk", "Spec Ed", "Graduated", "ward", "feeder", "quadrant"
            // }

            var textInput;
            var parentElementId = "#" + filterId;

            // ======= hover =======
            $(parentElementId).off("mouseenter").on("mouseenter", function(event) {
                console.log("-- mouseenter");
                console.log("  event.target.id: " + event.target.id);
                indexElement = event.target;
                $(indexElement).addClass("over");
                var subMenuItems = $(indexElement).children();
                var subMenuList = $(subMenuItems[1]);
                $(subMenuList).css('display', 'block');
                // console.log("  subMenuItems.length: " + subMenuItems.length);
                // console.log("  subMenuItems[1]: " + subMenuItems[1]);
                // console.log("  subMenuList: " + subMenuList);
                // console.log("  $(subMenuList).children().length: " + $(subMenuList).children().length);
                // console.log("  $(subMenuList).css('display', 'block'): " + $(subMenuList).css('display', 'block'));
            });

            $(parentElementId).off("mouseout").on("mouseout", function(event){
                console.log("-- mouseout");
                indexElement = event.target;
                $(indexElement).removeClass("over");
                // var subMenuItems = $(indexElement).children();
                // var subMenuList = $(subMenuItems[1]);
                // $(subMenuList).css('display', 'none');
            });

            // ======= general =======
            switch(filterId) {
                case "start_yea":
                    $(parentElementId).off("click").on("click", function(){
                        console.log("-- -- -- setStartYear -- -- -- ");
                        textInput = makeTextInput("startYear", "1998");
                        $(parentElementId).empty;
                        $(parentElementId).append(textInput);
                        $(parentElementId).style("")
                        $(parentElementId).off("click")
                    });
                    break;
                case "end_yea":
                    $(parentElementId).off("click").on("click", function(){
                        console.log("-- -- -- setEndYear -- -- -- ");
                        textInput = makeTextInput("endYear", "2020");
                        $(parentElementId).empty;
                        $(parentElementId).append(textInput);
                        $(parentElementId).off("click")
                    });
                    break;
            }
        }

        // ======= makeTextInput =======
        function makeTextInput(whichInput, whichValue) {
            console.log("makeTextInput");
            var entryString = "";
            entryString += "<div class='filterEntry'>" + whichInput +
                " - <input type='text' name='" + whichInput + "' value=" + whichValue + "></div>";
            return entryString;
        }
    }

    // ======= ======= ======= getSchoolData ======= ======= =======
    function getSchoolData(zoneType) {
        console.log("getSchoolData");
        console.log("  map: " + map);
        console.log("  zoneType: " + zoneType);

        var fillColors = ["green", "red", "orange", "purple", "blue", "yellow", "tomato", "salmon"];
        var url;

        switch(zoneType) {
            case "public":
                color = fillColors[2];
                url = "GeoData/Public_Schools.geojson";
                break;
            case "charter":
                color = fillColors[7];
                url = "GeoData/Charter_Schools.geojson";
                break;
        }
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

            // == parse csv text to js object
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

    initMap();
    // initFilterDivs();
    activateFilterDivs();

})
