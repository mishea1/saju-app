#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
네이버 스마트스토어 API 사용 예제
실제 사용 시나리오를 보여주는 샘플 코드입니다.
"""

import json
import time
from datetime import datetime, timedelta
from naver_smartstore_api import NaverSmartStoreAPI, ApiConfig, SmartStoreManager

def example_basic_usage():
    """기본 사용법 예제"""
    print("=== 기본 사용법 예제 ===")
    
    # 설정 로드 (실제 사용 시 config.json 파일에서 로드)
    config = ApiConfig(
        client_id="YOUR_CLIENT_ID",
        client_secret="YOUR_CLIENT_SECRET", 
        access_token="YOUR_ACCESS_TOKEN"
    )
    
    # API 클라이언트 초기화
    api_client = NaverSmartStoreAPI(config)
    
    try:
        # 1. 상품 목록 조회
        print("1. 상품 목록 조회 중...")
        products_response = api_client.get_products(page=1, page_size=5)
        
        if 'products' in products_response:
            products = products_response['products']
            print(f"   조회된 상품 수: {len(products)}")
            
            for i, product in enumerate(products[:3], 1):
                print(f"   {i}. {product.get('productName', 'N/A')} (ID: {product.get('productId', 'N/A')})")
        
        # 2. 특정 상품 상세 정보 조회
        if products:
            first_product_id = products[0].get('productId')
            if first_product_id:
                print(f"\n2. 상품 상세 정보 조회 중... (ID: {first_product_id})")
                product_detail = api_client.get_product_detail(first_product_id)
                print(f"   상품명: {product_detail.get('productName', 'N/A')}")
                print(f"   가격: {product_detail.get('price', 'N/A')}원")
        
        # 3. 최근 주문 조회
        print("\n3. 최근 주문 조회 중...")
        today = datetime.now()
        week_ago = today - timedelta(days=7)
        
        orders_response = api_client.get_orders(
            page=1,
            page_size=5,
            start_date=week_ago.strftime('%Y-%m-%d'),
            end_date=today.strftime('%Y-%m-%d')
        )
        
        if 'orders' in orders_response:
            orders = orders_response['orders']
            print(f"   최근 7일간 주문 수: {len(orders)}")
            
            for i, order in enumerate(orders[:3], 1):
                print(f"   {i}. 주문 ID: {order.get('orderId', 'N/A')}, 상태: {order.get('orderStatus', 'N/A')}")
        
    except Exception as e:
        print(f"오류 발생: {str(e)}")

def example_advanced_usage():
    """고급 사용법 예제"""
    print("\n=== 고급 사용법 예제 ===")
    
    # 설정 로드
    config = ApiConfig(
        client_id="YOUR_CLIENT_ID",
        client_secret="YOUR_CLIENT_SECRET",
        access_token="YOUR_ACCESS_TOKEN"
    )
    
    # 스마트스토어 매니저 초기화
    api_client = NaverSmartStoreAPI(config)
    store_manager = SmartStoreManager(api_client)
    
    try:
        # 1. 모든 상품 정보 가져오기
        print("1. 모든 상품 정보 수집 중...")
        all_products = store_manager.get_all_products(max_pages=3)
        print(f"   총 {len(all_products)}개의 상품 정보를 수집했습니다.")
        
        # 2. 재고 부족 상품 확인
        print("\n2. 재고 부족 상품 확인 중...")
        low_stock_products = store_manager.update_low_stock_products(threshold=5)
        
        if low_stock_products:
            print(f"   재고 부족 상품 수: {len(low_stock_products)}")
            for product in low_stock_products:
                print(f"   - 상품 ID: {product['productId']}, 현재 재고: {product['currentQuantity']}")
        else:
            print("   재고 부족 상품이 없습니다.")
        
        # 3. 최근 주문 분석
        print("\n3. 최근 주문 분석 중...")
        recent_orders = store_manager.get_recent_orders(days=30)
        
        if recent_orders:
            # 주문 상태별 통계
            status_count = {}
            for order in recent_orders:
                status = order.get('orderStatus', 'UNKNOWN')
                status_count[status] = status_count.get(status, 0) + 1
            
            print(f"   최근 30일간 총 주문 수: {len(recent_orders)}")
            print("   주문 상태별 통계:")
            for status, count in status_count.items():
                print(f"   - {status}: {count}건")
        
    except Exception as e:
        print(f"오류 발생: {str(e)}")

def example_product_management():
    """상품 관리 예제"""
    print("\n=== 상품 관리 예제 ===")
    
    config = ApiConfig(
        client_id="YOUR_CLIENT_ID",
        client_secret="YOUR_CLIENT_SECRET",
        access_token="YOUR_ACCESS_TOKEN"
    )
    
    api_client = NaverSmartStoreAPI(config)
    
    try:
        # 1. 새 상품 등록 예제 (실제로는 실행하지 않음)
        print("1. 새 상품 등록 예제")
        new_product_data = {
            "productName": "테스트 상품",
            "productDescription": "API를 통한 테스트 상품입니다.",
            "price": 10000,
            "categoryId": "카테고리ID",
            "images": [
                {
                    "url": "https://example.com/image1.jpg",
                    "sortOrder": 1
                }
            ],
            "options": [
                {
                    "optionName": "색상",
                    "optionValues": ["빨강", "파랑", "노랑"]
                }
            ]
        }
        
        print("   상품 등록 데이터 준비 완료 (실제 등록은 하지 않음)")
        print(f"   상품명: {new_product_data['productName']}")
        print(f"   가격: {new_product_data['price']}원")
        
        # 2. 상품 정보 수정 예제
        print("\n2. 상품 정보 수정 예제")
        update_data = {
            "price": 12000,
            "productDescription": "가격이 업데이트된 테스트 상품입니다."
        }
        print("   상품 정보 수정 데이터 준비 완료")
        print(f"   새 가격: {update_data['price']}원")
        
        # 3. 재고 관리 예제
        print("\n3. 재고 관리 예제")
        product_id = "EXAMPLE_PRODUCT_ID"
        
        # 재고 조회
        print(f"   상품 {product_id}의 재고 조회")
        
        # 재고 업데이트
        new_quantity = 50
        print(f"   재고 수량을 {new_quantity}개로 업데이트")
        
    except Exception as e:
        print(f"오류 발생: {str(e)}")

def example_error_handling():
    """오류 처리 예제"""
    print("\n=== 오류 처리 예제 ===")
    
    config = ApiConfig(
        client_id="INVALID_CLIENT_ID",
        client_secret="INVALID_CLIENT_SECRET",
        access_token="INVALID_ACCESS_TOKEN"
    )
    
    api_client = NaverSmartStoreAPI(config)
    
    try:
        # 의도적으로 잘못된 인증 정보로 API 호출
        print("1. 잘못된 인증 정보로 API 호출 테스트")
        response = api_client.get_products()
        print("   API 호출 성공 (예상치 못한 결과)")
        
    except Exception as e:
        print(f"   예상된 오류 발생: {str(e)}")
        print("   이는 잘못된 인증 정보로 인한 정상적인 오류입니다.")
    
    try:
        # 존재하지 않는 상품 ID로 조회
        print("\n2. 존재하지 않는 상품 ID로 조회 테스트")
        response = api_client.get_product_detail("NON_EXISTENT_PRODUCT_ID")
        print("   상품 조회 성공 (예상치 못한 결과)")
        
    except Exception as e:
        print(f"   예상된 오류 발생: {str(e)}")
        print("   이는 존재하지 않는 상품 ID로 인한 정상적인 오류입니다.")

def main():
    """메인 실행 함수"""
    print("네이버 스마트스토어 API 사용 예제")
    print("=" * 50)
    
    # 실제 API 정보가 설정되어 있는지 확인
    try:
        with open('config.json', 'r', encoding='utf-8') as f:
            config_data = json.load(f)
        
        if (config_data.get('client_id') == 'YOUR_CLIENT_ID' or 
            config_data.get('client_secret') == 'YOUR_CLIENT_SECRET' or
            config_data.get('access_token') == 'YOUR_ACCESS_TOKEN'):
            print("⚠️  경고: config.json 파일에 실제 API 정보를 입력해주세요.")
            print("현재는 예제 데이터로 실행됩니다.\n")
            
    except FileNotFoundError:
        print("⚠️  경고: config.json 파일이 없습니다.")
        print("naver_smartstore_api.py를 먼저 실행하여 설정 파일을 생성해주세요.\n")
    
    # 예제 실행
    example_basic_usage()
    example_advanced_usage()
    example_product_management()
    example_error_handling()
    
    print("\n" + "=" * 50)
    print("예제 실행 완료!")
    print("실제 사용을 위해서는 config.json 파일에 올바른 API 정보를 입력해주세요.")

if __name__ == "__main__":
    main() 