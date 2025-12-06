interface LoadingScreenProps {
  topic: string;
}

export default function LoadingScreen({ topic }: LoadingScreenProps) {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="text-center">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <h2 className="text-xl font-semibold mb-2" data-testid="text-generating">
          Generating Questions
        </h2>
        <p className="text-gray-600 dark:text-gray-400" data-testid="text-topic">
          Creating quiz about <span className="font-medium">{topic}</span>
        </p>
      </div>
    </div>
  );
}
