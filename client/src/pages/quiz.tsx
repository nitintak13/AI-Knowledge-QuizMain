import { useState, useCallback, useEffect } from "react";
import TopicSelect from "@/components/TopicSelect";
import LoadingScreen from "@/components/LoadingScreen";
import QuizScreen from "@/components/QuizScreen";
import ResultsScreen from "@/components/ResultsScreen";
import ErrorScreen from "@/components/ErrorScreen";
import { generateQuiz, generateFeedback } from "@/lib/api";
import type { Question } from "@/context/QuizContext";

type Screen = "topic" | "loading" | "quiz" | "results" | "error";

const STORAGE_KEY = "quiz-state";

interface QuizState {
  candidateName: string;
  topic: string;
  questions: Question[];
  answers: Record<number, number | null>;
  currentIndex: number;
  feedback: { summary: string; tips: string[] } | null;
}

const initialState: QuizState = {
  candidateName: "",
  topic: "",
  questions: [],
  answers: {},
  currentIndex: 0,
  feedback: null,
};

export default function QuizPage() {
  const [screen, setScreen] = useState<Screen>("topic");
  const [state, setState] = useState<QuizState>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          return parsed;
        } catch {
          return initialState;
        }
      }
    }
    return initialState;
  });
  const [isLoadingFeedback, setIsLoadingFeedback] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  useEffect(() => {
    if (state.questions.length > 0 && screen === "topic") {
      const hasAnswers = Object.keys(state.answers).length > 0;
      if (hasAnswers) {
        setScreen("quiz");
      }
    }
  }, []);

  const handleSelectTopic = useCallback(async (topic: string, name: string) => {
    setState((prev) => ({ ...prev, topic, candidateName: name }));
    setScreen("loading");
    setError(null);

    const result = await generateQuiz(topic, name);

    if ("error" in result && result.error) {
      setError(result.message);
      setScreen("error");
      return;
    }

    const quizResult = result as { topic: string; questions: Question[] };
    setState((prev) => ({
      ...prev,
      topic: quizResult.topic,
      questions: quizResult.questions,
      answers: {},
      currentIndex: 0,
      feedback: null,
    }));
    setScreen("quiz");
  }, []);

  const handleSelectAnswer = useCallback((questionId: number, answerIndex: number | null) => {
    setState((prev) => ({
      ...prev,
      answers: { ...prev.answers, [questionId]: answerIndex },
    }));
  }, []);

  const handlePrevious = useCallback(() => {
    setState((prev) => ({
      ...prev,
      currentIndex: Math.max(0, prev.currentIndex - 1),
    }));
  }, []);

  const handleNext = useCallback(() => {
    setState((prev) => ({
      ...prev,
      currentIndex: Math.min(prev.questions.length - 1, prev.currentIndex + 1),
    }));
  }, []);

  const handleFinish = useCallback(async () => {
    setScreen("results");
    setIsLoadingFeedback(true);

    const correctCount = state.questions.filter(
      (q) => state.answers[q.id] === q.correct_index
    ).length;

    const answersForFeedback = state.questions.map((q) => ({
      questionId: q.id,
      userAnswer: state.answers[q.id] ?? null,
      correctAnswer: q.correct_index,
      question: q.question,
    }));

    const result = await generateFeedback(
      state.topic,
      state.candidateName,
      correctCount,
      state.questions.length,
      answersForFeedback
    );

    if ("error" in result && result.error) {
      console.error("Feedback generation failed:", result.message);
      setState((prev) => ({
        ...prev,
        feedback: {
          summary: "We couldn't generate personalized feedback at this time.",
          tips: ["Review the explanations for each question to learn more."],
        },
      }));
    } else {
      const feedbackResult = result as { summary: string; tips: string[] };
      setState((prev) => ({
        ...prev,
        feedback: feedbackResult,
      }));
    }

    setIsLoadingFeedback(false);
  }, [state.questions, state.answers, state.topic]);

  const handleRetry = useCallback(() => {
    setState(initialState);
    localStorage.removeItem(STORAGE_KEY);
    setScreen("topic");
    setError(null);
  }, []);

  const handleErrorRetry = useCallback(() => {
    if (state.topic) {
      handleSelectTopic(state.topic);
    }
  }, [state.topic, handleSelectTopic]);

  const handleErrorBack = useCallback(() => {
    setState(initialState);
    setScreen("topic");
    setError(null);
  }, []);

  switch (screen) {
    case "topic":
      return <TopicSelect onSelectTopic={handleSelectTopic} />;
    case "loading":
      return <LoadingScreen topic={state.topic} />;
    case "quiz":
      return (
        <QuizScreen
          topic={state.topic}
          questions={state.questions}
          currentIndex={state.currentIndex}
          answers={state.answers}
          onSelectAnswer={handleSelectAnswer}
          onPrevious={handlePrevious}
          onNext={handleNext}
          onFinish={handleFinish}
        />
      );
    case "results":
      return (
        <ResultsScreen
          topic={state.topic}
          questions={state.questions}
          answers={state.answers}
          feedback={state.feedback}
          onRetry={handleRetry}
          isLoadingFeedback={isLoadingFeedback}
        />
      );
    case "error":
      return (
        <ErrorScreen
          message={error || "An unexpected error occurred"}
          onRetry={handleErrorRetry}
          onBack={handleErrorBack}
        />
      );
    default:
      return <TopicSelect onSelectTopic={handleSelectTopic} />;
  }
}
