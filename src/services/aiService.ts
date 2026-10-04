import { WrongProblem } from '../types';

export interface AIFeedbackResponse {
  feedback: string;
  animal: string;
}

/**
 * Request gentle AI encouragement feedback from the server-side Gemini API.
 * The client NEVER handles the GEMINI_API_KEY directly.
 */
export async function fetchAIFeedback(
  studentName: string,
  score: number,
  wrongProblems: WrongProblem[]
): Promise<AIFeedbackResponse> {
  try {
    const res = await fetch('/api/ai-feedback', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        studentName,
        score,
        wrongProblems,
      }),
    });

    if (!res.ok) {
      throw new Error(`Server returned ${res.status}`);
    }

    const data = await res.json();
    return {
      feedback: data.feedback,
      animal: data.animal || '토순이',
    };
  } catch (error) {
    console.warn('AI feedback fallback used:', error);
    // Student-friendly fallback message
    const animalNames = ['토순이', '곰돌이', '다람이', '멍뭉이', '야옹이'];
    const chosen = animalNames[Math.floor(Math.random() * animalNames.length)];

    let fallbackText = `${studentName} 친구야! ${score}점까지 정말 멋지게 도전했어! 끝까지 포기하지 않는 모습이 최고야!`;
    if (wrongProblems.length > 0) {
      const first = wrongProblems[0];
      fallbackText = `${studentName} 친구야! ${first.a}단(${first.a}×${first.b}=${first.ans})을 조금 헷갈렸구나! 그래도 끝까지 포기하지 않은 끈기가 정말 멋져! 다음엔 더 잘할 수 있을 거야 멍멍! 🐶`;
    }

    return {
      feedback: fallbackText,
      animal: chosen,
    };
  }
}
