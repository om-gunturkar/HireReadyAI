import { useLocation } from "react-router-dom";

export default function InterviewFeedback() {
  const { state } = useLocation();
  const { answers, role } = state || {};

  return (
    <div className="min-h-screen bg-purple-50 flex justify-center items-center">
      <div className="bg-white p-8 rounded-xl shadow-lg max-w-xl w-full">
        <h2 className="text-2xl font-semibold text-purple-700 mb-4">
          Interview Feedback ({role})
        </h2>

        <p className="mb-4 text-gray-600">
          Total Answers: {answers?.length}
        </p>

        <ul className="list-disc ml-6 text-gray-700">
          {answers?.map((a, i) => (
            <li key={i}>{a}</li>
          ))}
        </ul>

        <p className="mt-6 text-sm text-gray-500">
          * AI-based feedback logic can be extended further
        </p>
      </div>
    </div>
  );
}
