<?php
// Instellen van het content-type naar JSON
header('Content-Type: application/json');


// Definiëren van de paden naar de CSV-bestanden
$gebouwen_csv_path = '../data/data_gebouw.csv';
$appartementen_csv_path = '../data/data_appartement.csv';


// Functie om CSV-bestand te lezen
function read_csv($csv_file_path) {
    $rows = [];

    // Bestand openen en gegevens inlezen
    if (($handle = fopen($csv_file_path, "r")) !== false) {
        while (($data = fgetcsv($handle, 0, ";")) !== false) {
            $rows[] = $data;
        }
        fclose($handle);
    } else {   // Foutmelding tonen als het bestand niet geopend kan worden
        throw new Exception("Kan CSV niet openen: $csv_file_path");
    }

    return $rows;
}

// Functie om CSV-gegevens om te zetten naar JSON-formaat
function csv_to_json($csv_lines) {
    $header = $csv_lines[0];
    $data = [];
    // Door alle regels van het CSV-bestand gaan
    foreach ($csv_lines as $index => $line) {
        if ($index === 0) continue;
        // Sla regel over als ze  onjuist aantal velden bevatten
        if (count($line) !== count($header)) continue;
        $data[] = array_combine($header, $line);
    }

    return $data;
}



try {
    // Lees de CSV-bestanden
    $gebouwen = read_csv($gebouwen_csv_path);
    $appartementen = read_csv($appartementen_csv_path);
    // Converteer CSV-gegevens naar JSON-formaat
    $gebouwen_json = csv_to_json($gebouwen);
    $appartementen_json = csv_to_json($appartementen);
    // Resultaat voorbereiden
    $result = [
        'gebouwen' => $gebouwen_json,
        'appartementen' => $appartementen_json,
    ];
    // Resultaat als JSON weergeven
    echo json_encode($result);
} catch (Exception $e) {
    // Foutmelding tonen bij een uitzondering
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}
