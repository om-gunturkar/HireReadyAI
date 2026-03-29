const Resume = require("../models/Resume");
const pdfParse = require("pdf-parse");
const fetch = require("node-fetch");

const SECTION_ALIASES = {
  summary: ["summary", "professional summary", "profile", "objective", "career objective"],
  education: ["education", "academic background", "academic details"],
  skills: ["skills", "technical skills", "key skills", "core competencies", "competencies"],
  experience: ["experience", "work experience", "professional experience", "employment history"],
  internships: ["internships", "internship", "training"],
  projects: ["projects", "academic projects", "personal projects", "relevant projects"],
  certifications: ["certifications", "certificates", "licenses", "certification & achievements"],
  achievements: ["achievements", "awards", "accomplishments"],
  activities: ["extra-curricular activities", "extracurricular activities", "activities"],
};

const SECTION_ORDER = [
  "summary",
  "education",
  "skills",
  "experience",
  "internships",
  "projects",
  "certifications",
  "achievements",
  "activities",
];

const normalizeLine = (line = "") =>
  line
    .replace(/\u0000/g, " ")
    .replace(/\f/g, " ")
    .replace(/\t/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const getRawLines = (text = "") =>
  text
    .replace(/\r/g, "\n")
    .split("\n")
    .map(normalizeLine)
    .filter(Boolean);

const getCleanLines = (text = "") => {
  const rawLines = getRawLines(text);

  const merged = [];

  rawLines.forEach((line) => {
    const previous = merged[merged.length - 1];
    const isSection = detectSection(line);
    const startsBullet = /^[\u2022\-*]/.test(line);
    const looksContinuation =
      previous &&
      !detectSection(previous) &&
      !/[:.!?]$/.test(previous) &&
      !startsBullet &&
      !isSection &&
      (/^[a-z0-9(]/.test(line) || /^(API|LLM|rd|th|st|nd)\b/i.test(line));

    if (looksContinuation) {
      merged[merged.length - 1] = `${previous} ${line}`.replace(/\s+/g, " ").trim();
      return;
    }

    merged.push(line);
  });

  return merged;
};

const normalizeResumeText = (text = "") => getCleanLines(text).join("\n");
const getPreviewText = (text = "") => getRawLines(text).join("\n");

const detectSection = (line = "") => {
  const normalized = line.toLowerCase().replace(/[:\-]+$/, "").trim();
  return SECTION_ORDER.find((key) =>
    SECTION_ALIASES[key].some((alias) => alias === normalized)
  );
};

const extractSections = (text = "") => {
  const lines = getCleanLines(text);
  const sections = {};
  let currentSection = "header";

  lines.forEach((line) => {
    const matchedKey = detectSection(line);

    if (matchedKey) {
      currentSection = matchedKey;
      if (!sections[currentSection]) sections[currentSection] = [];
      return;
    }

    if (!sections[currentSection]) sections[currentSection] = [];
    sections[currentSection].push(line);
  });

  return sections;
};

const extractEmail = (text = "") =>
  text.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i)?.[0] || "";

const extractPhone = (text = "") =>
  text.match(/(?:\+?\d{1,3}[\s-]?)?(?:\(?\d{3,5}\)?[\s-]?)?\d{3,5}[\s-]?\d{4,}/)?.[0] || "";

const extractUrl = (text = "", keyword = "") => {
  const token = text
    .split(/\s+/)
    .find((value) => value.toLowerCase().includes(keyword) && /https?:|www\.|linkedin\.|github\.|portfolio/i.test(value));

  return token?.replace(/[|,)]/g, "") || "";
};

const extractContactLine = (lines = []) =>
  lines.find((line) => /@/.test(line) || /linkedin|github|portfolio/i.test(line) || /\+?\d[\d\s-]{8,}/.test(line)) || "";

