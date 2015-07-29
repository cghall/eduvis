import os
import pandas as pd
import itertools
import re

META_PATH = os.path.join('..', 'data-src', 'meta_file.csv')
SCHOOL_DATA_PATH = os.path.join('..', 'data-out', 'school_data.csv')

OUTPUT_PATH = os.path.join('..', 'data-out', 'final_data.csv')

meta_data = pd.read_csv(META_PATH)
school_data = pd.read_csv(SCHOOL_DATA_PATH)

# Create list of columns from meta_file
cols = meta_data['column'].tolist()
cols = set(cols)
cols = list(cols)

# Create final_data df
final_data = school_data[cols]

# Create dict of cols with data_type
col_type = dict(zip(meta_data.column,meta_data.data_type))

# Create list of int columns
int_cols = list(a for (a, b) in col_type.iteritems() if b == 'int')

# Apply convert numeric to int columns
def convert_numeric(cols):
    for col in cols:
        final_data[col] = final_data[col].convert_objects(convert_numeric=True)
convert_numeric(int_cols)

# Create dict of columns that can be aggregated with weighted_calc
col_category = dict(zip(meta_data.column,meta_data.category))
agg_cols_name = list(a for (a, b) in col_category.iteritems() if b == 'metric' or b == 'filter')

col_weighted = dict(zip(meta_data.column,meta_data.weighted_value))
agg_cols = dict((a, b) for (a, b) in col_weighted.iteritems() if a in agg_cols_name)

# Perform weighted calculation
for col in agg_cols_name:
    weighted_calc = [b for (a, b) in agg_cols.iteritems() if a == col]
    weighted_calc = ''.join(weighted_calc)
    weighted_calc = re.sub(r"([A-Za-z]\w+)", r"final_data['\1']", weighted_calc)
    final_data[col+'_weighted'] = eval(weighted_calc)

# Add establishment group column to final_data
establishment_mapping = {'Academy Converter': 'Academies', 'Community School' : 'LA maintained schools',
                         'Academy Sponsor Led' : 'Academies', 'Foundation School' : 'LA maintained schools',
                         'Voluntary Aided School' : 'LA maintained schools', 'Free Schools' : 'Free Schools',
                         'Voluntary Controlled School' : 'LA maintained schools', 'Studio Schools' : 'Free Schools',
                         'University Technical College' : 'Free Schools', 'City Technology College' : 'Academies'}

final_data['EstablishmentGroup'] = final_data['TypeOfEstablishment (name)'].replace(establishment_mapping)

# Removed independent schools from final_data
#final_data = final_data[final_data['EstablishmentGroup'] != 'Other Independent School']
#inal_data = final_data[final_data['EstablishmentGroup'] != 'Other Independent Special School']

final_data.to_csv(OUTPUT_PATH)
