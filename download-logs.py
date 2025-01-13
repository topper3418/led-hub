import requests
import csv
import json

# Replace with your actual URL
API_URL = "https://example.com/api/logs"

# Send the GET request to the endpoint
response = requests.get(API_URL)

# Check if the request was successful (status code 200)
if response.status_code != 200:
    print(f"Error: Unable to fetch data from the endpoint. Status code: {response.status_code}")
    exit(1)

# Parse the JSON response
logs = response.json()

# Open the CSV file for writing
with open('logs.csv', mode='w', newline='', encoding='utf-8') as file:
    writer = csv.DictWriter(file, fieldnames=["id", "timestamp", "logger", "logger_id", "level", "message"])

    # Write the header row
    writer.writeheader()

    # Write each log entry to the CSV file
    for log in logs:
        writer.writerow(log)

print("Logs have been written to logs.csv.")
