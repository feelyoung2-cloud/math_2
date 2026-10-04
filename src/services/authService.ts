import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase/config';
import { hashPassword } from '../utils/crypto';
import { ClassSettings, StudentProfile } from '../types';

export const SETTINGS_DOC_ID = 'class_settings';

// Default initial passwords (hashed) before teacher customizes them:
// Default Class Password: "1234"
// Default Teacher Password: "admin"
const DEFAULT_CLASS_PW = '1234';
const DEFAULT_TEACHER_PW = 'admin';

export function makeStudentKey(grade: number, classNum: number, studentNumber: number): string {
  const currentYear = new Date().getFullYear();
  return `${currentYear}-${grade}-${classNum}-${String(studentNumber).padStart(2, '0')}`;
}

export async function getClassSettings(): Promise<ClassSettings> {
  const path = `settings/${SETTINGS_DOC_ID}`;
  try {
    const snap = await getDoc(doc(db, 'settings', SETTINGS_DOC_ID));
    if (snap.exists()) {
      return snap.data() as ClassSettings;
    }

    // Initialize with defaults if not created yet
    const classPwHash = await hashPassword(DEFAULT_CLASS_PW);
    const teacherPwHash = await hashPassword(DEFAULT_TEACHER_PW);
    const initialSettings: ClassSettings = {
      classPasswordHash: classPwHash,
      teacherPasswordHash: teacherPwHash,
      grade: 2,
      classNum: 1,
      initialSetupDone: false,
      updatedAt: new Date().toISOString(),
    };

    await setDoc(doc(db, 'settings', SETTINGS_DOC_ID), initialSettings);
    return initialSettings;
  } catch (error) {
    return handleFirestoreError(error, OperationType.GET, path);
  }
}

export async function updateClassSettings(settings: Partial<ClassSettings>): Promise<void> {
  const path = `settings/${SETTINGS_DOC_ID}`;
  try {
    await updateDoc(doc(db, 'settings', SETTINGS_DOC_ID), {
      ...settings,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function verifyTeacherPassword(plainText: string): Promise<boolean> {
  const settings = await getClassSettings();
  const inputHash = await hashPassword(plainText);
  return inputHash === settings.teacherPasswordHash;
}

export async function changeTeacherPassword(newPlainText: string): Promise<void> {
  const newHash = await hashPassword(newPlainText);
  await updateClassSettings({ teacherPasswordHash: newHash });
}

export async function changeClassPassword(newPlainText: string): Promise<void> {
  const newHash = await hashPassword(newPlainText);
  await updateClassSettings({ classPasswordHash: newHash });
}

export async function getStudentProfile(studentKey: string): Promise<StudentProfile | null> {
  const path = `students/${studentKey}`;
  try {
    const snap = await getDoc(doc(db, 'students', studentKey));
    if (!snap.exists()) return null;
    return snap.data() as StudentProfile;
  } catch (error) {
    return handleFirestoreError(error, OperationType.GET, path);
  }
}

export async function registerOrSetStudentPassword(
  grade: number,
  classNum: number,
  studentNumber: number,
  name: string,
  classPasswordInput: string,
  newPersonalPassword: string
): Promise<{ success: boolean; message: string; student?: StudentProfile }> {
  const settings = await getClassSettings();
  const inputClassPwHash = await hashPassword(classPasswordInput);

  if (inputClassPwHash !== settings.classPasswordHash) {
    return {
      success: false,
      message: '학급 공통 비밀번호가 맞지 않아요. 선생님께 여쭤보세요!',
    };
  }

  const studentKey = makeStudentKey(grade, classNum, studentNumber);
  const path = `students/${studentKey}`;
  const personalHash = await hashPassword(newPersonalPassword);
  const now = new Date().toISOString();

  const profile: StudentProfile = {
    studentKey,
    grade,
    classNum,
    studentNumber,
    name: name.trim(),
    passwordHash: personalHash,
    isPasswordSet: true,
    createdAt: now,
    updatedAt: now,
  };

  try {
    await setDoc(doc(db, 'students', studentKey), profile);
    return { success: true, message: '비밀번호가 성공적으로 등록되었어요!', student: profile };
  } catch (error) {
    return handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function loginStudent(
  grade: number,
  classNum: number,
  studentNumber: number,
  name: string,
  personalPasswordInput: string
): Promise<{ success: boolean; message: string; student?: StudentProfile }> {
  const studentKey = makeStudentKey(grade, classNum, studentNumber);
  const profile = await getStudentProfile(studentKey);

  if (!profile || !profile.isPasswordSet) {
    return {
      success: false,
      message: '아직 개인 비밀번호가 없어요. 학급 공통 비밀번호로 먼저 등록해 주세요!',
    };
  }

  // Name check to avoid logging into another student's account
  if (profile.name.trim() !== name.trim()) {
    return {
      success: false,
      message: '입력한 번호와 이름이 일치하지 않아요. 번호와 이름을 다시 확인해 주세요!',
    };
  }

  const inputHash = await hashPassword(personalPasswordInput);
  if (inputHash !== profile.passwordHash) {
    return {
      success: false,
      message: '개인 비밀번호가 틀렸어요. 기억이 안 나면 선생님께 초기화를 부탁하세요!',
    };
  }

  return { success: true, message: '반가워요! 신나게 달려볼까요?', student: profile };
}

export async function resetStudentPasswordByTeacher(studentKey: string): Promise<void> {
  const path = `students/${studentKey}`;
  try {
    await updateDoc(doc(db, 'students', studentKey), {
      passwordHash: '',
      isPasswordSet: false,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}
