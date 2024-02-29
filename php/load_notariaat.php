<?php
header('Content-Type: application/json');

// Connect to the database
$dbconn = pg_connect("host=localhost dbname=postgres user=postgres password=Admin port=5432");

if (!$dbconn) {
    die("Connection failed: " . pg_last_error());
}

// Prepare the SQL query
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
WHERE geom IS NOT NULL;";

// Execute the SQL query
$result = pg_query($dbconn, $query);

if ($result) {
    // Fetch the result as a JSON object
    $geojson = pg_fetch_result($result, 0, 0);
    echo $geojson;
} else {
    // Return an error message if there is no result
    $error = ['error' => 'Geen data gevonden'];
    print_r($error);

    if (!$result) {
        die("Error executing query: " . pg_last_error());
    }
}

// Close the database connection
pg_close($dbconn);
?>