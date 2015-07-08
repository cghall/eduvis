import os
import pandas as pd
import re

ENGLAND_KS4_PATH = os.path.join('..', 'data-src', 'dfe', 'england_ks4.csv')
ENGLAND_CENSUS_PATH = os.path.join('..', 'data-src', 'dfe', 'england_census.csv')
EDUBASE_PATH = os.path.join('..', 'data-src', 'dfe', 'edubase_data.csv')
LEA_CODE_PATH = os.path.join('..', 'data-src', 'lea_names.csv')

OUTPUT_PATH = os.path.join('..', 'data-out', 'school_data.csv')


# Read in ks4 csv
ks4_england = pd.read_csv(ENGLAND_KS4_PATH)
# Filter out non-school records
ks4_england = ks4_england[ks4_england['RECTYPE']==1]
# Read in census
england_census = pd.read_csv(ENGLAND_CENSUS_PATH)
# Read in edubase
edubase = pd.read_csv(EDUBASE_PATH)
# Convert URN from object to float
england_census.URN = england_census.URN.convert_objects(convert_numeric=True)

### Check for duplicate columns and remove from dfs before merge
# Function for returning common elements
def common(list1, list2):
    return [el for el in list1 if el in list2]
# Function for returning all occurrences
def remove_all(list_name, val):
   return [value for value in list_name if value != val]
# Create column lists
ks4_cols = list(ks4_england.columns)
census_cols = list(england_census.columns)
edubase_cols = list(edubase.columns)

census_todrop = common(ks4_cols, census_cols)
census_todrop.remove('URN')

edubase_todrop = common(ks4_cols, edubase_cols) + common(census_cols, edubase_cols)
edubase_todrop = remove_all(edubase_todrop, 'URN')

england_census.drop(census_todrop, axis=1, inplace=True)
edubase.drop(edubase_todrop, axis=1, inplace=True)

# Merge data frames
merged_df = pd.merge(ks4_england, england_census, on='URN', how='left')
merged_df = pd.merge(merged_df, edubase, on='URN', how='left')

# Replace LEA codes with descriptive code
lea_codes = pd.read_csv(LEA_CODE_PATH)
lea_codes['NAME'] = lea_codes['LEA09NM'] +' '+'('+lea_codes['LEA09CD'].astype(str)+')'
lea_dict = lea_codes.set_index('LEA09CD')['NAME'].to_dict()
merged_df = merged_df.replace({'LEA': lea_dict})

# Function that parses percentage columns into float or None
def parse_percentage(value):
    percentages = re.findall(r'(\.?\d+\.?\d*)', str(value))
    if percentages:
        return float(percentages[0])
    else:
        return None
# Apply parse function to merged data frame
all_column_names = merged_df.columns.values
percent_columns = [name for name in all_column_names
                   if name.startswith('P') and name != 'PCODE' and '_parsed' not in name]
for column in percent_columns:
    merged_df[column] = merged_df[column].map(parse_percentage)
# Create CSV from df
merged_df.to_csv(OUTPUT_PATH)