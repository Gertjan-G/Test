<?php
function parseCoordinate($value) {
    $value = trim($value); // Verwijder spacies die niet gewenst zijn
    if (empty($value) || !is_numeric(str_replace(',', '.', $value))) {
        return 0;
    }
    return floatval(str_replace(',', '.', $value));
}

$csv_file_path = "../data/data.csv";


// Haal de geselecteerde filters op uit het POST-verzoek
$selected_status = isset($_POST['selected_status']) ? $_POST['selected_status'] : "";
$selected_types = isset($_POST['selected_types']) ? json_decode($_POST['selected_types'], true) : [];
$min_price = isset($_POST['min_price']) && $_POST['min_price'] !== '' ? floatval($_POST['min_price']) : null;
$max_price = isset($_POST['max_price']) && $_POST['max_price'] !== '' ? floatval($_POST['max_price']) : null;
$min_ground_area = isset($_POST['min_ground_area']) && $_POST['min_ground_area'] !== '' ? floatval($_POST['min_ground_area']) : null;
$max_ground_area = isset($_POST['max_ground_area']) && $_POST['max_ground_area'] !== '' ? floatval($_POST['max_ground_area']) : null;
$address_lat = isset($_POST['address_lat']) && $_POST['address_lat'] !== '' ? floatval($_POST['address_lat']) : null;
$address_lng = isset($_POST['address_lng']) && $_POST['address_lng'] !== '' ? floatval($_POST['address_lng']) : null;
$max_distance = isset($_POST['max_distance']) && $_POST['max_distance'] !== '' ? floatval($_POST['max_distance']) / 1000 : null;
$startDate = isset($_POST["start_date"]) && $_POST["start_date"] !== '' ? date("Y-m-d", strtotime($_POST["start_date"])) : null;
$endDate = isset($_POST["end_date"]) && $_POST["end_date"] !== '' ? date("Y-m-d", strtotime($_POST["end_date"])) : null;




if (file_exists($csv_file_path)) {
    $filtered_rows = [];
    $header_row = null;

    // Open het CSV-bestand om te lezen
    if (($handle = fopen($csv_file_path, "r")) !== false) {
        
        // Lees elke regel in het CSV-bestand
        while (($row = fgetcsv($handle, 0, ";")) !== false) {
            // Controleer of dit de eerste regel (kopregel) is
            if ($header_row === null) {
                $header_row = $row;
                $filtered_rows[] = $header_row;
            } else {
                // Zoek de index van elke kolom
                $typevastgoed_col_idx = array_search('typevastgoed', $header_row);
                $status_col_idx = array_search('status', $header_row);
                $price_col_idx = array_search('prijs', $header_row);
                $ground_area_col_idx = array_search('oppervlakte', $header_row);
                $lat_col_idx = array_search('latitude', $header_row);
                $lng_col_idx = array_search('longitude', $header_row);
                $last_seen_col_idx = array_search('laatstgezien', $header_row);


              

                // Controleer of alle benodigde kolommen aanwezig zijn
                if (isset($row[$typevastgoed_col_idx]) && isset($row[$status_col_idx]) && isset($row[$price_col_idx]) && isset($row[$ground_area_col_idx]) && isset($row[$lat_col_idx]) && isset($row[$lng_col_idx]) && isset($row[$last_seen_col_idx])) {
                    // Pas de coordinaten aan
                    $row[$lat_col_idx] = parseCoordinate($row[$lat_col_idx]);
                    $row[$lng_col_idx] = parseCoordinate($row[$lng_col_idx]);
                   
                    // Controleer ofdeze rij overeenkomt met de geselecteerde filters
                    $type_match = empty($selected_types) || in_array($row[$typevastgoed_col_idx], $selected_types);
                    $status_match = empty($selected_status) || $row[$status_col_idx] === $selected_status;
                    $price_match = ($min_price === null || floatval($row[$price_col_idx]) >= $min_price) && ($max_price === null || floatval($row[$price_col_idx]) <= $max_price);
                    $ground_area_match = ($min_ground_area === null || floatval($row[$ground_area_col_idx]) >= $min_ground_area) && ($max_ground_area === null || floatval($row[$ground_area_col_idx]) <= $max_ground_area);
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
                    if ($type_match && $status_match && $price_match && $ground_area_match && $distance_match && $date_match) {
                        $filtered_rows[] = $row;                              
                    }
                }
            }
        }
        
        fclose($handle);

        // Maak de gefilterde CSV-inhoud
        $csv_content = implode("\n", array_map(function ($row) {
            return implode(";", $row);
        }, $filtered_rows));

        // Stuur de gefilterde CSV-inhoud naar de browser om te downloaden
        header('Content-Type: text/csv');
        header('Content-Disposition: attachment; filename="filtered_data.csv"');
        echo $csv_content;
    } else {
        // Geef een foutmelding als het bestand niet kan worden geopend
        http_response_code(404);
        echo "Kan CSV-bestand niet openen";
    }
} else {
    http_response_code(404);
    echo "CSV-bestand niet gevonden";
}

// Bereken de afstand tussen twee punten met behulp van de breedte- en lengtegraad
function getDistance($lat1, $lng1, $lat2, $lng2) {
    $earth_radius = 6371; // km
    $dLat = deg2rad($lat2 - $lat1);
    $dLng = deg2rad($lng2 - $lng1);
    $a = sin($dLat / 2) * sin($dLat / 2) + cos(deg2rad($lat1)) * cos(deg2rad($lat2)) * sin($dLng / 2) * sin($dLng / 2);
    $c = 2 * atan2(sqrt($a), sqrt(1 - $a));
    $distance = $earth_radius * $c;

    return $distance;
}


