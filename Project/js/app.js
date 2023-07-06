function toggleLayerControl() {
  var layerControl = document.getElementById("layer-control");
  var searchContainer = document.getElementById("search-container");

  layerControl.style.display = "block";
  searchContainer.style.display = "none";
}

function toggleSearchContainer() {
  var layerControl = document.getElementById("layer-control");
  var searchContainer = document.getElementById("search-container");

  layerControl.style.display = "none";
  searchContainer.style.display = "block";
}

//----------------------------------------- Aanmaken van de kaart---------------------------

//Allereerst wordt er een kaart gedefinieerd en het centrum van de kaart ingesteld op de coördinaten van België.
let map = L.map("map", {
    center: [50.5039, 4.4699],
    zoom: 8,
  });
  
  
  // Definieer de NGI-topo laag
  let baseLayer = L.tileLayer.wms("https://cartoweb.wms.ngi.be/service", {
    layers: "topo",
    format: "image/png",
    transparent: true,
    version: "1.3.0",
    crs: L.CRS.EPSG3857,
    attribution:
      'NGI Topo &copy; <a href="https://www.ngi.be/">National Geographic Institute of Belgium</a>',
  });
  
  // Definieer de NGI-ortho laag
  let ngiOrtho = L.tileLayer.wms("https://wms.ngi.be/inspire/ortho/service", {
    layers: "orthoimage_coverage_2020",
    format: "image/png",
    transparent: true,
    version: "1.3.0",
    crs: L.CRS.EPSG3857,
    attribution:
      'NGI Ortho &copy; <a href="https://www.ngi.be/">National Geographic Institute of Belgium</a>',
  });
  
  // Definieer de OpenStreetMap laag
  let osmLayer = L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors',
    maxZoom: 19
  });
  
  let Perceel = L.tileLayer.wms('http://localhost:9090/geoserver/Super_Kadaster/wms', {
    layers: 'Super_Kadaster:percelen',
    format: 'image/png',
    transparent: true,
    
  });
  
  
    // Definieer de VMM Watertoets WMS
  let watertoetsLayerVlaanderen = L.tileLayer
  .wms("https://geoservices.informatievlaanderen.be/raadpleegdiensten/VMMWatertoets/wms", {
      layers: "Ovstrgev2014",
      format: "image/png",
      transparent: true,
      version: "1.3.0",
      crs: L.CRS.EPSG3857,
    }
  );
  
  // Definieer de Brusselse Watertoets WMS
  let watertoetsLayerWalonie = L.tileLayer.wms("https://wms.environnement.brussels/lb_wms", {
    layers: "flood_hazardmap_2019_scale_1_10000",
    format: "image/png",
    transparent: true,
    version: "1.3.0",
    crs: L.CRS.EPSG3857,
});

  
  // Defineer de waalse gewestplan
  let GewestWal = L.tileLayer
    .wms("https://geoservices.wallonie.be/arcgis/services/AMENAGEMENT_TERRITOIRE/PDS/MapServer/WmsServer", {
        layers: "2",
        format: "image/png",
        transparent: true,
        version: "1.3.0",
        crs: L.CRS.EPSG3857,
      }
    );
  
  // Defineer de vlaams gewestplan
  let GewestVL = L.tileLayer.wms("https://www.mercator.vlaanderen.be/raadpleegdienstenmercatorpubliek/ows", {
    layers: "lu:lu_gwp_gv",
    format: "image/png",
    transparent: true,
    version: "1.3.0",
    crs: L.CRS.EPSG3857,
    });

  
  // Defineer het brusselse gewestplan
  let GewestBRU = L.tileLayer.wms("https://gis.urban.brussels/geoserver/wms", {
    layers: "PERSPECTIVE_NL:GEWESTPLAN_1979",
    format: "image/png",
    transparent: true,
    version: "1.3.0",
    crs: L.CRS.EPSG3857,
    
  });
  
  // Defineer de erfgeodlaag
  let Erfgoed = L.tileLayer.wms("http://localhost:9090/geoserver/Super_Kadaster/wms", {
    layers: 'Erfgoed',
    format: 'image/png',
    transparent: true,
    version: '1.1.1',
    crs: L.CRS.EPSG3857,
    
});
  

