import os
import pandas as pd
import itertools

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

final_data.to_csv(OUTPUT_PATH)
