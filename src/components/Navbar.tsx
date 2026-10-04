import React, { useState } from 'react';
import { Volume2, VolumeX, Shield, User, LogOut, Trophy } from 'lucide-react';
import { StudentProfile } from '../types';
import { sounds } from '../utils/sound';

interface NavbarProps {
  student: StudentProfile | null;
  highScore: number;
  onOpenLogin: () => void;
  onLogout: () => void;
  onOpenTeacher: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  student,
  highScore,
  onOpenLogin,
  onLogout,
  onOpenTeacher,
}) => {
  const [isMuted, setIsMuted] = useState(!sounds.enabled);

  const toggleSound = () => {
    sounds.enabled = !sounds.enabled;
    setIsMuted(!sounds.enabled);
  };

  return (
    <header className="w-full bg-emerald-900/90 backdrop-blur-md text-white border-b-4 border-amber-400 shadow-md sticky top-0 z-40">
      <div className="max-w-5xl mx-auto px-4 py-2.5 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 sm:w-11 sm:h-11 bg-amber-400 text-amber-950 rounded-2xl flex items-center justify-center text-xl sm:text-2xl shadow-md border-2 border-amber-200 shrink-0">
            🐰
          </div>
          <div>
            <div className="text-lg sm:text-2xl font-black tracking-tight text-amber-300 flex items-center gap-1.5">
              <span>동물 숲 구구단 서바이벌</span>
            </div>
            <div className="text-[10px] sm:text-xs text-emerald-200 font-bold hidden sm:block">
              초등학교 2학년을 위한 신나는 수학 모험 🌲
            </div>
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Sound Toggle */}
          <button
            type="button"
            onClick={toggleSound}
            className="p-2 sm:px-2.5 sm:py-2 bg-emerald-800/80 hover:bg-emerald-700 text-amber-300 rounded-xl border border-emerald-600/80 flex items-center gap-1.5 text-xs font-bold cursor-pointer"
            title={isMuted ? '소리 켜기' : '소리 끄기'}
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-slate-300" /> : <Volume2 className="w-4 h-4 text-amber-300" />}
            <span className="hidden md:inline">{isMuted ? '소리 끔' : '소리 켬'}</span>
          </button>

          {/* Student Status or Login */}
          {student ? (
            <div className="flex items-center gap-1.5 bg-emerald-800/90 px-2.5 py-1.5 rounded-2xl border border-emerald-600">
              <div className="flex flex-col text-right">
                <span className="text-xs sm:text-sm font-black text-amber-300 flex items-center gap-1 justify-end">
                  <User className="w-3.5 h-3.5 text-emerald-300" />
                  {student.name} ({student.grade}-{student.classNum})
                </span>
                <span className="text-[10px] font-bold text-emerald-200 flex items-center gap-0.5 justify-end">
                  <Trophy className="w-3 h-3 text-amber-400" />
                  최고 {highScore}점
                </span>
              </div>
              <button
                type="button"
                onClick={onLogout}
                className="p-1.5 hover:bg-emerald-700 text-emerald-300 hover:text-white rounded-lg transition-colors cursor-pointer"
                title="로그아웃"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={onOpenLogin}
              className="px-3 py-2 bg-amber-400 hover:bg-amber-300 active:bg-amber-500 text-amber-950 font-black text-xs sm:text-sm rounded-xl shadow-md cursor-pointer flex items-center gap-1"
            >
              <User className="w-4 h-4" />
              <span>학생 로그인</span>
            </button>
          )}

          {/* Teacher Admin Link */}
          <button
            type="button"
            onClick={onOpenTeacher}
            className="px-2.5 sm:px-3 py-2 bg-emerald-800 hover:bg-emerald-700 text-emerald-100 font-extrabold text-xs sm:text-sm rounded-xl border border-emerald-600 cursor-pointer flex items-center gap-1"
            title="교사용 관리자 대시보드"
          >
            <Shield className="w-4 h-4 text-amber-300" />
            <span className="hidden sm:inline">선생님 방</span>
          </button>
        </div>
      </div>
    </header>
  );
};