// Defineer aanduidingsobjecten
let Aanduidingsobjecten = L.tileLayer.wms("http://localhost:9090/geoserver/Super_Kadaster/wms", {
  layers: "Super_Kadaster:aanduidingsobjecten",
  format: "image/png",
  transparent: true,
  version: "1.1.1",
  crs: L.CRS.EPSG3857,
  minZoom: 10, // Stel hier het gewenste minimale zoomlevel in

  
});

  
  // Voeg de basiskaartlaag toe aan de kaart
  baseLayer.addTo(map);
  Perceel.bringToFront();
  
  
  
  // voeg controler toe om van laag te wisselen
  let baseMaps = {
    "NGI Topo": baseLayer,
    "NGI Ortho": ngiOrtho,
    "OSM LAYER": osmLayer,
    
  };
  // ovarlay layers instellen
  let overlayMaps = {
    "Gewest plan Vlaanderen" : GewestVL,
    "Gewest plan Brussel" : GewestBRU,
    "Gewest plan Walonie" : GewestWal,
    "Kadastraal perceel": Perceel,
    "Watertoets_VL": watertoetsLayerVlaanderen,
    "Watertoets_Brussel": watertoetsLayerWalonie,
    "Erfgoed" : Erfgoed,
    "Aanduidingsobjecten" : Aanduidingsobjecten,
    
    
    
  };
  L.control.layers(baseMaps, overlayMaps).addTo(map);
  
// Create the layer control element manually
let layerControlElement = document.getElementById('layer-control');

// Add the base layer options to the layer control
for (let name in baseMaps) {
  let layer = baseMaps[name];
  let input = document.createElement('input');
  input.type = 'radio';
  input.name = 'base-layer';
  input.value = name;
  input.id = `base-layer-${name}`; // Add unique IDs to the input elements
  input.addEventListener('change', function() {
    // Switch the base layer when the input is changed
    for (let key in baseMaps) {
      map.removeLayer(baseMaps[key]);
    }
    map.addLayer(baseMaps[this.value]);
  });

  let label = document.createElement('label');
  label.textContent = name;
  label.setAttribute('for', `base-layer-${name}`); // Associate the label with the input

  layerControlElement.appendChild(input);
  layerControlElement.appendChild(label);
}

// Add the overlay layer options to the layer control
for (let name in overlayMaps) {
  let layer = overlayMaps[name];
  let input = document.createElement('input');
  input.type = 'checkbox';
  input.value = name;
  input.id = `overlay-layer-${name}`; // Add unique IDs to the input elements
  input.addEventListener('change', function() {
    // Add or remove the overlay layer based on the input state
    if (this.checked) {
      map.addLayer(overlayMaps[this.value]);
    } else {
      map.removeLayer(overlayMaps[this.value]);
    }
  });

  let label = document.createElement('label');
  label.textContent = name;
  label.setAttribute('for', `overlay-layer-${name}`); // Associate the label with the input

  layerControlElement.appendChild(input);
  layerControlElement.appendChild(label);
}





  
  // Difinieer de legende voor de  VMM Watertoets laag
  let legendControl = L.control({ position: "bottomright" });
  legendControl.onAdd = function (map) {
    let div = L.DomUtil.create("div", "legend");
    div.innerHTML = '<img src="https://geoservices.informatievlaanderen.be/raadpleegdiensten/VMMWatertoets/wms?request=GetLegendGraphic%26version=1.3.0%26format=image/png%26layer=Ovstrgev2014" alt="VMM Watertoets Legend">';
    return div;
  };
  
  
  // Wanneer de Watertoets_VL laag wordt ingeschakeld, voeg dan de legende toe aan de kaart.
  map.on("overlayadd", function (e) {
    if (e.name === "Watertoets_VL") {
      legendControl.addTo(map);
    }
  });
  
  // Verwijder de legende van de kaart wanneer de VMM Watertoets_VL laag is uitgeschakeld.
  map.on("overlayremove", function (e) {
    if (e.name === "Watertoets_VL") {
      map.removeControl(legendControl);
    }
  });
  
  

  

// ------------------- zoek adress -------------

// Verplaats de eventlisteners naar een aparte functie voor hergebruik
function addEventListeners() {
  let searchInput = document.getElementById('search-input');
  let searchButton = document.getElementById('search-button');

  // Voeg een eventlistener toe voor input in het zoekveld
  searchInput.addEventListener('input', function(event) {
    getSuggestions(event.target.value);
  });

  // Voeg een eventlistener toe aan het zoekveld voor de Enter-toets
  searchInput.addEventListener('keydown', function(event) {
    if (event.key === 'Enter') {
      event.preventDefault(); // Voorkom dat het formulier wordt verzonden
      searchAddress(event.target.value);
    }
  });

  // Voeg een 'blur' eventlistener toe aan het zoekveld
  searchInput.addEventListener('blur', function() {
    // We gebruiken setTimeout om een vertraging toe te voegen, zodat de 'click' event op de suggesties 
    // nog steeds wordt geregistreerd voordat de lijst wordt verborgen
    setTimeout(hideSuggestions, 200);
  });

  // Voeg een eventlistener toe aan de zoekknop
  searchButton.addEventListener('click', function() {
    searchAddress(searchInput.value);
  });
}

