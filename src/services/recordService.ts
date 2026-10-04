import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase/config';
import { DiagnosticResult, GameRecord, WrongProblem } from '../types';

export async function getStudentRecord(studentKey: string): Promise<GameRecord | null> {
  const path = `records/${studentKey}`;
  try {
    const snap = await getDoc(doc(db, 'records', studentKey));
    if (!snap.exists()) return null;
    return snap.data() as GameRecord;
  } catch (error) {
    return handleFirestoreError(error, OperationType.GET, path);
  }
}

export async function saveGameSession(
  studentKey: string,
  name: string,
  grade: number,
  classNum: number,
  studentNumber: number,
  score: number,
  wrongProblems: WrongProblem[],
  aiFeedback?: string
): Promise<GameRecord> {
  const path = `records/${studentKey}`;
  try {
    const existing = await getStudentRecord(studentKey);
    const prevWrong = existing?.wrongCounts || {};
    const updatedWrong: Record<string, number> = { ...prevWrong };

    // Accumulate each wrong problem
    for (const prob of wrongProblems) {
      const key = `${prob.a}x${prob.b}`;
      updatedWrong[key] = (updatedWrong[key] || 0) + 1;
    }

    const currentHighScore = Math.max(existing?.highScore || 0, score);
    const totalGames = (existing?.totalGames || 0) + 1;

    const recordData: GameRecord = {
      studentKey,
      name,
      grade,
      classNum,
      studentNumber,
      highScore: currentHighScore,
      totalGames,
      wrongCounts: updatedWrong,
      lastPlayedAt: new Date().toISOString(),
      recentFeedback: aiFeedback || existing?.recentFeedback || '',
      recentScore: score,
    };

    await setDoc(doc(db, 'records', studentKey), recordData);
    return recordData;
  } catch (error) {
    return handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function getAllClassRecords(): Promise<GameRecord[]> {
  const path = 'records';
  try {
    const snap = await getDocs(collection(db, 'records'));
    const list: GameRecord[] = [];
    snap.forEach((d) => {
      list.push(d.data() as GameRecord);
    });
    return list;
  } catch (error) {
    return handleFirestoreError(error, OperationType.LIST, path);
  }
}

export interface TopWrongProblem {
  problemKey: string; // e.g. "7x8"
  a: number;
  b: number;
  answer: number;
  count: number;
}

export function computeTopWrongProblems(records: GameRecord[], limitCount = 5): TopWrongProblem[] {
  const aggregated: Record<string, number> = {};

  for (const rec of records) {
    if (!rec.wrongCounts) continue;
    for (const [key, count] of Object.entries(rec.wrongCounts)) {
      aggregated[key] = (aggregated[key] || 0) + count;
    }
  }

  const sorted = Object.entries(aggregated)
    .sort((a, b) => b[1] - a[1])
    .slice(0, limitCount)
    .map(([key, count]) => {
      const [aStr, bStr] = key.split('x');
      const a = parseInt(aStr, 10) || 2;
      const b = parseInt(bStr, 10) || 2;
      return {
        problemKey: key,
        a,
        b,
        answer: a * b,
        count,
      };
    });

  return sorted;
}

/**
 * Execute real Firestore CRUD diagnostic:
 * 1. Create a test document in `_diagnostics/{testId}`
 * 2. Read back the test document
 * 3. Update the test document
 * 4. Delete the test document
 * Only returns ok: true if ALL 4 steps succeeded!
 */
export async function runFirestoreCrudDiagnostic(): Promise<DiagnosticResult> {
  const testId = `diag_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const docRef = doc(db, '_diagnostics', testId);
  const startTime = performance.now();

  let createSuccess = false;
  let readSuccess = false;
  let updateSuccess = false;
  let deleteSuccess = false;

  try {
    // 1. CREATE
    await setDoc(docRef, {
      test: 'ping',
      timestamp: Date.now(),
      status: 'created',
    });
    createSuccess = true;

    // 2. READ
    const readSnap = await getDoc(docRef);
    if (!readSnap.exists() || readSnap.data()?.test !== 'ping') {
      throw new Error('Read verification failed: document not found or mismatched data');
    }
    readSuccess = true;

    // 3. UPDATE
    await updateDoc(docRef, {
      test: 'pong',
      status: 'updated',
      updatedAt: Date.now(),
    });
    const verifyUpdate = await getDoc(docRef);
    if (verifyUpdate.data()?.status !== 'updated') {
      throw new Error('Update verification failed');
    }
    updateSuccess = true;

    // 4. DELETE
    await deleteDoc(docRef);
    const verifyDelete = await getDoc(docRef);
    if (verifyDelete.exists()) {
      throw new Error('Delete verification failed: document still exists');
    }
    deleteSuccess = true;

    const endTime = performance.now();
    return {
      ok: true,
      createSuccess,
      readSuccess,
      updateSuccess,
      deleteSuccess,
      latencyMs: Math.round(endTime - startTime),
      timestamp: new Date().toLocaleTimeString(),
    };
  } catch (error) {
    const endTime = performance.now();
    // Attempt cleanup if delete hadn't succeeded
    try {
      await deleteDoc(docRef);
    } catch {
      // ignore cleanup error
    }

    return {
      ok: false,
      createSuccess,
      readSuccess,
      updateSuccess,
      deleteSuccess,
      latencyMs: Math.round(endTime - startTime),
      timestamp: new Date().toLocaleTimeString(),
      error: error instanceof Error ? error.message : String(error),
    };
  }
}
