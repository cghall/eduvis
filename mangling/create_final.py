import os
import pandas as pd
import itertools

META_PATH = os.path.join('..', 'data-src', 'meta_file.csv')
SCHOOL_DATA_PATH = os.path.join('..', 'data-out', 'school_data.csv')

OUTPUT_PATH = os.path.join('..', 'data-out', 'final_data.csv')

meta_data = pd.read_csv(META_PATH)
school_data = pd.read_csv(SCHOOL_DATA_PATH)

col1 = meta_data['associated_cols'].tolist()
col1 = itertools.chain.from_iterable((c.split(',') for c in col1 if isinstance(c, str)))
col2 = meta_data['column'].tolist()
cols = set(col2) | set(col1)
cols = list(cols)

final_data = school_data[cols]

final_data.to_csv(OUTPUT_PATH)
