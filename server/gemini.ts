import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
dotenv.config();

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export interface Question {
  id: number;
  question: string;
  options: string[];
  correct_index: number;
  explanation: string;
}

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

type GeminiJson = Record<string, unknown>;

const QUIZ_SYSTEM_PROMPT = `You are a concise quiz-writer. Return ONLY valid JSON that matches the provided schema. If you cannot generate questions for the topic, return {"error":true,"message":"<reason>"}.`;

const QUIZ_SCHEMA = `{"topic":"string","questions":[{"id":"int","question":"string","options":["string","string","string","string"],"correct_index":"int (0-3)","explanation":"string"}]}`;

const FEEDBACK_SYSTEM_PROMPT = `You are a helpful educational feedback assistant. Analyze quiz performance and provide constructive, encouraging feedback. Return ONLY valid JSON with a summary and tips for improvement.`;

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function callGeminiWithRetry(
  prompt: string,
  systemPrompt: string,
  maxRetries: number = 2
): Promise<GeminiJson | ErrorResponse> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      if (attempt > 0) {
        const delay = 400 * attempt;
        console.log(`Retry attempt ${attempt}, waiting ${delay}ms...`);
        await sleep(delay);
      }

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        config: { systemInstruction: systemPrompt },
        contents: prompt,
      });

      const rawText = response.text;
      if (!rawText) throw new Error("Empty response from Gemini");

      let jsonText = rawText.trim();
      const jsonMatch = jsonText.match(/```(?:json)?\s*([\s\S]*?)```/);
      if (jsonMatch) jsonText = jsonMatch[1].trim();

      const parsed = JSON.parse(jsonText);

      if (parsed && typeof parsed === "object" && parsed.error === true) {
        return { error: true, message: parsed.message || "AI error" };
      }

      return parsed;
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      console.error(`Attempt ${attempt + 1} failed:`, lastError.message);
    }
  }

  return {
    error: true,
    message: `AI response malformed after ${maxRetries + 1} attempts: ${
      lastError?.message || "Unknown error"
    }`,
  };
}

function isErrorResponse(obj: unknown): obj is ErrorResponse {
  return (
    typeof obj === "object" &&
    obj !== null &&
    "error" in obj &&
    (obj as ErrorResponse).error === true
  );
}

function validateQuizResponse(data: unknown): QuizResponse | null {
  if (typeof data !== "object" || data === null) return null;

  const obj = data as Record<string, unknown>;

  if (!obj.questions || !Array.isArray(obj.questions)) return null;

  const questions: Question[] = [];
  for (let i = 0; i < obj.questions.length; i++) {
    const q = obj.questions[i] as Record<string, unknown>;

    if (
      typeof q.question !== "string" ||
      !q.question.trim() ||
      !Array.isArray(q.options) ||
      q.options.length !== 4 ||
      !q.options.every((opt) => typeof opt === "string") ||
      typeof q.correct_index !== "number" ||
      q.correct_index < 0 ||
      q.correct_index > 3 ||
      typeof q.explanation !== "string"
    ) {
      return null;
    }

    questions.push({
      id: i + 1,
      question: q.question,
      options: q.options as string[],
      correct_index: q.correct_index,
      explanation: q.explanation,
    });
  }

  return {
    topic: typeof obj.topic === "string" ? obj.topic : "",
    questions,
  };
}

function validateFeedbackResponse(data: unknown): FeedbackResponse | null {
  if (typeof data !== "object" || data === null) return null;

  const obj = data as Record<string, unknown>;
  if (
    typeof obj.summary !== "string" ||
    !Array.isArray(obj.tips) ||
    !obj.tips.every((t) => typeof t === "string")
  ) {
    return null;
  }

  return { summary: obj.summary, tips: obj.tips as string[] };
}

export async function generateQuiz(
  topic: string,
  candidateName: string
): Promise<QuizResponse | ErrorResponse> {
  const userPrompt = `Task: Generate EXACTLY 5 multiple-choice questions about "${topic}" for ${candidateName}. 
Each question must have 4 options. Mark the correct answer using correct_index (0-3). 
Provide an explanation for each question.
Make the questions engaging and tailored for ${candidateName}.

Return ONLY valid JSON:
${QUIZ_SCHEMA}`;

  const result = await callGeminiWithRetry(userPrompt, QUIZ_SYSTEM_PROMPT);

  if (isErrorResponse(result)) return result;

  const validated = validateQuizResponse(result);
  if (!validated) {
    return { error: true, message: "Invalid quiz JSON" };
  }

  validated.topic = topic;
  return validated;
}

export async function generateFeedback(
  topic: string,
  candidateName: string,
  score: number,
  total: number,
  answers: {
    questionId: number;
    userAnswer: number | null;
    correctAnswer: number;
    question: string;
  }[]
): Promise<FeedbackResponse | ErrorResponse> {
  const percentage = Math.round((score / total) * 100);

  const incorrect = answers
    .filter((a) => a.userAnswer !== a.correctAnswer)
    .map((a) => a.question)
    .slice(0, 3);

  const userPrompt = `${candidateName} completed a quiz on "${topic}" with score ${score}/${total} (${percentage}%).

${
  incorrect.length > 0
    ? `${candidateName} struggled with questions:\n${incorrect
        .map((q, i) => `${i + 1}. ${q}`)
        .join("\n")}`
    : `${candidateName} answered all questions correctly!`
}

Provide personalized feedback addressing ${candidateName} by name. Make it encouraging and constructive.

Return ONLY valid JSON:
{"summary":"string","tips":["string","string"]}`;

  const result = await callGeminiWithRetry(userPrompt, FEEDBACK_SYSTEM_PROMPT);

  if (isErrorResponse(result)) return result;

  const validated = validateFeedbackResponse(result);
  if (!validated) {
    return { error: true, message: "Invalid feedback JSON" };
  }

  return validated;
}
