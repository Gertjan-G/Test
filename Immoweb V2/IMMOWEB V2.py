#!/usr/bin/env python
# coding: utf-8

# In[1]:


import time
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from bs4 import BeautifulSoup
import requests
import pandas as pd
from datetime import datetime
import threading

# TOMTOM API instellen
API_ENDPOINT = 'https://api.tomtom.com/search/2/geocode/{address}.json'
API_PARAMS = {
    'key': '8mA6ufG2r6XlxHyI5ojoJRjXsRONZS2x',
    'countrySet': 'BE',
    'language': 'en-US',
}


class PageTimeoutError(Exception):
    pass


def check_page_timeout(start_time, timeout=30):
    if time.time() - start_time >= timeout:
        print("te lang op deze pagina")
        raise PageTimeoutError()


def initialiseer_chrome():
    # Configureer Chrome-opties
    chrome_options = Options()
    chrome_options.add_argument("--headless")
    #chrome_options.add_argument("--disable-images")  # Schakel afbeeldingen uit
    #chrome_options.add_argument("--disable-extensions")  # Schakel extensies uit

    # Creëer een nieuw exemplaar van de Chrome-browser met de geconfigureerde opties
    browser = webdriver.Chrome(options=chrome_options)

    return browser


def haal_detail_urls(browser, base_url):
    #Haal de detail-URL's van de pagina's.

    page_number = 1
    detail_urls = []

    while True:
        print(page_number)
        url = base_url.format(page_number)
        start_time = time.time()
        timeout_thread = threading.Thread(target=check_page_timeout, args=(start_time,))
        timeout_thread.start()

        try:
            browser.get(url)
            # Wacht tot de pagina is geladen en de JavaScript is weergegeven.
            time.sleep(5)
            try:
                accept_button = browser.execute_script(
                    'return document.getElementById("usercentrics-root").shadowRoot.querySelector(\'[data-testid="uc-accept-all-button"]\')')
                accept_button.click()
            except:
                pass

            soup = BeautifulSoup(browser.page_source, "html.parser")
            items = soup.find_all("a", {"class": "card__title-link"})

            for item in items:
                detail_url = item.get("href")
                detail_urls.append(detail_url)

            next_page_link = soup.find("span", {"class": "sr-only"}, text="Volgende pagina")
            if not next_page_link:
                break

        except PageTimeoutError:
            print(f"Timeout reached for page {page_number}. Moving to the next page.")

        finally:
            timeout_thread.join()  # Stop the timeout thread.

        page_number += 1

    return detail_urls


def initialiseer_dataframes():
    # Open de CSV bestanden
    gebouw = 'data_gebouw.csv'
    appartement = 'data_appartement.csv'
    #kijk of het bestand bestaad, anders maak je nieuwe dataframe aan.
    try:
        data_gebouw = pd.read_csv(gebouw, sep=';')
    except FileNotFoundError:
        columns = ["typevastgoed", "beschrijving", "code", "adres", "laatstgezien", "latitude", "longitude"]
        data_gebouw = pd.DataFrame(columns=columns)

    try:
        data_appartement = pd.read_csv(appartement, sep=';')
    except FileNotFoundError:
        columns = ["code", "prijs", "oppervlakte", "verdieping", "soort"]
        data_appartement = pd.DataFrame(columns=columns)

    return data_gebouw, data_appartement


def sla_data_op(data_gebouw, data_appartement):
    #Sla de dataframes op als csv-bestanden.
    data_gebouw.to_csv('data_gebouw.csv', encoding='utf-8', index=False, sep=';')
    data_appartement.to_csv('data_appartement.csv', encoding='utf-8', index=False, sep=';')


#functie voor het downloaden van de afbeeldingen       
def download_image(soup, code):
    # Zoek het knopelement dat de afbeelding bevat.
    button_element = soup.find("button", {"class": "classified-gallery__button"})
    if button_element:
        # Zoek het afbeeldingselement binnen het knopelement en haal de bron-URL ervan op.
        preview_picture = button_element.find("img", {"class": "classified-gallery__picture"})
        if preview_picture:
            preview_picture_url = preview_picture.get("src")
            if preview_picture_url:
                # Download de voorbeeldafbeelding en sla deze op als een bestand.
                img_path = f"img/immoweb/{code}.jpg"
                response = requests.get(preview_picture_url)
                with open(img_path, "wb") as f:
                    f.write(response.content)
                print(f"Saved image for {code} to {img_path}")
            else:
                print(f"Error: Failed to extract preview picture URL for {code}")
        else:
            print(f"Error: Failed to find preview picture for {code}")
    else:
        print(f"Error: Failed to find button element for {code}")


