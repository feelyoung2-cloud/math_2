import React, { useState } from 'react';
import { BookOpen, X, Sparkles } from 'lucide-react';

interface MultiplicationTableModalProps {
  onClose: () => void;
}

export const MultiplicationTableModal: React.FC<MultiplicationTableModalProps> = ({ onClose }) => {
  const [selectedDan, setSelectedDan] = useState<number>(2);

  const danList = [2, 3, 4, 5, 6, 7, 8, 9];

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-fade-in">
      <div className="w-full max-w-lg bg-white rounded-3xl border-4 border-amber-300 shadow-2xl p-5 sm:p-6 text-emerald-950">
        <div className="flex items-center justify-between pb-3 border-b border-amber-200 mb-4">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-amber-100 text-amber-800 rounded-xl">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xl font-black text-emerald-950 flex items-center gap-1.5">
                <span>동물 숲 구구단 사전</span>
                <Sparkles className="w-4 h-4 text-amber-500" />
              </h3>
              <p className="text-xs text-emerald-700 font-bold">2단부터 9단까지 소리 내어 읽어봐요!</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-full font-bold flex items-center justify-center cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Dan Selector Tabs */}
        <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-4 justify-center">
          {danList.map((dan) => (
            <button
              key={dan}
              type="button"
              onClick={() => setSelectedDan(dan)}
              className={`w-11 h-11 sm:w-12 sm:h-12 rounded-2xl font-black text-base sm:text-lg transition-all cursor-pointer ${
                selectedDan === dan
                  ? 'bg-amber-400 text-amber-950 border-b-4 border-amber-600 shadow-md scale-105'
                  : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200'
              }`}
            >
              {dan}단
            </button>
          ))}
        </div>

        {/* Selected Dan Flashcard Grid */}
        <div className="bg-amber-50/70 p-4 rounded-2xl border-2 border-amber-200">
          <div className="text-center font-black text-amber-900 text-lg mb-3">
            ⭐ {selectedDan}단 외우기 ⭐
          </div>
          <div className="grid grid-cols-3 gap-2 sm:gap-2.5">
            {Array.from({ length: 9 }, (_, i) => i + 1).map((multiplier) => (
              <div
                key={multiplier}
                className="bg-white p-2.5 sm:p-3 rounded-xl border-2 border-amber-200 text-center shadow-2xs hover:border-emerald-400 transition-colors"
              >
                <div className="text-xs sm:text-sm font-extrabold text-slate-600">
                  {selectedDan} × {multiplier} =
                </div>
                <div className="text-xl sm:text-2xl font-black text-emerald-700 mt-0.5">
                  {selectedDan * multiplier}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-4 text-center">
          <button
            type="button"
            onClick={onClose}
            className="w-full h-12 bg-emerald-700 hover:bg-emerald-600 text-white font-black text-base rounded-2xl shadow-md cursor-pointer"
          >
            이제 서바이벌 하러 가기! 🌲
          </button>
        </div>
      </div>
    </div>
  );
};
