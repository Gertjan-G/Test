
//---------------------------------- algememen event handelers en opmaak iconen -------------------
/*
document.addEventListener('DOMContentLoaded', function () {
  var kiSlider = document.getElementById('kiSlider');
  var oppSlider = document.getElementById('oppSlider');
  var kiValueElement = document.getElementById('kiValue');
  var oppValueElement = document.getElementById('oppValue');

  noUiSlider.create(kiSlider, {
      start: [0, 2500], // Beginwaarden voor de dubbele slider
      connect: true, // Verbindt de kleur tussen de twee handvatten
      range: {
          'min': 0,
          'max': 2500
      }
  });

  noUiSlider.create(oppSlider, {
      start: [0, 15000], // Beginwaarden voor de dubbele slider
      connect: true, // Verbindt de kleur tussen de twee handvatten
      range: {
          'min': 0,
          'max': 15000
      }
  });

  kiSlider.noUiSlider.on('update', function (values, handle) {
      kiValueElement.innerHTML = `€${Math.round(values[0])} - €${Math.round(values[1])}`;
  });

  oppSlider.noUiSlider.on('update', function (values, handle) {
      oppValueElement.innerHTML = `${Math.round(values[0])} m² - ${Math.round(values[1])} m²`;
  });
});
*/

// Definieer het pictogram voor Biddit.(er word gebruikt gemaakt van een zelf gemaakt icoon hiervoor)
const redIcon = L.icon({
  iconUrl: "data/img/icon_bidit.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
  iconSize: [24, 30],
  iconAnchor: [12, 0],
  popupAnchor: [1, -5],
  shadowSize: [41, 31],
});

// Definieer het pictogram voor VLABEl.(er word gebruikt gemaakt van een zelf gemaakt icoon hiervoor)
const blueIcon = L.icon({
  iconUrl: "data/img/icon_immoweb.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
  iconSize: [24, 30],
  iconAnchor: [12, 0],
  popupAnchor: [1, -5],
  shadowSize: [41, 31],
});

// Definieer het pictogram voor notariaat.(er word gebruikt gemaakt van een zelf gemaakt icoon hiervoor)
const  yellowIcon = L.icon({
  iconUrl: "data/img/icon_immoweb.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
  iconSize: [24, 30],
  iconAnchor: [12, 0],
  popupAnchor: [1, -5],
  shadowSize: [41, 31],
});


// bekijkt welke datasect gelecteerd is bij de filters en past de kleur aan. 
$(document).ready(function() {
  $('.btn-radio').click(function() {
    $('.btn-radio').removeClass('active').addClass('not-active');
    $(this).removeClass('not-active').addClass('active');
  });
});


//----------------------------------------- Aanmaken van de kaart---------------------------

//Allereerst wordt er een kaart gedefinieerd en het centrum van de kaart ingesteld op de geografische coördinaten van Vlaanderen.
let map = L.map("map", {
  preferCanvas: true,
  center: [51.0257, 4.1875],
  zoom: 9,
});

// Definieer de GRB-basiskaart layer
let grbBasiskaart = L.tileLayer.wms("https://geo.api.vlaanderen.be/GRB-basiskaart/wms", {
  layers: "GRB_BSK", // Dit moet je mogelijk aanpassen op basis van de beschikbare laag in de GetCapabilities
  format: "image/png",
  transparent: true,
  version: "1.3.0",
  crs: L.CRS.EPSG3857, // Zorg ervoor dat dit overeenkomt met de CRS van je kaart en de WMS-service
  attribution: 'GRB Basiskaart &copy; <a href="https://www.vlaanderen.be/">Vlaamse overheid</a>',
});

// Definieer de Orthofotowerkbestand layer
let orthofotowerkbestand = L.tileLayer.wms("https://geo.api.vlaanderen.be/ofw/wms", {
  layers: "OFW",
  format: "image/png",
  transparent: true,
  version: "1.3.0",
  crs: L.CRS.EPSG3857,
  attribution:
    'Orthofotowerkbestand &copy; <a href="https://geo.api.vlaanderen.be/">Agentschap Informatie Vlaanderen</a>',
});


// Definieer de OpenStreetMap layer
let osmLayer = L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors',
  maxZoom: 19
});

// Definieer de Cadaster WMS
let Perceel = L.tileLayer.wms('http://ccff02.minfin.fgov.be/geoservices/arcgis/services/WMS/Cadastral_Layers/MapServer/WMSServer', {
  layers: 'Cadastral Parcel',
  format: 'image/png',
  transparent: true,
  attribution: '© FGov Financiën - SPW DGO3'
})
  .addTo(map);

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

// Definieer de atlasBuurtwegen layer
let atlasBuurtwegen = L.tileLayer.wms("https://geo.api.vlaanderen.be/histcart/wms", {
  layers: "abw", // Specificeer de juiste laag
  format: "image/png",
  transparent: true,
  version: "1.3.0", // Zorg ervoor dat dit de correcte versie is voor deze service
  crs: L.CRS.EPSG3857, // Controleer of dit het correcte Coordinate Reference System is voor deze laag
  attribution: 'Atlas Buurtwegen Wijzigingen &copy; <a href="https://geoservices.vlaamsbrabant.be/">Vlaams Brabant GeoServices</a>',
  
});





