#!/usr/bin/env python
# coding: utf-8

# In[6]:


import os
import pandas as pd
from datetime import datetime, timedelta

# Laad de CSV data
df = pd.read_csv('data.csv', sep=';')

# Zet de "laatst gezien" kolom om in een datum/tijd object
df['laatstgezien'] = pd.to_datetime(df['laatstgezien'])

# Bepaal de datum van 5 maanden geleden
x_maanden_geleden = datetime.now() - timedelta(days=2*30)

# Filter de data op basis van de voorwaarden
filtered_df = df[(df['laatstgezien'] > x_maanden_geleden) | (df['status'] != 'ingehouden')]

# Vind de codes van de rijen die verwijderd zullen worden
te_verwijderen_codes = set(df['code']) - set(filtered_df['code'])

# Verwijder de bijbehorende afbeeldingen
for code in te_verwijderen_codes:
    img_path = f"img/{code}.jpeg"
    if os.path.exists(img_path):
        os.remove(img_path)
        print(f"Verwijderd: {img_path} behorend tot rij met code {code}")
    else:
        print(f"De afbeelding {img_path} bestaat niet")

# Print de details van de verwijderde rijen
for index, row in df[df['code'].isin(te_verwijderen_codes)].iterrows():
    print(f"Verwijderde rij: {row.to_dict()}")

# Schrijf de gefilterde data naar een nieuwe CSV
filtered_df.to_csv('data.csv', index=False,sep=';')
print('data gefilterd')


# In[ ]:




