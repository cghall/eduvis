import os
import re
import numpy as np
import pandas as pd

KS4_PATH = os.path.join('..', 'data-src', 'dfe', 'england_ks4.csv')
CENSUS_PATH = os.path.join('..', 'data-src', 'dfe', 'england_census.csv')
EDUBASE_PATH = os.path.join('..', 'data-src', 'dfe', 'edubase_data.csv')
LEA_CODE_PATH = os.path.join('..', 'data-src', 'lea_names.csv')
LAT_LONG_PATH = os.path.join('..', 'data-src', 'postcode_to_longlat.csv')
OUTPUT_PATH = os.path.join('..', 'data-out', 'school_data.csv')

# Read in CSVs
ks4 = pd.read_csv(KS4_PATH)
census = pd.read_csv(CENSUS_PATH)
edubase = pd.read_csv(EDUBASE_PATH, dtype={'URN': np.int32})
lea_codes = pd.read_csv(LEA_CODE_PATH)
lat_longs = pd.read_csv(LAT_LONG_PATH)

# Add record type flag and filter out independent and other schools
record_type_map = {1: 'SCH',
                   4: 'LA'}
ks4['RECTYPE'] = ks4['RECTYPE'].map(record_type_map)
is_school_la = ks4['RECTYPE'].isin({'SCH', 'LA'})
is_independent = ks4['NFTYPE'].isin({'IND', 'INDSPEC'})
ks4 = ks4[is_school_la & ~is_independent]

# Check for duplicate columns and remove from dfs before merge
keep_census_cols = census.columns.difference(ks4.columns[ks4.columns != 'URN'])
keep_edubase_cols = edubase.columns.difference(ks4.columns[ks4.columns != 'URN'])

# Merge data frames
merged_df = (ks4.merge(census[keep_census_cols], on='URN', how='left')
                .merge(edubase[keep_edubase_cols], on='URN', how='left')
                .merge(lea_codes, left_on='LEA', right_on='LEA_CODE', how='left')
                .merge(lat_longs, left_on='PCODE', right_on='Address', how='left')
                .rename(columns={'LEA_REGION': 'REGION'}))

# Change percent column values to float
def parse_percentage(value):
    percentages = re.findall(r'(\.?\d+\.?\d*)', str(value))
    if percentages:
        return float(percentages[0])
    return None
percent_columns = [col for col in merged_df.columns.values
                   if col.startswith('P') and col != 'PCODE' and '_parsed' not in col]
for column in percent_columns:
    merged_df[column] = merged_df[column].map(parse_percentage)

# Create output CSV
merged_df.to_csv(OUTPUT_PATH, index=False)