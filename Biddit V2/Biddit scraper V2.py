#!/usr/bin/env python
# coding: utf-8

# In[2]:


# Importeer de benodigde bibliotheken
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from bs4 import BeautifulSoup
import requests
import pandas as pd
from datetime import datetime
import os
import time
import warnings

#waarschuwing uitzetten voor future versies.
warnings.simplefilter(action='ignore', category=FutureWarning)

# TOMTOM API instellingen
TOMTOM_API_KEY = '8mA6ufG2r6XlxHyI5ojoJRjXsRONZS2x'
TOMTOM_ENDPOINT = 'https://api.tomtom.com/search/2/geocode/{address}.json'
TOMTOM_PARAMS = {
    'key': TOMTOM_API_KEY,
    'countrySet': 'BE',
    'language': 'en-US',
}

# Biddit URL's
BIDDIT_URL = "https://www.biddit.be"
BASE_URL = "https://www.biddit.be/nl/search?types=APARTMENT&types=HOUSE&types=LAND&methods=ONLINE_PUBLIC_SALE&nonActive=true&sortVal=&sortKey=searchcomponent.order.enddate&page={}&maps=false"
START_PAGE = 1

# Dictionary met de mapping van het originele type vastgoed naar het nieuwe type
vastgoed_omgezet = {
    "Ander goed": "Huis",
    "Appartementsgebouw": "Appartement",
    "Bel-etagewoning": "Huis",
    "Boerderij": "Huis",
    "Bos": "Ander",
    "Bouwgrond": "Grond",
    "Bungalow": "Huis",
    "Chalet": "Huis",
    "Duplex": "Appartement",
    "Fermette": "Huis",
    "Flat / Studio": "Appartement",
    "Gebouw voor gemengd gebruik": "Huis",
    "Gelijkvloers": "Appartement",
    "Grond": "Grond",
    "Herenhuis": "Huis",
    "Huis": "Huis",
    "Kasteel": "Villa",
    "Landbouwgrond": "Landbouwgrond",
    "Loft": "Appartement",
    "Niet-bebouwbare grond": "Ander",
    "Penthouse": "Appartement",
    "Recreatiegrond": "Ander",
    "Triplex": "Appartement",
    "Uitzonderlijk goed": "Villa",
    "Veld": "Landbouwgrond",
    "Verkavelbare grond": "Grond",
    "Villa": "Villa",
}


def create_headless_browser():
    # Configureer Chrome-opties voor headless-modus
    chrome_options = Options()
    #chrome_options.add_argument("--headless")
    chrome_options.add_argument("--disable-images")  # Schakel afbeeldingen uit
    chrome_options.add_argument("--disable-extensions")  # Schakel extensies uit

    # Creëer een nieuw exemplaar van de Chrome-browser met de geconfigureerde opties
    browser = webdriver.Chrome(options=chrome_options)

    return browser


def scrape_biddit_data():
    # Creëer een nieuw exemplaar van de Chrome-browser in headless-modus
    browser = create_headless_browser()

    # Maak een lege lijst aan waarin de detail-URL's worden opgeslagen
    detail_urls = []

    # Loop door alle pagina's
    page_number = START_PAGE
    while True:
        # Maak een aanvraag naar de URL voor de huidige pagina met de browser
        url = BASE_URL.format(page_number)
        browser.get(url)

        # Wacht tot de pagina is geladen en de JavaScript is gerenderd
        time.sleep(1)

        # Haal de HTML-inhoud van de pagina op nadat de JavaScript is gerenderd
        html = browser.page_source

        # Parseer de HTML-inhoud met BeautifulSoup
        soup = BeautifulSoup(html, "html.parser")

        # Verzamel detailpagina-URL's
        detail_urls.extend(get_detail_urls(soup))

        # Controleer of we op de laatste pagina zijn
        if is_last_page(soup, page_number):
            break

            # Print het huidige paginanummer en het laatste paginanummer
        largest_page_number = get_largest_page_number(soup)
        print(f"Scraping page {page_number}/{largest_page_number}")

        # Ga naar de volgende pagina
        page_number += 1

    # Sluit de browser af
    browser.quit()

    return detail_urls


def get_detail_urls(soup):
    # Zoek alle veilingitems op de huidige pagina
    items = soup.find_all("a", {"class": "display-container row g-0 width"})

    # Haal de URL van de detailpagina van het item op
    detail_urls = [item.get("href") for item in items]

    return detail_urls


def is_last_page(soup, current_page_number):
    largest_page_number = get_largest_page_number(soup)
    return current_page_number == largest_page_number


