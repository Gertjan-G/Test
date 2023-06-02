<?php
// Lees de gebouwen en appartementen CSV-bestanden
$gebouwen_csv = '../data/data_gebouw.csv';
$appartementen_csv = '../data/data_appartement.csv';


// Haal de geselecteerde filters op uit het POST-verzoek
// Voeg de nieuwe filters toe: type, start_date en end_date
$selected_types = isset($_POST['selected_types']) ? json_decode($_POST['selected_types'], true) : [];
$address_lat = isset($_POST['address_lat']) && $_POST['address_lat'] !== '' ? floatval($_POST['address_lat']) : null;
$address_lng = isset($_POST['address_lng']) && $_POST['address_lng'] !== '' ? floatval($_POST['address_lng']) : null;
$max_distance = isset($_POST['max_distance']) && $_POST['max_distance'] !== '' ? floatval($_POST['max_distance']) / 1000 : null;
$min_price = isset($_POST['min_price']) && $_POST['min_price'] !== '' ? floatval($_POST['min_price']) : null;
$max_price = isset($_POST['max_price']) && $_POST['max_price'] !== '' ? floatval($_POST['max_price']) : null;
$min_ground_area = isset($_POST['min_ground_area']) && $_POST['min_ground_area'] !== '' ? floatval($_POST['min_ground_area']) : null;
$max_ground_area = isset($_POST['max_ground_area']) && $_POST['max_ground_area'] !== '' ? floatval($_POST['max_ground_area']) : null;
$startDate = isset($_POST["start_date"]) && $_POST["start_date"] !== '' ? date("Y-m-d", strtotime($_POST["start_date"])) : null;
$endDate = isset($_POST["end_date"]) && $_POST["end_date"] !== '' ? date("Y-m-d", strtotime($_POST["end_date"])) : null;

// appartementen eerst filteren
if (file_exists($appartementen_csv)) {
    $filtered_appartementen = [];
    $header_row = null;

    // Open het CSV-bestand om te lezen
    if (($handle = fopen($appartementen_csv, "r")) !== false) {
        
        // Lees elke regel in het CSV-bestand
        while (($row = fgetcsv($handle, 0, ";")) !== false) {
            // Controleer of dit de eerste regel (kopregel) is
            if ($header_row === null) {
                $header_row = $row;
                $filtered_appartementen[] = $header_row;
            } else {
                // Zoek de index van elke kolom die we willen filteren
                $price_col_idx = array_search('prijs', $header_row);
                $ground_area_col_idx = array_search('oppervlakte', $header_row);
                

                // Controleer of alle benodigde kolommen aanwezig zijn
                if (isset($row[$price_col_idx]) && isset($row[$ground_area_col_idx])) {
                                   
                    $price_match = ($min_price === null || floatval($row[$price_col_idx]) >= $min_price) && ($max_price === null || floatval($row[$price_col_idx]) <= $max_price);
                    $ground_area_match = ($min_ground_area === null || floatval($row[$ground_area_col_idx]) >= $min_ground_area) && ($max_ground_area === null || floatval($row[$ground_area_col_idx]) <= $max_ground_area);
                    
                    
                    // Voeg de rij toe aan de gefilterde rijen als deze overeenkomt met alle filters
                    if ($price_match && $ground_area_match) {
                        $filtered_appartementen[] = $row;
                    }
                }
            }
        }
        // Sluit het CSV-bestand
        fclose($handle);
    }
} else {
    // Geef een foutmelding als het bestand niet kan worden geopend
    http_response_code(404);
    echo "Kan CSV-bestand niet openen";
}


