import React, { useState } from 'react';
import { Sparkles, User, Lock, KeyRound, AlertCircle, ArrowRight } from 'lucide-react';
import { StudentProfile } from '../types';
import {
  getStudentProfile,
  loginStudent,
  makeStudentKey,
  registerOrSetStudentPassword,
} from '../services/authService';

interface StudentLoginModalProps {
  onLoginSuccess: (student: StudentProfile) => void;
  onCancel: () => void;
}

export const StudentLoginModal: React.FC<StudentLoginModalProps> = ({
  onLoginSuccess,
  onCancel,
}) => {
  const [grade, setGrade] = useState<number>(2);
  const [classNum, setClassNum] = useState<number>(1);
  const [studentNum, setStudentNum] = useState<number>(1);
  const [name, setName] = useState<string>('');

  // Step flow: 'ident' -> 'login_existing' or 'setup_first_time'
  const [step, setStep] = useState<'ident' | 'login_existing' | 'setup_first_time'>('ident');
  const [existingProfile, setExistingProfile] = useState<StudentProfile | null>(null);

  // Password inputs
  const [personalPw, setPersonalPw] = useState<string>('');
  const [classPw, setClassPw] = useState<string>('');
  const [newPersonalPw, setNewPersonalPw] = useState<string>('');
  const [newPersonalPwConfirm, setNewPersonalPwConfirm] = useState<string>('');

  // Error / Loading
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleCheckIdentity = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!name.trim()) {
      setErrorMsg('이름을 입력해 주세요!');
      return;
    }

    setIsLoading(true);
    try {
      const studentKey = makeStudentKey(grade, classNum, studentNum);
      const profile = await getStudentProfile(studentKey);

      if (profile && profile.isPasswordSet) {
        setExistingProfile(profile);
        setStep('login_existing');
      } else {
        setExistingProfile(profile);
        setStep('setup_first_time');
      }
    } catch (err) {
      console.error(err);
      setErrorMsg('정보를 확인하지 못했어요. 다시 시도해 주세요!');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoginExisting = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!personalPw.trim()) {
      setErrorMsg('개인 비밀번호를 입력해 주세요!');
      return;
    }

    setIsLoading(true);
    setErrorMsg('');
    try {
      const res = await loginStudent(grade, classNum, studentNum, name, personalPw);
      if (res.success && res.student) {
        onLoginSuccess(res.student);
      } else {
        setErrorMsg(res.message);
      }
    } catch (err) {
      console.error(err);
      setErrorMsg('로그인 중 문제가 생겼어요. 선생님께 말씀해 주세요!');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFirstTimeSetup = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!classPw.trim()) {
      setErrorMsg('학급 공통 비밀번호를 입력해 주세요!');
      return;
    }
    if (!newPersonalPw.trim()) {
      setErrorMsg('새 개인 비밀번호를 입력해 주세요!');
      return;
    }
    if (newPersonalPw !== newPersonalPwConfirm) {
      setErrorMsg('새 비밀번호와 확인 비밀번호가 서로 달라요!');
      return;
    }

    setIsLoading(true);
    try {
      const res = await registerOrSetStudentPassword(
        grade,
        classNum,
        studentNum,
        name,
        classPw,
        newPersonalPw
      );

      if (res.success && res.student) {
        onLoginSuccess(res.student);
      } else {
        setErrorMsg(res.message);
      }
    } catch (err) {
      console.error(err);
      setErrorMsg('비밀번호 등록 중 문제가 생겼어요. 선생님께 말씀해 주세요!');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-fade-in">
      <div className="w-full max-w-md bg-white rounded-3xl border-4 border-amber-300 shadow-2xl p-6 my-auto text-emerald-950">
        {/* Step 1: Student Information */}
        {step === 'ident' && (
          <form onSubmit={handleCheckIdentity} className="space-y-4">
            <div className="text-center mb-4">
              <div className="w-16 h-16 bg-amber-100 text-3xl flex items-center justify-center rounded-2xl mx-auto mb-2 border-2 border-amber-300 shadow-sm">
                🎒
              </div>
              <h2 className="text-2xl font-black text-emerald-900">구구단 탐험대 로그인</h2>
              <p className="text-sm font-bold text-emerald-700 mt-1">
                학년, 반, 번호, 이름을 알려주세요!
              </p>
            </div>

            {/* Grade, Class, Number row */}
            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="block text-xs font-black text-emerald-800 mb-1">학년</label>
                <select
                  value={grade}
                  onChange={(e) => setGrade(Number(e.target.value))}
                  className="w-full h-12 bg-emerald-50 border-2 border-emerald-300 rounded-xl px-2 font-black text-center text-lg focus:outline-emerald-500"
                >
                  <option value={2}>2학년</option>
                  <option value={1}>1학년</option>
                  <option value={3}>3학년</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-black text-emerald-800 mb-1">반</label>
                <select
                  value={classNum}
                  onChange={(e) => setClassNum(Number(e.target.value))}
                  className="w-full h-12 bg-emerald-50 border-2 border-emerald-300 rounded-xl px-2 font-black text-center text-lg focus:outline-emerald-500"
                >
                  {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
                    <option key={n} value={n}>
                      {n}반
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-black text-emerald-800 mb-1">번호</label>
                <input
                  type="number"
                  min={1}
                  max={45}
                  value={studentNum}
                  onChange={(e) => setStudentNum(Math.max(1, Number(e.target.value)))}
                  className="w-full h-12 bg-emerald-50 border-2 border-emerald-300 rounded-xl px-2 font-black text-center text-lg focus:outline-emerald-500"
                  required
                />
              </div>
            </div>

            {/* Name Input */}
            <div>
              <label className="block text-xs font-black text-emerald-800 mb-1">이름</label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="예: 김민수"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  maxLength={10}
                  className="w-full h-13 bg-white border-2 border-emerald-300 rounded-xl px-4 pl-11 font-black text-lg text-emerald-950 focus:outline-emerald-500 placeholder:text-slate-400"
                  required
                />
                <User className="w-5 h-5 text-emerald-600 absolute left-3.5 top-4" />
              </div>
            </div>

            {errorMsg && (
              <div className="flex items-center gap-1.5 text-xs sm:text-sm font-bold text-rose-600 bg-rose-50 p-2.5 rounded-xl border border-rose-200">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <div className="pt-2 flex gap-2">
              <button
                type="button"
                onClick={onCancel}
                className="w-1/3 h-13 bg-slate-100 hover:bg-slate-200 text-slate-700 font-black rounded-2xl cursor-pointer"
              >
                닫기
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="w-2/3 h-13 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-black text-lg rounded-2xl border-b-4 border-emerald-800 shadow-md active:translate-y-1 active:border-b-0 transition-all flex items-center justify-center gap-1 cursor-pointer disabled:opacity-50"
              >
                {isLoading ? '확인 중...' : '다음으로'}
                <ArrowRight className="w-5 h-5 stroke-[2.5]" />
              </button>
            </div>
          </form>
        )}

        {/* Step 2A: Returning Student Login */}
        {step === 'login_existing' && (
          <form onSubmit={handleLoginExisting} className="space-y-4">
            <div className="text-center mb-4">
              <div className="w-16 h-16 bg-emerald-100 text-3xl flex items-center justify-center rounded-2xl mx-auto mb-2 border-2 border-emerald-300 shadow-sm">
                🌲
              </div>
              <h2 className="text-2xl font-black text-emerald-900">
                {existingProfile?.name || name} 친구 환영해요!
              </h2>
              <p className="text-sm font-bold text-emerald-700 mt-1">
                {grade}학년 {classNum}반 {studentNum}번
              </p>
            </div>

            <div>
              <label className="block text-xs font-black text-emerald-800 mb-1">
                개인 비밀번호 입력
              </label>
              <div className="relative">
                <input
                  type="password"
                  placeholder="내 비밀번호"
                  value={personalPw}
                  onChange={(e) => setPersonalPw(e.target.value)}
                  className="w-full h-13 bg-white border-2 border-emerald-300 rounded-xl px-4 pl-11 font-black text-lg focus:outline-emerald-500"
                  autoFocus
                  required
                />
                <Lock className="w-5 h-5 text-emerald-600 absolute left-3.5 top-4" />
              </div>
              <p className="text-xs text-emerald-700 mt-1 font-semibold">
                * 비밀번호를 잊어버렸다면 선생님께 초기화를 부탁하세요!
              </p>
            </div>

            {errorMsg && (
              <div className="flex items-center gap-1.5 text-xs sm:text-sm font-bold text-rose-600 bg-rose-50 p-2.5 rounded-xl border border-rose-200">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <div className="pt-2 flex gap-2">
              <button
                type="button"
                onClick={() => {
                  setStep('ident');
                  setErrorMsg('');
                }}
                className="w-1/3 h-13 bg-slate-100 hover:bg-slate-200 text-slate-700 font-black rounded-2xl cursor-pointer"
              >
                뒤로
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="w-2/3 h-13 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-black text-lg rounded-2xl border-b-4 border-emerald-800 shadow-md active:translate-y-1 active:border-b-0 transition-all flex items-center justify-center gap-1 cursor-pointer disabled:opacity-50"
              >
                {isLoading ? '로그인 중...' : '게임 시작하기!'}
                <Sparkles className="w-5 h-5 stroke-[2.5]" />
              </button>
            </div>
          </form>
        )}

        {/* Step 2B: First-time setup (Class common password -> Create personal password) */}
        {step === 'setup_first_time' && (
          <form onSubmit={handleFirstTimeSetup} className="space-y-3.5">
            <div className="text-center mb-3">
              <div className="w-14 h-14 bg-amber-100 text-2xl flex items-center justify-center rounded-2xl mx-auto mb-1.5 border-2 border-amber-300 shadow-sm">
                🎉
              </div>
              <h2 className="text-2xl font-black text-emerald-900">첫 접속을 환영해요!</h2>
              <p className="text-xs font-bold text-emerald-700">
                {grade}학년 {classNum}반 {studentNum}번 {name} 친구
              </p>
            </div>

            {/* Class common password */}
            <div className="bg-amber-50/80 p-3 rounded-2xl border border-amber-200">
              <label className="block text-xs font-black text-amber-900 mb-1">
                1. 학급 공통 비밀번호 (선생님이 알려주신 번호)
              </label>
              <div className="relative">
                <input
                  type="password"
                  placeholder="예: 1234"
                  value={classPw}
                  onChange={(e) => setClassPw(e.target.value)}
                  className="w-full h-11 bg-white border-2 border-amber-300 rounded-xl px-3 pl-10 font-bold text-base focus:outline-amber-500"
                  required
                />
                <KeyRound className="w-4 h-4 text-amber-600 absolute left-3 top-3.5" />
              </div>
            </div>

            {/* Create personal password */}
            <div className="bg-emerald-50/80 p-3 rounded-2xl border border-emerald-200 space-y-2">
              <label className="block text-xs font-black text-emerald-900">
                2. 내가 사용할 개인 비밀번호 만들기 (기억하기 쉬운 번호)
              </label>
              <input
                type="password"
                placeholder="새 개인 비밀번호"
                value={newPersonalPw}
                onChange={(e) => setNewPersonalPw(e.target.value)}
                className="w-full h-11 bg-white border-2 border-emerald-300 rounded-xl px-3 font-bold text-base focus:outline-emerald-500"
                required
              />
              <input
                type="password"
                placeholder="비밀번호 한 번 더 확인"
                value={newPersonalPwConfirm}
                onChange={(e) => setNewPersonalPwConfirm(e.target.value)}
                className="w-full h-11 bg-white border-2 border-emerald-300 rounded-xl px-3 font-bold text-base focus:outline-emerald-500"
                required
              />
            </div>

            {errorMsg && (
              <div className="flex items-center gap-1.5 text-xs font-bold text-rose-600 bg-rose-50 p-2 rounded-xl border border-rose-200">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <div className="pt-1 flex gap-2">
              <button
                type="button"
                onClick={() => {
                  setStep('ident');
                  setErrorMsg('');
                }}
                className="w-1/3 h-12 bg-slate-100 hover:bg-slate-200 text-slate-700 font-black rounded-2xl cursor-pointer"
              >
                뒤로
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="w-2/3 h-12 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-black text-base rounded-2xl border-b-4 border-emerald-800 shadow-md active:translate-y-1 active:border-b-0 transition-all flex items-center justify-center gap-1 cursor-pointer disabled:opacity-50"
              >
                {isLoading ? '등록 중...' : '비밀번호 등록 및 시작!'}
                <Sparkles className="w-4 h-4 stroke-[2.5]" />
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
