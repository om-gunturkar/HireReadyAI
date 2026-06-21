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
    <div className="min-h-screen overflow-x-hidden bg-slate-50">
      <div className="w-full px-5 py-8 sm:px-8 sm:py-10 lg:px-12 xl:px-16">
      {/* <button
        onClick={() => navigate("/home")}   // change to "/" if your home route is root
        className="mb-6 px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
      >
        ← Back to Home
      </button> */}
      <h1 className="mb-8 text-center text-3xl font-bold text-slate-950">
        Choose a Resume Template
      </h1>

      <div className="grid w-full grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {templates.map((t) => (
          <div
            key={t.id}
            className="rounded-[1.75rem] border border-slate-200 bg-white/90 p-6 shadow-[0_16px_40px_rgba(15,23,42,0.08)] transition hover:border-teal-200 hover:shadow-lg"
          >
            <div className="mb-4 flex h-80 items-center justify-center overflow-hidden rounded-[1.25rem] bg-slate-100 text-slate-400">
              <img
    src={t.image}
    alt={t.name}
    className="h-full w-full bg-slate-50 object-contain"
  />
            </div>

            <h2 className="text-center text-lg font-semibold text-slate-900">{t.name}</h2>

            <button
              onClick={() => handleSelect(t.id)}
              className="primary-btn mt-4 w-full py-2.5"
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
