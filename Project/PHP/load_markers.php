<?php
// Definieer het pad naar het CSV-bestand
$csv_file_path = "../data/data.csv";

// Controleer of het bestand bestaat
if (file_exists($csv_file_path)) {
    // Als het bestand bestaat, lees de inhoud en geef deze weer
    $csv_content = file_get_contents($csv_file_path);
    echo $csv_content;
} else {
     // Als het bestand niet bestaat, geef een 404-foutmelding en een foutbericht
    http_response_code(404);
    echo "CSV file not found";
}
