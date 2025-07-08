import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { motion } from 'framer-motion';
import { Sun, Moon } from 'lucide-react';

export default function SajuNameApp() {
  const [form, setForm] = useState({
    fullName: '',
    hanja: '',
    birthDate: '',
    birthTime: '',
    birthPlace: ''
  });
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            { role: 'system', content: '당신은 정통 명리학과 성명학 전문가입니다. 결과를 현실적이고 신뢰감 있는 말투로 서술해주세요.' },
            { role: 'user', content: `사주풀이 및 이름 분석\n이름: ${form.fullName}(${form.hanja})\n생년월일(양/음력): ${form.birthDate}\n출생시간: ${form.birthTime}\n출생지: ${form.birthPlace}\n` }
          ]
        })
      });
      const data = await res.json();
      setResult(data.choices[0].message.content);
    } catch (error) {
      setResult('분석 중 오류가 발생했습니다. 다시 시도해주세요.');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-900 via-indigo-800 to-green-900 p-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-xl mx-auto"
      >
        <Card className="bg-white/20 backdrop-blur-lg rounded-2xl shadow-2xl">
          <CardHeader>
            <CardTitle className="text-2xl text-white flex items-center gap-2">
              <Sun className="w-6 h-6" />
              사주·성명 풀이
              <Moon className="w-6 h-6" />
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="fullName" className="text-white">이름 (한글)</Label>
              <Input id="fullName" name="fullName" value={form.fullName} onChange={handleChange} placeholder="진현석" className="mt-1" />
            </div>
            <div>
              <Label htmlFor="hanja" className="text-white">한자 이름</Label>
              <Input id="hanja" name="hanja" value={form.hanja} onChange={handleChange} placeholder="陳炫錫" className="mt-1" />
            </div>
            <div>
              <Label htmlFor="birthDate" className="text-white">생년월일 (양력/음력)</Label>
              <Input id="birthDate" name="birthDate" value={form.birthDate} onChange={handleChange} placeholder="1982-08-23 (양력)" className="mt-1" />
            </div>
            <div>
              <Label htmlFor="birthTime" className="text-white">출생 시간</Label>
              <Input id="birthTime" name="birthTime" value={form.birthTime} onChange={handleChange} placeholder="14:57" className="mt-1" />
            </div>
            <div>
              <Label htmlFor="birthPlace" className="text-white">출생지</Label>
              <Input id="birthPlace" name="birthPlace" value={form.birthPlace} onChange={handleChange} placeholder="서울시 용산구" className="mt-1" />
            </div>
            <Button onClick={handleSubmit} disabled={loading} className="w-full mt-4">
              {loading ? '분석 중...' : '풀이하기'}
            </Button>
          </CardContent>
        </Card>
        {result && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="mt-6 bg-white/20 backdrop-blur-lg rounded-2xl p-6 text-white leading-relaxed whitespace-pre-wrap"
          >
            {result}
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
