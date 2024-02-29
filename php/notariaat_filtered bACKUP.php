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
$type_vastgoed = isset($_GET['types']) ? explode(',', $_GET['types']) : [];

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

// Voeg de datumfilter toe aan de query als de datums zijn opgegeven
if ($start_date && $end_date) {
    // Zet de einddatum om naar het einde van de dag om de hele dag te dekken
    $end_date_time = date('Y-m-d', strtotime($end_date . ' +1 day'));
    $query .= " AND punten.\"aanmaak datum\" >= '$start_date' AND punten.\"aanmaak datum\" < '$end_date_time'";
}

// Voeg de type_vastgoed filter toe aan de query als types zijn opgegeven
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

    if (!$result) {
        die("Error executing query: " . pg_last_error($dbconn));
    }
}

// Sluit de databaseverbinding
pg_close($dbconn);
?>
