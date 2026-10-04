import React, { useState } from 'react';
import { Play, Sparkles, Trophy, BookOpen, User, Flame, Heart } from 'lucide-react';
import { StudentProfile } from '../types';
import { AnimalMascot } from './AnimalMascot';
import { MultiplicationTableModal } from './MultiplicationTableModal';

interface HomeScreenProps {
  student: StudentProfile | null;
  highScore: number;
  totalGames: number;
  onStartGame: () => void;
  onOpenLogin: () => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  student,
  highScore,
  totalGames,
  onStartGame,
  onOpenLogin,
}) => {
  const [showTableModal, setShowTableModal] = useState<boolean>(false);

  return (
    <div className="w-full max-w-xl mx-auto flex flex-col items-center px-4 py-4 space-y-5 select-none">
      {/* Mascot Cheer & Greeting */}
      <div className="mt-1">
        <AnimalMascot
          animal="rabbit"
          emotion="happy"
          size="lg"
          message={
            student
              ? `${student.name} 친구! 오늘 구구단 숲에서 신나게 달려볼까? 🌲`
              : '안녕! 동물 숲 구구단 서바이벌에 온 걸 환영해! 🐰'
          }
        />
      </div>

      {/* Main Hero Card */}
      <div className="w-full bg-white/95 rounded-3xl border-4 border-amber-300 shadow-xl p-5 sm:p-6 text-center">
        <div className="inline-flex items-center gap-1.5 bg-amber-100 text-amber-900 px-3.5 py-1 rounded-full font-black text-xs sm:text-sm border border-amber-300 mb-2">
          <Sparkles className="w-4 h-4 text-amber-600" />
          <span>초등학교 2학년 수학 구구단 마스터</span>
        </div>

        <h1 className="text-3xl sm:text-4xl font-black text-emerald-950 tracking-tight leading-tight">
          하트 3개 서바이벌!
        </h1>
        <p className="text-sm sm:text-base font-bold text-emerald-800 mt-1">
          틀리지 않고 얼마나 멀리 갈 수 있을까요?
        </p>

        {/* 3 Heart Rules Preview */}
        <div className="bg-emerald-50 rounded-2xl p-3 sm:p-4 border-2 border-emerald-200 mt-4 text-left space-y-2">
          <div className="flex items-center gap-2 font-black text-emerald-950 text-sm">
            <div className="flex text-rose-500">
              <Heart className="w-5 h-5 fill-rose-500" />
              <Heart className="w-5 h-5 fill-rose-500" />
              <Heart className="w-5 h-5 fill-rose-500" />
            </div>
            <span>하트 3개 제공!</span>
          </div>
          <ul className="text-xs sm:text-sm font-bold text-emerald-800 space-y-1.5 list-disc list-inside">
            <li>
              구구단(2~9단) 정답을 맞히면 <strong className="text-emerald-900">연속 콤보 점수</strong>가 쑥쑥!
            </li>
            <li>틀릴 때마다 하트가 1개씩 사라져요.</li>
            <li>게임이 끝나면 귀여운 동물 친구의 <strong className="text-amber-800">AI 맞춤 응원</strong>이 도착해요!</li>
          </ul>
        </div>

        {/* Student Stats Badge (if logged in) */}
        {student ? (
          <div className="mt-4 p-3 bg-amber-50 rounded-2xl border-2 border-amber-200 flex items-center justify-around">
            <div className="text-center">
              <div className="text-xs font-bold text-amber-800 flex items-center justify-center gap-1">
                <Trophy className="w-3.5 h-3.5 text-amber-600" />
                내 최고 점수
              </div>
              <div className="text-2xl font-black text-amber-600 mt-0.5">{highScore}점</div>
            </div>
            <div className="h-8 w-px bg-amber-200" />
            <div className="text-center">
              <div className="text-xs font-bold text-emerald-800 flex items-center justify-center gap-1">
                <Flame className="w-3.5 h-3.5 text-emerald-600" />
                도전 횟수
              </div>
              <div className="text-2xl font-black text-emerald-700 mt-0.5">{totalGames}회</div>
            </div>
          </div>
        ) : (
          <div className="mt-4 p-3 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between gap-3 text-left">
            <div>
              <div className="text-xs font-black text-slate-800">아직 로그인하지 않았어요</div>
              <div className="text-[11px] font-semibold text-slate-500">
                로그인하면 내 최고 점수와 기록이 저장돼요!
              </div>
            </div>
            <button
              type="button"
              onClick={onOpenLogin}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs rounded-xl cursor-pointer shrink-0"
            >
              학생 로그인
            </button>
          </div>
        )}

        {/* Play Action Button */}
        <div className="mt-5 space-y-2.5">
          <button
            type="button"
            onClick={onStartGame}
            className="w-full h-16 sm:h-18 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-black text-2xl sm:text-3xl rounded-3xl border-b-6 border-emerald-800 shadow-xl active:translate-y-1 active:border-b-2 transition-all flex items-center justify-center gap-3 cursor-pointer"
          >
            <Play className="w-8 h-8 fill-white stroke-none" />
            <span>서바이벌 시작!</span>
          </button>

          <button
            type="button"
            onClick={() => setShowTableModal(true)}
            className="w-full h-12 bg-amber-100 hover:bg-amber-200 text-amber-950 font-black text-base rounded-2xl border-2 border-amber-300 shadow-sm flex items-center justify-center gap-2 cursor-pointer"
          >
            <BookOpen className="w-5 h-5 text-amber-700" />
            <span>구구단 사전 먼저 복습하기 (2~9단)</span>
          </button>
        </div>
      </div>

      {/* Animal Friends Gallery */}
      <div className="w-full bg-white/70 backdrop-blur-xs rounded-2xl p-3 border border-emerald-200 flex items-center justify-around text-center text-xs font-extrabold text-emerald-900">
        <div>
          <span className="text-2xl block">🐰</span>
          <span>토순이</span>
        </div>
        <div>
          <span className="text-2xl block">🐻</span>
          <span>곰돌이</span>
        </div>
        <div>
          <span className="text-2xl block">🐿️</span>
          <span>다람이</span>
        </div>
        <div>
          <span className="text-2xl block">🐶</span>
          <span>멍뭉이</span>
        </div>
        <div>
          <span className="text-2xl block">🐱</span>
          <span>야옹이</span>
        </div>
      </div>

      {showTableModal && <MultiplicationTableModal onClose={() => setShowTableModal(false)} />}
    </div>
  );
};
