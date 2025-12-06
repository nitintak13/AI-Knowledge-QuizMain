import ProgressBar from "./ProgressBar";
import QuestionCard from "./QuestionCard";
import type { Question } from "@/context/QuizContext";

interface QuizScreenProps {
  topic: string;
  questions: Question[];
  currentIndex: number;
  answers: Record<number, number | null>;
  onSelectAnswer: (questionId: number, answerIndex: number | null) => void;
  onPrevious: () => void;
  onNext: () => void;
  onFinish: () => void;
}

export default function QuizScreen({
  topic,
  questions,
  currentIndex,
  answers,
  onSelectAnswer,
  onPrevious,
  onNext,
  onFinish,
}: QuizScreenProps) {
  const currentQuestion = questions[currentIndex];
  const isFirst = currentIndex === 0;
  const isLast = currentIndex === questions.length - 1;

  const handleSkip = () => {
    onSelectAnswer(currentQuestion.id, null);
    if (isLast) {
      onFinish();
    } else {
      onNext();
    }
  };

  if (!currentQuestion) {
    return null;
  }

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-2xl mx-auto">
        <div className="mb-4 text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Topic: <span className="font-medium">{topic}</span>
          </p>
        </div>
        <div className="mb-6">
          <ProgressBar current={currentIndex + 1} total={questions.length} />
        </div>
        <div className="mb-6">
          <QuestionCard
            questionNumber={currentIndex + 1}
            question={currentQuestion.question}
            options={currentQuestion.options}
            selectedAnswer={answers[currentQuestion.id] ?? null}
            onSelectAnswer={(index) => onSelectAnswer(currentQuestion.id, index)}
          />
        </div>
        <div className="flex justify-between gap-2">
          <button
            onClick={onPrevious}
            disabled={isFirst}
            className="px-4 py-2 border rounded hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50"
          >
            Previous
          </button>
          <button
            onClick={handleSkip}
            className="px-4 py-2 border rounded hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            Skip
          </button>
          {isLast ? (
            <button
              onClick={onFinish}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Finish
            </button>
          ) : (
            <button
              onClick={onNext}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Next
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
