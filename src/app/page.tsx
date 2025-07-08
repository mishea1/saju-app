'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { Sun, Moon, Loader2, AlertCircle } from 'lucide-react';
import { validateInput, getErrorMessage, storage } from '@/lib/utils';

// 폼 데이터 타입 정의
interface FormData {
  fullName: string;
  hanja: string;
  birthDate: string;
  birthTime: string;
  birthPlace: string;
}

// 에러 상태 타입 정의
interface FormErrors {
  fullName?: string;
  hanja?: string;
  birthDate?: string;
  birthTime?: string;
  birthPlace?: string;
}

export default function HomePage() {
  // 상태 관리
  const [form, setForm] = useState<FormData>({
    fullName: '',
    hanja: '',
    birthDate: '',
    birthTime: '',
    birthPlace: ''
  });
  
  const [errors, setErrors] = useState<FormErrors>({});
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);

  // 입력값 변경 처리
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  // 폼 유효성 검사
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // 이름 검증
    if (!form.fullName.trim()) {
      newErrors.fullName = '이름을 입력해주세요.';
    } else if (!validateInput(form.fullName, 'name')) {
      newErrors.fullName = getErrorMessage('name');
    }

    // 한자 이름 검증 (선택사항이지만 입력 시 검증)
    if (form.hanja.trim() && !/^[\u4e00-\u9fff]{2,4}$/.test(form.hanja)) {
      newErrors.hanja = '한자 이름을 2-4글자로 입력해주세요.';
    }

    // 생년월일 검증
    if (!form.birthDate.trim()) {
      newErrors.birthDate = '생년월일을 입력해주세요.';
    } else if (!validateInput(form.birthDate, 'date')) {
      newErrors.birthDate = getErrorMessage('date');
    }

    // 출생시간 검증
    if (!form.birthTime.trim()) {
      newErrors.birthTime = '출생시간을 입력해주세요.';
    } else if (!validateInput(form.birthTime, 'time')) {
      newErrors.birthTime = getErrorMessage('time');
    }

    // 출생지 검증
    if (!form.birthPlace.trim()) {
      newErrors.birthPlace = '출생지를 입력해주세요.';
    } else if (!validateInput(form.birthPlace, 'place')) {
      newErrors.birthPlace = getErrorMessage('place');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // 폼 제출 처리
  const handleSubmit = async () => {
    // 유효성 검사
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setResult('');

    try {
      // API 호출
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [
            {
              role: 'system',
              content: `당신은 정통 명리학과 성명학 전문가입니다. 
              다음 지침을 따라 사주풀이와 이름 분석을 해주세요:
              
              1. 정통 명리학 이론을 바탕으로 분석
              2. 현실적이고 신뢰감 있는 말투 사용
              3. 긍정적이면서도 객관적인 조언 제공
              4. 구체적이고 실용적인 해석
              5. 한글로 명확하게 설명
              6. 과도한 미신적 요소는 배제
              7. 전문적이면서도 이해하기 쉽게 설명
              8. 각 항목별로 자세하고 상세한 분석 제공
              9. 실제 사례와 예시를 포함한 설명
              10. 최소 1000자 이상의 상세한 분석 제공`
            },
            {
              role: 'user',
              content: `사주풀이 및 이름 분석을 요청합니다.
              
              이름: ${form.fullName}${form.hanja ? ` (${form.hanja})` : ''}
              생년월일: ${form.birthDate}
              출생시간: ${form.birthTime}
              출생지: ${form.birthPlace}
              
              위 정보를 바탕으로 다음을 매우 자세하게 분석해주세요:
              
              【사주팔자 분석】
              1. 일간(日干) 분석과 오행 균형
              2. 십이운성과 십이신살 분석
              3. 천간지지의 조합과 영향
              4. 월령과 계절의 영향
              
              【성격적 특징】
              1. 선천적 성격과 기질
              2. 강점과 약점 분석
              3. 대인관계 성향
              4. 의사결정 스타일
              
              【적성과 직업 방향】
              1. 적합한 직업 분야
              2. 창업이나 사업 적성
              3. 학문적 소질
              4. 재능 개발 방향
              
              【건강상 주의사항】
              1. 취약한 신체 부위
              2. 주의해야 할 질병
              3. 건강 관리 방법
              4. 생활 습관 개선점
              
              【이름의 의미와 영향】
              1. 한자 의미 분석
              2. 오행과의 조화
              3. 사주와의 연관성
              4. 이름이 미치는 영향
              
              【향후 운세 전망】
              1. 10년 대운 분석
              2. 연운과 월운 전망
              3. 주요 변화 시기
              4. 행운과 기회의 시기
              
              【개선 방안과 조언】
              1. 운세 개선 방법
              2. 행운을 부르는 행동
              3. 주의해야 할 시기
              4. 평생 행복을 위한 조언
              
              각 항목별로 구체적이고 실용적인 조언을 제공해주시고, 
              전문적이면서도 이해하기 쉽게 설명해주세요.`
            }
          ]
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || '분석 중 오류가 발생했습니다.');
      }

      if (data.success && data.data?.content) {
        setResult(data.data.content);
        
        // 결과를 로컬 스토리지에 저장 (최근 5개)
        const recentResults = storage.get('recentResults') || [];
        const newResult = {
          id: Date.now(),
          timestamp: new Date().toISOString(),
          form: { ...form },
          result: data.data.content
        };
        
        const updatedResults = [newResult, ...recentResults.slice(0, 4)];
        storage.set('recentResults', updatedResults);
      } else {
        throw new Error('분석 결과를 받지 못했습니다.');
      }

    } catch (error) {
      console.error('분석 오류:', error);
      setResult(error instanceof Error ? error.message : '분석 중 오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
      setLoading(false);
    }
  };



  return (
    <div className="min-h-screen p-6 traditional-pattern">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="max-w-4xl mx-auto"
      >
        {/* 헤더 */}
        <Card className="traditional-card mystical-glow mb-8">
          <CardHeader className="text-center traditional-ornament">
            <CardTitle className="traditional-title text-4xl font-bold mb-4">
              🏮 사주팔자·성명풀이 🏮
            </CardTitle>
            <p className="text-white/90 text-lg">
              정통 명리학과 성명학을 바탕으로 한 신비로운 무료 운세 분석
            </p>
          </CardHeader>
        </Card>

        {/* 메인 폼 */}
        <Card className="traditional-card">
          <CardHeader>
            <CardTitle className="traditional-title text-2xl flex items-center gap-2">
              <Sun className="w-6 h-6" />
              사주·성명 풀이
              <Moon className="w-6 h-6" />
            </CardTitle>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* 이름 입력 */}
            <div>
              <Label htmlFor="fullName" className="text-white font-semibold">이름 (한글) *</Label>
              <input
                id="fullName"
                name="fullName"
                value={form.fullName}
                onChange={handleChange}
                className={`mt-2 w-full px-4 py-3 traditional-input rounded-xl text-white placeholder-white/50 ${
                  errors.fullName ? 'border-red-400' : ''
                }`}
                placeholder="홍길동"
              />
              {errors.fullName && (
                <div className="flex items-center gap-1 mt-2 text-red-300 text-sm">
                  <AlertCircle className="w-4 h-4" />
                  {errors.fullName}
                </div>
              )}
            </div>

            {/* 한자 이름 입력 */}
            <div>
              <Label htmlFor="hanja" className="text-white font-semibold">한자 이름 (선택)</Label>
              <input
                id="hanja"
                name="hanja"
                value={form.hanja}
                onChange={handleChange}
                className={`mt-2 w-full px-4 py-3 traditional-input rounded-xl text-white placeholder-white/50 ${
                  errors.hanja ? 'border-red-400' : ''
                }`}
                placeholder="洪吉童"
              />
              {errors.hanja && (
                <div className="flex items-center gap-1 mt-2 text-red-300 text-sm">
                  <AlertCircle className="w-4 h-4" />
                  {errors.hanja}
                </div>
              )}
            </div>

            {/* 생년월일 입력 */}
            <div>
              <Label htmlFor="birthDate" className="text-white font-semibold">생년월일 (양력/음력) *</Label>
              <input
                id="birthDate"
                name="birthDate"
                type="date"
                value={form.birthDate}
                onChange={handleChange}
                className={`mt-2 w-full px-4 py-3 traditional-input rounded-xl text-white ${
                  errors.birthDate ? 'border-red-400' : ''
                }`}
              />
              {errors.birthDate && (
                <div className="flex items-center gap-1 mt-2 text-red-300 text-sm">
                  <AlertCircle className="w-4 h-4" />
                  {errors.birthDate}
                </div>
              )}
            </div>

            {/* 출생시간 입력 */}
            <div>
              <Label htmlFor="birthTime" className="text-white font-semibold">출생 시간 *</Label>
              <input
                id="birthTime"
                name="birthTime"
                type="time"
                value={form.birthTime}
                onChange={handleChange}
                className={`mt-2 w-full px-4 py-3 traditional-input rounded-xl text-white ${
                  errors.birthTime ? 'border-red-400' : ''
                }`}
              />
              {errors.birthTime && (
                <div className="flex items-center gap-1 mt-2 text-red-300 text-sm">
                  <AlertCircle className="w-4 h-4" />
                  {errors.birthTime}
                </div>
              )}
            </div>

            {/* 출생지 입력 */}
            <div>
              <Label htmlFor="birthPlace" className="text-white font-semibold">출생지 *</Label>
              <input
                id="birthPlace"
                name="birthPlace"
                value={form.birthPlace}
                onChange={handleChange}
                className={`mt-2 w-full px-4 py-3 traditional-input rounded-xl text-white placeholder-white/50 ${
                  errors.birthPlace ? 'border-red-400' : ''
                }`}
                placeholder="서울특별시"
              />
              {errors.birthPlace && (
                <div className="flex items-center gap-1 mt-2 text-red-300 text-sm">
                  <AlertCircle className="w-4 h-4" />
                  {errors.birthPlace}
                </div>
              )}
            </div>

            {/* 제출 버튼 */}
            <Button 
              onClick={handleSubmit} 
              disabled={loading} 
              className="traditional-button w-full mt-8 py-4 text-lg font-bold"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  신비로운 분석 중...
                </>
              ) : (
                '🏮 운세 풀이하기 🏮'
              )}
            </Button>
          </CardContent>
        </Card>

        {/* 결과 표시 */}
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mt-8 traditional-card p-8"
          >
            <h3 className="traditional-title text-2xl font-bold mb-6 flex items-center gap-2">
              <Sun className="w-6 h-6" />
              🏮 신비로운 분석 결과 🏮
            </h3>
            <div className="text-white/90 leading-relaxed whitespace-pre-wrap text-lg">
              {result}
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
} 