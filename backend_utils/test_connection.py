from data_loader import load_from_elasticsearch
import time

if __name__ == "__main__":
    start_time = time.time()
    df_temp = load_from_elasticsearch(
        host="http://10.0.0.90:9200",
        index="data_feed_temperature",
        fields=["time", "temperature_0"],
        api_key="SVMwZmZKa0JYUEZDdTRiY3RXQ2U6MFQyTUN6TkdYNEVQQnZGUm5hcHhCUQ=="
    )
    print(df_temp.head())
    end_time = time.time()
    print("Time taken:", end_time - start_time)
    print(f"Retrieved {len(df_temp)} rows")