// Defineer de vlaams gewestplan
let GewestVL = L.tileLayer.wms("https://www.mercator.vlaanderen.be/raadpleegdienstenmercatorpubliek/ows", {
  layers: "lu:lu_gwp_gv",
  format: "image/png",
  transparent: true,
  version: "1.3.0",
  crs: L.CRS.EPSG3857,
  attribution: 'Gewestplan &copy; <a href="https://www.agiv.be/">AGIV</a>',
  opacity: 0.7, // Stel de opaciteit in op 50%
});

// Defineer het brusselse gewestplan
let GewestBRU = L.tileLayer.wms("https://gis.urban.brussels/geoserver/wms", {
  layers: "PERSPECTIVE_NL:GEWESTPLAN_1979",
  format: "image/png",
  transparent: true,
  version: "1.3.0",
  crs: L.CRS.EPSG3857,
  attribution: 'Gewestplan &copy; <a href="https://perspective.brussels/nl/">perspective.brussels</a>'
});



// Voeg de basiskaartlaag toe aan de kaart
grbBasiskaart.addTo(map);
Perceel.bringToFront();



// voeg controler toe om van laag te wisselen
let baseMaps = {
  "Ortho": orthofotowerkbestand,
  "OSM LAYER": osmLayer,
  "GRB Basis" : grbBasiskaart,
  
};


let overlayMaps = {
  "Gewest plan Vlaanderen" : GewestVL,
  "Watertoets_VL": watertoetsLayerVlaanderen,
  "atlasBuurtwegen":atlasBuurtwegen,
   
};
L.control.layers(baseMaps, overlayMaps).addTo(map);


// Difinieer de legende voor de  VMM Watertoets layer
let legendControl = L.control({ position: "bottomright" });
legendControl.onAdd = function (map) {
  let div = L.DomUtil.create("div", "legend");
  div.innerHTML = '<img src="https://geoservices.informatievlaanderen.be/raadpleegdiensten/VMMWatertoets/wms?request=GetLegendGraphic%26version=1.3.0%26format=image/png%26layer=Ovstrgev2014" alt="VMM Watertoets Legend">';
  return div;
};


// Wanneer de Watertoets_VL laag wordt ingeschakeld, voeg dan de legende  toe aan de kaart.
map.on("overlayadd", function (e) {
  if (e.name === "Watertoets_VL") {
    legendControl.addTo(map);
  }
});

// Verwijder de legende  van de kaart wanneer de VMM Watertoets_VL laag is uitgeschakeld.
map.on("overlayremove", function (e) {
  if (e.name === "Watertoets_VL") {
    map.removeControl(legendControl);
  }
});


// Voeg de Cadaster WMS toe aan de kaart.
Perceel.addTo(map);







//----------------------------- Adress zoek functie + click on map functie ----------------------


//Eventlistener adreszoekopdracht
document.getElementById('search-button').addEventListener('click', ZoekAdres);



// Definieer de zoekfunctie & API key
let markerAdres;
const tomtomApiKey = '8mA6ufG2r6XlxHyI5ojoJRjXsRONZS2x';

function AdressMarker(lat, lon) {
  // Gebruik de TomTom API om het adres op te halen
  let url = 'https://api.tomtom.com/search/2/reverseGeocode/' + lat + ',' + lon + '.json?key='+tomtomApiKey;
  
    fetch(url)
    .then(response => response.json())
    .then(data => {
      if (data.addresses.length > 0) {
        const foundAddress = data.addresses[0].address.freeformAddress;

        // Update  HTML met het gevonden adres
        document.getElementById('adres').textContent = foundAddress;

        if (markerAdres) {
          // Controleer of de marker is verplaatst
          const currentLatLng = markerAdres.getLatLng();
          if (currentLatLng.lat !== lat || currentLatLng.lng !== lon) {
            markerAdres.setLatLng([lat, lon]);
          }
          markerAdres.bindPopup(foundAddress); // Update de popuptekst
        } else {
          markerAdres = L.marker([lat, lon], {icon: greenIcon}).addTo(map);
          markerAdres.bindPopup(foundAddress);
          map.flyTo([lat, lon], 16); // Zet het kaartbeeld op de markerlocatie
        }
      }
    })
    .catch(error => console.error(error));


    // als het gezochte adres binnen vlaanderen ligt update de samenvatende info:
    const params = {
      service: 'WMS',
      version: '1.3.0',
      request: 'GetFeatureInfo',
      layers: 'GRB_BSK',
      query_layers: 'GRB_BSK',
      styles: '',
      bbox: `${lat-0.0001},${lon-0.0001},${lat+0.0001},${lon+0.0001}`,
      crs: 'EPSG:4326',
      width: 100,
      height: 100,
      format: 'image/png',
      transparent: true,
      info_format: 'text/html',
      feature_count: 10,
      i: 50,
      j: 50
    };  


    // Bouw de URL op 
    const wmsEndpoint = 'https://geo.api.vlaanderen.be/GRB-basiskaart/wms';
    const url_wms = `${wmsEndpoint}?${Object.entries(params).map(([k, v]) => `${k}=${encodeURIComponent(v)}`).join('&')}`;
    console.log(`WMS URL: ${url_wms}`);

    // Maak een GET-verzoek naar de WMS-service
  fetch(url_wms)
  .then(response => response.text())
  .then(data => {
    // Controleer of de server informatie over de geklikte locatie heeft teruggestuurd
    if (data.includes("GRB_ADP")) { 
      // Voer de functies uit als de klik binnen de grenzen van de WMS-laag viel
      getErfgoed(lat, lon); //info Erfgoed functie oproepen
      Kadaster(lat, lon); //info kadaster functie oproepen
      gewestplanVL(lat, lon); //info gewesplan functie oproepen
      overVL(lat, lon); //info overstroming

    } else {
      
      //alert('Samenvattende info werkt enkel binnen Vlaanderen');
      Kadaster(lat, lon); //info kadaster functie oproepen
      const gewestEl = document.getElementById('gewestplan');
      gewestEl.textContent = "Functie werkt enkel in vlaanderen";
      const overVL = document.getElementById('Overstromingsgevoeilg');
      overVL.textContent = "Functie werkt enkel in vlaanderen";
      const erfgoedEl = document.getElementById('erfgoed');
      erfgoedEl.textContent = "Functie werkt enkel in vlaanderen";


    }
  })
  .catch(error => console.error('Error:', error));

   
   }

