interface QuestionCardProps {
  questionNumber: number;
  question: string;
  options: string[];
  selectedAnswer: number | null;
  onSelectAnswer: (index: number) => void;
}

const optionLabels = ["A", "B", "C", "D"];

export default function QuestionCard({
  questionNumber,
  question,
  options,
  selectedAnswer,
  onSelectAnswer,
}: QuestionCardProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border p-6">
      <div className="mb-4">
        <span className="text-sm text-gray-500">Question {questionNumber}</span>
        <p className="text-lg font-medium mt-2">{question}</p>
      </div>
      <div className="space-y-2">
        {options.map((option, index) => {
          const isSelected = selectedAnswer === index;
          return (
            <button
              key={index}
              onClick={() => onSelectAnswer(index)}
              className={`w-full p-3 rounded border text-left ${
                isSelected
                  ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                  : "border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
              }`}
            >
              <span className="font-medium mr-2">{optionLabels[index]}.</span>
              {option}
            </button>
          );
        })}
      </div>
    </div>
  );
}
