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
    <div className="app-shell min-h-screen">
      <div className="page-frame py-8 sm:py-10">
      {/* <button
        onClick={() => navigate("/home")}   // change to "/" if your home route is root
        className="mb-6 px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
      >
        ← Back to Home
      </button> */}
      <h1 className="mb-8 text-center text-3xl font-bold text-purple-700">
        Choose a Resume Template
      </h1>

      <div className="grid w-full grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
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
    </div>
  );
}
