# app/src/redis_conn.py

import redis
import os
from dotenv import load_dotenv

load_dotenv(dotenv_path="/S13P31D101/.env")

redis_conn = redis.Redis(
    host=os.getenv("REDIS_HOST", "localhost"),
    port=int(os.getenv("REDIS_PORT", 6379)),
    password=os.getenv("REDIS_PASSWORD"),
    db=int(os.getenv("REDIS_DB", 0)),
    decode_responses=True
)
