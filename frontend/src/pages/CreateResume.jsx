import { useNavigate } from "react-router-dom";

export default function CreateResume() {
  const navigate = useNavigate();

  return (
    <div className="app-shell min-h-screen">
      <div className="page-frame flex min-h-[calc(100dvh-3rem)] flex-col justify-center py-10 sm:py-14">
        <h1 className="text-center text-3xl font-bold text-slate-900 sm:text-4xl">Create your resume</h1>

        <p className="mx-auto mb-10 mt-3 max-w-2xl text-center text-sm text-slate-600 sm:text-base">
          Choose how you want to build—both paths stay inside Hire Ready AI and work with resume-based interviews.
        </p>

        <div className="grid w-full gap-6 sm:gap-8 md:grid-cols-2 lg:gap-10">
          <button
            type="button"
            onClick={() => navigate("/role-based-resume")}
            className="flex w-full cursor-pointer flex-col rounded-[1.75rem] border border-slate-200 bg-white/90 p-8 text-left shadow-[0_16px_40px_rgba(15,23,42,0.08)] transition hover:border-teal-200 hover:shadow-lg sm:p-10"
          >
            <span className="text-4xl" aria-hidden>
              🎯
            </span>
            <h2 className="mt-5 text-xl font-semibold text-slate-900 sm:text-2xl">Role-based resume</h2>
            <p className="mt-2 text-sm leading-7 text-slate-600">Upload a PDF, parse it, and generate a version tailored to your target role.</p>
            <span className="primary-btn mt-8 inline-flex w-fit px-6 py-2.5 text-sm">Continue</span>
          </button>

          <button
            type="button"
            onClick={() => navigate("/resume-templates")}
            className="flex w-full cursor-pointer flex-col rounded-[1.75rem] border border-slate-200 bg-white/90 p-8 text-left shadow-[0_16px_40px_rgba(15,23,42,0.08)] transition hover:border-teal-200 hover:shadow-lg sm:p-10"
          >
            <span className="text-4xl" aria-hidden>
              🎨
            </span>
            <h2 className="mt-5 text-xl font-semibold text-slate-900 sm:text-2xl">Resume templates</h2>
            <p className="mt-2 text-sm leading-7 text-slate-600">Pick Classic, Tech, or Creative, then edit and export from the builder.</p>
            <span className="primary-btn mt-8 inline-flex w-fit px-6 py-2.5 text-sm">Browse templates</span>
          </button>
        </div>
      </div>
    </div>
  );
}