// Functie om suggesties op te halen van de Geopunt API
function getSuggestions(query) {
  let suggestUrl = `https://loc.geopunt.be/v4/Suggestion?q=${encodeURIComponent(query)}&c=5`;

  fetch(suggestUrl)
    .then(response => response.json())
    .then(data => {
      let suggestionList = document.getElementById('suggestion-list');
      suggestionList.innerHTML = ''; // Leeg de vorige suggesties

      let suggestions = data.SuggestionResult;
      suggestions.forEach(suggestion => {
        let listItem = document.createElement('li');
        listItem.textContent = suggestion;
        listItem.addEventListener('click', function() {
          document.getElementById('search-input').value = suggestion;
          searchAddress(suggestion);
          hideSuggestions();
        });
        suggestionList.appendChild(listItem);
      });

      showSuggestionList();
    })
    .catch(error => {
      console.log('Fout bij het ophalen van de suggesties:', error);
    });
}

// Pas de executeSearch-functie aan om de suggesties te verbergen en zoek het adres
function executeSearch() {
  hideSuggestions();
  searchAddress(document.getElementById('search-input').value);
}

// Functie om het adres te zoeken
function searchAddress(address) {
  // Bouw de API-url op voor de geocodeerder
  let geocodeUrl = `https://loc.geopunt.be/v4/Location?q=${encodeURIComponent(address)}&c=1`;

  // Maak een HTTP GET-verzoek naar de geocodeerder API
  fetch(geocodeUrl)
    .then(response => response.json())
    .then(data => {
      if (data.LocationResult.length === 0) {
        console.log('Geen resultaten gevonden.');
        return;
      }

      // Haal de gegevens op van het eerste resultaat
      let result = data.LocationResult[0];
      let latitude = result.Location.Lat_WGS84;
      let longitude = result.Location.Lon_WGS84;
      let address = result.FormattedAddress;

      // Verplaats de kaart naar de geocodeerde locatie
      map.setView([latitude, longitude], 15); // Pas de zoom aan naar wensVervolgt:


      // Voeg een popup toe met het adres
      L.popup()
        .setLatLng([latitude, longitude])
        .setContent(address)
        .openOn(map);

        // Update the summary information based on the searched address
      updateSummaryInfo(latitude, longitude,address);
    })

    .catch(error => {
      console.log('Fout bij het ophalen van de geocodeerder:', error);
    });
}

// Verberg de suggestielijst
function hideSuggestions() {
  let suggestionList = document.getElementById('suggestion-list');
  suggestionList.style.display = 'none';
}

// Toon de suggestielijst
function showSuggestionList() {
  let suggestionList = document.getElementById('suggestion-list');
  suggestionList.style.display = 'block';
}

// Voeg de eventlisteners toe na het definiëren van de functies
addEventListeners();



// ------------- ophalen info van de WMS services voor de info

// Function to update the summary information based on the searched address coordinates
function updateSummaryInfo(latitude, longitude, address) {
  // Retrieve the summary information from the WMS services using the provided coordinates
  let watertoetsInfo = getInfoFromWatertoetsService(latitude, longitude); // Implement this function to retrieve watertoets info
  let gewestplanInfo = getInfoFromGewestplanService(latitude, longitude); // Implement this function to retrieve gewestplan info
  let erfgoedInfo = getInfoFromErfgoedService(latitude, longitude); // Implement this function to retrieve erfgoed info
  let aanduidingsobjectenInfo = getInfoFromAanduidingsobjectenService(latitude, longitude); // Implement this function to retrieve aanduidingsobjecten info
  let perceelInfo = getInfoFromPerceelService(latitude, longitude); // Implement this function to retrieve perceel info

  // Update the content of the summary info HTML element
  let summaryInfoElement = document.getElementById('summary-info');
  summaryInfoElement.innerHTML = `
    <h3>Samenvattende info:</h3>
    <p>Watertoets: ${watertoetsInfo}</p>
    <p>Gewestplan: ${gewestplanInfo}</p>
    <p>Erfgoedlaag: ${erfgoedInfo}</p>
    <p>Aanduidingsobjecten: ${aanduidingsobjectenInfo}</p>
    <p>Perceel:${address , perceelInfo}</p>
  `;
}


// watertoets info 
function getInfoFromWatertoetsService(latitude, longitude) {
  // Construct the URL for the WMS GetFeatureInfo request
  let url = `https://geoservices.informatievlaanderen.be/raadpleegdiensten/VMMWatertoets/wms?service=WMS&version=1.3.0&request=GetFeatureInfo&layers=Ovstrgev2014&query_layers=Ovstrgev2014&info_format=text/plain&width=1&height=1&crs=EPSG:4326&bbox=${longitude},${latitude},${longitude},${latitude}`;
  console.log(url)
  // Make an HTTP request to the WMS service
  return fetch(url)
    .then(response => response.text())
    .then(data => {
      // Parse the response and extract the relevant information
      let watertoetsInfo = parseWatertoetsInfo(data); // Implement the parsing logic

      // Return the retrieved watertoets info
      return watertoetsInfo;
    })
    .catch(error => {
      console.log('Fout bij het ophalen van de watertoets informatie:', error);
      return 'Niet beschikbaar';
    });
}