def get_largest_page_number(soup):
    # Zoek alle koppelings-URL's op de pagina
    pagination_links = soup.find_all("a", {"class": "page-link"})

    # Haal de paginanummers uit de koppelings-URL's en zoek het grootste nummer
    page_numbers = [int(link.text.strip()) for link in pagination_links if link.text.strip().isdigit()]
    largest_page_number = max(page_numbers)

    return largest_page_number


if __name__ == "__main__":
    detail_urls = scrape_biddit_data()



# In[ ]:


# Functie om het cookiebanner te sluiten
def close_cookie_banner(browser):
    try:
        WebDriverWait(browser, 2).until(
            EC.presence_of_element_located((By.XPATH, "//div[@class='cookies-wrapper']//button"))
        ).click()
    except:
        pass


# Functie om een pagina te scrapen
def scrape_page(browser, url, data):
    # Haal de code uit de URL
    code = int(url.split("/")[-1])

    #print(f"Huidige code: {code}", type(code))
    # Initialiseer de DataFrame
    data = create_initial_dataframe('data.csv')
    #print(data)

    # Opschonen van de 'code' kolom in de DataFrame
    data.loc[data['code'].notna(), 'code'] = data.loc[data['code'].notna(), 'code'].astype(str).str.extract('(\d+)',
                                                                                                            expand=False).astype(
        int).values

    # Controleer of de code al in de DataFrame `data` bestaat
    if data['code'].isin([code]).any():
        print(f"Code {code} bestaat al in de DataFrame")
        # Haal de bijbehorende status op voor de gegeven code
        current_status = data.loc[data['code'] == code, 'status'].iloc[0]
        print(f"Huidige status voor code {code}: {current_status}")

        # Controleer of de status 'toegewezen' of 'ingehouden' is
        if current_status in ['Toegewezen', 'ingehouden']:
            print(f" {code} bestaat al en heeft status '{current_status}', overslaan...")
            return

    # Open de URL
    browser.get(url)
    # Sluit het cookiebanner
    close_cookie_banner(browser)
    # Wacht tot de pagina is geladen en de JavaScript is gerenderd
    time.sleep(1)
    # Haal de HTML-content van de pagina na het renderen van JavaScript
    html = browser.page_source
    # Parse de HTML-content met BeautifulSoup
    soup = BeautifulSoup(html, "html.parser")

    #check of de pagina nog online is
    try:
        text = soup.get_text()
        if 'Helaas, dit goed is niet meer beschikbaar.' in text:
            print('The page is no longer available')

        else:

            # Controleer of de listing nog niet is begonnen
            not_started_element = soup.find('span', {'class': 'countdown-title mb-1'})
            if not_started_element is not None:
                if not_started_element.text == 'Start op':
                    print("De listing is nog niet begonnen, deze pagina wordt overgeslagen.")
                    return

            # haal de gegevens van de detailpagina
            # Zoek het type vastgoed
            try:
                type_vastgoed = soup.find("span", {"class": "property-type me-2"}).text.strip()
                print('type:', type_vastgoed)
            except:
                print("error op type vastgoed")
                return

            # Zoek het adres, als het er niet is laat leeg

            address_spans = soup.find("h2", {"class": "address"}).find_all("span")
            address = "".join(span.text.strip() for span in address_spans) if address_spans else ""
            print(address)

            # Initialiseer variabelen om de waarden van de itemlabels op te slaan
            num_bedrooms = ""
            ground_area = ""
            num_facades = ""
            num_bathrooms = ""
            kadaster_income = ""
            sale_type = ""
            beschrijving = ""
            price = ""
            latitude = ""
            longitude = ""

            # Zoek uit of het onroerend goed verkocht is, nog te koop staat of niet is toegewezen.
            if soup.find(text=" Onroerend goed ingehouden "):
                status = "ingehouden"
                price = ""
                print('status', status)
            else:
                if soup.find(text=" Dit onroerend goed werd verkocht voor "):
                    price = soup.find("span", {"class": "date-of-bid"}).text.strip()
                    price = price.replace(".", "")
                    price = price.replace("€", "")
                    price = str(price)
                    status = "Toegewezen"
                    print('status', status)


                #Als de biedingsperiode nog niet voorbij is, worden de details van de vastgoed verzameld.
                else:
                    #Als er staat "Afgelopen biedingsperiode" in de pagina, betekent dit dat de biedingsperiode voorbij is.
                    if soup.find(text=" Afgelopen biedingsperiode "):
                        status = "biedingsperiode afgelopen"
                        price_elements = soup.find_all('h3', attrs={'kid': 'public-sale-bid-history-current-price'})
                        for price_element in price_elements:
                            if price_element:
                                price = price_element.text.strip()
                                price = price.replace(".", "")
                                price = price.replace("€", "")
                                price = price.replace(" ", "")
                            else:
                                print("Price element not found.")
                        print('status', status)

                    else:
                        #Als de biedingsperiode nog bezig is, verzamel de prijs van de vastgoed en verwerk de tekst.
                        status = "biedingsperiode"
                        print('status', status)

                        #Zoek naar de beschrijving, als deze niet is geschreven, voer "N/A" in.
                        #Vind de link "Meer details" en klik erop.
                        try:
                            meer_details_link = WebDriverWait(browser, 1).until(
                                EC.element_to_be_clickable((By.XPATH,
                                                            "//a[contains(@class, 'view-more-link') and contains(text(), 'Meer details')]"))
                            )
                            meer_details_link.click()
                        except:
                            pass

                        beschrijving_element = soup.find("div", {"class": "description"})
                        if beschrijving_element is not None:
                            beschrijving = beschrijving_element.text.strip()
                        else:
                            beschrijving = "Geen Beschrijving gevonden"

                        #Zoek naar het type vastgoed.
                        sale_type = soup.find("span", {"class": "property-handling-method red-theme me-2"}).text.strip()

                        #Vind alle <span> elementen met class "col-12 col-sm-auto item-label"
                        item_labels = soup.find_all("span", {"class": "col-12 col-sm-auto item-label"})

                        #Loop door elk item label en haal de waarde van het elementeruit.
                        for item_label in item_labels:
                            if item_label.text.strip() == "Aantal slaapkamers":
                                num_bedrooms = item_label.find_next_sibling("span", {
                                    "class": "col-12 col-sm-auto text-val"}).text.strip()
                            elif item_label.text.strip() == "Oppervlakte grond":
                                ground_area = item_label.find_next_sibling("span", {
                                    "class": "col-12 col-sm-auto text-val"}).text.strip()
                            elif item_label.text.strip() == "Aantal gevels":
                                num_facades = item_label.find_next_sibling("span", {
                                    "class": "col-12 col-sm-auto text-val"}).text.strip()
                            elif item_label.text.strip() == "Aantal badkamers":
                                num_bathrooms = item_label.find_next_sibling("span", {
                                    "class": "col-12 col-sm-auto text-val"}).text.strip()
                            elif item_label.text.strip() == "Kadastraal inkomen":
                                kadaster_income = item_label.find_next_sibling("span", {
                                    "class": "col-12 col-sm-auto text-val"}).text.strip()

                        # Print de waarden van de item labels
                        print("Aantal slaapkamers:", num_bedrooms)
                        print("Oppervlakte grond:", ground_area)
                        print("Aantal gevels:", num_facades)
                        print("Aantal badkamers:", num_bathrooms)
                        print("Kadastraal inkomen:", kadaster_income)
                        print("beschrijving:", beschrijving)
                        print("prijs:", price)
                        print("code:", code)

            #Geocode - TOMTOM API
            # Controleer of breedtegraad (latitude) en lengtegraad (longitude) al zijn ingevuld

            if 'latitude' in data.columns and 'longitude' in data.columns:
                if data.loc[data['code'] == code, 'latitude'].notnull().any() and data.loc[
                    data['code'] == code, 'longitude'].notnull().any():
                    print(f"Breedtegraad en lengtegraad zijn al ingevuld voor {code}, overslaan...")
                else:
                    url = TOMTOM_ENDPOINT.format(address=address)
                    response = requests.get(url, params=TOMTOM_PARAMS)

                    if response.ok:
                        data_json = response.json()
                        if data_json['summary']['numResults'] > 0:
                            latitude = str(data_json['results'][0]['position']['lat'])
                            longitude = str(data_json['results'][0]['position']['lon'])
                            print(f"Coördinaten opgehaald voor {code}: {latitude}, {longitude}")

                            # Update the dataframe with new values
                            data.loc[data['code'] == code, 'latitude'] = latitude
                            data.loc[data['code'] == code, 'longitude'] = longitude
                        else:
                            print("Adres niet gevonden")
                    else:
                        print("API-aanroep mislukt")
            else:
                print(f"Kolommen 'latitude' en 'longitude' niet gevonden in de dataframe.")

            try:
                # Zoek het carrousel-element dat de afbeelding bevat.
                carousel = soup.find('app-ngx-gallery-image', {'class': 'ng-tns-c131-0'})

                # Zoek het specifieke HTML-tag dat de afbeeldings-URL bevat.
                image_tag = carousel.find('div', {'class': 'ngx-gallery-image'})

                # Haal de afbeeldings-URL uit het stijl attribuut met behulp van regex (patroondetectie).
                style_attr = image_tag['style']
                start_index = style_attr.index('https')
                end_index = style_attr.index('jpeg') + 4
                image_url = style_attr[start_index:end_index]

                # Download de afbeelding
                response = requests.get(image_url)

                # Maak de "img" map aan als deze nog niet bestaat.
                if not os.path.exists('img'):
                    os.makedirs('img')

                # Sla de afbeelding op in een bestand binnen de "img" map.
                nr = code[6:]
                filename = nr + '.jpeg'
                filepath = os.path.join('img', filename)
                with open(filepath, 'wb') as f:
                    f.write(response.content)
                print("afbeeling opgeslagen")

            except:
                print("geen afbeelding gevonden")

            # Maak een nieuwe rij aan in de DataFrame
            new_row = pd.DataFrame({
                "typevastgoed": wijzig_vastgoed_type(type_vastgoed),
                "prijs": price.replace('€', ''),
                "oppervlakte": ground_area.replace('m²', ''),
                "beschrijving": type_vastgoed + " - " + beschrijving.replace('\n', ' ').replace(';', '-'),
                "aantal slaapkamers": num_bedrooms,
                "aantal badkamers": num_bathrooms,
                "KI": kadaster_income.replace('€', ''),
                "code": code,
                "adres": address,
                "soort verkoop": sale_type,
                "laatstgezien": datetime.today().strftime('%Y-%m-%d'),
                "status": status,
                "latitude": latitude,
                "longitude": longitude,
            }, index=[len(data)])

            # Controleer of de code al in de DataFrame bestaat
            if data['code'].isin([code]).any():
                print('nieuwe prijs:', price, 'bestaande prijs:', data.loc[data['code'] == code, 'prijs'])
                if (new_row['prijs'] >= data.loc[data['code'] == code, 'prijs'].values).any():
                    # Update de bestaande rij met nieuwe waarden voor prijs, laatst gezien en status
                    data.loc[data['code'] == code, ['prijs', 'laatstgezien', 'status']] = new_row[
                        ['prijs', 'laatstgezien', 'status']].values
                    print('Data updated')
                else:
                    # Update de bestaande rij met nieuwe waarde voor laatst gezien en status
                    data.loc[data['code'] == code, ['laatstgezien', 'status']] = new_row[
                        ['laatstgezien', 'status']].values
                    print('Updating laatst gezien en status')

            else:
                # Voeg de nieuwe rij toe aan de DataFrame
                data = pd.concat([data, new_row], ignore_index=True)
                print("nieuwe rij toegevoegd")

            print("csv geupdate")
            return data


    except requests.exceptions.RequestException as e:
        print('Error:', e)