//-------------------------------------------------------



    // Gebouwen filteren
    if (file_exists($gebouwen_csv)) {
        $filtered_gebouwen = [];
        $header_row = null;
    
        // Open het CSV-bestand om te lezen
        if (($handle = fopen($gebouwen_csv, "r")) !== false) {
            
        // Lees elke regel in het CSV-bestand
        while (($row = fgetcsv($handle, 0, ";")) !== false) {
            // Controleer of dit de eerste regel (kopregel) is
            if ($header_row === null) {
                $header_row = $row;
                $filtered_gebouwen[] = $header_row;
            } else {
                // Zoek de index van elke kolom
                $typevastgoed_col_idx = array_search('typevastgoed', $header_row);
                $lat_col_idx = array_search('latitude', $header_row);
                $lng_col_idx = array_search('longitude', $header_row);
                $last_seen_col_idx = array_search('laatstgezien', $header_row);
    
    
            
    
                // Controleer of alle benodigde kolommen aanwezig zijn
                if (isset($row[$typevastgoed_col_idx])  && isset($row[$lat_col_idx]) && isset($row[$lng_col_idx]) && isset($row[$last_seen_col_idx])) {
                    // Pas de coordinaten aan
                    $row[$lat_col_idx] = parseCoordinate($row[$lat_col_idx]);
                    $row[$lng_col_idx] = parseCoordinate($row[$lng_col_idx]);
                
                    // Controleer ofdeze rij overeenkomt met de geselecteerde filters
                    $type_match = empty($selected_types) || array_reduce($selected_types, function($carry, $type) use ($row, $typevastgoed_col_idx) {
                        return $carry || (stripos($row[$typevastgoed_col_idx], $type) !== false);
                    }, false);
                    $date_match = ($startDate === null && $endDate === null) || ($startDate !== null && $endDate === null && strtotime($row[$last_seen_col_idx]) >= strtotime($startDate)) || ($startDate === null && $endDate !== null && strtotime($row[$last_seen_col_idx]) <= strtotime($endDate)) || ($startDate !== null && $endDate !== null && strtotime($row[$last_seen_col_idx]) >= strtotime($startDate) && strtotime($row[$last_seen_col_idx]) <= strtotime($endDate));
    
    
                    error_log("Row last_seen_col_idx: {$row[$last_seen_col_idx]}");
                    error_log("Row start_date: {$startDate}");
                    error_log("Row end_date: {$endDate}");
                    error_log("Row date_match: {$date_match}");
    
                    // Controleer of de rij voldoet aan de afstandsfilter
                    $distance_match = true;
                    if ($address_lat !== null && $address_lng !== null) {
                        
                        $distance = getDistance($address_lat, $address_lng, $row[$lat_col_idx], $row[$lng_col_idx]);
                        $distance_match = $distance <= $max_distance;
                    }
    
                    // Voeg de rij toe aan de gefilterde rijen als deze overeenkomt met alle filters
                    if ($type_match &&  $distance_match && $date_match) {
                        $filtered_gebouwen[] = $row;                              
                    }
                }
            }
        }
        // Sluit het CSV-bestand
        fclose($handle);
    }
    
    } else {
    // Geef een foutmelding als het bestand niet kan worden geopend
    http_response_code(404);
    echo "Kan CSV-bestand niet openen";
    }
    



    
// Bereken de afstand tussen twee punten met behulp van de breedte- en lengtegraad
function getDistance($x1, $y1, $x2, $y2) {
    $earth_radius = 6371; // km
    $dX = deg2rad($x2 - $x1);
    $dY = deg2rad($y2 - $y1);
    $a = sin($dY / 2) * sin($dY / 2) + cos(deg2rad($y1)) * cos(deg2rad($y2)) * sin($dX / 2) * sin($dX / 2);
    $c = 2 * atan2(sqrt($a), sqrt(1 - $a));
    $distance = $earth_radius * $c;

    return $distance;
}


// pas de coordinaten aan
function parseCoordinate($value) {
    $value = trim($value); // Verwijder spacies die niet gewenst zijn
    if (empty($value) || !is_numeric(str_replace(',', '.', $value))) {
        return 0;
    }
    return floatval(str_replace(',', '.', $value));
}





// Initialiseer een lege array om de gecombineerde resultaten op te slaan
$combined_results = [];

// Voeg de kopregels van de twee CSV's samen
$header_row_combined = array_merge($filtered_appartementen[0], $filtered_gebouwen[0]);
$combined_results[] = $header_row_combined;

// Zoek de index van de 'code' kolom in beide CSV's
$code_appartementen_col_idx = array_search('code', $filtered_appartementen[0]);
$code_gebouwen_col_idx = array_search('code', $filtered_gebouwen[0]);

// Ga door de gefilterde appartementen
for ($i = 1; $i < count($filtered_appartementen); $i++) {
    $appartement = $filtered_appartementen[$i];
    $appartement_code = $appartement[$code_appartementen_col_idx];

    // Ga door de gefilterde gebouwen
    for ($j = 1; $j < count($filtered_gebouwen); $j++) {
        $gebouw = $filtered_gebouwen[$j];
        $gebouw_code = $gebouw[$code_gebouwen_col_idx];

        // Als de codes overeenkomen, voeg dan de gegevens van het appartement en het gebouw samen
        if ($appartement_code === $gebouw_code) {
            $combined_row = array_merge($appartement, $gebouw);
            $combined_results[] = $combined_row;
        }
    }
}

// Maak een CSV-bestand van de gecombineerde resultaten
$combined_csv = fopen('php://temp/maxmemory:' . (5 * 1024 * 1024), 'r+');
foreach ($combined_results as $row) {
    fputcsv($combined_csv, $row, ';');
}

rewind($combined_csv);
$csv_output = stream_get_contents($combined_csv);
fclose($combined_csv);

// Stuur de gecombineerde CSV als resultaat terug
header('Content-Type: text/csv');
header('Content-Disposition: attachment; filename="Immoweb.csv"');
echo $csv_output;