//zoek adres functie
function ZoekAdres(event) {
  event.preventDefault();

  let address = document.getElementById('search-adres').value.trim(); 
  if (!address) {
    // Als het adres leeg is, stel dan lat en lon in op null 
    const lat = null;
    const lon = null;
    return;
  }
  //TOMTOM API definieren
  let url = `https://api.tomtom.com/search/2/geocode/${encodeURIComponent(address)}.json?key=${tomtomApiKey}&limit=1`;
//fetch van de API de lon/lat
  fetch(url)
    .then(response => response.json())
    .then(data => {
      if (data.results.length > 0) {
        const lat = data.results[0].position.lat;
        const lon = data.results[0].position.lon;
        const formattedAddress = data.results[0].address.freeformAddress;

        AdressMarker(lat, lon, formattedAddress);
        
        // Update de straal van de cirkel nadat het adres is gezocht
        updateRadius(document.getElementById('radius').value);

            }
    })
    .catch(error => console.error(error));
}


// zoek adress op basis van de aangeklikte locatie functie
function reverseGeocode(lat, lon, callback) {
  let url = 'https://api.tomtom.com/search/2/reverseGeocode/' + lat + ',' + lon + '.json?key=' + tomtomApiKey;
//fetch van de API de straatnaam en huisnr.
  fetch(url)
    .then(response => response.json())
    .then(data => {
      if (data.addresses && data.addresses.length > 0) {
        const addressObj = data.addresses[0].address;
        const address = [addressObj.street, addressObj.streetNumber, addressObj.postalCode, addressObj.municipality].filter(Boolean).join(', ');
        callback(address);
      } else {
        callback('Adres niet gevonden');
      }
    })
    .catch(error => {
      console.error(error);
      callback('Fout bij het ophalen van het adres');
    });

    
}

// Functie om de marker en popup naar de aangeklikte locatie op de kaart te verplaatsen
function opMapklikken(e) {
  const latlng = e.latlng;
  const lat = latlng.lat;
  const lon = latlng.lng;

  

  reverseGeocode(lat, lon, (address) => {
    const popupText = address;

      // Update  HTML met het gevonden adres
    document.getElementById('adres').textContent = address;

    if (!markerAdres) {
      markerAdres = L.marker(latlng, {icon: greenIcon}).addTo(map);
      markerAdres.bindPopup(popupText);
      map.flyTo(latlng, 16); // Vlieg naar de marker locatie
    } else {
      markerAdres.setLatLng(latlng);
      markerAdres.bindPopup(popupText);
      markerAdres.openPopup();
      map.flyTo(latlng, 16); // Vlieg naar de marker locatie
    }
  });
  
  
  
    // als het gezochte adres binnen vlaanderen ligt update de samenvatende info:
    const params = {
      service: 'WMS',
      version: '1.3.0',
      request: 'GetFeatureInfo',
      layers: 'GRB_BSK',
      query_layers: 'GRB_BSK',
      styles: '',
      bbox: `${lat-0.0001},${lon-0.0001},${lat+0.0001},${lon+0.0001}`,
      crs: 'EPSG:4326',
      width: 100,
      height: 100,
      format: 'image/png',
      transparent: true,
      info_format: 'text/html',
      feature_count: 10,
      i: 50,
      j: 50
    };


    // Bouw de URL op 
    const wmsEndpoint = 'https://geo.api.vlaanderen.be/GRB-basiskaart/wms';
    const url_wms = `${wmsEndpoint}?${Object.entries(params).map(([k, v]) => `${k}=${encodeURIComponent(v)}`).join('&')}`;
    console.log(`WMS URL: ${url_wms}`);

    // Maak een GET-verzoek naar de WMS-service
  fetch(url_wms)
  .then(response => response.text())
  .then(data => {
    // Controleer of de server informatie over de geklikte locatie heeft teruggestuurd
    if (data.includes("GRB_ADP")) { 
      // Voer de functies uit als de klik binnen de grenzen van de WMS-laag viel
      getErfgoed(lat, lon); //info Erfgoed functie oproepen
      Kadaster(lat, lon); //info kadaster functie oproepen
      gewestplanVL(lat, lon); //info gewesplan functie oproepen
      overVL(lat, lon); //info overstroming

    } else {
      
      //alert('Samenvattende info werkt enkel binnen Vlaanderen');
      Kadaster(lat, lon); //info kadaster functie oproepen
      const gewestEl = document.getElementById('gewestplan');
      gewestEl.textContent = "Functie werkt enkel in vlaanderen";
      const overVL = document.getElementById('Overstromingsgevoeilg');
      overVL.textContent = "Functie werkt enkel in vlaanderen";
      const erfgoedEl = document.getElementById('erfgoed');
      erfgoedEl.textContent = "Functie werkt enkel in vlaanderen";


    }
  })
  .catch(error => console.error('Error:', error));


  }

