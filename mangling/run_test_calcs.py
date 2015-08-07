##Test that replicates calculation method and compares output to actual DfE aggregate calculations in the data set

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

##Run eduvis LA calculations
# Exclude NaN LA from lea_df
lea_df = lea_df[lea_df['LEA_CODE'] != 201]

dfe_data_df = dfe_data_df[dfe_data_df['RECTYPE'] == 4]

metric_list_df = meta_df[meta_df['category'] == 'metric']
metric_list = zip(metric_list_df['column'], metric_list_df['group_divisor'] )

##Map DfE aggregate calculations to eduvis LA calculations
for (metric, divisor) in metric_list:
    if metric.startswith('P'):
    else:
        dfe_data_df[metric] = dfe_data_df[metric].convert_objects(convert_numeric=True)
    
    
def weighted_calc(df, group, groupfilter, divisor, metric):
    metric_sum = df.groupby([group])[metric+'_weighted'].sum()
    divisor_sum = df.groupby([group])[divisor].sum()
    calc = metric_sum / divisor_sum
    value = calc[groupfilter]
    value = value * 100
    return value

def get_value(df, index, index_filter, metric):
    dic = df.set_index(index)[metric].to_dict()
    return dic[index_filter]

for (metric, divisor) in metric_list:
    lea_df[metric+'_eduvis'] = lea_df.apply(lambda row: weighted_calc(final_df, 'LEA', row['LEA_CODE'], divisor, metric), axis=1)
    lea_df[metric+'_dfe'] = lea_df.apply(lambda row: get_value(dfe_data_df, 'LEA', row['LEA_CODE'], metric), axis=1)
    
for (metric, divisor) in metric_list:
    lea_df[metric+'_VARIANCE'] =  lea_df[metric+'_dfe'] - lea_df[metric+'_eduvis']
    
##Return df that shows variance for each metric
lea_df.to_csv(OUTPUT_PATH)
