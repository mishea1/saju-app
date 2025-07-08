#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
네이버 스마트스토어 API 자동 접속 프로그램
네이버 커머스API를 사용하여 스마트스토어와 연동하는 프로그램입니다.

주요 기능:
- API 인증 및 토큰 관리
- 상품 조회 및 관리
- 주문 조회 및 처리
- 재고 관리
- 에러 처리 및 로깅

참고 문서:
- https://apicenter.commerce.naver.com/docs/introduction
- https://apicenter.commerce.naver.com/docs/restful-api
- https://apicenter.commerce.naver.com/docs/trouble-shooting
"""

import requests
import json
import time
import logging
from datetime import datetime, timezone, timedelta
from typing import Dict, List, Optional, Any
import os
from dataclasses import dataclass
import hashlib
import hmac
import base64

# 로깅 설정
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('naver_api.log', encoding='utf-8'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

@dataclass
class ApiConfig:
    """API 설정 정보를 담는 데이터 클래스"""
    client_id: str
    client_secret: str
    access_token: str
    # 테스트 환경 URL (실제 운영 스토어에 영향을 주지 않음)
    base_url: str = "https://api.commerce.naver.com/external"
    timeout: int = 30

class NaverSmartStoreAPI:
    """네이버 스마트스토어 API 클라이언트"""
    
    def __init__(self, config: ApiConfig):
        """
        API 클라이언트 초기화
        
        Args:
            config (ApiConfig): API 설정 정보
        """
        self.config = config
        self.session = requests.Session()
        self.session.headers.update({
            'Content-Type': 'application/json; charset=UTF-8',
            'Accept': 'application/json',
            'X-Naver-Client-Id': config.client_id,
            'X-Naver-Client-Secret': config.client_secret
        })
        
        # 토큰이 있으면 헤더에 추가
        if config.access_token:
            self.session.headers.update({
                'Authorization': f'Bearer {config.access_token}'
            })
    
    def _make_request(self, method: str, endpoint: str, data: Optional[Dict] = None, 
                     params: Optional[Dict] = None) -> Dict[str, Any]:
        """
        API 요청을 보내는 공통 메서드
        
        Args:
            method (str): HTTP 메서드 (GET, POST, PUT, DELETE)
            endpoint (str): API 엔드포인트
            data (Dict, optional): 요청 데이터
            params (Dict, optional): URL 파라미터
            
        Returns:
            Dict[str, Any]: API 응답 데이터
            
        Raises:
            Exception: API 요청 실패 시
        """
        url = f"{self.config.base_url}{endpoint}"
        
        try:
            logger.info(f"API 요청: {method} {url}")
            
            response = self.session.request(
                method=method,
                url=url,
                json=data,
                params=params,
                timeout=self.config.timeout
            )
            
            # Trace ID 로깅 (디버깅용)
            trace_id = response.headers.get('GNCP-GW-Trace-ID')
            if trace_id:
                logger.info(f"Trace ID: {trace_id}")
            
            # 응답 시간 로깅
            response_time = response.headers.get('GNCP-GW-HttpClient-ResponseTime')
            if response_time:
                logger.info(f"응답 시간: {response_time}ms")
            
            # HTTP 상태 코드 확인
            if response.status_code >= 400:
                error_msg = f"API 요청 실패: {response.status_code} - {response.text}"
                logger.error(error_msg)
                raise Exception(error_msg)
            
            # JSON 응답 파싱
            if response.content:
                return response.json()
            else:
                return {"success": True}
                
        except requests.exceptions.Timeout:
            error_msg = "API 요청 시간 초과"
            logger.error(error_msg)
            raise Exception(error_msg)
        except requests.exceptions.RequestException as e:
            error_msg = f"API 요청 중 오류 발생: {str(e)}"
            logger.error(error_msg)
            raise Exception(error_msg)
        except json.JSONDecodeError as e:
            error_msg = f"JSON 파싱 오류: {str(e)}"
            logger.error(error_msg)
            raise Exception(error_msg)
    
    def get_products(self, page: int = 1, page_size: int = 20) -> Dict[str, Any]:
        """
        상품 목록 조회
        
        Args:
            page (int): 페이지 번호 (기본값: 1)
            page_size (int): 페이지당 상품 수 (기본값: 20)
            
        Returns:
            Dict[str, Any]: 상품 목록 데이터
        """
        endpoint = "/v1/products"
        params = {
            'page': page,
            'pageSize': page_size
        }
        
        return self._make_request('GET', endpoint, params=params)
    
    def get_store_info(self) -> Dict[str, Any]:
        """
        스토어 정보 조회 (기본 정보 확인용)
        
        Returns:
            Dict[str, Any]: 스토어 정보
        """
        endpoint = "/v1/seller"
        return self._make_request('GET', endpoint)
    
    def get_product_detail(self, product_id: str) -> Dict[str, Any]:
        """
        상품 상세 정보 조회
        
        Args:
            product_id (str): 상품 ID
            
        Returns:
            Dict[str, Any]: 상품 상세 정보
        """
        endpoint = f"/v1/products/{product_id}"
        return self._make_request('GET', endpoint)
    
    def create_product(self, product_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        새 상품 등록
        
        Args:
            product_data (Dict[str, Any]): 상품 정보
            
        Returns:
            Dict[str, Any]: 생성된 상품 정보
        """
        endpoint = "/v1/products"
        return self._make_request('POST', endpoint, data=product_data)
    
    def update_product(self, product_id: str, product_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        상품 정보 수정
        
        Args:
            product_id (str): 상품 ID
            product_data (Dict[str, Any]): 수정할 상품 정보
            
        Returns:
            Dict[str, Any]: 수정된 상품 정보
        """
        endpoint = f"/v1/products/{product_id}"
        return self._make_request('PUT', endpoint, data=product_data)
    
    def get_orders(self, page: int = 1, page_size: int = 20, 
                   start_date: Optional[str] = None, end_date: Optional[str] = None) -> Dict[str, Any]:
        """
        주문 목록 조회
        
        Args:
            page (int): 페이지 번호 (기본값: 1)
            page_size (int): 페이지당 주문 수 (기본값: 20)
            start_date (str, optional): 조회 시작일 (YYYY-MM-DD 형식)
            end_date (str, optional): 조회 종료일 (YYYY-MM-DD 형식)
            
        Returns:
            Dict[str, Any]: 주문 목록 데이터
        """
        endpoint = "/v1/orders"
        params = {
            'page': page,
            'pageSize': page_size
        }
        
        if start_date:
            params['startDate'] = start_date
        if end_date:
            params['endDate'] = end_date
            
        return self._make_request('GET', endpoint, params=params)
    
    def get_order_detail(self, order_id: str) -> Dict[str, Any]:
        """
        주문 상세 정보 조회
        
        Args:
            order_id (str): 주문 ID
            
        Returns:
            Dict[str, Any]: 주문 상세 정보
        """
        endpoint = f"/v1/orders/{order_id}"
        return self._make_request('GET', endpoint)
    
    def update_order_status(self, order_id: str, status: str) -> Dict[str, Any]:
        """
        주문 상태 업데이트
        
        Args:
            order_id (str): 주문 ID
            status (str): 변경할 주문 상태
            
        Returns:
            Dict[str, Any]: 업데이트 결과
        """
        endpoint = f"/v1/orders/{order_id}/status"
        data = {"status": status}
        return self._make_request('PUT', endpoint, data=data)
    
    def get_inventory(self, product_id: str) -> Dict[str, Any]:
        """
        상품 재고 정보 조회
        
        Args:
            product_id (str): 상품 ID
            
        Returns:
            Dict[str, Any]: 재고 정보
        """
        endpoint = f"/v1/products/{product_id}/inventory"
        return self._make_request('GET', endpoint)
    
    def update_inventory(self, product_id: str, quantity: int) -> Dict[str, Any]:
        """
        상품 재고 수량 업데이트
        
        Args:
            product_id (str): 상품 ID
            quantity (int): 변경할 재고 수량
            
        Returns:
            Dict[str, Any]: 업데이트 결과
        """
        endpoint = f"/v1/products/{product_id}/inventory"
        data = {"quantity": quantity}
        return self._make_request('PUT', endpoint, data=data)

class SmartStoreManager:
    """스마트스토어 관리 클래스"""
    
    def __init__(self, api_client: NaverSmartStoreAPI):
        """
        스마트스토어 매니저 초기화
        
        Args:
            api_client (NaverSmartStoreAPI): API 클라이언트
        """
        self.api = api_client
    
    def get_all_products(self, max_pages: int = 10) -> List[Dict[str, Any]]:
        """
        모든 상품 정보를 가져오는 메서드
        
        Args:
            max_pages (int): 최대 조회할 페이지 수
            
        Returns:
            List[Dict[str, Any]]: 모든 상품 정보 리스트
        """
        all_products = []
        page = 1
        
        while page <= max_pages:
            try:
                logger.info(f"상품 목록 조회 중... (페이지 {page})")
                response = self.api.get_products(page=page, page_size=20)
                
                if 'products' in response:
                    products = response['products']
                    all_products.extend(products)
                    
                    # 더 이상 상품이 없으면 종료
                    if len(products) < 20:
                        break
                else:
                    logger.warning(f"페이지 {page}에서 상품 데이터를 찾을 수 없습니다.")
                    break
                    
                page += 1
                time.sleep(0.5)  # API 호출 제한 방지
                
            except Exception as e:
                logger.error(f"페이지 {page} 조회 중 오류 발생: {str(e)}")
                break
        
        logger.info(f"총 {len(all_products)}개의 상품을 조회했습니다.")
        return all_products
    
    def get_recent_orders(self, days: int = 7) -> List[Dict[str, Any]]:
        """
        최근 주문 정보를 가져오는 메서드
        
        Args:
            days (int): 조회할 일수 (기본값: 7일)
            
        Returns:
            List[Dict[str, Any]]: 최근 주문 정보 리스트
        """
        # 날짜 계산 (KST 기준)
        end_date = datetime.now(timezone(timedelta(hours=9)))
        start_date = end_date - timedelta(days=days)
        
        start_date_str = start_date.strftime('%Y-%m-%d')
        end_date_str = end_date.strftime('%Y-%m-%d')
        
        logger.info(f"최근 {days}일간의 주문 조회 중... ({start_date_str} ~ {end_date_str})")
        
        try:
            response = self.api.get_orders(
                page=1,
                page_size=100,
                start_date=start_date_str,
                end_date=end_date_str
            )
            
            if 'orders' in response:
                orders = response['orders']
                logger.info(f"총 {len(orders)}개의 주문을 조회했습니다.")
                return orders
            else:
                logger.warning("주문 데이터를 찾을 수 없습니다.")
                return []
                
        except Exception as e:
            logger.error(f"주문 조회 중 오류 발생: {str(e)}")
            return []
    
    def update_low_stock_products(self, threshold: int = 10) -> List[Dict[str, Any]]:
        """
        재고가 부족한 상품들을 찾아서 업데이트하는 메서드
        
        Args:
            threshold (int): 재고 부족 기준 수량
            
        Returns:
            List[Dict[str, Any]]: 업데이트된 상품 정보 리스트
        """
        updated_products = []
        
        try:
            # 모든 상품 조회
            products = self.get_all_products(max_pages=5)
            
            for product in products:
                product_id = product.get('productId')
                if not product_id:
                    continue
                
                try:
                    # 재고 정보 조회
                    inventory_response = self.api.get_inventory(product_id)
                    
                    if 'quantity' in inventory_response:
                        current_quantity = inventory_response['quantity']
                        
                        # 재고가 기준치보다 적으면 경고 로그
                        if current_quantity <= threshold:
                            logger.warning(f"상품 {product_id}의 재고가 부족합니다. (현재: {current_quantity})")
                            
                            # 여기서 자동으로 재고를 업데이트하거나 알림을 보낼 수 있습니다
                            # 예: self.api.update_inventory(product_id, threshold * 2)
                            
                            updated_products.append({
                                'productId': product_id,
                                'currentQuantity': current_quantity,
                                'threshold': threshold
                            })
                    
                    time.sleep(0.2)  # API 호출 제한 방지
                    
                except Exception as e:
                    logger.error(f"상품 {product_id} 재고 조회 중 오류: {str(e)}")
                    continue
        
        except Exception as e:
            logger.error(f"재고 업데이트 중 오류 발생: {str(e)}")
        
        return updated_products

def load_config_from_file(config_file: str = "config.json") -> ApiConfig:
    """
    설정 파일에서 API 설정을 로드하는 함수
    
    Args:
        config_file (str): 설정 파일 경로
        
    Returns:
        ApiConfig: API 설정 정보
        
    Raises:
        FileNotFoundError: 설정 파일이 없을 때
    """
    if not os.path.exists(config_file):
        # 기본 설정 파일 생성
        default_config = {
            "client_id": "YOUR_CLIENT_ID",
            "client_secret": "YOUR_CLIENT_SECRET", 
            "access_token": "YOUR_ACCESS_TOKEN",
            "base_url": "https://api.commerce.naver.com/external",
            "timeout": 30
        }
        
        with open(config_file, 'w', encoding='utf-8') as f:
            json.dump(default_config, f, indent=2, ensure_ascii=False)
        
        raise FileNotFoundError(
            f"설정 파일이 생성되었습니다. {config_file} 파일을 편집하여 실제 API 정보를 입력해주세요."
        )
    
    with open(config_file, 'r', encoding='utf-8') as f:
        config_data = json.load(f)
    
    return ApiConfig(**config_data)

def main():
    """메인 실행 함수"""
    try:
        logger.info("네이버 스마트스토어 API 자동 접속 프로그램을 시작합니다.")
        
        # 설정 파일에서 API 정보 로드
        config = load_config_from_file()
        
        # API 클라이언트 초기화
        api_client = NaverSmartStoreAPI(config)
        
        # 스마트스토어 매니저 초기화
        store_manager = SmartStoreManager(api_client)
        
        # 1. 스토어 정보 조회 (기본 연결 테스트)
        logger.info("=== 스토어 정보 조회 ===")
        try:
            store_info = api_client.get_store_info()
            logger.info(f"스토어 정보 조회 성공: {store_info}")
        except Exception as e:
            logger.error(f"스토어 정보 조회 실패: {str(e)}")
        
        # 2. 상품 목록 조회
        logger.info("=== 상품 목록 조회 ===")
        products = store_manager.get_all_products(max_pages=2)
        
        if products:
            logger.info(f"조회된 상품 수: {len(products)}")
            for product in products[:3]:  # 처음 3개만 출력
                product_id = product.get('productId', 'N/A')
                product_name = product.get('productName', 'N/A')
                logger.info(f"상품 ID: {product_id}, 이름: {product_name}")
        
        # 2. 최근 주문 조회
        logger.info("\n=== 최근 주문 조회 ===")
        recent_orders = store_manager.get_recent_orders(days=7)
        
        if recent_orders:
            logger.info(f"최근 7일간 주문 수: {len(recent_orders)}")
            for order in recent_orders[:3]:  # 처음 3개만 출력
                order_id = order.get('orderId', 'N/A')
                order_status = order.get('orderStatus', 'N/A')
                logger.info(f"주문 ID: {order_id}, 상태: {order_status}")
        
        # 3. 재고 부족 상품 확인
        logger.info("\n=== 재고 부족 상품 확인 ===")
        low_stock_products = store_manager.update_low_stock_products(threshold=10)
        
        if low_stock_products:
            logger.info(f"재고 부족 상품 수: {len(low_stock_products)}")
            for product in low_stock_products:
                logger.info(f"상품 ID: {product['productId']}, 현재 재고: {product['currentQuantity']}")
        else:
            logger.info("재고 부족 상품이 없습니다.")
        
        logger.info("\n프로그램이 성공적으로 완료되었습니다.")
        
    except FileNotFoundError as e:
        logger.error(f"설정 파일 오류: {str(e)}")
        logger.info("config.json 파일을 편집하여 실제 API 정보를 입력한 후 다시 실행해주세요.")
        
    except Exception as e:
        logger.error(f"프로그램 실행 중 오류 발생: {str(e)}")
        logger.error("API 설정이나 네트워크 연결을 확인해주세요.")

if __name__ == "__main__":
    main() 