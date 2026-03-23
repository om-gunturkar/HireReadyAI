import { useNavigate } from "react-router-dom";

export default function CreateResume() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-purple-50 to-purple-100 flex flex-col items-center justify-center px-6">

      <h1 className="text-4xl font-bold text-purple-800 mb-4">
        Create Your Resume
      </h1>

      <p className="text-gray-600 mb-12 text-center max-w-xl">
        Choose how you want to build your resume
      </p>

      <div className="flex flex-col md:flex-row gap-10">

        {/* ROLE BASED */}
        <div
          onClick={() => navigate("/role-based-resume")}
          className="cursor-pointer w-80 rounded-3xl p-10 bg-white shadow-lg hover:shadow-xl transition"
        >
          <div className="text-5xl mb-6">🎯</div>

          <h3 className="text-2xl font-semibold text-purple-800 mb-2">
            Role-Based Resume
          </h3>

          <p className="text-gray-600 text-sm">
            Upload resume → Generate tailored resume
          </p>

          <button className="mt-6 px-6 py-2 rounded-full bg-purple-600 text-white">
            Continue →
          </button>
        </div>

        {/* TEMPLATE */}
        <div
          onClick={() => navigate("/resume-templates")}
          className="cursor-pointer w-80 rounded-3xl p-10 bg-white shadow-lg hover:shadow-xl transition"
        >
          <div className="text-5xl mb-6">🎨</div>

          <h3 className="text-2xl font-semibold text-purple-800 mb-2">
            Template Resume
          </h3>

          <p className="text-gray-600 text-sm">
            Choose template and edit manually
          </p>

          <button className="mt-6 px-6 py-2 rounded-full bg-purple-600 text-white">
            Browse →
          </button>
        </div>

      </div>
    </div>
  );
}