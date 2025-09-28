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
        fields=["time", "temperature_0"],
        last_n=10,
        api_key="SVMwZmZKa0JYUEZDdTRiY3RXQ2U6MFQyTUN6TkdYNEVQQnZGUm5hcHhCUQ=="
    )
    values = df["temperature_0"].tolist() if "temperature_0" in df else []
    return {"values": values}

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
