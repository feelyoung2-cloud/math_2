import React, { useState, useEffect, useCallback } from 'react';
import {
  ShieldCheck,
  Database,
  RefreshCw,
  Trophy,
  Users,
  KeyRound,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Lock,
  ArrowLeft,
  Search,
  BookOpen,
  Sparkles,
  BarChart3,
  Check,
} from 'lucide-react';
import { GameRecord, DiagnosticResult } from '../types';
import {
  getAllClassRecords,
  computeTopWrongProblems,
  TopWrongProblem,
  runFirestoreCrudDiagnostic,
} from '../services/recordService';
import {
  getClassSettings,
  verifyTeacherPassword,
  changeTeacherPassword,
  changeClassPassword,
  resetStudentPasswordByTeacher,
} from '../services/authService';

interface TeacherDashboardProps {
  onBackToApp: () => void;
}

export const TeacherDashboard: React.FC<TeacherDashboardProps> = ({ onBackToApp }) => {
  // Authentication state
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [teacherPwInput, setTeacherPwInput] = useState<string>('');
  const [authError, setAuthError] = useState<string>('');
  const [isLoggingIn, setIsLoggingIn] = useState<boolean>(false);

  // Data states
  const [records, setRecords] = useState<GameRecord[]>([]);
  const [topWrongs, setTopWrongs] = useState<TopWrongProblem[]>([]);
  const [isLoadingData, setIsLoadingData] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Diagnostic state
  const [diagnostic, setDiagnostic] = useState<DiagnosticResult | null>(null);
  const [isDiagnosing, setIsDiagnosing] = useState<boolean>(false);

  // Selected student for detail modal
  const [selectedStudent, setSelectedStudent] = useState<GameRecord | null>(null);

  // Password reset action notice
  const [resetNotice, setResetNotice] = useState<string>('');

  // Settings update modal/state
  const [showSettingsModal, setShowSettingsModal] = useState<boolean>(false);
  const [newClassPw, setNewClassPw] = useState<string>('');
  const [newTeacherPw, setNewTeacherPw] = useState<string>('');
  const [settingsSuccess, setSettingsSuccess] = useState<string>('');

  // Run real CRUD diagnostic
  const handleRunDiagnostic = useCallback(async () => {
    setIsDiagnosing(true);
    try {
      const res = await runFirestoreCrudDiagnostic();
      setDiagnostic(res);
    } catch (err) {
      console.error('Diagnostic error:', err);
    } finally {
      setIsDiagnosing(false);
    }
  }, []);

  // Fetch class records
  const loadClassData = useCallback(async () => {
    setIsLoadingData(true);
    try {
      const classRecs = await getAllClassRecords();
      setRecords(classRecs);
      const top5 = computeTopWrongProblems(classRecs, 5);
      setTopWrongs(top5);
    } catch (err) {
      console.error('Failed to load class records:', err);
    } finally {
      setIsLoadingData(false);
    }
  }, []);

  // On successful login
  useEffect(() => {
    if (isAuthenticated) {
      loadClassData();
      handleRunDiagnostic();
    }
  }, [isAuthenticated, loadClassData, handleRunDiagnostic]);

  const handleTeacherLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setIsLoggingIn(true);
    try {
      const valid = await verifyTeacherPassword(teacherPwInput);
      if (valid) {
        setIsAuthenticated(true);
      } else {
        setAuthError('관리자 비밀번호가 일치하지 않습니다. (기본 비밀번호: admin)');
      }
    } catch (err) {
      console.error(err);
      setAuthError('로그인 확인 중 오류가 발생했습니다.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleResetPassword = async (studentKey: string, studentName: string) => {
    if (!window.confirm(`${studentName} 학생의 비밀번호를 초기화하시겠습니까?\n초기화 후 학생은 학급 공통 비밀번호로 새 비밀번호를 등록할 수 있습니다.`)) {
      return;
    }

    try {
      await resetStudentPasswordByTeacher(studentKey);
      setResetNotice(`${studentName} 학생의 비밀번호가 성공적으로 초기화되었습니다.`);
      setTimeout(() => setResetNotice(''), 4000);
    } catch (err) {
      console.error(err);
      alert('비밀번호 초기화에 실패했습니다.');
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSettingsSuccess('');
    try {
      if (newClassPw.trim()) {
        await changeClassPassword(newClassPw.trim());
      }
      if (newTeacherPw.trim()) {
        await changeTeacherPassword(newTeacherPw.trim());
      }
      setSettingsSuccess('설정이 성공적으로 저장되었습니다!');
      setNewClassPw('');
      setNewTeacherPw('');
      setTimeout(() => {
        setShowSettingsModal(false);
        setSettingsSuccess('');
      }, 1500);
    } catch (err) {
      console.error(err);
      alert('설정 저장 중 오류가 발생했습니다.');
    }
  };

  // If not logged in as teacher, show password modal
  if (!isAuthenticated) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-3xl border-4 border-amber-400 shadow-2xl p-6 sm:p-8 text-emerald-950">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-amber-100 rounded-2xl flex items-center justify-center mx-auto mb-3 border-2 border-amber-300">
              <ShieldCheck className="w-10 h-10 text-amber-700" />
            </div>
            <h2 className="text-2xl font-black text-emerald-900">교사용 대시보드 로그인</h2>
            <p className="text-sm text-emerald-700 font-bold mt-1">
              학급 오답 통계 및 학생 지도 관리자 모드
            </p>
          </div>

          <form onSubmit={handleTeacherLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-black text-emerald-900 mb-1">
                관리자 비밀번호 입력
              </label>
              <div className="relative">
                <input
                  type="password"
                  placeholder="관리자 비밀번호 (기본: admin)"
                  value={teacherPwInput}
                  onChange={(e) => setTeacherPwInput(e.target.value)}
                  className="w-full h-12 bg-emerald-50 border-2 border-emerald-300 rounded-xl px-4 pl-11 font-bold text-base focus:outline-emerald-500"
                  autoFocus
                  required
                />
                <Lock className="w-5 h-5 text-emerald-600 absolute left-3.5 top-3.5" />
              </div>
              <p className="text-xs text-slate-500 mt-1">
                * 최초 실행 시 기본 비밀번호는 <code className="bg-slate-100 px-1 rounded font-bold text-emerald-800">admin</code>입니다.
              </p>
            </div>

            {authError && (
              <div className="flex items-center gap-1.5 text-xs font-bold text-rose-600 bg-rose-50 p-2.5 rounded-xl border border-rose-200">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{authError}</span>
              </div>
            )}

            <div className="pt-2 flex gap-2">
              <button
                type="button"
                onClick={onBackToApp}
                className="w-1/3 h-12 bg-slate-100 hover:bg-slate-200 text-slate-700 font-black rounded-2xl cursor-pointer"
              >
                홈으로
              </button>
              <button
                type="submit"
                disabled={isLoggingIn}
                className="w-2/3 h-12 bg-emerald-700 hover:bg-emerald-600 active:bg-emerald-800 text-white font-black text-base rounded-2xl shadow-md cursor-pointer disabled:opacity-50"
              >
                {isLoggingIn ? '확인 중...' : '관리자 입장'}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  // Filter students
  const filteredRecords = records.filter(
    (r) =>
      r.name.includes(searchQuery.trim()) ||
      String(r.studentNumber).includes(searchQuery.trim())
  );

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-4 space-y-6">
      {/* Top Bar */}
      <div className="bg-white rounded-3xl p-4 sm:p-6 border-3 border-emerald-200 shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onBackToApp}
            className="p-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-2xl border border-emerald-200 cursor-pointer"
            title="게임 화면으로 돌아가기"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-emerald-950 flex items-center gap-2">
              <span>교사용 학습 지도 대시보드</span>
              <span className="text-xs bg-emerald-100 text-emerald-800 font-extrabold px-2.5 py-0.5 rounded-full border border-emerald-300">
                2학년
              </span>
            </h1>
            <p className="text-xs sm:text-sm font-semibold text-emerald-700 mt-0.5">
              학급 전체 구구단 오답 데이터 분석 및 학생별 기록 관리
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowSettingsModal(true)}
            className="px-4 py-2.5 bg-amber-100 hover:bg-amber-200 text-amber-900 font-extrabold text-sm rounded-2xl border border-amber-300 flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <KeyRound className="w-4 h-4" />
            비밀번호 관리
          </button>
          <button
            type="button"
            onClick={loadClassData}
            disabled={isLoadingData}
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-sm rounded-2xl shadow-md flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isLoadingData ? 'animate-spin' : ''}`} />
            새로고침
          </button>
        </div>
      </div>

      {/* Notice Banner */}
      {resetNotice && (
        <div className="bg-emerald-100 border-2 border-emerald-300 text-emerald-900 p-3 rounded-2xl font-bold flex items-center gap-2 animate-fade-in shadow-sm">
          <CheckCircle2 className="w-5 h-5 text-emerald-700 shrink-0" />
          <span>{resetNotice}</span>
        </div>
      )}

      {/* Firebase Real CRUD Diagnostic Card */}
      <div className="bg-white rounded-3xl p-5 border-3 border-emerald-200 shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-emerald-100 text-emerald-800 rounded-xl">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-emerald-950 text-lg">Firebase Firestore 실시간 연결 진단</h3>
              <p className="text-xs text-slate-500 font-medium">
                실제 Firestore에 [생성 → 읽기 → 수정 → 삭제] 전 과정을 테스트하여 가짜 연결을 원천 차단합니다.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleRunDiagnostic}
            disabled={isDiagnosing}
            className="self-start sm:self-auto px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-800 font-bold text-xs rounded-xl border border-slate-300 flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isDiagnosing ? 'animate-spin' : ''}`} />
            {isDiagnosing ? '테스트 실행 중...' : '실시간 CRUD 진단 실행'}
          </button>
        </div>

        {diagnostic ? (
          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200">
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-200 mb-3">
              <div className="flex items-center gap-2">
                {diagnostic.ok ? (
                  <span className="inline-flex items-center gap-1.5 bg-emerald-500 text-white font-black text-xs sm:text-sm px-3 py-1 rounded-full shadow-xs">
                    <CheckCircle2 className="w-4 h-4" />
                    Firebase 연결 정상
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 bg-rose-500 text-white font-black text-xs sm:text-sm px-3 py-1 rounded-full shadow-xs">
                    <XCircle className="w-4 h-4" />
                    Firebase 연결 점검 필요
                  </span>
                )}
                <span className="text-xs font-bold text-slate-600">
                  (응답 속도: <strong className="text-emerald-700">{diagnostic.latencyMs}ms</strong> | 마지막 확인: {diagnostic.timestamp})
                </span>
              </div>
            </div>

            {/* Step breakdown */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-bold">
              <div
                className={`p-2.5 rounded-xl border flex items-center gap-2 ${
                  diagnostic.createSuccess
                    ? 'bg-emerald-50 text-emerald-900 border-emerald-300'
                    : 'bg-rose-50 text-rose-900 border-rose-300'
                }`}
              >
                {diagnostic.createSuccess ? <Check className="w-4 h-4 text-emerald-600" /> : <XCircle className="w-4 h-4 text-rose-600" />}
                <span>1. 문서 생성 [CREATE]</span>
              </div>

              <div
                className={`p-2.5 rounded-xl border flex items-center gap-2 ${
                  diagnostic.readSuccess
                    ? 'bg-emerald-50 text-emerald-900 border-emerald-300'
                    : 'bg-rose-50 text-rose-900 border-rose-300'
                }`}
              >
                {diagnostic.readSuccess ? <Check className="w-4 h-4 text-emerald-600" /> : <XCircle className="w-4 h-4 text-rose-600" />}
                <span>2. 문서 읽기 [READ]</span>
              </div>

              <div
                className={`p-2.5 rounded-xl border flex items-center gap-2 ${
                  diagnostic.updateSuccess
                    ? 'bg-emerald-50 text-emerald-900 border-emerald-300'
                    : 'bg-rose-50 text-rose-900 border-rose-300'
                }`}
              >
                {diagnostic.updateSuccess ? <Check className="w-4 h-4 text-emerald-600" /> : <XCircle className="w-4 h-4 text-rose-600" />}
                <span>3. 문서 수정 [UPDATE]</span>
              </div>

              <div
                className={`p-2.5 rounded-xl border flex items-center gap-2 ${
                  diagnostic.deleteSuccess
                    ? 'bg-emerald-50 text-emerald-900 border-emerald-300'
                    : 'bg-rose-50 text-rose-900 border-rose-300'
                }`}
              >
                {diagnostic.deleteSuccess ? <Check className="w-4 h-4 text-emerald-600" /> : <XCircle className="w-4 h-4 text-rose-600" />}
                <span>4. 문서 삭제 [DELETE]</span>
              </div>
            </div>

            {diagnostic.error && (
              <div className="mt-2 text-xs font-semibold text-rose-700 bg-rose-50 p-2 rounded-lg border border-rose-200">
                오류 상세: {diagnostic.error}
              </div>
            )}
          </div>
        ) : (
          <div className="bg-slate-50 p-4 rounded-2xl text-center text-xs text-slate-500 font-bold">
            연결 상태를 진단하고 있습니다...
          </div>
        )}
      </div>

      {/* Feature 1: TOP 5 Most Frequently Missed Questions */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border-3 border-amber-300 shadow-md">
        <div className="flex items-center gap-2 mb-4">
          <div className="p-2 bg-amber-100 text-amber-800 rounded-xl">
            <BarChart3 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xl font-black text-emerald-950 flex items-center gap-2">
              <span>우리 반 가장 많이 틀리는 구구단 순위 TOP 5</span>
              <Sparkles className="w-4 h-4 text-amber-500" />
            </h3>
            <p className="text-xs text-slate-600 font-semibold">
              학급 전체 누적 오답 데이터를 실시간 집계하여 맞춤 복습 포인트를 제시합니다.
            </p>
          </div>
        </div>

        {topWrongs.length === 0 ? (
          <div className="bg-amber-50 rounded-2xl p-8 text-center text-slate-500 border border-amber-200">
            <BookOpen className="w-10 h-10 text-amber-400 mx-auto mb-2" />
            <p className="font-bold text-sm text-amber-900">아직 누적된 오답 데이터가 없습니다.</p>
            <p className="text-xs text-slate-500 mt-1">
              학생들이 서바이벌 게임을 플레이하면 자주 헷갈리는 문제가 순위별로 자동 집계됩니다.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {topWrongs.map((item, index) => {
              const maxCount = topWrongs[0]?.count || 1;
              const percent = Math.round((item.count / maxCount) * 100);

              const rankBadges = [
                'bg-rose-500 text-white',
                'bg-amber-500 text-white',
                'bg-yellow-500 text-white',
                'bg-emerald-600 text-white',
                'bg-slate-600 text-white',
              ];

              return (
                <div
                  key={item.problemKey}
                  className="bg-amber-50/70 p-3.5 rounded-2xl border border-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`w-8 h-8 rounded-xl font-black text-sm flex items-center justify-center shrink-0 ${
                        rankBadges[index] || 'bg-slate-400 text-white'
                      }`}
                    >
                      {index + 1}위
                    </span>
                    <div>
                      <div className="text-xl font-black text-emerald-950">
                        {item.a} × {item.b} = <span className="text-emerald-700">{item.answer}</span>
                      </div>
                      <div className="text-xs text-slate-600 font-semibold">
                        {item.a}단 영역
                      </div>
                    </div>
                  </div>

                  {/* Frequency meter */}
                  <div className="flex items-center gap-3 sm:w-64">
                    <div className="flex-1 bg-white h-3.5 rounded-full overflow-hidden border border-amber-200">
                      <div
                        className="bg-rose-500 h-full rounded-full transition-all duration-500"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                    <span className="font-black text-rose-600 text-sm shrink-0">
                      오답 {item.count}회
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Feature 2 & 3: Student Roster, Individual Records & Password Reset */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border-3 border-emerald-200 shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-emerald-100 text-emerald-800 rounded-xl">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xl font-black text-emerald-950">학생별 기록 및 계정 관리</h3>
              <p className="text-xs text-slate-600 font-semibold">
                학생 이름을 클릭하면 상세 오답 내역을 확인하고 비밀번호를 초기화할 수 있습니다.
              </p>
            </div>
          </div>

          {/* Search box */}
          <div className="relative w-full sm:w-64">
            <input
              type="text"
              placeholder="이름 또는 번호 검색"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-10 bg-slate-50 border border-slate-300 rounded-xl px-3 pl-9 text-sm font-bold focus:outline-emerald-500"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          </div>
        </div>

        {/* Table / Cards */}
        {filteredRecords.length === 0 ? (
          <div className="p-8 text-center text-slate-500 bg-slate-50 rounded-2xl border border-slate-200">
            <Users className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p className="font-bold text-sm">등록된 학생 기록이 없습니다.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b-2 border-emerald-100 text-xs font-black text-emerald-900 bg-emerald-50/60">
                  <th className="py-3 px-3">번호</th>
                  <th className="py-3 px-3">이름</th>
                  <th className="py-3 px-3">최고 점수</th>
                  <th className="py-3 px-3">총 플레이</th>
                  <th className="py-3 px-3">자주 틀린 문제</th>
                  <th className="py-3 px-3 text-right">관리</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm font-bold text-slate-800">
                {filteredRecords.map((rec) => {
                  const wrongEntries = Object.entries(rec.wrongCounts || {}).sort(
                    (a, b) => b[1] - a[1]
                  );
                  const topMistake = wrongEntries[0]
                    ? `${wrongEntries[0][0].replace('x', '×')} (${wrongEntries[0][1]}회)`
                    : '오답 없음';

                  return (
                    <tr
                      key={rec.studentKey}
                      className="hover:bg-emerald-50/40 transition-colors"
                    >
                      <td className="py-3.5 px-3 font-mono text-emerald-800">
                        {rec.studentNumber}번
                      </td>
                      <td className="py-3.5 px-3">
                        <button
                          type="button"
                          onClick={() => setSelectedStudent(rec)}
                          className="font-black text-emerald-900 hover:text-emerald-600 underline cursor-pointer text-base"
                        >
                          {rec.name}
                        </button>
                      </td>
                      <td className="py-3.5 px-3 font-extrabold text-amber-600">
                        <span className="inline-flex items-center gap-1">
                          <Trophy className="w-3.5 h-3.5 text-amber-500" />
                          {rec.highScore}점
                        </span>
                      </td>
                      <td className="py-3.5 px-3 text-slate-600">{rec.totalGames}회</td>
                      <td className="py-3.5 px-3 text-xs font-semibold text-rose-700">
                        {topMistake}
                      </td>
                      <td className="py-3.5 px-3 text-right">
                        <button
                          type="button"
                          onClick={() => handleResetPassword(rec.studentKey, rec.name)}
                          className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-black rounded-xl border border-rose-200 cursor-pointer shadow-2xs"
                        >
                          비밀번호 초기화
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Student Detail Modal */}
      {selectedStudent && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-fade-in">
          <div className="w-full max-w-lg bg-white rounded-3xl border-4 border-emerald-300 shadow-2xl p-6 text-emerald-950">
            <div className="flex items-center justify-between pb-3 border-b border-emerald-100 mb-4">
              <div>
                <h3 className="text-2xl font-black text-emerald-950">
                  {selectedStudent.name} 학생 학습 리포트
                </h3>
                <p className="text-xs text-slate-500 font-bold">
                  {selectedStudent.grade}학년 {selectedStudent.classNum}반 {selectedStudent.studentNumber}번 ({selectedStudent.studentKey})
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedStudent(null)}
                className="w-9 h-9 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-full font-bold flex items-center justify-center cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="bg-amber-50 p-3.5 rounded-2xl border border-amber-200 text-center">
                <div className="text-xs font-bold text-amber-800">최고 점수</div>
                <div className="text-3xl font-black text-amber-600 mt-1">
                  {selectedStudent.highScore}점
                </div>
              </div>
              <div className="bg-emerald-50 p-3.5 rounded-2xl border border-emerald-200 text-center">
                <div className="text-xs font-bold text-emerald-800">총 도전 횟수</div>
                <div className="text-3xl font-black text-emerald-700 mt-1">
                  {selectedStudent.totalGames}회
                </div>
              </div>
            </div>

            {/* AI Feedback */}
            {selectedStudent.recentFeedback && (
              <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 mb-4">
                <div className="text-xs font-extrabold text-emerald-800 mb-1 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span>최근 AI 격려 피드백</span>
                </div>
                <p className="text-xs text-slate-700 leading-relaxed font-semibold">
                  "{selectedStudent.recentFeedback}"
                </p>
              </div>
            )}

            {/* All Wrong Problems Breakdown */}
            <div className="mb-5">
              <div className="text-xs font-black text-emerald-950 mb-2">
                누적 오답 내역 분석 (총 {Object.keys(selectedStudent.wrongCounts || {}).length}개 문제)
              </div>
              {Object.keys(selectedStudent.wrongCounts || {}).length === 0 ? (
                <div className="p-4 bg-emerald-50 rounded-xl text-center text-xs text-emerald-700 font-bold">
                  오답 기록이 없습니다. 모두 완벽하게 맞혔습니다! 🌟
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
                  {Object.entries(selectedStudent.wrongCounts || {})
                    .sort((a, b) => b[1] - a[1])
                    .map(([probKey, count]) => {
                      const [aStr, bStr] = probKey.split('x');
                      const a = parseInt(aStr, 10);
                      const b = parseInt(bStr, 10);
                      const ans = a * b;
                      return (
                        <div
                          key={probKey}
                          className="bg-white p-2.5 rounded-xl border border-rose-200 flex items-center justify-between text-xs font-bold shadow-2xs"
                        >
                          <span className="text-slate-800">
                            {a} × {b} = {ans}
                          </span>
                          <span className="text-rose-600 font-extrabold bg-rose-50 px-2 py-0.5 rounded-md">
                            {count}회 오답
                          </span>
                        </div>
                      );
                    })}
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  handleResetPassword(selectedStudent.studentKey, selectedStudent.name);
                  setSelectedStudent(null);
                }}
                className="flex-1 h-11 bg-rose-100 hover:bg-rose-200 text-rose-800 font-black text-sm rounded-xl border border-rose-300 cursor-pointer"
              >
                비밀번호 초기화
              </button>
              <button
                type="button"
                onClick={() => setSelectedStudent(null)}
                className="flex-1 h-11 bg-emerald-700 hover:bg-emerald-600 text-white font-black text-sm rounded-xl cursor-pointer"
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Class Settings Modal */}
      {showSettingsModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-fade-in">
          <div className="w-full max-w-md bg-white rounded-3xl border-4 border-amber-400 shadow-2xl p-6 text-emerald-950">
            <h3 className="text-xl font-black text-emerald-950 mb-1 flex items-center gap-2">
              <KeyRound className="w-5 h-5 text-amber-600" />
              학급 보안 및 비밀번호 설정
            </h3>
            <p className="text-xs text-slate-500 font-bold mb-4">
              학생들이 최초 등록 시 사용하는 공통 비밀번호와 관리자 비밀번호를 변경할 수 있습니다.
            </p>

            <form onSubmit={handleSaveSettings} className="space-y-4">
              <div>
                <label className="block text-xs font-black text-emerald-900 mb-1">
                  새 학급 공통 비밀번호 (학생 최초 접속용)
                </label>
                <input
                  type="text"
                  placeholder="변경할 때만 입력 (예: 1234)"
                  value={newClassPw}
                  onChange={(e) => setNewClassPw(e.target.value)}
                  className="w-full h-11 bg-emerald-50 border-2 border-emerald-300 rounded-xl px-3 font-bold text-sm focus:outline-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-black text-emerald-900 mb-1">
                  새 교사 관리자 비밀번호
                </label>
                <input
                  type="password"
                  placeholder="변경할 때만 입력"
                  value={newTeacherPw}
                  onChange={(e) => setNewTeacherPw(e.target.value)}
                  className="w-full h-11 bg-emerald-50 border-2 border-emerald-300 rounded-xl px-3 font-bold text-sm focus:outline-emerald-500"
                />
              </div>

              {settingsSuccess && (
                <div className="text-xs font-bold text-emerald-700 bg-emerald-100 p-2.5 rounded-xl border border-emerald-300 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{settingsSuccess}</span>
                </div>
              )}

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowSettingsModal(false)}
                  className="w-1/3 h-11 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl cursor-pointer text-sm"
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="w-2/3 h-11 bg-amber-500 hover:bg-amber-400 text-amber-950 font-black rounded-xl shadow-md cursor-pointer text-sm"
                >
                  설정 변경 저장
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
