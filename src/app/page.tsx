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

  // 간단한 테스트 함수
  const handleTest = async () => {
    setLoading(true);
    setResult('');

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [
            {
              role: 'user',
              content: '안녕하세요. 간단한 테스트입니다.'
            }
          ]
        })
      });

      const responseText = await response.text();
      console.log('테스트 응답:', responseText);
      
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        throw new Error(`테스트 응답 파싱 오류: ${responseText.substring(0, 100)}`);
      }

      if (data.success && data.data?.content) {
        setResult(`✅ 테스트 성공!\n\n${data.data.content}`);
      } else {
        throw new Error(data.error || '테스트 실패');
      }
    } catch (error) {
      console.error('테스트 오류:', error);
      setResult(`❌ 테스트 실패: ${error instanceof Error ? error.message : '알 수 없는 오류'}`);
    } finally {
      setLoading(false);
    }
  };

  // 폼 상태 초기화 함수
  const handleReset = () => {
    setForm({
      fullName: '',
      hanja: '',
      birthDate: '',
      birthTime: '',
      birthPlace: ''
    });
    setErrors({});
    setResult('');
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
              간단하고 명확하게 사주풀이와 이름 분석을 해주세요.
              한글로 설명하고, 실용적인 조언을 제공해주세요.`
            },
            {
              role: 'user',
              content: `사주풀이 및 이름 분석을 요청합니다.
              
              이름: ${form.fullName}${form.hanja ? ` (${form.hanja})` : ''}
              생년월일: ${form.birthDate}
              출생시간: ${form.birthTime}
              출생지: ${form.birthPlace}
              
              위 정보를 바탕으로 간단하게 다음을 분석해주세요:
              
              1. 사주팔자 기본 분석
              2. 성격적 특징
              3. 적성과 직업 방향
              4. 건강상 주의사항
              5. 향후 운세 전망
              
              간단하고 실용적인 조언을 제공해주세요.`
            }
          ]
        })
      });

      // 응답 텍스트를 먼저 가져와서 로깅
      const responseText = await response.text();
      console.log('API 응답 상태:', response.status, response.statusText);
      console.log('API 응답 텍스트:', responseText.substring(0, 200));
      
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        console.error('JSON 파싱 오류:', parseError);
        throw new Error(`서버 응답 형식 오류: ${responseText.substring(0, 100)}...`);
      }

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
      
      let errorMessage = '분석 중 오류가 발생했습니다. 다시 시도해주세요.';
      
      if (error instanceof Error) {
        if (error.message.includes('API 키')) {
          errorMessage = '서버 설정에 문제가 있습니다. 관리자에게 문의해주세요.';
        } else if (error.message.includes('시간이 초과')) {
          errorMessage = '요청 시간이 초과되었습니다. 잠시 후 다시 시도해주세요.';
        } else if (error.message.includes('서버 응답 형식 오류')) {
          errorMessage = '서버에서 예상치 못한 응답을 받았습니다. 잠시 후 다시 시도해주세요.';
        } else if (error.message.includes('OpenAI API 오류')) {
          errorMessage = 'AI 분석 서비스에 일시적인 문제가 있습니다. 잠시 후 다시 시도해주세요.';
        } else {
          errorMessage = error.message;
        }
      }
      
      setResult(`❌ 오류: ${errorMessage}`);
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

            {/* 테스트 버튼 */}
            <Button 
              onClick={handleTest} 
              disabled={loading} 
              className="traditional-button w-full mt-4 py-3 text-md font-bold bg-blue-600 hover:bg-blue-700"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  테스트 중...
                </>
              ) : (
                '🧪 API 연결 테스트'
              )}
            </Button>

            {/* 제출 버튼 */}
            <Button 
              onClick={handleSubmit} 
              disabled={loading} 
              className="traditional-button w-full mt-4 py-4 text-lg font-bold"
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
            {/* 다시 하기 버튼 */}
            <button
              type="button"
              onClick={handleReset}
              className="mt-8 w-full py-3 rounded-xl font-bold text-lg bg-gradient-to-r from-gray-700/80 to-black/70 text-white hover:opacity-90 transition"
            >
              🔄 다시 하기
            </button>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
} 