const extractName = (lines = []) => {
  for (const line of lines.slice(0, 10)) {
    if (
      line &&
      line.length < 60 &&
      !/@/.test(line) &&
      !/\d{5,}/.test(line) &&
      !SECTION_ORDER.some((key) => SECTION_ALIASES[key].includes(line.toLowerCase())) &&
      /^[A-Za-z][A-Za-z\s.'-]+$/.test(line)
    ) {
      return line.trim();
    }
  }

  return "Your Name";
};

const cleanBulletLine = (line = "") =>
  line
    .replace(/^[\u2022\-*]\s*/, "")
    .replace(/\s+/g, " ")
    .trim();

const toBulletList = (lines = []) =>
  lines
    .flatMap((line) => line.split(/\u2022/))
    .map(cleanBulletLine)
    .filter((line) => line.length > 2);

const groupEducation = (lines = []) =>
  lines
    .map(cleanBulletLine)
    .filter(Boolean)
    .map((line) => {
      const yearMatch = line.match(/\b(?:\d{4}\s*[-–]\s*(?:Present|\d{4})|(?:June\s+)?\d{4})\b/i);
      const scoreMatch = line.match(/(?:cgpa|gpa|percentage|score)[:\s-]*([0-9.]+%?)/i);

      let degree = line;
      let institute = "";

      if (line.includes(" - ")) {
        const [left, ...rest] = line.split(" - ");
        degree = left.trim();
        institute = rest.join(" - ").trim();
      } else if (line.includes(" – ")) {
        const [left, ...rest] = line.split(" – ");
        degree = left.trim();
        institute = rest.join(" – ").trim();
      }

      if (scoreMatch) {
        institute = institute.replace(scoreMatch[0], "").replace(/\|\s*$/, "").trim();
      }

      if (yearMatch) {
        institute = institute.replace(yearMatch[0], "").replace(/\|\s*$/, "").trim();
      }

      return {
        degree,
        institute,
        score: scoreMatch?.[1] || "",
        year: yearMatch?.[0] || "",
      };
    })
    .slice(0, 5);

const groupExperience = (lines = []) => {
  const items = [];
  const cleaned = lines.map((line) => line.trim()).filter(Boolean);
  let current = null;

  cleaned.forEach((line) => {
    const bulletLike = /^[\u2022\-*]/.test(line);
    const compactLine = cleanBulletLine(line);

    if (!bulletLike && compactLine.length > 0 && compactLine.length < 140) {
      if (current) items.push(current);

      const durationMatch = compactLine.match(
        /\b(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*,?\s+\d{4}(?:\s*[-–]\s*(?:Present|(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*,?\s+\d{4}))?/i
      );
      const withoutDuration = durationMatch ? compactLine.replace(durationMatch[0], "").trim() : compactLine;
      const parts = withoutDuration.split(/\s+\|\s+| at | - /i);

      current = {
        role: parts[0] || compactLine,
        company: parts[1] || "",
        duration: durationMatch?.[0] || "",
        points: "",
      };
      return;
    }

    if (!current) {
      current = {
        role: "Experience",
        company: "",
        duration: "",
        points: "",
      };
    }

    current.points = current.points ? `${current.points}\n${compactLine}` : compactLine;
  });

  if (current) items.push(current);

  return items
    .map((item) => ({ ...item, points: item.points.trim() }))
    .filter((item) => item.role || item.points)
    .slice(0, 5);
};

const groupProjects = (lines = []) => {
  const items = [];
  const cleaned = lines.map((line) => line.trim()).filter(Boolean);
  let current = null;

  cleaned.forEach((line) => {
    const bulletLike = /^[\u2022\-*]/.test(line);
    const compactLine = cleanBulletLine(line);

    if (!bulletLike && compactLine.length > 0 && compactLine.length < 160) {
      if (current) items.push(current);

      const [titlePart, ...techParts] = compactLine.split(/\s*\|\s*/);
      current = {
        title: titlePart || compactLine,
        tech: techParts.join(" | "),
        points: "",
      };
      return;
    }

    if (!current) {
      current = {
        title: "Project",
        tech: "",
        points: "",
      };
    }

    current.points = current.points ? `${current.points}\n${compactLine}` : compactLine;
  });

  if (current) items.push(current);

  return items
    .map((item) => ({ ...item, points: item.points.trim() }))
    .filter((item) => item.title || item.points)
    .slice(0, 6);
};

const buildFallbackResumeData = (role, resumeText) => {
  const normalizedText = normalizeResumeText(resumeText);
  const lines = getRawLines(resumeText);
  const sections = extractSections(resumeText);
  const topLines = lines.slice(0, 10);
  const contactLine = extractContactLine(lines);
  const name = extractName([...topLines, ...(sections.summary || [])]);

  return {
    extractedData: {
      name,
      email: extractEmail(resumeText) || "email@example.com",
      phone: extractPhone(resumeText),
      linkedin: extractUrl(resumeText, "linkedin"),
      github: extractUrl(resumeText, "github"),
      portfolio: extractUrl(resumeText, "portfolio"),
      contactLine,
    },
    summary:
      (sections.summary || [])
        .filter((line) => line !== contactLine && line !== name)
        .join(" ")
        .trim() || `Targeting ${role} opportunities with experience aligned to the uploaded resume.`,
    education: groupEducation(sections.education || []),
    skills: toBulletList(sections.skills || []).slice(0, 20),
    experience: groupExperience([...(sections.experience || []), ...(sections.internships || [])]),
    projects: groupProjects(sections.projects || []),
    certifications: toBulletList(sections.certifications || []).slice(0, 10),
    achievements: toBulletList(sections.achievements || []).slice(0, 10),
    activities: toBulletList(sections.activities || []).slice(0, 10),
    rawText: normalizedText,
  };
};

const enhanceProjectsForRole = async (role, fallbackData) => {
  if (!process.env.OPENROUTER_API_KEY || !fallbackData.projects?.length) {
    return fallbackData.projects || [];
  }

  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "openai/gpt-4o-mini",
        response_format: { type: "json_object" },
        messages: [
          {
            role: "user",
            content: `
You are an expert ATS resume writer.

Rewrite only the project descriptions for a ${role} application.

Rules:
- Keep all basic candidate details unchanged.
- Keep each project title exactly the same.
- Keep the tech stack the same unless it already exists in the source.
- Improve only the bullet text to better match the target role.
- Do not invent metrics, tools, dates, or features not supported by the source.
- Return valid JSON only.

JSON shape:
{
  "projects": [
    { "title": "string", "tech": "string", "points": "bullet 1\\nbullet 2" }
  ]
}

Target role: ${role}

Projects from the full resume:
${JSON.stringify(fallbackData.projects, null, 2)}

Full parsed resume text:
${fallbackData.rawText}
            `.trim(),
          },
        ],
      }),
    });

    const data = await response.json();
    const aiText = data?.choices?.[0]?.message?.content || "";
    const parsed = JSON.parse(aiText);

    if (!Array.isArray(parsed.projects)) {
      return fallbackData.projects || [];
    }

    return parsed.projects.map((project, index) => ({
      title: project?.title || fallbackData.projects[index]?.title || "Project",
      tech: project?.tech || fallbackData.projects[index]?.tech || "",
      points: project?.points || fallbackData.projects[index]?.points || "",
    }));
  } catch (err) {
    console.log("Project enhancement failed, using original projects:", err.message);
    return fallbackData.projects || [];
  }
};

