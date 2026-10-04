import React, { useState, useEffect, useCallback, useRef } from 'react';
import confetti from 'canvas-confetti';
import { Heart, Trophy, Zap, Sparkles } from 'lucide-react';
import { AnimalMascot, AnimalEmotion } from './AnimalMascot';
import { NumericKeypad } from './NumericKeypad';
import { GameOverModal } from './GameOverModal';
import { sounds } from '../utils/sound';
import { WrongProblem, GameSessionResult, StudentProfile } from '../types';
import { saveGameSession } from '../services/recordService';
import { fetchAIFeedback } from '../services/aiService';

interface GameScreenProps {
  student: StudentProfile;
  highScore: number;
  onExit: () => void;
  onScoreUpdate: (newHighScore: number) => void;
}

interface Question {
  a: number;
  b: number;
  ans: number;
}

function getRandomQuestion(lastQ?: Question): Question {
  let a: number;
  let b: number;
  let ans: number;
  do {
    // Grade 2: 2단 through 9단, multiplied by 1 through 9
    a = Math.floor(Math.random() * 8) + 2; // 2 ~ 9
    b = Math.floor(Math.random() * 9) + 1; // 1 ~ 9
    ans = a * b;
  } while (lastQ && lastQ.a === a && lastQ.b === b);

  return { a, b, ans };
}

