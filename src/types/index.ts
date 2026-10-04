export interface StudentProfile {
  studentKey: string;
  grade: number;
  classNum: number;
  studentNumber: number;
  name: string;
  passwordHash: string;
  isPasswordSet: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ClassSettings {
  classPasswordHash: string;
  teacherPasswordHash: string;
  grade: number;
  classNum: number;
  initialSetupDone: boolean;
  updatedAt: string;
}

export interface GameRecord {
  studentKey: string;
  name: string;
  grade: number;
  classNum: number;
  studentNumber: number;
  highScore: number;
  totalGames: number;
  wrongCounts: Record<string, number>;
  lastPlayedAt: string;
  recentFeedback?: string;
  recentScore?: number;
}

export interface WrongProblem {
  q: string;
  a: number;
  b: number;
  ans: number;
  userAns?: number;
}

export interface GameSessionResult {
  score: number;
  correctCount: number;
  wrongProblems: WrongProblem[];
  aiFeedback?: string;
  animalCheer?: string;
  date: string;
}

export interface DiagnosticResult {
  ok: boolean;
  createSuccess: boolean;
  readSuccess: boolean;
  updateSuccess: boolean;
  deleteSuccess: boolean;
  latencyMs: number;
  timestamp: string;
  error?: string;
}
