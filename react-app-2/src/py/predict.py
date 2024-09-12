import sys
import json
import joblib
import numpy as np
import pandas as pd

# Load the model
# sys.stdout.flush()

model = joblib.load('src/py/random_forest_model.pkl')

# Parse input features from the command line argument
data = json.loads(sys.argv[1])

parsed_data = {
    "pH": data['pH'],
    "conductivity": data['conductivity'],
    "turbidity": data['turbidity'],
    "conductivity_log_us_cm": np.log10(data['conductivity']),
    "turbidity_log": np.log10(data['turbidity']),
    "water_level": data['water_level'],
    "date": data['date'],
    "time": data['time']
}

# Prepare input features for the model
input_features = [parsed_data['pH'], parsed_data['conductivity_log_us_cm'], parsed_data['turbidity_log']]
features = np.array(input_features).reshape(1, -1)
features_df = pd.DataFrame(features, columns=["ph", "conductivity_log_us_cm", "turbidity_log"])

# Make a prediction
parsed_data['prediction'] = int(model.predict(features_df)[0])

# Print the result as a JSON string
print(json.dumps(parsed_data))

    # return parsed_data
