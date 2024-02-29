<?php

header('Content-Type: application/json');

// Verbind met de database
$dbconn = pg_connect("host=localhost dbname=postgres user=postgres password=Admin port=5432");

if (!$dbconn) {
    die("Connection failed: " . pg_last_error());
}

// Haal de filters op uit de querystring
$start_date = $_GET['start_date'] ?? null;
$end_date = $_GET['end_date'] ?? null;
$ki_min = $_GET['ki_min'] ?? '0';
$ki_max = $_GET['ki_max'] ?? 'Infinity';
$opp_min = $_GET['opp_min'] ?? '0';
$opp_max = $_GET['opp_max'] ?? 'Infinity';
$start_bouwjaar = $_GET['start_bouwjaar'] ?? null;
$end_bouwjaar = $_GET['end_bouwjaar'] ?? null;
$type_vastgoed = isset($_GET['types']) ? explode(',', $_GET['types']) : [];

var_dump($_GET); // Toon alle ontvangen GET-parameters


// Begin van de SQL-query
$query = "SELECT json_build_object(
    'type', 'FeatureCollection',
    'features', json_agg(
        json_build_object(
            'type', 'Feature',
            'geometry', ST_AsGeoJSON(geom)::json,
            'properties', json_build_object(
                'bijtellen', bijtellen,
                'reeds_in_dossier', punten.\"reeds in dossier\",
                'type_goed', punten.\"type goed\",
                'adres', adres,
                'nummer', nummer,
                'postcode', postcode,
                'stad', stad,
                'kadastraal_inkomen', punten.\"kadastraal inkomen\",
                'bouw_jaar', punten.\"bouw-jaar\",
                'oppervlakte', punten.\"oppervlakte (in m²)\",
                'prijs', punten.\"prijs (in €)\",
                'prijs_per_m2', punten.\"prijs/m²\",
                'aanmaak_datum', punten.\"aanmaak datum\",
                'aktedatum', aktedatum,
                'gevels', gevels,
                'slaapkamers', slaapkamers,
                'tuin', tuin,
                'kelder', kelder,
                'zolder', zolder,
                'garage', garage,
                'opm', opm
            )
        )
    )
)
FROM schattingstool.punten
WHERE geom IS NOT NULL";


// Net voor de pg_query-aanroep
echo $query; // Verwijder of comment dit uit in productie!
$result = pg_query($dbconn, $query);


// Datumfilters
if ($start_date && $end_date) {
    $start_date_formatted = date('d-m-Y', strtotime($start_date)) . ' 00:00:00';
    $end_date_formatted = date('d-m-Y', strtotime($end_date . ' +1 day')) . ' 00:00:00';
    $query .= " AND punten.\"aanmaak datum\" BETWEEN '$start_date_formatted' AND '$end_date_formatted'";
}

// KI en Oppervlakte filters
if ($ki_min !== '0' || $ki_max !== 'Infinity') {
    $ki_max_condition = $ki_max === 'Infinity' ? "" : "AND punten.\"kadastraal inkomen\" <= $ki_max";
    $query .= " AND punten.\"kadastraal inkomen\" >= $ki_min $ki_max_condition";
}

if ($opp_min !== '0' || $opp_max !== 'Infinity') {
    $opp_max_condition = $opp_max === 'Infinity' ? "" : "AND punten.\"oppervlakte (in m²)\" <= $opp_max";
    $query .= " AND punten.\"oppervlakte (in m²)\" >= $opp_min $opp_max_condition";
}

// Bouwjaar filters
if ($start_bouwjaar && $end_bouwjaar) {
    $query .= " AND punten.\"bouw-jaar\" BETWEEN '$start_bouwjaar' AND '$end_bouwjaar'";
}

// Type vastgoed filter
if (!empty($type_vastgoed)) {
    $type_conditions = array_map(function($type) use ($dbconn) {
        $type = pg_escape_string($dbconn, $type);
        return "punten.\"type goed\" ILIKE '%$type%'";
    }, $type_vastgoed);
    
    $query .= " AND (" . implode(' OR ', $type_conditions) . ")";
}

$query .= ";";

// Voer de SQL-query uit
$result = pg_query($dbconn, $query);

if ($result) {
    // Haal het resultaat op als een JSON-object
    $geojson = pg_fetch_result($result, 0, 0);
    echo $geojson;
} else {
    // Geef een foutmelding als er geen resultaat is
    $error = ['error' => 'Geen data gevonden'];
    echo json_encode($error);
}

// Sluit de databaseverbinding
pg_close($dbconn);




