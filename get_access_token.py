#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
네이버 커머스API SELF 방식(서버-투-서버) 인증 토큰 발급 프로그램
- bcrypt 해시 + base64 인코딩 방식
- config.json에서 client_id, client_secret을 읽어 토큰을 발급받고 저장
"""

import time
import bcrypt
import pybase64
import requests
import json
import sys

# 1. config.json에서 정보 읽기
try:
    with open('config.json', 'r', encoding='utf-8') as f:
        config = json.load(f)
except FileNotFoundError:
    print('❌ config.json 파일이 없습니다. naver_smartstore_api.py를 먼저 실행해 설정 파일을 생성하세요.')
    sys.exit(1)

client_id = config.get('client_id')
client_secret = config.get('client_secret')
api_url = config.get('base_url', 'https://api.commerce.naver.com/external')

if not client_id or not client_secret:
    print('❌ config.json에 client_id, client_secret 값을 정확히 입력하세요.')
    sys.exit(1)

# 2. timestamp(밀리초) 생성
#    네이버 커머스API는 밀리초 단위의 timestamp를 요구함
#    예: 1721234567890

timestamp = str(int(round(time.time() * 1000)))

# 3. password 생성: client_id + "_" + timestamp
password = f"{client_id}_{timestamp}"

# 4. bcrypt 해싱 (client_secret을 salt로 사용)
hashed = bcrypt.hashpw(password.encode('utf-8'), client_secret.encode('utf-8'))

# 5. base64 인코딩
client_secret_sign = pybase64.standard_b64encode(hashed).decode('utf-8')

# 6. 토큰 요청
#    grant_type: client_credentials, type: SELF
#    공식문서: https://apicenter.commerce.naver.com/docs/commerce-api/current/exchange-sellers-auth

auth_token_url = f"{api_url}/v1/oauth2/token"
data = {
    'client_id': client_id,
    'timestamp': timestamp,
    'client_secret_sign': client_secret_sign,
    'grant_type': 'client_credentials',
    'type': 'SELF'
}

print("\n[네이버 커머스API SELF 방식 토큰 발급 요청]")
print(f"요청 URL: {auth_token_url}")
print(f"client_id: {client_id}")
print(f"timestamp: {timestamp}")
print(f"client_secret_sign: {client_secret_sign[:20]}... (생략)")

response = requests.post(auth_token_url, data=data)

if response.status_code == 200:
    token_data = response.json()
    access_token = token_data['access_token']
    print(f"\n✅ 발급된 access_token: {access_token}")
    # config.json에 저장
    config['access_token'] = access_token
    with open('config.json', 'w', encoding='utf-8') as f:
        json.dump(config, f, indent=2, ensure_ascii=False)
    print("config.json 파일이 자동으로 업데이트 되었습니다.")
else:
    print(f"❌ 토큰 발급 실패: {response.status_code} - {response.text}") 