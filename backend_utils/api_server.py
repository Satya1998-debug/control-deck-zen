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