// Voeg een eventlistener toe voor klikken op de kaart die de opMapklikken-functie aanroept
map.on('click', opMapklikken);


// -----------------------------  geselecteerde punten voor vergelijking op slaan ---------------------

//lijst met vergelijkingspunten opstellen
let vergelijkingsLijst = [];

function addToVergelijking(feature) {
  vergelijkingsLijst.push(feature);
  console.log('Toegevoegd aan vergelijking:', feature);
  alert('Dit element is toegevoegd aan de lijst voor vergelijking.')
  updateVergelijkingLijst(); // Roep deze functie aan om de UI te updaten
}

function updateVergelijkingLijst() {
  const lijst = document.getElementById('lijstItems');
  lijst.innerHTML = ''; // Reset de lijst

  function formatGetalAlsTekst(nummer) {
    // Zet de string om naar een nummer, en formatteer dan met punten als duizendtalscheiders
    return Number(nummer).toLocaleString('nl-NL');
  }
   
    
  vergelijkingsLijst.forEach((item, index) => {
    const li = document.createElement('li');
    li.className = 'list-group-item';
    li.innerHTML = `
    <strong>Vergelijkingspunt ${index + 1}: ${item.adres}<br></strong>
    "${item.type_goed}", verkocht uit de hand op ${item.aanmaak_datum.slice(0, -9)} voor <strong>€${formatGetalAlsTekst(item.prijs)}<br></strong>
    "Hier komt de kadastrale info van het pand, dit moet via een WMS query worden opgevraagd."<br>
    Bouwjaar: ${item.bouw_jaar}<br>
    Perceeloppervlakte: ${formatGetalAlsTekst(item.oppervlakte)}m²<br>
    KI: €${formatGetalAlsTekst(item.kadastraal_inkomen)}
  `;

    const verwijderBtn = document.createElement('button');
    verwijderBtn.innerHTML = '&times;';
    verwijderBtn.className = 'btn btn-danger btn-sm float-end';
    verwijderBtn.onclick = function() { verwijderItem(index); };

    li.appendChild(verwijderBtn);
    lijst.appendChild(li);
  });
}


function verwijderItem(index) {
  vergelijkingsLijst.splice(index, 1); // Verwijder het item uit de lijst
  updateVergelijkingLijst(); // Update de lijst in de UI
}





/// ------------------------------------ inladen van volledige notariaat via PHP om weer te geven op de kaart ---------------------

// Maak een nieuwe variabele genaamd "markers" (= de groep van individuele "maker") en wijs deze toe aan een nieuwe instantie van de L.markerClusterGroup()-klasse.
let markerCluster;
let markers = L.markerClusterGroup({ maxClusterRadius: 80,  disableClusteringAtZoom: 17});

 async function loadGeoJsonData() {
  console.log("Laden van GeoJSON data gestart...");

  try {
      const response = await fetch('php/load_notariaat.php');

      if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log("GeoJSON data succesvol geladen:", data);

      L.geoJSON(data, {
          onEachFeature: function(feature, layer) {
              if (feature.properties && feature.geometry) {
                  const { geometry, properties } = feature;
                  const latLng = [geometry.coordinates[1], geometry.coordinates[0]];
                  const circleMarker = L.circleMarker(latLng, {
                      
                      radius: 6
                  });

                  const streetViewUrl = `https://www.google.com/maps?q=&layer=c&cbll=${latLng[0]},${latLng[1]}`;
                  const popupContent = `<div style="font-family: Arial, sans-serif; font-size: 14px;">
                      <h4><strong>${properties.type_goed}</strong></h4>
                      <br><strong>Adres:</strong> ${properties.adres} ${properties.nummer}, ${properties.postcode} ${properties.stad}
                      <br><strong>Prijs:</strong> €${properties.prijs}
                      <br><strong>Verkocht op:</strong> ${properties.aanmaak_datum.slice(0, -9) || "Niet beschikbaar"}
                      <br>
                      <br><strong>Bouwjaar:</strong> ${properties.bouw_jaar}
                      <br><strong>Oppervlakte:</strong> ${properties.oppervlakte}m²
                      <br><strong>KI:</strong> €${properties.kadastraal_inkomen}
                      <br><strong>Gevels:</strong> ${properties.gevels}
                      <br><strong>Prijs/m²:</strong> €${properties.prijs_per_m2}
                      <br>
                      <br><strong>Reeds in Dossier:</strong> ${properties.reeds_in_dossier ? "Ja" : "Nee"}
                      <br><a href="${streetViewUrl}" target="_blank">Bekijk op Google Street View</a>
                      <p>
                      <button onclick='addToVergelijking(${JSON.stringify(feature.properties)})' class="vergelijk-knop">Toevoegen aan vergelijkingen</button>
                      </p>
                      </div>`
                      
                      
                      ;

                  circleMarker.bindPopup(popupContent);
                  markers.addLayer(circleMarker);
              }
          }
      });

      map.addLayer(markers);

      console.log("GeoJSON data en clusters succesvol toegevoegd aan de kaart");
  } catch (error) {
      console.error("Fout bij het ophalen van GeoJSON data:", error);
  }
}

