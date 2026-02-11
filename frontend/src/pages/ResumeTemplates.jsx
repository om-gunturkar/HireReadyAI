import { useNavigate } from "react-router-dom";
import classicImg from "../assets/templates/classic.jpg";
import techImg from "../assets/templates/tech.jpg";
import creativeImg from "../assets/templates/creative.jpg";


export default function ResumeTemplates() {
  const navigate = useNavigate();

  const templates = [
  { id: "classic", name: "Classic", image: classicImg },
  { id: "tech", name: "Tech", image: techImg },
  { id: "creative", name: "Creative", image: creativeImg },
];


  const handleSelect = (templateId) => {
    navigate("/resume", { state: { templateId } });
  };

  return (
    <div className="min-h-screen bg-gray-50 px-10 py-10">
      {/* <button
        onClick={() => navigate("/home")}   // change to "/" if your home route is root
        className="mb-6 px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
      >
        ← Back to Home
      </button> */}
      <h1 className="text-3xl font-bold text-purple-700 text-center mb-6">
        Choose a Resume Template
      </h1>
      <br></br>

      <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {templates.map((t) => (
          <div
            key={t.id}
            className="bg-white border rounded-xl p-6 shadow hover:shadow-lg transition"
          >
            <div className="h-80 bg-gray-100 flex items-center justify-center mb-4 text-gray-400">
              <img
    src={t.image}
    alt={t.name}
    className="w-full h-full object-contain bg-gray-50"
  />
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
