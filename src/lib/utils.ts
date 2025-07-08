import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

// CSS 클래스명을 병합하는 유틸리티 함수
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// 날짜 포맷팅 함수
export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date)
}

// 시간 포맷팅 함수
export function formatTime(date: Date): string {
  return new Intl.DateTimeFormat('ko-KR', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(date)
}

// 입력값 검증 함수
export function validateInput(value: string, type: 'name' | 'date' | 'time' | 'place'): boolean {
  switch (type) {
    case 'name':
      // 한글 이름 검증 (1-5글자로 확장)
      return /^[가-힣]{1,5}$/.test(value)
    case 'date':
      // 날짜 형식 검증 (YYYY-MM-DD)
      return /^\d{4}-\d{2}-\d{2}$/.test(value)
    case 'time':
      // 시간 형식 검증 (HH:MM)
      return /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(value)
    case 'place':
      // 장소 검증 (1-20글자)
      return value.length >= 1 && value.length <= 20
    default:
      return false
  }
}

// 에러 메시지 생성 함수
export function getErrorMessage(type: 'name' | 'date' | 'time' | 'place'): string {
  switch (type) {
    case 'name':
      return '한글 이름을 1-5글자로 입력해주세요.'
    case 'date':
      return '날짜를 YYYY-MM-DD 형식으로 입력해주세요.'
    case 'time':
      return '시간을 HH:MM 형식으로 입력해주세요.'
    case 'place':
      return '출생지를 1-20글자로 입력해주세요.'
    default:
      return '올바른 형식으로 입력해주세요.'
  }
}

// 로컬 스토리지 유틸리티
export const storage = {
  get: (key: string) => {
    if (typeof window === 'undefined') { return null }
    try {
      const item = window.localStorage.getItem(key)
      return item ? JSON.parse(item) : null
    } catch (error) {
      console.error('로컬 스토리지 읽기 오류:', error)
      return null
    }
  },
  set: (key: string, value: any) => {
    if (typeof window === 'undefined') { return }
    try {
      window.localStorage.setItem(key, JSON.stringify(value))
    } catch (error) {
      console.error('로컬 스토리지 쓰기 오류:', error)
    }
  },
  remove: (key: string) => {
    if (typeof window === 'undefined') { return }
    try {
      window.localStorage.removeItem(key)
    } catch (error) {
      console.error('로컬 스토리지 삭제 오류:', error)
    }
  }
}

// 디바운스 함수
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout
  return (...args: Parameters<T>) => {
    clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}

// API 응답 타입 정의
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

// API 에러 처리 함수
export function handleApiError(error: any): string {
  if (error.response) {
    // 서버 응답이 있는 경우
    const status = error.response.status
    switch (status) {
      case 400:
        return '잘못된 요청입니다. 입력값을 확인해주세요.'
      case 401:
        return '인증이 필요합니다.'
      case 403:
        return '접근 권한이 없습니다.'
      case 404:
        return '요청한 리소스를 찾을 수 없습니다.'
      case 429:
        return '요청이 너무 많습니다. 잠시 후 다시 시도해주세요.'
      case 500:
        return '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.'
      default:
        return `오류가 발생했습니다. (${status})`
    }
  } else if (error.request) {
    // 네트워크 오류
    return '네트워크 연결을 확인해주세요.'
  } else {
    // 기타 오류
    return '알 수 없는 오류가 발생했습니다.'
  }
} 