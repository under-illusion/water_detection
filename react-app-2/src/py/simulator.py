import requests
import random
import datetime
import time
import sys
import json

print("Simulator Running...")
# sys.stdout.flush()
def generate_random_data():
    now = datetime.datetime.now()
    date_str = now.strftime("%Y-%m-%d")
    time_str = now.strftime("%H:%M:%S")


    data = {
        "pH": round(random.uniform(6.5, 8.5), 2),  # Safe pH range for drinking water
        "conductivity": random.randint(50, 1500),  # Typical range for clean water in µS/cm
        "turbidity": round(random.uniform(0.1, 5.0), 2),  # Safe turbidity level for drinking water in NTU
        "water_level": random.randint(50, 100),  # Adjusted to your specific use case
        "date": date_str,
        "time": time_str
    }

    return data

def post_data_to_api(url, data):
    response = requests.post(url, json=data)
    try:
        response_json = response.json()
        return response.status_code, response_json
    except json.JSONDecodeError:
        print("Error: Invalid JSON response")
        # sys.exit(1)

storage_api_url = "http://localhost:8000/sensor_data"  # Replace with your API endpoint
predict_api_url = "http://localhost:8080/api/predict"  # Replace with your API endpoint

while True:
    # Generate data
    data = generate_random_data()
    # Perform prediction
    prediction_status_code, prediction_response = post_data_to_api(predict_api_url, data)
    print(prediction_response)
    # Store data and prediction result
    storage_status_code, storage_response = post_data_to_api(storage_api_url, prediction_response)
    # print(storage_response)
    # Wait for 5 seconds before sending the next batch of data
    time.sleep(60) # Every minute