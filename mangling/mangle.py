import os
import pandas as pd
import re

ENGLAND_KS4_PATH = os.path.join('..', 'data-src', 'dfe', 'england_ks4.csv')
ENGLAND_CENSUS_PATH = os.path.join('..', 'data-src', 'dfe', 'england_census.csv')
EDUBASE_PATH = os.path.join('..', 'data-src', 'dfe', 'edubasealldata20150629.csv')
LEA_CODE_PATH = os.path.join('..', 'data-src', 'LEA_APR_2009_EW_NC.csv')

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
# Convert other numbers to float
ks4_england.TOTPUPS = ks4_england.TOTPUPS.convert_objects(convert_numeric=True)
ks4_england.B8VAMEA_PTQ = ks4_england.B8VAMEA_PTQ.convert_objects(convert_numeric=True)
# Merge data frames
merged_df = ks4_england.merge(england_census, on='URN')
merged_df = merged_df.merge(edubase, on='URN')
# Replace LEA codes with descriptive code
lea_codes = pd.read_csv(LEA_CODE_PATH)
lea_codes['NAME'] = lea_codes['LEA09NM'] +' '+'('+lea_codes['LEA09CD'].astype(str)+')'
lea_dict = lea_codes.set_index('LEA09CD')['NAME'].to_dict()
merged_df = merged_df.replace({'LEA': lea_dict})

# Function that parses percentage columns into float or None
def parse_percentage(value):
    percentages = re.findall(r'(\.?\d+\.?\d*)', str(value))
    if percentages:
        return float(percentages[0])/100
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