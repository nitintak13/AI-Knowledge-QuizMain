import type { Question } from "@/context/QuizContext";

export interface QuizResponse {
  topic: string;
  questions: Question[];
}

export interface FeedbackResponse {
  summary: string;
  tips: string[];
}

export interface ErrorResponse {
  error: true;
  message: string;
}

export async function generateQuiz(topic: string, name: string): Promise<QuizResponse | ErrorResponse> {
  try {
    const response = await fetch("/api/generate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ topic, name }),
    });

    const data = await response.json();

    if (!response.ok || ("error" in data && data.error)) {
      return {
        error: true,
        message: data.message || "Failed to generate quiz",
      };
    }

    return data as QuizResponse;
  } catch (error) {
    console.error("Error generating quiz:", error);
    return {
      error: true,
      message: "Network error. Please check your connection and try again.",
    };
  }
}

export async function generateFeedback(
  topic: string,
  name: string,
  score: number,
  total: number,
  answers: { questionId: number; userAnswer: number | null; correctAnswer: number; question: string }[]
): Promise<FeedbackResponse | ErrorResponse> {
  try {
    const response = await fetch("/api/feedback", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ topic, name, score, total, answers }),
    });

    const data = await response.json();

    if (!response.ok || ("error" in data && data.error)) {
      return {
        error: true,
        message: data.message || "Failed to generate feedback",
      };
    }

    return data as FeedbackResponse;
  } catch (error) {
    console.error("Error generating feedback:", error);
    return {
      error: true,
      message: "Network error. Please check your connection and try again.",
    };
  }
}
