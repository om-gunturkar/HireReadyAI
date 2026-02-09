import { useNavigate } from "react-router-dom";

export default function ResumeTemplates() {
  const navigate = useNavigate();

  const handleSelectTemplate = (templateId) => {
    navigate("/resume", { state: { templateId } });
  };

  const templates = [
    { id: "classic", name: "Classic" },
    { id: "modern", name: "Modern" },
    { id: "student", name: "Student" },
    { id: "tech", name: "Tech" },
    { id: "creative", name: "Creative" },
    { id: "executive", name: "Executive" },
  ];

  return (
    <div className="min-h-screen bg-gray-50 px-8 py-10">
      <h1 className="text-3xl font-bold text-purple-700 text-center mb-4">
        Choose a Resume Template
      </h1>

      <p className="text-center text-gray-600 mb-10">
        Select a template to start building your resume
      </p>

      <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {templates.map((template) => (
          <div
            key={template.id}
            className="bg-white rounded-2xl border shadow-sm hover:shadow-xl transition-all duration-300 p-5 flex flex-col"
          >
            {/* Preview */}
            <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center mb-4">
              <span className="text-gray-400 text-sm">
                {template.name} Preview
              </span>
            </div>

            {/* Title */}
            <h3 className="text-lg font-semibold text-center text-gray-800">
              {template.name}
            </h3>

            {/* Button (ONLY click handler here) */}
            <button
              type="button"
              onClick={() => handleSelectTemplate(template.id)}
              className="mt-4 mx-auto px-6 py-2 rounded-full bg-purple-600 text-white text-sm hover:bg-purple-700 transition"
            >
              Use Template →
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
