
//---------------------------------- algememen event handelers en opmaak iconen -------------------

//reset knop instellen
document.getElementById("reset").addEventListener("click", function() {
  location.reload();
});


// code om modal op te roepen als je op info klikt 
document.addEventListener("DOMContentLoaded", function() {
  const infoBtn = document.getElementById("info-btn");
  const infoModal = new bootstrap.Modal(document.getElementById("info-modal"));

  infoBtn.addEventListener("click", function() {
    infoModal.show();
  });
});


// defineer het groene icon voor het adres zoekopracht
const greenIcon = L.icon({
  iconUrl: "data/img/icon_hier.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
  iconSize: [24, 30],
  iconAnchor: [12, 30],
  popupAnchor: [1, -5],
  shadowSize: [41, 31],
});



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

// Definieer het pictogram voor Immoweb.(er word gebruikt gemaakt van een zelf gemaakt icoon hiervoor)
const blueIcon = L.icon({
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

//Allereerst wordt er een kaart gedefinieerd en het centrum van de kaart ingesteld op de geografische coördinaten van België.
let map = L.map("map", {
  center: [50.5039, 4.4699],
  zoom: 8,
});


// Definieer de NGI-topo layer
let baseLayer = L.tileLayer.wms("https://cartoweb.wms.ngi.be/service", {
  layers: "topo",
  format: "image/png",
  transparent: true,
  version: "1.3.0",
  crs: L.CRS.EPSG3857,
  attribution:
    'NGI Topo &copy; <a href="https://www.ngi.be/">National Geographic Institute of Belgium</a>',
});

// Definieer de NGI-ortho layer
let ngiOrtho = L.tileLayer.wms("https://wms.ngi.be/inspire/ortho/service", {
  layers: "orthoimage_coverage_2020",
  format: "image/png",
  transparent: true,
  version: "1.3.0",
  crs: L.CRS.EPSG3857,
  attribution:
    'NGI Ortho &copy; <a href="https://www.ngi.be/">National Geographic Institute of Belgium</a>',
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

// Definieer de waalse Watertoets WMS
let watertoetsLayerWalonie = L.tileLayer
.wms("https://geoservices.wallonie.be/arcgis/services/EAU/ALEA_INOND/MapServer/WmsServer", {
    layers: "6,5,4",
    format: "image/png",
    transparent: true,
    version: "1.3.0",
    crs: L.CRS.EPSG3857,
  }
);

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
  attribution: 'Gewestplan &copy; <a href="https://www.agiv.be/">AGIV</a>'
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
baseLayer.addTo(map);
Perceel.bringToFront();



// voeg controler toe om van laag te wisselen
let baseMaps = {
  "NGI Topo": baseLayer,
  "NGI Ortho": ngiOrtho,
  "OSM LAYER": osmLayer,
  
};

let overlayMaps = {
  "Gewest plan Vlaanderen" : GewestVL,
  "Gewest plan Brussel" : GewestBRU,
  "Gewest plan Walonie" : GewestWal,
  "Kadastraal perceel": Perceel,
  "Watertoets_VL": watertoetsLayerVlaanderen,
  "Watertoets_WAL": watertoetsLayerWalonie,
  
  
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





//-------------------------- DIAGRAM AANMAKEN ----------------------

// Maak de functie om gegevens op te halen van de API en het diagram te maken.
async function PrijsIndexTabel() {
  const response = await fetch(
    "https://bestat.statbel.fgov.be/bestat/api/views/ec1309b7-4de9-4dde-b89e-5dd8f8a70edd/result/JSON"
  );
  const data = await response.json();

  // Haal de relevante gegevens uit de JSON-structuur.
  const index = data.facts;

  // Filter gegevens voor de laatste twee jaar.
  const laatseTweeJaar = index.filter((entry) => {
    const HuidigJaar = new Date().getFullYear();
    const jaartal = parseInt(entry.Jaar);
    return jaartal >= HuidigJaar - 2;
  });

  // Bereid de gegevens voor op het diagram.
  const labels = laatseTweeJaar.map((entry) => `${entry.Trimester}`);
  const dataset = laatseTweeJaar.map(
    (entry) => parseFloat(entry.Index) - 100
  );

  // Genereer diagram.
  const ctx = document.getElementById("priceIndexChart").getContext("2d");
  new Chart(ctx, {
    type: "line",
    data: {
      labels,
      datasets: [
        {
          label: "Indexcijfer van de huizenprijzen (%) (tegenover 2015) ",
          data: dataset,
          borderColor: "rgb(75, 192, 192)",
          tension: 0.1,
        },
      ],
    },
    options: {
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            callback: function (value) {
              return value + "%";
            },
          },
        },
      },
      plugins: {
        legend: {
          display: true,
          labels: {
            font: {
              size: 14,
            },
          },
        },
      },
    },
  });
}

// Roep de functie aan om het diagram te maken.
PrijsIndexTabel();





//----------------------------- Adress zoek functie + click on map functie ----------------------


//Eventlistener adreszoekopdracht
document.getElementById('search-button').addEventListener('click', ZoekAdres);



// Definieer de zoekfunctie & API key
let markerAdres;
let circleRadius = '2000';
let circle;
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
        //als circle niet aanwezig (=null of falls) is voer de if statment uit anders de else.
        if (!circle) {
          // Maak een cirkel met de standaardradius
          circle = L.circle([lat, lon], { radius: circleRadius }).addTo(map);
        } else {
          // Update de positie en radius van de cirkel
          circle.setLatLng([lat, lon]);
          circle.setRadius(circleRadius);
        }
      }
    })
    .catch(error => console.error(error));


    // als het gezochte adres binnen vlaanderen ligt update de samenvatende info:
    const params = {
      service: 'WMS',
      version: '1.3.0',
      request: 'GetFeatureInfo',
      layers: 'Refgew',
      query_layers: 'Refgew',
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
    const wmsEndpoint = 'https://geoservices.informatievlaanderen.be/raadpleegdiensten/Administratieve_Eenheden/wms';
    const url_wms = `${wmsEndpoint}?${Object.entries(params).map(([k, v]) => `${k}=${encodeURIComponent(v)}`).join('&')}`;
    console.log(`WMS URL: ${url_wms}`);

    // Maak een GET-verzoek naar de WMS-service
  fetch(url_wms)
  .then(response => response.text())
  .then(data => {
    // Controleer of de server informatie over de geklikte locatie heeft teruggestuurd
    if (data.includes("Refgew")) { 
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
    updateMarkers(lat, lon);
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

    //als circle niet aanwezig (=null of falls) is voer de if statment uit anders de else.
    if (!circle) {
      // Maak een nieuwe cirkel op de geklikte locatie met de huidige straal.
      circle = L.circle([lat, lon], { radius: circleRadius }).addTo(map);
    } else {
     // Werk de positie en straal van de cirkel bij.
      circle.setLatLng([lat, lon]);
      circle.setRadius(circleRadius);
    }
  });
  
  
  
    // als het gezochte adres binnen vlaanderen ligt update de samenvatende info:
    const params = {
      service: 'WMS',
      version: '1.3.0',
      request: 'GetFeatureInfo',
      layers: 'Refgew',
      query_layers: 'Refgew',
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
    const wmsEndpoint = 'https://geoservices.informatievlaanderen.be/raadpleegdiensten/Administratieve_Eenheden/wms';
    const url_wms = `${wmsEndpoint}?${Object.entries(params).map(([k, v]) => `${k}=${encodeURIComponent(v)}`).join('&')}`;
    console.log(`WMS URL: ${url_wms}`);

    // Maak een GET-verzoek naar de WMS-service
  fetch(url_wms)
  .then(response => response.text())
  .then(data => {
    // Controleer of de server informatie over de geklikte locatie heeft teruggestuurd
    if (data.includes("Refgew")) { 
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
document.getElementById('radius').addEventListener('input', (event) => {
  updateRadius(event.target.value);
});

 
// Werk de straal van de cirkel bij wanneer de schuifregelaar wordt verplaatst.
document.getElementById('radius').addEventListener('input', (event) => {
  updateRadius(event.target.value);
  if (markerAdres) {
    const latlng = markerAdres.getLatLng();
    const lat = latlng.lat;
    const lon = latlng.lng;
    //pas dit dan ook aan op de kaart door deze functies op te roepen
    circle.setLatLng([lat, lon]);
    circle.setRadius(circleRadius);
  }
});

// pas ook de value aan op de HTML pagina naar de geslecteerde afstand
function updateRadius(value) {
  circleRadius = value * 1000; //  kilometers naar meters
  document.getElementById('radius-value').innerHTML = value + ' km';
}


/// ------------------------------------ inladen van volledige CSV Biddit via PHP om weer te geven op de kaart ---------------------



// Maak een nieuwe variabele genaamd "markers" (= de groep van individuele "maker") en wijs deze toe aan een nieuwe instantie van de L.markerClusterGroup()-klasse.
let markerCluster;
let markers = L.markerClusterGroup({ maxClusterRadius: 80,  disableClusteringAtZoom: 15
 });

//roep de PHP die de markers laad
async function loadBidditData() {
  try {
    const response = await fetch("php/load_markers.php");

    if (!response.ok) {
      throw new Error(`HTTP error ${response.status}: ${await response.text()}`);
    }

    const data = await response.text();

    // Verwerk de CSV-gegevens met Papa Parse. (> opgelet de csv heeft een ";" delimiter)
    let result = Papa.parse(data, {
      delimiter: ";",
      header: true,
      skipEmptyLines: true,
      dynamicTyping: true,
    });

    // Controleer op fouten in de gegevens.
    if (result.errors.length > 0) {
      console.error("CSV parsing errors:", result.errors);
      return;
    }

    let rows = result.data;

    // loop door de rijen
    for (let i = 0; i < rows.length; i++) {
      let row = rows[i];

      // Controleer of breedtegraad en lengtegraad bestaan in het csv bestand en vervang de , met een .
      if (row.latitude && row.longitude) {
        let lat = parseFloat(String(row.latitude).replace(",", "."));
        let lng = parseFloat(String(row.longitude).replace(",", "."));

        // Voeg eigenschapsgegevens toe aan de marker.  (om enkel de toegewezen te kunnen weergeven)
        let property = {
          status: row.status.toLowerCase(),
        };

        // Controleer of de status 'toegezen' is voordat u de marker toevoegt
        if (property.status === "toegewezen") {
          // maak een marker (type:biddit) met het rode icoon
          let marker = L.marker([lat, lng], { icon: redIcon });

          // Voeg eigenschapsgegevens toe aan de marker.
          marker.property = property;
        
                  // Maak de HTML-inhoud voor de marker popup.
                  let imgCode = row.code; // Haal de code-waarde op en verwijder "code: " uit de tekst om enkel de code over te houden
                  let imgSrc = "data/img/" + imgCode + ".jpeg";
                  let popupContent =
                  `<h4>${row.typevastgoed}</h4>` +
                  `${row.prijs} €` +
                  '<br>'+
                  `${row.adres}` +
                  '<br>'+
                  `<b>Laatst gezien:</b> ${row.laatstgezien}` +
                  "<br>" +
                  "<br>" +
                  `<img src='${imgSrc}'><br>` +
                  `<a href='https://www.google.com/maps?q=${row.latitude},${row.longitude}&layer=c&cbll=${row.latitude},${row.longitude}&cbp=13,0,0,0,0' target='_blank'>Bekijk in Google Street View</a>` +
                  "<br>" +
                  "<br>" +
                  `${row.beschrijving}` +
                  "<br>" +
                  "<br>" +
                  `<b>Soort verkoop:</b> ${row["soort verkoop"]}` +
                  "<br>" +
                  `<b>Oppervlakte:</b> ${row.oppervlakte}` +
                  "<br>" +
                  `<b>KI:</b> € ${row.KI}` +
                  "<br>" +
                  `<b>Status:</b> ${row.status}` +
                  "<br>" +
                  `<b>Code:</b> ${imgCode}`;
                  marker.bindPopup(popupContent);
        
                  // Voeg de individuele marker toe aan de cluster groep.
                  markers.addLayer(marker);
                }
              }
            }
        
            // Voeg de marker cluster groep toe aan de kaart.
            map.addLayer(markers);
          } catch (error) {
            console.error("Error bij het ophalen van de data:", error);
          }
        }
        
        loadBidditData();
        


///----------------------------- Inladen van de 2 csv's  data Immoweb via php ------------


async function LaadImmowebData() {
  try {
    const response = await fetch('php/load_immoweb_markers.php');
    
    // Controleer of het verzoek succesvol was
    if (!response.ok) {
      throw new Error(`HTTP error ${response.status}: ${await response.text()}`);
    }

    // Verkrijg JSON-gegevens uit het antwoord
    const data = await response.json();
    //console.log('Opgehaalde JSON data:', data);
    // Groepeer appartementen op code
    const appartementenByCode = {};

    data.appartementen.slice(1).forEach((appartement) => {
      const { code, prijs, oppervlakte, verdieping, soort } = appartement;
      if (!appartementenByCode[code]) {
        appartementenByCode[code] = [];
      }
      appartementenByCode[code].push({ prijs, oppervlakte, verdieping, soort });
    });

    // Voeg markers toe aan de kaart voor elk gebouw
    data.gebouwen.slice(1).forEach((gebouw) => {
      const { typevastgoed, beschrijving, code, adres, laatstgezien, latitude, longitude } = gebouw;
      const appartementenList = appartementenByCode[code] || [];
  
      // Maak een informatietabel voor de appartementen waar ze in worden weergegeven
      let appartementenInfo = '';
      appartementenList.forEach((appartement) => {
        appartementenInfo += `
          <tr>
            <td>${appartement.prijs + "€"} </td>
            <td>${appartement.oppervlakte + " m²"}</td>
            <td>${appartement.verdieping}</td>
            <td>${appartement.soort}</td>
          </tr>
        `;
      });

  // Maak een marker en voeg deze toe aan de kaart
      const marker = L.marker([latitude, longitude], { icon: blueIcon });
      marker.bindPopup(`
        <div class="popup-content">
          <h4>${typevastgoed}</h4>
          <p>${adres} <br>
          <strong>Laatst gezien:</strong> ${laatstgezien}</p>
          <img src="data/img/immoweb/${code}.jpg" alt="${typevastgoed}">
          <p>${TextIngekort(beschrijving, 150)}</p>
          <button onclick="volledigeBeschrijvingPopup('${VervangQuotes(beschrijving)}')">Lees meer ...</button>
          <hr>
          <div class="popup-table-container">
            <table class="popup-table">
              <thead>
                <tr>
                  <th>Prijs</th>
                  <th>Oppervlakte</th>
                  <th>Verdieping</th>
                  <th>Soort</th>
                </tr>
              </thead>
              <tbody>
                ${appartementenInfo}
              </tbody>
            </table>
          </div>
        </div>
      `);
      markers.addLayer(marker);
    });

    map.addLayer(markers);

  } catch (error) {
    console.error('Error fetching map data:', error);
  }
}
// Verkort de tekst tot de opgegeven maximale lengte
function TextIngekort(text, maxLength) { 
  if (text.length > maxLength) {
    const truncated = text.substr(0, maxLength);
    return `${truncated}...`;
  } else {
    return text;
  }
}

// Vervang dubbele aanhalingstekens door HTML-entiteiten
function VervangQuotes(text) { 
  return text.replace(/"/g, '&quot;');
}

// Toon de volledige beschrijving in een pop-upvenster
function volledigeBeschrijvingPopup(description) { 
  alert(description);
}

// Haal de gegevens op en toon de markers op de kaart fetchData();
LaadImmowebData();


///--------------------------------------- Download data (filtered)-----------------------



// Luister naar klikken op de downloadknop

document.getElementById("download-csv").addEventListener("click", function (event) {
  event.preventDefault();

  const datasetAll = document.getElementById("dataset-all");
  const datasetBiddit = document.getElementById("dataset-biddit");
  const datasetImmoweb = document.getElementById("dataset-immoweb");

  if (datasetAll.checked) {
    applyFilter_Biddit();
    applyFilter_Immoweb();
    //console.log('alle 2 de data word gedownload')
  } else if (datasetBiddit.checked) {
    applyFilter_Biddit();
    //console.log('enkel biddit word gedownload')
  } else if (datasetImmoweb.checked) {
    applyFilter_Immoweb();
    //console.log('enkel immoweb word gedownload')
  }
});


function applyFilter_Biddit() {
    if (!markerAdres) {
    alert("Zoek eerst een adres of klik op de kaart om een vastgoedboject te selecteren.");
    return;
  }

 
  // Verzamel geselecteerde type
  let selectedTypes = [];
  let typeVastgoedCheckboxes = document.querySelectorAll("input[name='type-vastgoed']:checked");

  typeVastgoedCheckboxes.forEach(function (checkbox) {
    selectedTypes.push(checkbox.value);
  });

  // min & maximum prijs
  let minPrice = document.getElementById("min-price").value;
  let maxPrice = document.getElementById("max-price").value;

  // start & eind datum
  let startDate = document.getElementById("start_date").value 
  let endDate = document.getElementById("end_date").value 
  
  // min & max oppervlakte
  let minGrondOpp = document.getElementById("min-ground-area").value;
  let maxGrondOpp = document.getElementById("max-ground-area").value;

   // Haal het center van het adres en de straal op.
   let lat = markerAdres ? markerAdres.getLatLng().lat : null;
   let lng = markerAdres ? markerAdres.getLatLng().lng : null;
   let radius = circleRadius;
 
// Stuur de geselecteerde filters naar het PHP-script.
fetchFilteredCSV("Toegewezen", selectedTypes, minPrice, maxPrice, minGrondOpp, maxGrondOpp, startDate, endDate, lat, lng, radius);
 }
 function fetchFilteredCSV(selectedStatus, selectedTypes, minPrice, maxPrice, minGroundArea, maxGroundArea, startDate, endDate, lat, lng, radius) {
  const formData = new FormData();
  formData.append("selected_status", selectedStatus);
  formData.append("selected_types", JSON.stringify(selectedTypes));
  formData.append("min_price", minPrice);
  formData.append("max_price", maxPrice);
  formData.append("min_ground_area", minGroundArea);
  formData.append("max_ground_area", maxGroundArea);
  formData.append("start_date", startDate);
  formData.append("end_date", endDate);     

  if (lat && lng) {
    formData.append("address_lat", lat);
    formData.append("address_lng", lng);
    formData.append("max_distance", radius);
    
  }

  
  fetch("php/download_Biddit_markers.php", {
    method: "POST",
    body: formData,
  })
    .then((response) => response.blob())
    .then((blob) => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "Biddit_data.csv";
      document.body.appendChild(a); // Vereist voor Firefox
      a.click();
      a.remove();
    })
    .catch((error) => console.error("Error ophalen CSV:", error));
}


//* immoweb */-----------


function applyFilter_Immoweb() {
  if (!markerAdres) {
    alert("Zoek eerst een adres of klik op de kaart om een vastgoedboject te selecteren.");
    return;
  }
  // Verzamel geselecteerde type
  let selectedTypes = [];
  let typeVastgoedCheckboxes = document.querySelectorAll("input[name='type-vastgoed']:checked");

  typeVastgoedCheckboxes.forEach(function (checkbox) {
    selectedTypes.push(checkbox.value);
  });

  // min & maxi price
  let minPrice = document.getElementById("min-price").value;
  let maxPrice = document.getElementById("max-price").value;

  // start & end date
  let startDate = document.getElementById("start_date").value 
  let endDate = document.getElementById("end_date").value 
  
  // min & max opp
  let minGrondOpp = document.getElementById("min-ground-area").value;
  let maxGrondOpp = document.getElementById("max-ground-area").value;

   // Haal het center van het adres en de straal op.
  let lat = markerAdres ? markerAdres.getLatLng().lat : null;
  let lng = markerAdres ? markerAdres.getLatLng().lng : null;
  let radius = circleRadius;
    
  // Voeg de filterwaarden toe aan een FormData-object
  const formData = new FormData();
  formData.append("selected_types", JSON.stringify(selectedTypes));
  formData.append("min_price", minPrice);
  formData.append("max_price", maxPrice);
  formData.append("min_ground_area", minGrondOpp);
  formData.append("max_ground_area", maxGrondOpp);
  formData.append("start_date", startDate);
  formData.append("end_date", endDate);

  if (lat && lng) {
    formData.append("address_lat", lat);
    formData.append("address_lng", lng);
    formData.append("max_distance", radius);
  }

  // Verstuur een POST-verzoek naar de nieuwe PHP-script voor appartementen
  fetch("php/download_immoweb_csv.php", {
    method: "POST",
    body: formData,
  })
  .then(response => {
    if (!response.ok) {
      throw new Error("Network response was niet ok");
    }
    return response.blob();
  })
  .then(blob => {
    const url = window.URL.createObjectURL(new Blob([blob]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'gefilterde_immoweb_appartementen.csv');
    document.body.appendChild(link);
    link.click();
    link.remove();
  })
  .catch(error => {
    console.error('Er is iets gebeurd:', error);
  });
}


///--------------------------------------- Leaflet data (filtered)-----------------------

// Event Listener voor de Apply knop
document.getElementById("filter").addEventListener("click", function() {
  if (!markerAdres) {
    alert("Zoek eerst een adres of klik op de kaart om een vastgoedboject te selecteren.");
    return;
  }
  applyfilter_Biddit_markers();
  applyfilter_immoweb();
  // Verwijder de huidige markers van de kaart.
  map.removeLayer(markers);
  markers.clearLayers();

  // Verberg de tabellen als ze zichtbaar zijn.
  const table1 = document.getElementById('table-wrapper-Biddit');
  const table2 = document.getElementById('table-wrapper-Immoweb');
  table1.hidden = true;
  table2.hidden = true;

});


// Biddit

async function applyfilter_Biddit_markers() {
  // Haal de status van de radio knoppen op
  const datasetAll = document.getElementById("dataset-all");
  const datasetBiddit = document.getElementById("dataset-biddit");

  // Controleer of "alle" of "biddit" is aangevinkt
  if (!datasetAll.checked && !datasetBiddit.checked) {
    // console.log("Noch 'alle' noch 'biddit' is aangevinkt.");
    return;
  }

  // console.log('Filter button clicked');

  



  // Verzamel geselecteerde type
  let selectedTypes = [];
  let typeVastgoedCheckboxes = document.querySelectorAll("input[name='type-vastgoed']:checked");

  typeVastgoedCheckboxes.forEach(function (checkbox) {
    selectedTypes.push(checkbox.value);
  });

  // min & maxi price
  let minPrice = document.getElementById("min-price").value;
  let maxPrice = document.getElementById("max-price").value;

  // start & end date
  let startDate = document.getElementById("start_date").value 
  let endDate = document.getElementById("end_date").value 
  
  
  // min & max opp
  let minGroundArea = document.getElementById("min-ground-area").value;
  let maxGroundArea = document.getElementById("max-ground-area").value;

   // Haal het center van het adres en de straal op.
  let lat = markerAdres ? markerAdres.getLatLng().lat : null;
  let lng = markerAdres ? markerAdres.getLatLng().lng : null;
  let radius = circleRadius;

  // Haal de gefilterde gegevens op.
  const filteredData = await fetchFilteredData("Toegewezen", selectedTypes, minPrice, maxPrice, minGroundArea, maxGroundArea, startDate, endDate, lat, lng, radius);
  
  // verwijder de header 
  const dataWithoutHeader = filteredData.slice(1);

  // Roep hier de "updateTable" functie aan (voor de tabel onderaan).
  updateTable_Biddit(dataWithoutHeader);
 
  // controle log of alles goed is doorgegeven
  // console.log("Opgehaalde data:", filteredData);

 

  // Maak een nieuwe markerClusterGroup en voeg de gefilterde markers toe.
  markers = L.markerClusterGroup({ maxClusterRadius: 80,  disableClusteringAtZoom: 15
  });

  // Loop door de gefilterdeData en maak markers aan.
  for (const row of dataWithoutHeader) {
    // Controleer of breedtegraad en lengtegraad bestaan in het CSV-bestand en vervang de , door een .
    if (row[12] && row[13]) {
      const lat = parseFloat(String(row[12]).replace(",", "."));
      const lng = parseFloat(String(row[13]).replace(",", "."));

      // Maak een marker aan (type: biddit).
      const marker = L.marker([lat, lng], { icon: redIcon });
      

      // Voeg eigenschapsgegevens toe aan de marker.
      marker.property = {
        price: parseInt(row[1]),
        oppervlakte: parseInt(row[2]),
        type: row[0].toLowerCase(),
        status: row[11].toLowerCase(),
      };

            // Maak de HTML-inhoud voor de marker popup.
            const imgCode = row[7].substring(row[7].indexOf(":") + 1).trim(); // vraag de code-waarde op en verwijder "code: " uit de tekst om alleen de code over te houden.
            const imgSrc = "data/img/" + imgCode + ".jpeg";
            const popupContent =
            `<h4>${row[0]}</h4>` +
            `${row[1]} €` +
            '<br>' +
            `${row[8]}` +
            '<br>' +
            `<b>Laatst gezien:</b> ${row[10]}` +
            "<br>" +
            "<br>" +
            `<img src='${imgSrc}'><br>` +
            `<a href='https://www.google.com/maps?q=${row[12]},${row[13]}&layer=c&cbll=${row[12]},${row[13]}&cbp=13,0,0,0,0' target='_blank'>Bekijk in Google Street View</a>` +
            "<br>" +
            "<br>" +
            `${row[3]}` +
            "<br>" +
            "<br>" +
            `<b>Soort verkoop:</b> ${row[9]}` +
            "<br>" +
            `<b>Oppervlakte:</b> ${row[2]}` +
            "<br>" +
            `<b>KI:</b> € ${row[6]}` +
            "<br>" +
            `<b>Status:</b> ${row[11]}` +
            "<br>" +
            `<b>Code:</b> ${imgCode}`;
            marker.bindPopup(popupContent);
      
            // Voeg de individuele marker toe aan de cluster groep.
            markers.addLayer(marker);
            
          }
        }
      
        // Voeg nieuwe markers toe aan de kaart
        map.addLayer(markers);
        
      }
      



// Haal de gefilterde gegevens op en retourneer deze als JSON
async function fetchFilteredData(selectedStatuses, selectedTypes, minPrice, maxPrice, minGroundArea, maxGroundArea, startDate, endDate, lat, lng, radius) {
  //console.log("Start Date:", document.getElementById("start_date").value);
  //console.log("End Date:", document.getElementById("end_date").value);
      
  // Voeg de filterwaarden toe aan een FormData-object
  const formData = new FormData();
  formData.append("selected_status", selectedStatuses[0]);
  formData.append("selected_types", JSON.stringify(selectedTypes));
  formData.append("min_price", minPrice);
  formData.append("max_price", maxPrice);
  formData.append("min_ground_area", minGroundArea);
  formData.append("max_ground_area", maxGroundArea);
  formData.append("start_date", startDate);
  formData.append("end_date", endDate);

  if (lat && lng) {
    formData.append("address_lat", lat);
    formData.append("address_lng", lng);
    formData.append("max_distance", radius);
  }

  // Verstuur een POST-verzoek naar de nieuwe PHP-script
  const response = await fetch("php/filter_Biddit_markers.php", {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    console.error("Error bij het ophalen van de biddit data:", response.statusText);
    return [];
  }

  const responseBody = await response.text(); 

  //console.log("Response body:", responseBody); // Debugging consol log

  try {
    // Converteer de  response naar  JSON en geef terug
    return JSON.parse(responseBody);
  } catch (e) {
    console.error("Omzetten naar JSON mislukt:", e);
    throw e;
  }
}


// immoweb ------


async function applyfilter_immoweb() {
  // Haal de status van de radio knoppen op
  const datasetAll = document.getElementById("dataset-all");
  const datasetImmoweb = document.getElementById("dataset-immoweb");

  // Controleer of "alle" of "biddit" is aangevinkt
  if (!datasetAll.checked && !datasetImmoweb.checked) {
    
    return;
  }
  
  
  // Verzamel geselecteerde type
  let selectedTypes = [];
  let typeVastgoedCheckboxes = document.querySelectorAll("input[name='type-vastgoed']:checked");

  typeVastgoedCheckboxes.forEach(function (checkbox) {
    selectedTypes.push(checkbox.value);
  });

  // min & maxi price
  let minPrice = document.getElementById("min-price").value;
  let maxPrice = document.getElementById("max-price").value;

  // start & end date
  let startDate = document.getElementById("start_date").value 
  let endDate = document.getElementById("end_date").value 
  
  
  // min & max opp
  let minGroundArea = document.getElementById("min-ground-area").value;
  let maxGroundArea = document.getElementById("max-ground-area").value;

   // Haal het center van het adres en de straal op.
  let lat = markerAdres ? markerAdres.getLatLng().lat : null;
  let lng = markerAdres ? markerAdres.getLatLng().lng : null;
  let radius = circleRadius;

  //console.log('lat:', lat);
  //console.log('lng:', lng);

// Haal de gefilterde gegevens op.
const filteredData_Immoweb = await fetchFilteredData_Immoweb(selectedTypes, minPrice, maxPrice, minGroundArea, maxGroundArea, startDate, endDate, lat, lng, radius);

  
// Groepeer appartementen op code
const appartementenByCode = {};

filteredData_Immoweb.appartementen.slice(1).forEach((appartement) => {
  const [code, prijs, oppervlakte, verdieping, soort] = appartement;
  if (code) {
    if (!appartementenByCode[code]) {
      appartementenByCode[code] = [];
    }
    appartementenByCode[code].push({ prijs, oppervlakte, verdieping, soort });
  }
});



// Voeg markers toe aan de kaart voor elk gebouw
filteredData_Immoweb.gebouwen.slice(1).forEach((gebouw) => {
  const [typevastgoed, beschrijving, code, adres, laatstgezien, latitude, longitude] = gebouw;
  //console.log('latitude:', latitude);
  //console.log('longitude:', longitude);
  const appartementenList = appartementenByCode[code] || [];
  //console.log('appartementenList:', appartementenList);

  // Maak een informatietabel voor de appartementen
  let appartementenInfo = '';
  appartementenList.forEach((appartement) => {
    //console.log('appartement:', appartement);
    appartementenInfo += `
      <tr>
        <td>${appartement.prijs + "€"} </td>
        <td>${appartement.oppervlakte + " m²"}</td>
        <td>${appartement.verdieping}</td>
        <td>${appartement.soort}</td>
      </tr>
    `;
  });

  // Maak een marker en voeg deze toe aan de kaart
  const marker = L.marker([latitude, longitude], { icon: blueIcon });
  //console.log('marker:', marker)
  marker.bindPopup(`
    <div class="popup-content">
      <h4>${typevastgoed}</h4>
      <p>${adres} <br>
      <strong>Laatst gezien:</strong> ${laatstgezien}</p>
      <img src="data/img/immoweb/${code}.jpg" alt="${typevastgoed}">
      <p>${TextIngekort(beschrijving, 150)}</p>
      <button onclick="volledigeBeschrijvingPopup('${VervangQuotes(beschrijving)}')">Lees meer ...</button>
      <hr>
      <div class="popup-table-container">
        <table class="popup-table">
          <thead>
            <tr>
              <th>Prijs</th>
              <th>Oppervlakte</th>
              <th>Verdieping</th>
              <th>Soort</th>
            </tr>
          </thead>
          <tbody>
            ${appartementenInfo}
          </tbody>
        </table>
      </div>
    </div>
  `);
  markers.addLayer(marker);
});

map.addLayer(markers);
}




// Haal de gefilterde gegevens op en retourneer deze als JSON
async function fetchFilteredData_Immoweb(selectedTypes, minPrice, maxPrice, minGroundArea, maxGroundArea, startDate, endDate, lat, lng, radius) {
    
  // Voeg de filterwaarden toe aan een FormData-object
  const formData = new FormData();
  formData.append("selected_types", JSON.stringify(selectedTypes));
  formData.append("min_price", minPrice);
  formData.append("max_price", maxPrice);
  formData.append("min_ground_area", minGroundArea);
  formData.append("max_ground_area", maxGroundArea);
  formData.append("start_date", startDate);
  formData.append("end_date", endDate);

  if (lat && lng) {
    formData.append("address_lat", lat);
    formData.append("address_lng", lng);
    formData.append("max_distance", radius);
  }

  // Verstuur een POST-verzoek naar de nieuwe PHP-script voor appartementen
  const responseApp = await fetch("php/filter_immoweb_appartementen.php", {
    method: "POST",
    body: formData,
  });

  if (!responseApp.ok) {
    console.error("Error ophalen data voor appartementen:", responseApp.statusText);
    return [];
  }

  const responseBodyApp = await responseApp.text(); //  body als text
  //console.log("Response body for appartementen:", responseBodyApp); // Log  response body 

  // Verstuur een POST-verzoek naar de nieuwe PHP-script voor gebouwen
  const responseGeb = await fetch("php/filter_immoweb_gebouwen.php", {
    method: "POST",
    body: formData,
  });

  if (!responseGeb.ok) {
    console.error("Error ophalen data voor gebouwen:", responseGeb.statusText);
    return [];
  }

  const responseBodyGeb = await responseGeb.text(); // response body als text
  //console.log("Response body for gebouwen:", responseBodyGeb); // Log  response body 

  try {
    // Converteer the responses naar JSON en return it
    const appartementen = JSON.parse(responseBodyApp);
    const gebouwen = JSON.parse(responseBodyGeb);
    // Voeg de appartementen en gebouwen samen op basis van de "code" kolom.
    const combinedJSON = joinJSONs(appartementen, gebouwen);
    // Update de Immoweb-tabel met de gecombineerde gegevens.
    updateTable_Immoweb(combinedJSON);

    return { appartementen, gebouwen };
    
   } catch (e) {
    console.error("Failed to parse JSON:", e);
    throw e;
  }
  
}



///---------------------------------------  tabel met gefilterde data -----------------------

// BIDDIT -------------------------------------

// Roep de functie aan bij de eerste keer laden van de pagina en wanneer het venster van grootte wordt veranderd.
adjustTableFontSize();
window.addEventListener('resize', adjustTableFontSize);


function updateTable_Biddit(jsonData) {
  const table = document.getElementById('table-wrapper-Biddit');
  table.hidden = false;
  const tableBody = document.getElementById('table-body');
  tableBody.innerHTML = '';

  jsonData.forEach((row) => {
    const newRow = tableBody.insertRow();

    newRow.insertCell().innerText = row[0]; // Type Vastgoed
    newRow.insertCell().innerText = row[1]; // Prijs
    newRow.insertCell().innerText = row[2]; // Oppervlakte
    newRow.insertCell().innerText = row[3]; // Beschrijving
    newRow.insertCell().innerText = row[4]; // Aantal Slaapkamers
    newRow.insertCell().innerText = row[5]; // Aantal Badkamers
    newRow.insertCell().innerText = row[6]; // KI
    newRow.insertCell().innerText = row[8]; // Adres
    newRow.insertCell().innerText = row[9]; // Soort Verkoop
    newRow.insertCell().innerText = row[10]; // Laatst Gezien
    newRow.insertCell().innerText = row[11]; // Status

    // Hier voegen we de nieuwe cel met de afbeelding toe
    const imgCell = newRow.insertCell();
    const img = document.createElement('img');
    img.src = 'data/img/' + row[7] + '.jpeg'; // Veronderstelt dat de code zich in row[7] bevindt
    imgCell.appendChild(img);
    img.style.height = "100px";
  });

  adjustTableFontSize();
}



//past de grootte van de tekst in de tabel aan als het scherm groter/kleiner is
function adjustTableFontSize() {
  const table = document.querySelector('.responsive-table');
  const columnWidth = table.clientWidth / table.rows[0].cells.length;
  const fontSize = Math.max(10, Math.min(16, columnWidth / 10)) + 'px';
  table.style.fontSize = fontSize;
}

// Immoweb -------------------------------------

function joinJSONs(appartementen, gebouwen) {
  const combined = [];

  // Verwijder de headers uit de arrays
  const appartementenData = appartementen.slice(1);
  const gebouwenData = gebouwen.slice(1);

  // Maak een map van de gebouwen met de "code" als sleutel
  const gebouwenMap = new Map();
  gebouwenData.forEach((building) => {
    const buildingObj = {
      typevastgoed: building[0],
      beschrijving: building[1],
      code: building[2],
      adres: building[3],
      laatstgezien: building[4],
      latitude: building[5],
      longitude: building[6],
      image: 'data/img/immoweb/' + building[2] + '.jpg', // Voeg de afbeeldingslocatie toe
    };
    gebouwenMap.set(buildingObj.code, buildingObj);
  });

 

  // Voor elk appartement...
  appartementenData.forEach((apartment) => {
    const apartmentObj = {
      code: apartment[0],
      prijs: apartment[1],
      oppervlakte: apartment[2],
      verdieping: apartment[3],
      soort: apartment[4],
      image: 'data/img/immoweb/' + apartment[0] + '.jpg', // Voeg de afbeeldingslocatie toe
    };

    // Zoek het gebouw met dezelfde code als het appartement.
    const building = gebouwenMap.get(apartmentObj.code);

    // Als er een gebouw is gevonden...
    if (building) {
      // Voeg het appartement en het gebouw samen in de gecombineerde array.
      const combinedData = { ...apartmentObj, ...building };
      combined.push(combinedData);
      //console.log("Gecombineerde data:", combinedData);
    }
  });

  //console.log("Gecombineerde JSON:", combined);
  return combined;
}



// Update de tabel
function updateTable_Immoweb(jsonData) {
  const table = document.querySelector('.hide-table2');
  table.hidden = false;
  const tableBody = document.getElementById('table-body-Immoweb');
  tableBody.innerHTML = '';

  jsonData.forEach((row) => {
    const newRow = tableBody.insertRow();

    const maxDescriptionLength = 200; // Limit the description to 200 characters

    // Truncate the description if it exceeds the maximum length
    const truncatedDescription = row.beschrijving.length > maxDescriptionLength
      ? row.beschrijving.substr(0, maxDescriptionLength) + "..."
      : row.beschrijving;

    newRow.insertCell().innerText = row.typevastgoed; // Type Vastgoed
    newRow.insertCell().innerText = row.prijs +"€"; // Prijs
    newRow.insertCell().innerText = row.oppervlakte + "m²"; // Oppervlakte
    newRow.insertCell().innerText = truncatedDescription; // Beschrijving
    newRow.insertCell().innerText = row.adres; // Adres
    newRow.insertCell().innerText = row.laatstgezien; // Laatst Gezien

    // Voeg de nieuwe cel met de afbeelding toe
    const imgCell = newRow.insertCell();
    const img = document.createElement('img');
    img.src = row.image; // Gebruik het afbeeldingspad uit de row data
    imgCell.appendChild(img);
    img.style.height = "100px";
  });

  adjustTableFontSize();
}

// Pas de lettergrootte van de tabel aan als het scherm groter/kleiner wordt.
function adjustTableFontSize() {
  const table = document.querySelector('.responsive-table');
  const columnWidth = table.clientWidth / table.rows[0].cells.length;
  const fontSize = Math.max(6, Math.min(16, columnWidth / 10)) + 'px';
  table.style.fontSize = fontSize;
}
``








// ------------------------- download leaflet huidige kaartweergave ---------------------------

//easyPrint gebruiken om een afbeelding te kunnen downloaden van de kaartweergave.
let options = {
  title: 'Download Map',
  position: 'topright',
  sizeModes: ['Current'], 
  forceDefaultSize: true, // Gebruik huidige map grote
  filename: 'Kaartweergave',
  exportOnly: true
};
L.easyPrint(options).addTo(map);





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
  // Set up the WMS endpoint and layer
  const wmsEndpoint = 'https://ccff02.minfin.fgov.be/geoservices/arcgis/services/WMS/Cadastral_Layers/MapServer/WMSServer?';
  const wmsLayer = 'Cadastral Parcel';


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
   const features = htmlDoc.querySelectorAll('tr:not(:first-child)'); // sla de eerst rij over (header)

   // als er geen data gevonden word geef dit antwood: 
   if (!features || features.length === 0) {
     const kadasterEl = document.getElementById('Kadaster');
     kadasterEl.textContent = "geen data gevonden";
     return;
   }

   // verzamerl de  Capakey and oppervlakte van de html responce
   const columns = features[0].querySelectorAll('td');
   const capakey = columns[1].textContent;
   const oppervlakte = parseFloat(columns[12].textContent).toFixed(2);

   // voeg de Capakey and oppervlakte toe aan het Kadaster element
   const kadasterEl = document.getElementById('Kadaster');
   kadasterEl.innerHTML = `<br><h6>CaPaKey:</h6> ${capakey}<h6>Oppervlakte:</h6> ${oppervlakte}m²`;
  })
 
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
