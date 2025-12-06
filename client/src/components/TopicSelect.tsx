import { useState } from "react";

const presetTopics = [
  "Technology",
  "Science",
  "History",
  "Geography",
  "Art & Culture",
  "Literature",
];

interface TopicSelectProps {
  onSelectTopic: (topic: string, name: string) => void;
  isLoading?: boolean;
}

export default function TopicSelect({ onSelectTopic, isLoading = false }: TopicSelectProps) {
  const [name, setName] = useState("");
  const [customTopic, setCustomTopic] = useState("");
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null);

  const handleStart = () => {
    const topic = customTopic.trim() || selectedPreset;
    const candidateName = name.trim();
    if (topic && candidateName) {
      onSelectTopic(topic, candidateName);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <div className="bg-white dark:bg-gray-800 rounded-lg border p-6">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold mb-2">AI Knowledge Quiz</h1>
            <p className="text-gray-600 dark:text-gray-400">Enter your name and choose a topic to get personalized feedback</p>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Your Name</label>
              <input
                type="text"
                placeholder="Enter your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={isLoading}
                className="w-full p-3 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800"
              />
            </div>
            <div>
              <h3 className="text-sm font-medium mb-3">Popular Topics</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {presetTopics.map((topic) => {
                  const isSelected = selectedPreset === topic;
                  return (
                    <button
                      key={topic}
                      onClick={() => {
                        setSelectedPreset(topic);
                        setCustomTopic("");
                      }}
                      disabled={isLoading}
                      className={`p-3 rounded border text-sm ${
                        isSelected
                          ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                          : "border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
                      }`}
                    >
                      {topic}
                    </button>
                  );
                })}
              </div>
            </div>
            <div className="border-t pt-4">
              <input
                type="text"
                placeholder="Or enter your own topic"
                value={customTopic}
                onChange={(e) => {
                  setCustomTopic(e.target.value);
                  setSelectedPreset(null);
                }}
                disabled={isLoading}
                className="w-full p-3 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800"
              />
            </div>
            <button
              onClick={handleStart}
              disabled={!name.trim() || (!customTopic.trim() && !selectedPreset) || isLoading}
              className="w-full p-3 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "Generating..." : "Start Quiz"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
