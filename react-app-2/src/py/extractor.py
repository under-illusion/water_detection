import csv
import pandas as pd
import glob

# File paths
input_file_path = 'top_temp_cond_ph_raw_data.txt'  # replace with your actual input file path
output_file_path = 'raw_data_topen_full.csv'
input_folder = 'raw_top_data'

# Column headers
# columns = ["e_coli", "contamination(%)", "water_temperature(◦C)", "conductivity(µS)", "pH", "turbidity(NTU)", "e_coli_MG1655_load(LogCFU/mL)"]
# columns = ["e_coli_MPN_100_mL", "enterococci"]
columns = ["temp_celsius(water)", "conductivity_mu_S", "pH"]

def extractor(input_file_path, output_file_path, columns):
    # Read the input file and write to the CSV file
    with open(input_file_path, 'r') as input_file, open(output_file_path, 'w', newline='') as output_file:
        reader = input_file.readlines()
        writer = csv.writer(output_file)
        
        # Write the header
        writer.writerow(columns)
        
        # Process each line in the input file
        for line in reader:
            # Split the line by spaces        
            values = line.strip().split()
            # Write the values to the CSV file
            writer.writerow(values)
        
    print(f"Data has been written to {output_file_path}")


def join_csv_files(input_folder, output_file):
    # Find all CSV files in the input folder
    csv_files = glob.glob(f"{input_folder}/*.csv")
    
    # Read and concatenate all CSV files side by side
    dfs = [pd.read_csv(file) for file in csv_files]
    merged_df = pd.concat(dfs, axis=1)
    
    # Write the merged DataFrame to the output file
    merged_df.to_csv(output_file, index=False)
    print(f"CSV files joined and saved to {output_file}")


def stack_csv_files(input_folder, output_file):
    # Find all CSV files in the input folder
    csv_files = glob.glob(f"{input_folder}/*.csv")
    
    # Read and concatenate all CSV files row-wise
    dfs = [pd.read_csv(file) for file in csv_files]
    stacked_df = pd.concat(dfs, ignore_index=True)
    
    # Write the stacked DataFrame to the output file
    stacked_df.to_csv(output_file, index=False)
    print(f"CSV files stacked and saved to {output_file}")


# extractor(input_file_path, output_file_path, columns)
# join_csv_files(input_folder, output_file_path)
# stack_csv_files(input_folder, output_file_path)
print("hey hey")