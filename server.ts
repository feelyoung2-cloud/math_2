import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json());

// Initialize Gemini SDK securely on the server
let aiClient: GoogleGenAI | null = null;
if (process.env.GEMINI_API_KEY) {
  aiClient = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// Animal mascots for feedback personality
const ANIMAL_FRIENDS = [
  { name: '토순이', suffix: '깡총깡총! 🐰' },
  { name: '곰돌이', suffix: '으라차차 힘내! 🐻' },
  { name: '다람이', suffix: '도토리처럼 반짝반짝! 🐿️' },
  { name: '멍뭉이', suffix: '멍멍! 최고야! 🐶' },
  { name: '야옹이', suffix: '야옹! 다음엔 다 맞힐 수 있어! 🐱' },
];

// API endpoint for AI feedback tailored to 2nd grade students
app.post('/api/ai-feedback', async (req, res) => {
  try {
    const { studentName, score, wrongProblems } = req.body;

    const animal = ANIMAL_FRIENDS[Math.floor(Math.random() * ANIMAL_FRIENDS.length)];

    // If no wrong problems (perfect or high score before stopping)
    const wrongListStr = Array.isArray(wrongProblems) && wrongProblems.length > 0
      ? wrongProblems.map((p: { q: string; userAns?: number; ans: number }) => `${p.q}=${p.ans}`).join(', ')
      : '틀린 문제 없음 (모두 정답!)';

    if (!process.env.GEMINI_API_KEY || !aiClient) {
      // Warm fallback when API key is not yet set
      const defaultFeedback = wrongProblems && wrongProblems.length > 0
        ? `${studentName || '친구'}야! 이번에 ${wrongListStr}를 조금 헷갈렸구나! 그래도 ${score}점까지 끝까지 달린 끈기가 정말 멋져! 다음엔 더 잘할 수 있을 거야 ${animal.suffix}`
        : `${studentName || '친구'}야! 틀린 문제 없이 ${score}점을 얻다니 정말 구구단 대장이야! 숲속 동물 친구들이 모두 기뻐하고 있어 ${animal.suffix}`;
      return res.json({ feedback: defaultFeedback, animal: animal.name });
    }

    const systemInstruction = `당신은 초등학교 2학년 학생들을 지도하는 따뜻하고 귀여운 동물 숲의 친구('${animal.name}')입니다.
아이들에게 상냥하고 다정하게 존댓말 또는 친근한 반존댓말(~했구나!, ~멋져! 등)로 2~3문장의 짧은 피드백을 전달하세요.
초등학교 2학년 수준에 맞게 쉽고 칭찬을 듬뿍 담아 주세요.
틀린 문제가 있다면 그 중 1~2개 문제의 정답(예: 7단 7x8=56)을 자연스럽게 짚어주며 격려해 주세요.
틀린 문제가 없다면 놀라운 실력을 크게 칭찬해 주세요.
문장 끝에 귀여운 동물 의성어나 응원 구호(예: "${animal.suffix}")를 붙여주세요.`;

    const prompt = `학생 이름: ${studentName || '친구'}
획득 점수: ${score}점
틀린 문제 목록: ${wrongListStr}
이 학생을 위한 다정하고 신나는 격려 한마디를 작성해 주세요.`;

    const response = await aiClient.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction,
        temperature: 0.8,
      },
    });

    const feedbackText = response.text?.trim() || `${studentName || '친구'}야, 정말 잘했어! 다음에도 숲속 친구들과 재미있게 구구단 연습해 보자 ${animal.suffix}`;
    return res.json({ feedback: feedbackText, animal: animal.name });
  } catch (error) {
    console.error('Gemini feedback error:', error);
    // Non-blocking fallback so students are never presented with an error
    const fallbackMsg = `구구단을 씩씩하게 풀어낸 우리 친구 최고야! 다음 판에서는 더 높은 점수에 도전해 보자 깡총! 🐰`;
    return res.json({ feedback: fallbackMsg, animal: '토순이' });
  }
});

// Setup Vite dev middleware or static serving
async function setupServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on http://0.0.0.0:${PORT}`);
  });
}

setupServer();