loadGeoJsonData();



///--------- Info opvragen kadastraal perceel en liggin volgens gewest. ------------//

async function haalKadastraleGegevensOp(coordinaten) {
  const url = new URL('https://geo.api.vlaanderen.be/GRB-basiskaart/wms/GetFeatureInfo');
  url.search = new URLSearchParams({
      request: 'GetFeatureInfo',
      service: 'WMS',
      version: '1.3.0',
      layers: 'GRB_ADP',
      query_layers: 'GRB_ADP',
      info_format: 'application/json',
      feature_count: 10,
      I: 50,
      J: 50,
      CRS: 'EPSG:4326',
      width: 101,
      height: 101,
      bbox: `${coordinaten.lon - 0.0001},${coordinaten.lat - 0.0001},${coordinaten.lon + 0.0001},${coordinaten.lat + 0.0001}`,
  }).toString();

  try {
      const response = await fetch(url);
      if (!response.ok) {
          throw new Error('Fout bij het ophalen van de kadastrale gegevens');
      }
      const data = await response.json();
      console.log(data);
      // Verwerk de gegevens hier. Je moet de specifieke velden uit 'data' extraheren die je nodig hebt.
  } catch (error) {
      console.error(error);
  }
}







///--------------------------------------- Leaflet data filteren van de data -----------------------



document.getElementById('filter').addEventListener('click', applyFilters);

async function applyFilters() {
    // Wis de huidige markers
    markers.clearLayers();
    


    // Bepaal welke dataset geselecteerd is
    const selectedDataset = document.querySelector('input[name="options"]:checked').id;
    
    // Filterparameters ophalen
    const kiMin = document.getElementById('kiMin').value || 0; // Als leeg, gebruik 0
    const kiMax = document.getElementById('kiMax').value || Infinity; // Als leeg, gebruik Infinity
    
    const oppervlakteMin = document.getElementById('oppMin').value || 0; // Als leeg, gebruik 0
    const oppervlakteMax = document.getElementById('oppMax').value || Infinity; // Als leeg, gebruik Infinity
    
    const startBouwjaar = document.getElementById('start_bouwjaar').value;
    const endBouwjaar = document.getElementById('end_bouwjaar').value;
    

    const startDate = document.getElementById('start_date').value;
    const endDate = document.getElementById('end_date').value;

    const typesVastgoed = [...document.querySelectorAll('input[name="type-vastgoed"]:checked')].map(el => el.value);
    console.log(`Filters - Start Date: ${startDate}, End Date: ${endDate}, Types: ${typesVastgoed.join(', ')}, KI tussen de:${kiMin} en de ${kiMax}, opp tussen de:${oppervlakteMin} en de ${oppervlakteMax}  `);

    console.log(`KI Min: ${kiMin}, KI Max: ${kiMax}`);
    console.log(`Oppervlakte Min: ${oppervlakteMin}, Oppervlakte Max: ${oppervlakteMax}`);
    console.log(`Start Date: ${startDate}, End Date: ${endDate}`);
   
    // Foutcontroles
    if (parseInt(kiMin, 10) > parseInt(kiMax, 10)) {
      alert("Fout: Het minimale KI moet kleiner zijn dan het maximale KI.");
      return; // Stop de functie als de voorwaarde niet klopt
  }
  
  if (parseInt(oppervlakteMin, 10) > parseInt(oppervlakteMax, 10)) {
      alert("Fout: De minimale oppervlakte moet kleiner zijn dan de maximale oppervlakte.");
      return; // Stop de functie als de voorwaarde niet klopt
  }

  if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
    alert("Fout: De startdatum moet eerder zijn dan de einddatum.");
    return; // Stop de functie als de voorwaarde niet klopt
}

    // Controleer of beide bouwjaren zijn ingevuld en of het startbouwjaar eerder is dan het eindbouwjaar
    if (startBouwjaar && endBouwjaar && new Date(startBouwjaar) > new Date(endBouwjaar)) {
      alert("Fout: Het startbouwjaar moet eerder zijn dan het eindbouwjaar.");
      return; // Stop de functie als de voorwaarde niet klopt
  }


    // Roep de juiste functie aan op basis van de geselecteerde dataset
    switch (selectedDataset) {
        case 'dataset-Notariaat':
            console.log("Loading Notariaat data...");
            loadNotariaatData(startDate, endDate, typesVastgoed);
            break;
        case 'dataset-Vlabel':
            // loadVlabelData(startDate, endDate, typesVastgoed);
            break;
        case 'dataset-Biddit':
            // loadBidditData(startDate, endDate, typesVastgoed);
            break;
        case 'dataset-all':
        default:
            console.log("Loading all datasets...");
            loadNotariaatData(startDate, endDate, typesVastgoed);
            // loadAllData(startDate, endDate, typesVastgoed);
            break;
    }
}

// Maak een nieuwe MarkerClusterGroup
const markerClusterGroup = L.markerClusterGroup({ maxClusterRadius: 80,  disableClusteringAtZoom: 17});