export const GameScreen: React.FC<GameScreenProps> = ({
  student,
  highScore,
  onExit,
  onScoreUpdate,
}) => {
  const [hearts, setHearts] = useState<number>(3);
  const [score, setScore] = useState<number>(0);
  const [combo, setCombo] = useState<number>(0);
  const [inputVal, setInputVal] = useState<string>('');
  const [currentQ, setCurrentQ] = useState<Question>(() => getRandomQuestion());
  const [wrongList, setWrongList] = useState<WrongProblem[]>([]);
  const [correctCount, setCorrectCount] = useState<number>(0);

  // Mascot state
  const mascotAnimals = useRef<('rabbit' | 'bear' | 'squirrel' | 'puppy' | 'cat')[]>([
    'rabbit',
    'bear',
    'squirrel',
    'puppy',
    'cat',
  ]).current;
  const [activeAnimal, setActiveAnimal] = useState<'rabbit' | 'bear' | 'squirrel' | 'puppy' | 'cat'>('rabbit');
  const [mascotEmotion, setMascotEmotion] = useState<AnimalEmotion>('idle');
  const [mascotMessage, setMascotMessage] = useState<string>('시작해 볼까? 파이팅!');

  // Feedback flash
  const [answerFeedback, setAnswerFeedback] = useState<'correct' | 'wrong' | null>(null);

  // Game over state
  const [isGameOver, setIsGameOver] = useState<boolean>(false);
  const [saveStatus, setSaveStatus] = useState<'saving' | 'saved' | 'error'>('saving');
  const [gameResult, setGameResult] = useState<GameSessionResult | null>(null);

  // Rotate mascot occasionally
  const switchAnimal = useCallback(() => {
    const next = mascotAnimals[Math.floor(Math.random() * mascotAnimals.length)];
    setActiveAnimal(next);
  }, [mascotAnimals]);

  const handleNumberInput = (digit: string) => {
    if (inputVal.length >= 3) return; // 9x9 is max 81 (2 digits), allow up to 3 digits
    setInputVal((prev) => prev + digit);
  };

  const handleDelete = () => {
    setInputVal((prev) => prev.slice(0, -1));
  };

  const handleFinishGame = useCallback(
    async (finalScore: number, finalWrongs: WrongProblem[], finalCorrect: number) => {
      setIsGameOver(true);
      sounds.playGameOver();

      setSaveStatus('saving');
      try {
        // Fetch gentle AI feedback from server
        const aiRes = await fetchAIFeedback(student.name, finalScore, finalWrongs);

        // Auto-save to Firestore
        await saveGameSession(
          student.studentKey,
          student.name,
          student.grade,
          student.classNum,
          student.studentNumber,
          finalScore,
          finalWrongs,
          aiRes.feedback
        );

        if (finalScore > highScore) {
          onScoreUpdate(finalScore);
        }

        setSaveStatus('saved');
        setGameResult({
          score: finalScore,
          correctCount: finalCorrect,
          wrongProblems: finalWrongs,
          aiFeedback: aiRes.feedback,
          animalCheer: aiRes.animal,
          date: new Date().toLocaleDateString(),
        });
      } catch (err) {
        console.error('Failed to save game session:', err);
        setSaveStatus('error');
        setGameResult({
          score: finalScore,
          correctCount: finalCorrect,
          wrongProblems: finalWrongs,
          aiFeedback: '숲속 친구들이 열심히 응원하고 있어! 다음 판도 파이팅이야! 🌲',
          animalCheer: '토순이',
          date: new Date().toLocaleDateString(),
        });
      }
    },
    [student, highScore, onScoreUpdate]
  );

  const handleSubmit = () => {
    if (!inputVal) return;
    const userAnsNum = parseInt(inputVal, 10);

    if (userAnsNum === currentQ.ans) {
      // CORRECT!
      sounds.playCorrect();
      const newCombo = combo + 1;
      const points = 10 + Math.min(newCombo * 5, 50);
      const newScore = score + points;
      const newCorrectCount = correctCount + 1;

      setScore(newScore);
      setCombo(newCombo);
      setCorrectCount(newCorrectCount);
      setAnswerFeedback('correct');

      // Mascot cheers
      setMascotEmotion('cheering');
      if (newCombo >= 10) {
        setMascotMessage(`🔥 대단해! ${newCombo}문제 연속 정답!`);
        confetti({ particleCount: 50, spread: 70, origin: { y: 0.6 } });
        sounds.playCombo();
      } else if (newCombo >= 5) {
        setMascotMessage(`✨ 와아! ${newCombo}콤보 달성!`);
        confetti({ particleCount: 30, spread: 50, origin: { y: 0.6 } });
        sounds.playCombo();
      } else {
        const cheerQuotes = ['정답이야! 최고야!', '잘했어! 다음 문제도!', '우와! 정말 빠르다!', '멋져요! 구구단 박사!'];
        setMascotMessage(cheerQuotes[Math.floor(Math.random() * cheerQuotes.length)]);
      }

      switchAnimal();
      setInputVal('');
      setCurrentQ(getRandomQuestion(currentQ));

      setTimeout(() => {
        setAnswerFeedback(null);
        setMascotEmotion('idle');
      }, 700);
    } else {
      // WRONG!
      sounds.playWrong();
      const newHearts = hearts - 1;
      setHearts(newHearts);
      setCombo(0);
      setAnswerFeedback('wrong');

      const missedProb: WrongProblem = {
        q: `${currentQ.a} × ${currentQ.b}`,
        a: currentQ.a,
        b: currentQ.b,
        ans: currentQ.ans,
        userAns: userAnsNum,
      };

      const updatedWrongs = [...wrongList, missedProb];
      setWrongList(updatedWrongs);

      setMascotEmotion('sad');
      setMascotMessage(`앗! ${currentQ.a} × ${currentQ.b} = ${currentQ.ans} 이었어! 힘내자!`);

      setInputVal('');

      if (newHearts <= 0) {
        // Game Over!
        setTimeout(() => {
          handleFinishGame(score, updatedWrongs, correctCount);
        }, 600);
      } else {
        setCurrentQ(getRandomQuestion(currentQ));
        setTimeout(() => {
          setAnswerFeedback(null);
          setMascotEmotion('idle');
        }, 1200);
      }
    }
  };

  const handleRestart = () => {
    setHearts(3);
    setScore(0);
    setCombo(0);
    setInputVal('');
    setWrongList([]);
    setCorrectCount(0);
    setCurrentQ(getRandomQuestion());
    setIsGameOver(false);
    setMascotEmotion('idle');
    setMascotMessage('새로운 마음으로 다시 출발! 🌲');
    setGameResult(null);
  };

  return (
    <div className="w-full max-w-xl mx-auto flex flex-col items-center px-4 py-2 select-none">
      {/* Top Status Bar: Hearts & Score & Combo */}
      <div className="w-full bg-emerald-800/80 backdrop-blur-md text-white rounded-3xl p-3 sm:p-4 mb-3 shadow-lg border-2 border-emerald-500/30 flex items-center justify-between">
        {/* Hearts */}
        <div className="flex items-center gap-1.5">
          {[1, 2, 3].map((hIndex) => (
            <div
              key={hIndex}
              className={`transition-transform duration-300 ${
                hIndex <= hearts ? 'scale-110' : 'scale-90 opacity-30 grayscale'
              }`}
            >
              <Heart
                className={`w-7 h-7 sm:w-9 sm:h-9 ${
                  hIndex <= hearts ? 'text-rose-400 fill-rose-500' : 'text-slate-400'
                }`}
              />
            </div>
          ))}
        </div>

        {/* Combo Badge */}
        {combo > 1 && (
          <div className="flex items-center gap-1 bg-amber-400 text-amber-950 px-3 py-1 rounded-full font-black text-sm sm:text-base animate-bounce shadow-md">
            <Zap className="w-4 h-4 fill-amber-950" />
            <span>{combo} 콤보!</span>
          </div>
        )}

        {/* Score & High Score */}
        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="text-xs text-emerald-200 font-semibold">내 점수</div>
            <div className="text-2xl sm:text-3xl font-black text-amber-300 tracking-tight">{score}점</div>
          </div>
          <div className="hidden sm:block text-right border-l border-emerald-600/60 pl-3">
            <div className="text-xs text-emerald-300 font-medium flex items-center gap-1">
              <Trophy className="w-3.5 h-3.5 text-amber-300" />
              최고
            </div>
            <div className="text-lg font-bold text-emerald-100">{Math.max(highScore, score)}점</div>
          </div>
        </div>
      </div>

      {/* Animal Mascot with Speech Bubble */}
      <div className="my-1">
        <AnimalMascot
          animal={activeAnimal}
          emotion={mascotEmotion}
          size="md"
          message={mascotMessage}
        />
      </div>

      {/* Main Question Card */}
      <div
        className={`w-full relative my-2 p-5 sm:p-6 rounded-3xl border-4 text-center shadow-xl transition-all duration-300 ${
          answerFeedback === 'correct'
            ? 'bg-emerald-100 border-emerald-400 scale-105'
            : answerFeedback === 'wrong'
            ? 'bg-rose-100 border-rose-400 shake-animation'
            : 'bg-white/95 border-amber-300'
        }`}
      >
        <div className="text-xs sm:text-sm font-extrabold text-emerald-700 uppercase tracking-widest mb-1 flex items-center justify-center gap-1">
          <Sparkles className="w-4 h-4 text-amber-500" />
          <span>{currentQ.a}단 문제</span>
          <Sparkles className="w-4 h-4 text-amber-500" />
        </div>

        {/* Giant Equation */}
        <div className="flex items-center justify-center gap-2 sm:gap-3 text-4xl sm:text-6xl font-black text-emerald-950 tracking-wide my-1">
          <span className="bg-amber-100 text-amber-900 px-3 py-1 rounded-2xl border-2 border-amber-300">
            {currentQ.a}
          </span>
          <span className="text-amber-600">×</span>
          <span className="bg-amber-100 text-amber-900 px-3 py-1 rounded-2xl border-2 border-amber-300">
            {currentQ.b}
          </span>
          <span className="text-amber-600">=</span>
          <span
            className={`min-w-16 sm:min-w-24 px-3 py-1 rounded-2xl border-3 font-mono ${
              inputVal
                ? 'bg-emerald-500 text-white border-emerald-600'
                : 'bg-slate-100 text-slate-400 border-dashed border-slate-300'
            }`}
          >
            {inputVal || '?'}
          </span>
        </div>
      </div>

      {/* Keypad */}
      <div className="w-full mt-1">
        <NumericKeypad
          onNumber={handleNumberInput}
          onDelete={handleDelete}
          onSubmit={handleSubmit}
          disabled={isGameOver}
        />
      </div>

      {/* Bottom Exit Bar */}
      <div className="mt-2">
        <button
          type="button"
          onClick={onExit}
          className="text-xs sm:text-sm font-bold text-emerald-800 hover:text-emerald-950 underline px-3 py-1.5 cursor-pointer"
        >
          잠깐 쉬어갈래요 (처음 화면으로)
        </button>
      </div>

      {/* Game Over Modal */}
      {isGameOver && gameResult && (
        <GameOverModal
          result={gameResult}
          studentName={student.name}
          highScore={highScore}
          saveStatus={saveStatus}
          onRestart={handleRestart}
          onExit={onExit}
        />
      )}
    </div>
  );
};
