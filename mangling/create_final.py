import os
import re
import pandas as pd

META_PATH = os.path.join('..', 'data-src', 'meta_file.csv')
SCHOOL_DATA_PATH = os.path.join('..', 'data-out', 'school_data.csv')
OUTPUT_PATH = os.path.join('..', 'data-out', 'final_data.csv')

# Create list of columns from meta_file and create final_data df
meta_data = pd.read_csv(META_PATH)
final_data = (pd.read_csv(SCHOOL_DATA_PATH, usecols=meta_data['column'])
              .convert_objects(convert_numeric=True))

# Do weighted calculations
aggs = meta_data[meta_data.category.isin(('metric', 'filter'))]
for column, formula in zip(aggs['column'], aggs['weighted_value']):
    formula = re.sub(r"([A-Za-z]\w+)", r"final_data['\1']", formula)
    final_data[column+'_weighted'] = eval(formula)

# Add establishment group column to final_data
establishment_mapping = {'Academy Converter': 'Academies', 'Community School': 'LA maintained schools',
                         'Academy Sponsor Led': 'Academies', 'Foundation School': 'LA maintained schools',
                         'Voluntary Aided School': 'LA maintained schools', 'Free Schools': 'Free Schools',
                         'Voluntary Controlled School': 'LA maintained schools', 'Studio Schools': 'Free Schools',
                         'University Technical College': 'Free Schools', 'City Technology College': 'Academies'}
final_data['EstablishmentGroup'] = final_data['TypeOfEstablishment (name)'].replace(establishment_mapping)

final_data.to_csv(OUTPUT_PATH, index=False)