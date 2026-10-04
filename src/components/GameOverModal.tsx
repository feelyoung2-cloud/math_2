import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Trophy, RotateCcw, Home, Sparkles, AlertCircle, CheckCircle2, Loader2, BookOpen } from 'lucide-react';
import { GameSessionResult } from '../types';

interface GameOverModalProps {
  result: GameSessionResult;
  studentName: string;
  highScore: number;
  saveStatus: 'saving' | 'saved' | 'error';
  onRestart: () => void;
  onExit: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  result,
  studentName,
  highScore,
  saveStatus,
  onRestart,
  onExit,
}) => {
  const isNewRecord = result.score > highScore;

  useEffect(() => {
    if (isNewRecord) {
      confetti({
        particleCount: 80,
        spread: 100,
        origin: { y: 0.5 },
      });
    }
  }, [isNewRecord]);

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-fade-in">
      <div className="w-full max-w-lg bg-white rounded-3xl border-4 border-amber-300 shadow-2xl p-5 sm:p-6 my-auto text-emerald-950">
        {/* Header Ribbon */}
        <div className="text-center mb-3">
          <div className="inline-block bg-amber-400 text-amber-950 font-black text-xl sm:text-2xl px-6 py-1.5 rounded-full border-b-4 border-amber-600 shadow-md">
            서바이벌 종료! 🏁
          </div>
          <h2 className="text-2xl sm:text-3xl font-black mt-2 text-emerald-900">
            {studentName} 친구, 정말 멋졌어!
          </h2>
        </div>

        {/* Score & Record Box */}
        <div className="bg-amber-50 rounded-2xl p-4 border-2 border-amber-200 text-center mb-4">
          <div className="text-sm font-bold text-amber-800">이번에 획득한 점수</div>
          <div className="text-5xl font-black text-amber-600 my-1">{result.score}점</div>
          <div className="flex items-center justify-center gap-2 mt-2">
            {isNewRecord ? (
              <span className="inline-flex items-center gap-1 bg-rose-500 text-white font-extrabold text-sm px-3 py-1 rounded-full shadow-sm animate-bounce">
                <Sparkles className="w-4 h-4" /> 내 최고 기록 경신! 🏆
              </span>
            ) : (
              <span className="text-xs font-semibold text-emerald-800 flex items-center gap-1">
                <Trophy className="w-3.5 h-3.5 text-amber-500" />
                내 최고 점수: {Math.max(highScore, result.score)}점
              </span>
            )}
          </div>
        </div>

        {/* Status Indicator (Child-friendly wording) */}
        <div className="mb-4">
          {saveStatus === 'saving' && (
            <div className="flex items-center justify-center gap-2 bg-emerald-50 text-emerald-800 text-sm font-bold py-2 px-3 rounded-xl border border-emerald-200">
              <Loader2 className="w-4 h-4 animate-spin text-emerald-600" />
              <span>숲속 도서관에 기록 저장 중... 🐾</span>
            </div>
          )}
          {saveStatus === 'saved' && (
            <div className="flex items-center justify-center gap-2 bg-emerald-100 text-emerald-900 text-sm font-bold py-2 px-3 rounded-xl border border-emerald-300">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>기록 저장 완료! ✨</span>
            </div>
          )}
          {saveStatus === 'error' && (
            <div className="flex items-center justify-center gap-2 bg-amber-100 text-amber-900 text-sm font-bold py-2 px-3 rounded-xl border border-amber-300">
              <AlertCircle className="w-4 h-4 text-amber-700" />
              <span>저장하지 못했어요. 선생님께 말씀해 주세요! 🌿</span>
            </div>
          )}
        </div>

        {/* AI Mascot Feedback Card */}
        {result.aiFeedback && (
          <div className="bg-emerald-50 rounded-2xl p-4 border-2 border-emerald-300 mb-4 shadow-sm relative">
            <div className="flex items-center gap-2 text-xs font-black text-emerald-700 mb-1">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>동물 친구의 다정한 한마디 ({result.animalCheer || '토순이'})</span>
            </div>
            <p className="text-sm sm:text-base font-bold text-emerald-950 leading-relaxed">
              "{result.aiFeedback}"
            </p>
          </div>
        )}

        {/* Missed Problems Review */}
        {result.wrongProblems.length > 0 && (
          <div className="mb-5">
            <div className="flex items-center gap-1 text-sm font-extrabold text-amber-900 mb-2">
              <BookOpen className="w-4 h-4 text-amber-700" />
              <span>헷갈렸던 구구단 다시 보기 ({result.wrongProblems.length}개)</span>
            </div>
            <div className="grid grid-cols-2 gap-2 max-h-36 overflow-y-auto pr-1">
              {result.wrongProblems.map((prob, idx) => (
                <div
                  key={idx}
                  className="bg-white p-2.5 rounded-xl border-2 border-rose-200 flex items-center justify-between shadow-xs"
                >
                  <span className="font-extrabold text-slate-800 text-base">
                    {prob.q} =
                  </span>
                  <span className="font-black text-emerald-600 text-lg">
                    {prob.ans}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Big Action Buttons */}
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={onRestart}
            className="h-14 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-black text-lg rounded-2xl border-b-4 border-emerald-800 shadow-md active:translate-y-1 active:border-b-0 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <RotateCcw className="w-5 h-5 stroke-[2.5]" />
            다시 도전하기!
          </button>
          <button
            type="button"
            onClick={onExit}
            className="h-14 bg-amber-400 hover:bg-amber-300 active:bg-amber-500 text-amber-950 font-black text-lg rounded-2xl border-b-4 border-amber-600 shadow-md active:translate-y-1 active:border-b-0 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Home className="w-5 h-5 stroke-[2.5]" />
            홈으로 가기
          </button>
        </div>
      </div>
    </div>
  );
};