def process_detail_urls(data, detail_urls, filename):
    browser = create_headless_browser()
    for url in detail_urls:
        link = BIDDIT_URL + url
        print(link)
        data = scrape_page(browser, link, data)
        if data is not None:
            # Save naar  CSV met ";"  delimiter
            data.to_csv(filename, index=False, sep=";")
            
    browser.quit()
    return data


# Functie om een initiële DataFrame te maken
def create_initial_dataframe(filename):
    try:
        data = pd.read_csv(filename, delimiter=";",
                           dtype={"prijs": str, "oppervlakte": str, "KI": str, "latitude": str, "longitude": str})

    except FileNotFoundError:
        columns = ["typevastgoed", "prijs", "oppervlakte", "beschrijving", "aantal slaapkamers",
                   "aantal badkamers", "KI", "code", "adres", "soort verkoop", "laatstgezien",
                   "status", "latitude", "longitude"]
        data = pd.DataFrame(columns=columns)

    return data


# DIT MOET NOG AANGEPAST WORDEN (TRY erbij  en maken dat het werkt op de variabele niet op een dF)
def wijzig_vastgoed_type(type_vastgoed):
    return vastgoed_omgezet.get(type_vastgoed, type_vastgoed)


def main():
    filename = 'data.csv'
    data = create_initial_dataframe(filename)
    data = process_detail_urls(data, detail_urls, filename)
    if data is not None:
        # Save naar  CSV met ";"  delimiter
        data.to_csv(filename, index=False, sep=";")


if __name__ == "__main__":
    main()




# In[ ]:




