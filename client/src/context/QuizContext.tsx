import { createContext, useContext, useState, useEffect, type ReactNode } from "react";

export interface Question {
  id: number;
  question: string;
  options: string[];
  correct_index: number;
  explanation: string;
}

export interface QuizData {
  topic: string;
  questions: Question[];
}

export interface QuizState {
  topic: string;
  questions: Question[];
  answers: Record<number, number | null>;
  currentQuestionIndex: number;
  isGenerating: boolean;
  isComplete: boolean;
  error: string | null;
  feedback: { summary: string; tips: string[] } | null;
}

interface QuizContextType {
  state: QuizState;
  setTopic: (topic: string) => void;
  setQuestions: (questions: Question[]) => void;
  setAnswer: (questionId: number, answerIndex: number | null) => void;
  nextQuestion: () => void;
  prevQuestion: () => void;
  goToQuestion: (index: number) => void;
  setGenerating: (generating: boolean) => void;
  setComplete: (complete: boolean) => void;
  setError: (error: string | null) => void;
  setFeedback: (feedback: { summary: string; tips: string[] } | null) => void;
  resetQuiz: () => void;
  getScore: () => { correct: number; total: number };
}

const STORAGE_KEY = "quiz-state";

const initialState: QuizState = {
  topic: "",
  questions: [],
  answers: {},
  currentQuestionIndex: 0,
  isGenerating: false,
  isComplete: false,
  error: null,
  feedback: null,
};

const QuizContext = createContext<QuizContextType | undefined>(undefined);

export function QuizProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<QuizState>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {
          return initialState;
        }
      }
    }
    return initialState;
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  const setTopic = (topic: string) => {
    setState((prev) => ({ ...prev, topic }));
  };

  const setQuestions = (questions: Question[]) => {
    setState((prev) => ({ ...prev, questions }));
  };

  const setAnswer = (questionId: number, answerIndex: number | null) => {
    setState((prev) => ({
      ...prev,
      answers: { ...prev.answers, [questionId]: answerIndex },
    }));
  };

  const nextQuestion = () => {
    setState((prev) => ({
      ...prev,
      currentQuestionIndex: Math.min(prev.currentQuestionIndex + 1, prev.questions.length - 1),
    }));
  };

  const prevQuestion = () => {
    setState((prev) => ({
      ...prev,
      currentQuestionIndex: Math.max(prev.currentQuestionIndex - 1, 0),
    }));
  };

  const goToQuestion = (index: number) => {
    setState((prev) => ({
      ...prev,
      currentQuestionIndex: Math.max(0, Math.min(index, prev.questions.length - 1)),
    }));
  };

  const setGenerating = (isGenerating: boolean) => {
    setState((prev) => ({ ...prev, isGenerating }));
  };

  const setComplete = (isComplete: boolean) => {
    setState((prev) => ({ ...prev, isComplete }));
  };

  const setError = (error: string | null) => {
    setState((prev) => ({ ...prev, error }));
  };

  const setFeedback = (feedback: { summary: string; tips: string[] } | null) => {
    setState((prev) => ({ ...prev, feedback }));
  };

  const resetQuiz = () => {
    setState(initialState);
    localStorage.removeItem(STORAGE_KEY);
  };

  const getScore = () => {
    let correct = 0;
    state.questions.forEach((q) => {
      if (state.answers[q.id] === q.correct_index) {
        correct++;
      }
    });
    return { correct, total: state.questions.length };
  };

  return (
    <QuizContext.Provider
      value={{
        state,
        setTopic,
        setQuestions,
        setAnswer,
        nextQuestion,
        prevQuestion,
        goToQuestion,
        setGenerating,
        setComplete,
        setError,
        setFeedback,
        resetQuiz,
        getScore,
      }}
    >
      {children}
    </QuizContext.Provider>
  );
}

export function useQuiz() {
  const context = useContext(QuizContext);
  if (!context) {
    throw new Error("useQuiz must be used within a QuizProvider");
  }
  return context;
}
