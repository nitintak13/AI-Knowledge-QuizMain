import type { Question } from "@/context/QuizContext";

interface ResultsScreenProps {
  topic: string;
  questions: Question[];
  answers: Record<number, number | null>;
  feedback: { summary: string; tips: string[] } | null;
  onRetry: () => void;
  isLoadingFeedback?: boolean;
}

export default function ResultsScreen({
  topic,
  questions,
  answers,
  feedback,
  onRetry,
  isLoadingFeedback = false,
}: ResultsScreenProps) {
  const correctCount = questions.filter((q) => answers[q.id] === q.correct_index).length;
  const percentage = Math.round((correctCount / questions.length) * 100);

  const getScoreColor = () => {
    if (percentage >= 80) return "text-green-600";
    if (percentage >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const getScoreMessage = () => {
    if (percentage >= 80) return "Excellent work!";
    if (percentage >= 60) return "Good job!";
    if (percentage >= 40) return "Keep practicing!";
    return "Don't give up!";
  };

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-2xl mx-auto space-y-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg border p-6 text-center">
          <h2 className="text-xl font-bold mb-2">{getScoreMessage()}</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">Quiz: {topic}</p>
          <div className={`text-4xl font-bold ${getScoreColor()}`}>
            {correctCount}/{questions.length}
          </div>
          <p className="text-gray-600 dark:text-gray-400 mt-2">{percentage}% correct</p>
        </div>

        {isLoadingFeedback && (
          <div className="bg-white dark:bg-gray-800 rounded-lg border p-6 text-center">
            <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            <p className="text-gray-600 dark:text-gray-400">Generating feedback...</p>
          </div>
        )}

        {feedback && !isLoadingFeedback && (
          <div className="bg-white dark:bg-gray-800 rounded-lg border p-6">
            <h3 className="font-semibold mb-3">AI Feedback</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-3">{feedback.summary}</p>
            {feedback.tips.length > 0 && (
              <div>
                <p className="font-medium mb-2">Tips:</p>
                <ul className="list-disc list-inside space-y-1 text-sm text-gray-600 dark:text-gray-400">
                  {feedback.tips.map((tip, i) => (
                    <li key={i}>{tip}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        <div>
          <h3 className="text-lg font-semibold mb-3">Question Review</h3>
          <div className="space-y-3">
            {questions.map((question, index) => {
              const userAnswer = answers[question.id];
              const isCorrect = userAnswer === question.correct_index;
              const isSkipped = userAnswer === null || userAnswer === undefined;

              return (
                <div
                  key={question.id}
                  className={`bg-white dark:bg-gray-800 rounded-lg border p-4 border-l-4 ${
                    isSkipped
                      ? "border-l-gray-400"
                      : isCorrect
                      ? "border-l-green-500"
                      : "border-l-red-500"
                  }`}
                >
                  <div className="mb-2">
                    <span className="text-sm text-gray-500">Q{index + 1}</span>
                    <p className="font-medium mt-1">{question.question}</p>
                  </div>
                  <div className="space-y-1 text-sm mb-2">
                    {isSkipped ? (
                      <p className="text-gray-600 dark:text-gray-400">Skipped</p>
                    ) : (
                      <>
                        <p>
                          Your answer:{" "}
                          <span className={isCorrect ? "text-green-600" : "text-red-600"}>
                            {question.options[userAnswer]}
                          </span>
                          {isCorrect ? " ✓" : " ✗"}
                        </p>
                        {!isCorrect && (
                          <p className="text-green-600">
                            Correct: {question.options[question.correct_index]}
                          </p>
                        )}
                      </>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                    {question.explanation}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        <div className="pt-4">
          <button
            onClick={onRetry}
            className="w-full p-3 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Start New Quiz
          </button>
        </div>
      </div>
    </div>
  );
}
