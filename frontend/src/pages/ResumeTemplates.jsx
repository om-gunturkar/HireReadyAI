import { useNavigate } from "react-router-dom";

export default function ResumeTemplates() {
  const navigate = useNavigate();

  const templates = [
    { id: "classic", name: "Classic" },
    { id: "modern", name: "Modern" },
    { id: "student", name: "Student" },
    { id: "tech", name: "Tech" },
    { id: "creative", name: "Creative" },
    { id: "executive", name: "Executive" },
  ];

  const handleSelect = (templateId) => {
    navigate("/resume", { state: { templateId } });
  };

  return (
    <div className="min-h-screen bg-gray-50 px-10 py-10">
      <h1 className="text-3xl font-bold text-purple-700 text-center mb-6">
        Choose a Resume Template
      </h1>

      <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {templates.map((t) => (
          <div
            key={t.id}
            className="bg-white border rounded-xl p-6 shadow hover:shadow-lg transition"
          >
            <div className="h-48 bg-gray-100 flex items-center justify-center mb-4 text-gray-400">
              {t.name} Preview
            </div>

            <h2 className="text-lg font-semibold text-center">{t.name}</h2>

            <button
              onClick={() => handleSelect(t.id)}
              className="mt-4 w-full py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
            >
              Use Template
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
