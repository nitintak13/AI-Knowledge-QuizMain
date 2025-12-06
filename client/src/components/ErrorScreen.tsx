interface ErrorScreenProps {
  message: string;
  onRetry: () => void;
  onBack: () => void;
}

export default function ErrorScreen({ message, onRetry, onBack }: ErrorScreenProps) {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md text-center bg-white dark:bg-gray-800 rounded-lg border p-6">
        <h2 className="text-xl font-semibold mb-2 text-red-600">Error</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">{message}</p>
        <div className="flex flex-col gap-2">
          <button
            onClick={onRetry}
            className="p-3 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Try Again
          </button>
          <button
            onClick={onBack}
            className="p-3 border rounded hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            Choose Different Topic
          </button>
        </div>
      </div>
    </div>
  );
}
