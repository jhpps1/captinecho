# import redis
# import json
# import os

# def get_redis_connection():
#     """환경에 따라 Redis 연결 설정"""
#     redis_host = os.getenv('REDIS_HOST', 'localhost')
#     redis_port = int(os.getenv('REDIS_PORT', 6379))
#     # 비밀번호 라인 완전 제거!
    
#     try:
#         r = redis.Redis(
#             host=redis_host,
#             port=redis_port,
#             # password 라인 제거!
#             decode_responses=True,
#             socket_connect_timeout=5
#         )
#         r.ping()  # 연결 테스트
#         print(f"✅ Redis connected to {redis_host}:{redis_port}")
#         return r
#     except redis.ConnectionError as e:
#         print(f"❌ Redis connection failed: {e}")
#         return None

# # Redis 연결 초기화
# r = get_redis_connection()

# def save_to_redis(key, data):
#     """Redis에 데이터 저장"""
#     if r is None:
#         print("⚠️ Redis not available, skipping save")
#         return False
    
#     try:
#         value = json.dumps(data) if isinstance(data, dict) else str(data) 
#         r.set(key, value)
#         print(f"✅ Saved to Redis: {key}")
#         return True
#     except Exception as e:
#         print(f"❌ Redis save error: {e}")
#         return False

# def read_from_redis(key):
#     """Redis에서 데이터 읽기"""
#     if r is None:
#         print("⚠️ Redis not available")
#         return None
    
#     try:
#         value = r.get(key)
#         if value:
#             try:
#                 return json.loads(value)
#             except:
#                 return value
#         return None
#     except Exception as e:
#         print(f"❌ Redis read error: {e}")
#         return None

# def get_cache_key(user_input, student_id):
#     """캐시 키 생성"""
#     import hashlib
#     content = f"{user_input}_{student_id}"
#     return f"crew:cache:{hashlib.md5(content.encode()).hexdigest()}"      

# def get_cached_response(user_input, student_id):
#     """캐시된 응답 조회"""
#     if r is None:
#         return None
    
#     key = get_cache_key(user_input, student_id)
#     cached = read_from_redis(key)
#     if cached:
#         print(f"✅ Cache hit: {key}")
#     return cached

# def cache_response(user_input, student_id, output, ttl=86400):
#     """응답 캐싱 (기본 24시간)"""
#     if r is None:
#         return False
    
#     try:
#         key = get_cache_key(user_input, student_id)
#         value = json.dumps(output) if isinstance(output, dict) else str(output)
#         r.setex(key, ttl, value)
#         print(f"✅ Cached response for {ttl}s: {key}")
#         return True
#     except Exception as e:
#         print(f"❌ Cache error: {e}")
#         return False