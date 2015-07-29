import os

import pandas as pd
import numpy as np


OUTPUT_PATH = os.path.join('..', 'data-out', 'inspection_outcomes.csv')

root = os.path.abspath(os.path.join('..', 'data-src', 'ofsted'))
target_files = [os.path.join(root, file) for file in os.listdir(root)]

inspection_dfs = [pd.read_csv(ofsted_csv, index_col=False) for ofsted_csv in target_files]

all_inspections_df = pd.concat(inspection_dfs)

all_inspections_df['Inspection end date'] = pd.to_datetime(all_inspections_df['Inspection end date'],dayfirst=True)

all_inspections_df['date_sum'] = 1
all_inspections_df = all_inspections_df.sort(columns=['URN', 'Inspection end date'], ascending=[True, False])
all_inspections_df['running_sum']= np.cumsum(all_inspections_df.groupby(['URN'])['date_sum'])

all_inspections_df.to_csv(OUTPUT_PATH, index=False)