async function loadNotariaatData(startDate, endDate, typesVastgoed) {
  console.log("Laden van gefilterde GeoJSON data gestart...");

  let url = `php/notariaat_filtered.php?`;
  if (startDate) url += `start_date=${startDate}&`;
  if (endDate) url += `end_date=${endDate}&`;
  if (typesVastgoed.length > 0) url += `types=${typesVastgoed.join(',')}`;

  try {
      const response = await fetch(url);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

      const data = await response.json();
      console.log("Gefilterde GeoJSON data succesvol geladen:", data);

      // Eerst de huidige markers en clusters verwijderen
      markers.clearLayers();
      markerClusterGroup.clearLayers();

     
      
      L.geoJSON(data, {
          renderer: L.canvas(), // Gebruik L.canvas als renderer
          pointToLayer: function(feature, latLng) {
              const marker = L.circleMarker(latLng, { radius: 6 });
              const properties = feature.properties;
              const streetViewUrl = `https://www.google.com/maps?q=&layer=c&cbll=${latLng.lat},${latLng.lng}`;
              const popupContent = `<div style="font-family: Arial, sans-serif; font-size: 14px;">
                      <h4><strong>${properties.type_goed}</strong></h4>
                      <br><strong>Adres:</strong> ${properties.adres} ${properties.nummer}, ${properties.postcode} ${properties.stad}
                      <br><strong>Prijs:</strong> €${properties.prijs}
                      <br><strong>Verkocht op:</strong> ${properties.aanmaak_datum.slice(0, -9) || "Niet beschikbaar"}
                      <br>
                      <br><strong>Bouwjaar:</strong> ${properties.bouw_jaar}
                      <br><strong>Oppervlakte:</strong> ${properties.oppervlakte}m²
                      <br><strong>KI:</strong> €${properties.kadastraal_inkomen}
                      <br><strong>Gevels:</strong> ${properties.gevels}
                      <br><strong>Prijs/m²:</strong> €${properties.prijs_per_m2}
                      <br>
                      <br><strong>Reeds in Dossier:</strong> ${properties.reeds_in_dossier ? "Ja" : "Nee"}
                      <br><a href="${streetViewUrl}" target="_blank">Bekijk op Google Street View</a>
                      <p>
                      <button onclick='addToVergelijking(${JSON.stringify(properties)})' class="vergelijk-knop">Toevoegen aan vergelijkingen</button>
                      </p>
                      </div>`;
                      marker.bindPopup(popupContent);
                      return marker;
                    }
                  }).eachLayer(function(layer) {
                    markerClusterGroup.addLayer(layer);
                  });
              
                  map.addLayer(markerClusterGroup);
                  console.log("Gefilterde GeoJSON data en clusters succesvol toegevoegd aan de kaart");
                } catch (error) {
                  console.error("Fout bij het ophalen van gefilterde GeoJSON data:", error);
                }
              }





//------------------- add data to info via WMS -------------


//ergfoed

function getErfgoed(lat, lon) {
  // Definieer de  WMS endpoint en layer
  const wmsEndpoint = 'https://www.mercator.vlaanderen.be/raadpleegdienstenmercatorpubliek/ows?SERVICE=WMS';
  const wmsLayer = 'ps:ps_aandobj';

  // Definieer de WMS query params
  const params = {
    service: 'WMS',
    version: '1.3.0',
    request: 'GetFeatureInfo',
    layers: wmsLayer,
    query_layers: wmsLayer,
    styles: '',
    bbox: `${lat-0.0005},${lon-0.0005},${lat+0.0005},${lon+0.0005}`,
    crs: 'EPSG:4326',
    width: 100,
    height: 100,
    format: 'image/png',
    transparent: true,
    info_format: 'application/json',
    feature_count: 10,
    i: 50,
    j: 50
  };

  // bouw de url op
  const url = `${wmsEndpoint}&${Object.entries(params).map(([k, v]) => `${k}=${encodeURIComponent(v)}`).join('&')}`;

   // maak de  request met de  WMS server
  fetch(url)
    .then(response => response.json())
    .then(data => {
      console.log(data);

      // sla de data op van de  response 
      const features = data.features;

       // als er geen features zijn betekend dat het niet in erfgoed gebied ligt
    if (!features || features.length === 0) {
      const erfgoedEl = document.getElementById('erfgoed');
      erfgoedEl.textContent = "Object is geen geïnventariseerd erfgoed";
      return;
    }

      // Maakt een tabel om de resultaten in weer te geven.
      let tableHtml = '<table class="erfgoed-table"><thead><tr><th>Naam</th><th>Type</th><th>URL</th></tr></thead><tbody>';

      // loop door elke feature en plaat ze in de tabel
      features.forEach(feature => {
        const naam = feature.properties.naam;
        const typeNaam = feature.properties.type_naam;
        const url = feature.properties.url;

        tableHtml += `<tr><td>${naam}</td><td>${typeNaam}</td><td><a href="${url}" target="_blank">Link</a></td></tr>`;
      });

      tableHtml += '</tbody></table>';

      // voeg de link toe 
      const erfgoedEl = document.getElementById('erfgoed');
      erfgoedEl.innerHTML = tableHtml;
    })
  }



//Kadaster


