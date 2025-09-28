from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend_utils.data_loader import load_from_elasticsearch

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Adjust for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/api/temperature")
def get_temperature():
    df = load_from_elasticsearch(
        host="http://10.0.0.90:9200",
        index="data_feed_temperature",
        fields=["time", "principal", "model_id", "join_id", "battery_v", "battery_status", 
               "humidity", "temperature_0", "temperature_1", "received_at", "source_file", 
               "source_path", "timestamp"],
        last_n=10,
        api_key="SVMwZmZKa0JYUEZDdTRiY3RXQ2U6MFQyTUN6TkdYNEVQQnZGUm5hcHhCUQ=="
    )
    
    # Convert DataFrame to list of dictionaries matching your data structure
    data = []
    for i in range(len(df)):
        data.append({
            "time": df["time"].iloc[i] if "time" in df else None,
            "principal": df["principal"].iloc[i] if "principal" in df else None,
            "model_id": df["model_id"].iloc[i] if "model_id" in df else None,
            "join_id": df["join_id"].iloc[i] if "join_id" in df else None,
            "battery_v": df["battery_v"].iloc[i] if "battery_v" in df else None,
            "battery_status": df["battery_status"].iloc[i] if "battery_status" in df else None,
            "humidity": df["humidity"].iloc[i] if "humidity" in df else None,
            "temperature_0": df["temperature_0"].iloc[i] if "temperature_0" in df else None,
            "temperature_1": df["temperature_1"].iloc[i] if "temperature_1" in df else None,
            "received_at": df["received_at"].iloc[i] if "received_at" in df else None,
            "source_file": df["source_file"].iloc[i] if "source_file" in df else None,
            "source_path": df["source_path"].iloc[i] if "source_path" in df else None,
            "timestamp": df["timestamp"].iloc[i] if "timestamp" in df else None,
        })
    
    return {"data": data}

@app.get("/api/metrics")
def get_metrics():
    df = load_from_elasticsearch(
        host="http://10.0.0.90:9200",
        index="data_feed_metrics",
        fields=["time", "temperature_0", "vibration_0", "battery_0"],
        last_n=10,
        api_key="SVMwZmZKa0JYUEZDdTRiY3RXQ2U6MFQyTUN6TkdYNEVQQnZGUm5hcHhCUQ=="
    )
    metrics = []
    for i in range(len(df)):
        metrics.append({
            "time": df["time"].iloc[i] if "time" in df else None,
            "temperature": df["temperature_0"].iloc[i] if "temperature_0" in df else None,
            "vibration": df["vibration_0"].iloc[i] if "vibration_0" in df else None,
            "battery": df["battery_0"].iloc[i] if "battery_0" in df else None,
        })
    return {"metrics": metrics}