# Web scraper:
def main():
    #basis url definieren
    base_url = "https://www.immoweb.be/nl/zoeken/nieuwbouwproject-appartementen/te-koop?countries=BE&page={}&orderBy=relevance"
    #browser functie oproepen
    browser = initialiseer_chrome()
    detail_urls = haal_detail_urls(browser, base_url)
    data_gebouw, data_appartement = initialiseer_dataframes()
    #door de lijst met url's lopen en data ophalen.
    for detail_url in detail_urls:

        # Haal de code op op basis van de url
        code = detail_url.split("/")[-1]

        # kijk of deze code reeds bestaad, zoja sla deze pagina over.
        if (data_gebouw["code"].astype(str) == code).any():
            print(code, "is al aanwezig, sla deze over")
        else:
            print('Nieuwe data gevonden: ' + code)

            #kijk na of de pagina opent zoals verwacht
            try:

                # open de pagina
                browser.get(detail_url)
                time.sleep(5)

                # haal de html uit de pagina
                soup = BeautifulSoup(browser.page_source, 'html.parser')
                error_message = soup.find('h1')
                #sla over als er iets mis is met de pagina
                if error_message and (
                        'Helaas ging er iets mis.' in error_message.text or '500 server error' in error_message.text):
                    print('Error 404, next url ...')
                    continue

                else:
                    try:
                        # open de pagina
                        browser.get(detail_url)
                        time.sleep(2)

                        # sluit de cookie banner
                        try:
                            accept_button = browser.execute_script(
                                'return document.getElementById("usercentrics-root").shadowRoot.querySelector(\'[data-testid="uc-accept-all-button"]\')')
                            accept_button.click()
                        except:
                            pass

                        html = browser.page_source

                        # Parse de HTML-inhoud met BeautifulSoup.
                        soup = BeautifulSoup(html, "html.parser")

                        # vind de gewenste informatie.

                        type_vastgoed = "Nieuwbouwproject Appartementen"

                        try:
                            code = soup.find("div", {"class": "classified__header--immoweb-code"}).text.strip()
                        except:
                            print("Er ging iets mis, volgende link")
                            break

                        code = code.replace("Immoweb code : ", "").strip()
                        address = soup.find("div", {"class": "classified__information--address"}).text.strip()
                        address = address.replace("—", "").strip()
                        address = " ".join(address.split())

                        latitude = ""
                        longitude = ""
                        prijs = ""
                        verdieping = ""
                        oppervlakte = ""
                        vedieping = ""

                        # zoek de beschrijving
                        try:
                            beschrijving = soup.find("p", {"class": "classified__description"}).text.strip()

                        except AttributeError:
                            #Als de beschrijving niet op de gebruikelijke plaats wordt gevonden, zoek deze dan op in het genoemde div-element "classified-description-content-text"
                            try:
                                div_description = soup.find("div", {"id": "classified-description-content-text"})
                                if div_description.find_all("p"):
                                    beschrijving = div_description.find_all("p")[0].text.strip()
                                else:
                                    raise AttributeError
                            except AttributeError:
                                print("Pagina wordt overgeslagen omdat de beschrijving niet kan worden gevonden")
                                continue

                        #Geocode - TOMTOM API
                        url = API_ENDPOINT.format(address=address)
                        response = requests.get(url, params=API_PARAMS)

                        if response.ok:
                            data_json = response.json()
                            if data_json['summary']['numResults'] > 0:
                                latitude = data_json['results'][0]['position']['lat']
                                longitude = data_json['results'][0]['position']['lon']
                                print("Address added:", latitude, ",", longitude)
                            else:
                                latitude = ''
                                longitude = ''
                                print("Address not found")
                        else:
                            latitude = ''
                            longitude = ''
                            print("Failed API request")

                        new_row_gebouw = {
                            "typevastgoed": type_vastgoed,
                            "beschrijving": beschrijving,
                            "code": code,
                            "adres": address,
                            "laatstgezien": datetime.today().strftime('%Y-%m-%d'),
                            "latitude": latitude,
                            "longitude": longitude,
                        }

                        new_row_gebouw = pd.DataFrame([new_row_gebouw])
                        data_gebouw = pd.concat([data_gebouw, new_row_gebouw], ignore_index=True)

                        # Zoek naar de tabel met appartementdetails.
                        table = soup.find("ul", {"class": "classified__list classified__list--striped"})

                        # Definieer de rijen.
                        rows = table.find_all("li",
                                              {"class": "classified-with-plan__list-item classified__list-item-link"})
                        #print("Rows: ", rows)
                        # Loop over alle rijen
                        for row in rows:
                            grid_items = row.find_all("p", {"class": "grid__item"})

                            # Filter relevante rijen
                            filtered_grid_items = [grid_item for grid_item in grid_items if
                                                   "classified__list-item-price" not in grid_item.attrs.get('class',
                                                                                                            [])]

                            # # Haal de tekst uit de gefilterde rijen en verwijder onnodige spaties.
                            data = [grid_item.get_text(strip=True) for grid_item in filtered_grid_items]

                            # verwerk deze tekst en voeg ze toe aan een variabele
                            soort = ' '.join(data[0].split())
                            area = data[1]
                            floor = data[2]
                            price = data[3]
                            price = price.replace("€", "")
                            price = price.replace(".", "")

                            # kijk of het appartement niet "verkocht" is.
                            if price.lower() != "verkocht":
                                # Sla de data op in een df
                                new_row_appartement = {
                                    "code": code,
                                    "prijs": price,
                                    "oppervlakte": area.replace("m²", ""),
                                    "verdieping": floor,
                                    "soort": soort
                                }

                                # Converteer new_row_appartement naar een DataFrame.
                                new_row_appartement = pd.DataFrame([new_row_appartement])

                                # combineer het data_appartement DataFrame met het new_row_appartement DataFrame.
                                data_appartement = pd.concat([data_appartement, new_row_appartement], ignore_index=True)
                                #print("Apartment Data: ", new_row_appartement)

                        # roep de functie op om de afbeelding te downloaden
                        download_image(soup, code)

                    except Exception as e:
                        print('Error occurred: ', str(e))
                        continue

            finally:
                #sla de data op ook als er een error zou zijn.
                sla_data_op(data_gebouw, data_appartement)
                print("data opgeslagen")

    browser.quit()


if __name__ == "__main__":
    main()