function Kadaster(lat, lon) {
  // Nieuwe WMS endpoint voor de GRB basiskaart
  const wmsEndpoint = 'https://geo.api.vlaanderen.be/GRB-basiskaart/wms';

  // Defineer de nieuwe WMS query parameters voor de GRB basiskaart layer
  const params = {
    service: 'WMS',
    version: '1.3.0',
    request: 'GetFeatureInfo',
    layers: 'GRB_BSK',
    query_layers: 'GRB_BSK',
    styles: '',
    bbox: `${lat-0.0001},${lon-0.0001},${lat+0.0001},${lon+0.0001}`,
    crs: 'EPSG:4326',
    width: 100,
    height: 100,
    format: 'image/png',
    transparent: true,
    info_format: 'text/html',
    feature_count: 10,
    i: 50,
    j: 50
  };

  // Bouw de URL op
  const url = `${wmsEndpoint}?${Object.entries(params).map(([k, v]) => `${k}=${encodeURIComponent(v)}`).join('&')}`;

  // Maak de request naar de WMS server
  fetch(url)
  .then(response => response.text())
  .then(data => {
    // Verwerk de response om de CAPAKEY te extraheren
    const lines = data.split('\n'); // Splits de response in regels
    let capakey = '';

    // Doorloop elke regel op zoek naar 'GRB_ADP' of 'GRB_ADP_GRENS'
    for (const line of lines) {
      if (line.includes('GRB_ADP') || line.includes('GRB_ADP_GRENS')) {
        const parts = line.split('\t'); // Splits elke regel in kolommen (uitgaande van tab als scheidingsteken)
        capakey = parts[5]; // De CAPAKEY bevindt zich in de zesde kolom
        break; // Stop met zoeken na het vinden van de eerste match
      }
    }

    // Toon de CAPAKEY en andere informatie
    const kadasterEl = document.getElementById('Kadaster');
    if (!capakey) {
      kadasterEl.textContent = "Geen data gevonden";
    } else {
      kadasterEl.innerHTML = `<br><h6>CaPaKey:</h6> ${capakey}`;
    }
  })
  .catch(error => {
    console.error('Er is een fout opgetreden bij het ophalen van de gegevens:', error);
  });
}



// Gewestplan


function gewestplanVL(lat, lon) {
  // Definieer de  WMS endpoint en layer
  const wmsEndpoint = 'https://www.mercator.vlaanderen.be/raadpleegdienstenmercatorpubliek/ows?';
  const wmsLayer = 'lu:lu_gwp_gv';


  // Define the WMS query parameters
  const params = {
    service: 'WMS',
    version: '1.3.0',
    request: 'GetFeatureInfo',
    layers: wmsLayer,
    query_layers: wmsLayer,
    styles: '',
    bbox: `${lat-0.0001},${lon-0.0001},${lat+0.0001},${lon+0.0001}`,
    crs: 'EPSG:4326',
    width: 100,
    height: 100,
    format: 'image/png',
    transparent: true,
    info_format: 'text/html',
    feature_count: 10,
    i: 50,
    j: 50
  };

// bouw de url op
const url = `${wmsEndpoint}&${Object.entries(params).map(([k, v]) => `${k}=${encodeURIComponent(v)}`).join('&')}`;


  // maak de  request met de  WMS server
   fetch(url)
.then(response => response.text())
.then(data => {
   // verzamel de gewenste info van de responce
  const parser = new DOMParser();
  const htmlDoc = parser.parseFromString(data, 'text/html');
  const features = htmlDoc.querySelectorAll('tr:not(:first-child)'); // Skip de eerste rij (headers)

   // als er geen data gevonden word geef dit antwood: 
   if (!features || features.length === 0) {
    const gewestEl = document.getElementById('gewestplan');
    gewestEl.textContent = "geen data gevonden";
    return;
  }

  // verzamel het gewestplan van de html 
  const gewestplan = features[0].querySelector('td:nth-child(12)').textContent;

  //voeg het Gewestplan toe aan het  Gewestplan element
  const gewestEl = document.getElementById('gewestplan');
  gewestEl.textContent = gewestplan;
  
  controleerVEN(lat,lon);
  controleerHAG(lat,lon);
})

}


// zoek VENgebied en voeg dit ook toe aan de info. 

function controleerVEN(lat,lon) {
    // Definieer de WMS endpoint
    const wmsEndpoint = 'https://geo.api.vlaanderen.be/RVVAfbak/wms?';
    // Definieer de WMS parameters
    const wmsParams = {
      REQUEST: 'GetFeatureInfo',
      SERVICE: 'WMS',
      LAYERS: 'RVVVlEcolNetw',
      QUERY_LAYERS: 'RVVVlEcolNetw',
      STYLES: 'default',
      BBOX: `${lat-0.0001},${lon-0.0001},${lat+0.0001},${lon+0.0001}`,
      CRS: 'EPSG:4326',
      WIDTH: 100,
      HEIGHT: 100,
      FORMAT: 'image/png',
      TRANSPARENT: true,
      VERSION: '1.3.0',
      INFO_FORMAT: 'text/html',
      FEATURE_COUNT: 10,
      I: 50,
      J: 50 
    };

    // Bouw de WMS URL
    const wmsUrl = `${wmsEndpoint}&${Object.entries(wmsParams).map(([k, v]) => `${k}=${encodeURIComponent(v)}`).join('&')}`;
    //console.log(`WMS URL: ${wmsUrl}`);
  
  // Maak het verzoek naar de WMS-server
  fetch(wmsUrl)
    .then((response) => response.text())
    .then((data) => {
  // verzamel de gewenste info van de responce
  const parser = new DOMParser();
  const htmlDoc = parser.parseFromString(data, 'text/html');
  const features = htmlDoc.querySelectorAll('tr:not(:first-child)'); // Skip de eerste rij (headers)

  // als er geen data gevonden word geef dit antwoord:
  if (!features || features.length === 0) {
    const venGebied = document.getElementById('venGebied');
    venGebied.textContent = "Niet in VEN gebied";
    return;
  }

  // verzamel het gewestplan van de html
  const gewestplan = features[0].querySelector('td:nth-child(9)').textContent;

  // verzamel de begunstigde van de html
  const begunstigde = features[0].querySelector('td:nth-child(9)').textContent;

  // Voeg de begunstigde toe aan het VEN-gebied element
  const venGebied = document.getElementById('venGebied');
venGebied.innerHTML = `<b>VEN Gebied met begunstigde: </b> ${begunstigde} <br>`;
venGebied.style.display = 'inline'; // Toon het venGebied element
    })
}


