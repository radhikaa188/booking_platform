import redis
import json
import os

redis_client = redis.Redis(host=os.getenv("REDIS_HOST", "localhost"), port=6379, decode_responses=True)

def get_cache(key: str):
    value = redis_client.get(key)
    if value:
        return json.loads(value)
    return None

def set_cache(key: str, value, ttl_seconds: int = 300):
    redis_client.setex(key, ttl_seconds, json.dumps(value, default=str))