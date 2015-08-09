# Test that replicates calculation method and compares output to actual DfE aggregate calculations in the data set

import pandas as pd
import os


META_PATH = os.path.join('..', 'data-src', 'meta_file.csv')
FINAL_PATH = os.path.join('..', 'data-out', 'final_data.csv')
RAW_PATH = os.path.join('..', 'data-out', 'test_school_data.csv')
LEA_PATH = os.path.join('..', 'data-src', 'lea_names.csv')
OUTPUT_PATH = os.path.join('..', 'data-out', 'variance_calcs.csv')

meta_df = pd.read_csv(META_PATH)
final_df = pd.read_csv(FINAL_PATH)
dfe_data_df = pd.read_csv(RAW_PATH)
lea_df = pd.read_csv(LEA_PATH)

# Run eduvis LEA calculations

# Exclude NaN LEAs
lea_df = lea_df[lea_df['LEA_CODE'] != 201]
lea_df = lea_df[lea_df['LEA_CODE'] != 420]
# Replace blanks in final data with 'missing'
final_df = final_df.fillna('missing')
# Create a list of tuples containing each metric and corresponding group divisor
metric_df = meta_df[meta_df['category'] == 'metric']
metric_list = zip(metric_df['column'], metric_df['group_divisor'])
# Define function for calculating aggregate metrics
def weighted_calc(df, group, groupfilter, divisor, metric):
    df = df[df[metric+'_weighted'] != 'missing']
    df = df[df[divisor] != 'missing']
    metric_sum = df.groupby([group])[metric+'_weighted'].sum()
    divisor_sum = df.groupby([group])[divisor].sum()
    calc = metric_sum / divisor_sum
    value = calc[groupfilter]
    value = value * 100
    return value
# Loop over metrics and use function to create column in LEA df
for (metric, divisor) in metric_list:
    lea_df[metric+'_eduvis'] = lea_df.apply(lambda row: weighted_calc(final_df, 'LEA', row['LEA_CODE'], divisor, metric), axis=1)

# Add DfE aggregate calculations to LEA df

# Include only rows that contain LEA data
dfe_data_df = dfe_data_df[dfe_data_df['RECTYPE'] == 4]
# Convert non-numeric columns to numeric (percentage cols already parsed)
for (metric, divisor) in metric_list:
    if metric.startswith('P'):
        pass
    else:
        dfe_data_df[metric] = dfe_data_df[metric].convert_objects(convert_numeric=True)
# Define function for returning actual DfE LEA aggregation
def get_value(df, index, index_filter, metric):
    dic = df.set_index(index)[metric].to_dict()
    return dic[index_filter]
# Loop over metrics and use function to create column in LEA df
for (metric, divisor) in metric_list:
    lea_df[metric+'_dfe'] = lea_df.apply(lambda row: get_value(dfe_data_df, 'LEA', row['LEA_CODE'], metric), axis=1)
# Calculate variance columns by subtracting DfE value from eduvis
for (metric, divisor) in metric_list:
    lea_df[metric+'_VARIANCE'] =  lea_df[metric+'_dfe'] - lea_df[metric+'_eduvis']
    
# Export calculations including variance to CSV

lea_df.to_csv(OUTPUT_PATH)
