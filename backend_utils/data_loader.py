from elasticsearch import Elasticsearch
import pandas as pd
import time

def load_from_elasticsearch(
    host: str,
    index: str,
    fields: list[str],
    last_n: int = 1,
    api_key: str | None = None,
    username: str | None = None,
    password: str | None = None,
) -> pd.DataFrame:
    """
    Load the last N documents from Elasticsearch into a pandas DataFrame.
    Parameters
    ----------
    host : str
        Elasticsearch host, e.g. "http://localhost:9200"
    index : str
        Index name
    fields : list[str]
        Fields to retrieve from documents
    last_n : int, optional
        Number of most recent documents to fetch (default: 100)
    api_key : str, optional
        API key for authentication
    username : str, password : str, optional
        Basic authentication
    Returns
    -------
    pd.DataFrame
    """
    # Connect
    if api_key:
        es = Elasticsearch(host, api_key=api_key)
    elif username and password:
        es = Elasticsearch(host, basic_auth=(username, password))
    else:
        es = Elasticsearch(host)
    # Query: sort by time descending to get last N
    query = {
        "size": last_n,
        "_source": fields,
        "sort": [{"time": {"order": "desc"}}]
    }
    response = es.search(index=index, body=query)
    hits = response["hits"]["hits"]
    if not hits:
        return pd.DataFrame(columns=fields)
    df = pd.json_normalize([h["_source"] for h in hits])
    # Convert time and sort ascending
    if "time" in df.columns:
        df["time"] = pd.to_datetime(df["time"])
        df = df.set_index("time").sort_index()
    return df


