import React, { useState, useEffect, useCallback } from 'react';
import { Navbar } from './components/Navbar';
import { HomeScreen } from './components/HomeScreen';
import { GameScreen } from './components/GameScreen';
import { TeacherDashboard } from './components/TeacherDashboard';
import { StudentLoginModal } from './components/StudentLoginModal';
import { StudentProfile } from './types';
import { getStudentRecord } from './services/recordService';
import { testConnection } from './firebase/config';

export default function App() {
  const [currentView, setCurrentView] = useState<'home' | 'game' | 'teacher'>('home');
  const [student, setStudent] = useState<StudentProfile | null>(null);
  const [highScore, setHighScore] = useState<number>(0);
  const [totalGames, setTotalGames] = useState<number>(0);
  const [showLoginModal, setShowLoginModal] = useState<boolean>(false);

  // Initial connection test on boot as recommended by Firebase skill
  useEffect(() => {
    testConnection();
  }, []);

  // Restore stored session if present
  useEffect(() => {
    const saved = localStorage.getItem('animal_forest_student');
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as StudentProfile;
        setStudent(parsed);
        // Sync latest record from Firestore
        getStudentRecord(parsed.studentKey).then((rec) => {
          if (rec) {
            setHighScore(rec.highScore || 0);
            setTotalGames(rec.totalGames || 0);
          }
        });
      } catch {
        localStorage.removeItem('animal_forest_student');
      }
    }
  }, []);

  const handleLoginSuccess = useCallback(async (loggedInStudent: StudentProfile) => {
    setStudent(loggedInStudent);
    localStorage.setItem('animal_forest_student', JSON.stringify(loggedInStudent));
    setShowLoginModal(false);

    // Fetch student's real Firestore record
    try {
      const record = await getStudentRecord(loggedInStudent.studentKey);
      if (record) {
        setHighScore(record.highScore || 0);
        setTotalGames(record.totalGames || 0);
      } else {
        setHighScore(0);
        setTotalGames(0);
      }
    } catch (err) {
      console.error('Error fetching student record:', err);
    }
  }, []);

  const handleLogout = useCallback(() => {
    setStudent(null);
    setHighScore(0);
    setTotalGames(0);
    localStorage.removeItem('animal_forest_student');
    setCurrentView('home');
  }, []);

  const handleStartGame = () => {
    if (!student) {
      setShowLoginModal(true);
      return;
    }
    setCurrentView('game');
  };

  const handleScoreUpdate = useCallback((newScore: number) => {
    setHighScore((prev) => Math.max(prev, newScore));
    setTotalGames((prev) => prev + 1);
  }, []);

  return (
    <div className="min-h-screen bg-linear-to-b from-emerald-100 via-emerald-50 to-amber-50 text-slate-800 flex flex-col font-sans">
      {/* Navigation */}
      <Navbar
        student={student}
        highScore={highScore}
        onOpenLogin={() => setShowLoginModal(true)}
        onLogout={handleLogout}
        onOpenTeacher={() => setCurrentView('teacher')}
      />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col items-center justify-center p-2 sm:p-4">
        {currentView === 'home' && (
          <HomeScreen
            student={student}
            highScore={highScore}
            totalGames={totalGames}
            onStartGame={handleStartGame}
            onOpenLogin={() => setShowLoginModal(true)}
          />
        )}

        {currentView === 'game' && student && (
          <GameScreen
            student={student}
            highScore={highScore}
            onExit={() => setCurrentView('home')}
            onScoreUpdate={handleScoreUpdate}
          />
        )}

        {currentView === 'teacher' && (
          <TeacherDashboard onBackToApp={() => setCurrentView('home')} />
        )}
      </main>

      {/* Footer */}
      <footer className="w-full py-3 text-center text-xs font-bold text-emerald-800/80 border-t border-emerald-200/60 bg-emerald-50/50">
        🌲 동물 숲 구구단 서바이벌 • 초등학교 2학년 맞춤형 수학 놀이터 🐰
      </footer>

      {/* Student Login & Registration Modal */}
      {showLoginModal && (
        <StudentLoginModal
          onLoginSuccess={handleLoginSuccess}
          onCancel={() => setShowLoginModal(false)}
        />
      )}
    </div>
  );
}