/* =========================
   SAVE RESUME (DB)
========================= */
exports.saveResume = async (req, res) => {
  try {
    const resume = await Resume.findOneAndUpdate(
      { userId: req.user.id },
      { ...req.body, userId: req.user.id },
      { new: true, upsert: true }
    );

    res.status(200).json({ success: true, resume });
  } catch (err) {
    console.error("Save Resume Error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

/* =========================
   GET RESUME (DB)
========================= */
exports.getResume = async (req, res) => {
  try {
    const resume = await Resume.findOne({ userId: req.user.id });
    res.status(200).json(resume);
  } catch (err) {
    console.error("Get Resume Error:", err);
    res.status(500).json({ message: err.message });
  }
};

/* =========================
   PARSE RESUME (PDF Upload)
========================= */
exports.parseResume = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: "No file uploaded",
      });
    }

    const pdfData = await pdfParse(req.file.buffer);
    const text = normalizeResumeText(pdfData.text || "");
    const preview = getPreviewText(pdfData.text || "");

    console.log("FINAL PARSED TEXT:\n", text.slice(0, 2500));

    return res.json({
      success: true,
      text,
      preview,
    });
  } catch (err) {
    console.error("Parse Error:", err);
    return res.status(500).json({
      success: false,
      error: "Resume parsing failed",
    });
  }
};

/* =========================
   ROLE-BASED GENERATION
========================= */
exports.generateRoleResume = async (req, res) => {
  try {
    const { role, resumeText } = req.body;

    if (!role || !resumeText) {
      return res.status(400).json({
        success: false,
        error: "Missing data",
      });
    }

    const fallbackData = buildFallbackResumeData(role, resumeText);
    const enhancedProjects = await enhanceProjectsForRole(role, fallbackData);
    const finalData = {
      ...fallbackData,
      projects: enhancedProjects,
    };

    return res.json({
      success: true,
      data: finalData,
    });
  } catch (err) {
    console.error("FINAL ERROR:", err);
    return res.status(500).json({
      success: false,
      error: "Generation failed",
    });
  }
};