//controleer HAG gebied

function controleerHAG(lat, lon) {
  // Definieer de WMS endpoint
  const wmsEndpoint = 'https://www.mercator.vlaanderen.be/raadpleegdienstenmercatorpubliek/ows?SERVICE=WMS&';
  // Definieer de WMS parameters
  const wmsParams = {
    REQUEST: 'GetFeatureInfo',
    SERVICE: 'WMS',
    LAYERS: 'lu:lu_hag',
    QUERY_LAYERS: 'lu:lu_hag',
    STYLES: '',
    BBOX: `${lat - 0.0001},${lon - 0.0001},${lat + 0.0001},${lon + 0.0001}`,
    CRS: 'EPSG:4326',
    WIDTH: 100,
    HEIGHT: 100,
    FORMAT: 'image/png',
    TRANSPARENT: true,
    VERSION: '1.3.0',
    INFO_FORMAT: 'text/html',
    FEATURE_COUNT: 10,
    I: 50,
    J: 50
  };

  // Bouw de WMS URL
  const wmsUrl = `${wmsEndpoint}&${Object.entries(wmsParams).map(([k, v]) => `${k}=${encodeURIComponent(v)}`).join('&')}`;
  //console.log(`WMS URL: ${wmsUrl}`);

  // Maak het verzoek naar de WMS-server
  fetch(wmsUrl)
    .then((response) => response.text())
    .then((data) => {
      // verzamel de gewenste info van de responce
      const parser = new DOMParser();
      const htmlDoc = parser.parseFromString(data, 'text/html');
      const features = htmlDoc.querySelectorAll('tr:not(:first-child)'); // Skip de eerste rij (headers)

      // als er geen data gevonden word geef dit antwoord:
      if (!features || features.length === 0) {
        const hagGebied = document.getElementById('hagGebied');
        hagGebied.textContent = "Niet in HAG gebied<br>";
        return;
      }

      // verzamel de naam en de link_oup van de html
      const naam = features[0].querySelector('td:nth-child(7)').textContent;
      const link_oup = features[0].querySelector('td:nth-child(14)').textContent; 

      // Voeg de naam en de link_oup toe aan het HAG-gebied element
      const hagGebied = document.getElementById('hagGebied');
      hagGebied.innerHTML = `<b>HAG gebied:</b> ${naam} <br>  <a href="${link_oup}" target="_blank">Link HAG<br></a>`;
      hagGebied.style.display = 'inline'; // Toon het hagGebied element
    })
}


//Overstromingsgevoelig


function overVL(lat, lon) {
  // Definieer de  WMS endpoint en layer
  const wmsEndpoint = 'https://geoservices.informatievlaanderen.be/raadpleegdiensten/VMMWatertoets/wms?';
  const wmsLayer = 'Ovstrgev2014';


  // Definieer de  WMS  parameters
  const params = {
    service: 'WMS',
    version: '1.3.0',
    request: 'GetFeatureInfo',
    layers: wmsLayer,
    query_layers: wmsLayer,
    styles: '',
    bbox: `${lat-0.0001},${lon-0.0001},${lat+0.0001},${lon+0.0001}`,
    crs: 'EPSG:4326',
    width: 100,
    height: 100,
    format: 'image/png',
    transparent: true,
    info_format: 'text/html',
    feature_count: 10,
    i: 50,
    j: 50
  };


// bouw de url op
const url = `${wmsEndpoint}&${Object.entries(params).map(([k, v]) => `${k}=${encodeURIComponent(v)}`).join('&')}`;


  // maak de  request met de  WMS server
  fetch(url)
   .then(response => response.text())
   .then(data => {
    // verzamel de gewenste info van de responce
     const parser = new DOMParser();
     const htmlDoc = parser.parseFromString(data, 'text/html');
     const features = htmlDoc.querySelectorAll('tr:not(:first-child)'); // Skip de eerste rij (headers)

         // Controleer de waarde van de eerste kolom en stel de juiste tekst in
     const firstColumnValue = features[0].querySelectorAll('td')[0].textContent;
     const overVL = document.getElementById('Overstromingsgevoeilg');
     if (firstColumnValue === '1') {
       overVL.textContent = "Effectief overstromingsgevoelig gebied";
     } else if (firstColumnValue === '2') {
       overVL.textContent = "Mogelijk overstromingsgevoelig gebied";
     } else {
       overVL.textContent = "Niet in overstromingsgevoelig gebied";
     }
   })
   
}
