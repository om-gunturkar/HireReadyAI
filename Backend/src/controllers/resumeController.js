const Resume = require("../models/Resume");
const pdfParse = require("pdf-parse");
const Groq = require("groq-sdk");

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

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

const buildRoleSeedProfile = (fallbackData) => ({
  candidate: {
    name: fallbackData.extractedData?.name || "Your Name",
    email: fallbackData.extractedData?.email || "",
    phone: fallbackData.extractedData?.phone || "",
    linkedin: fallbackData.extractedData?.linkedin || "",
    github: fallbackData.extractedData?.github || "",
    portfolio: fallbackData.extractedData?.portfolio || "",
  },
  education: (fallbackData.education || []).map((item) => ({
    degree: item.degree || "",
    institute: item.institute || "",
    year: item.year || "",
    score: item.score || "",
  })),
  skills: (fallbackData.skills || []).slice(0, 15),
  experience: (fallbackData.experience || []).map((item) => ({
    role: item.role || "",
    company: item.company || "",
    duration: item.duration || "",
  })),
  projects: (fallbackData.projects || []).map((item) => ({
    title: item.title || "Project",
    tech: item.tech || "",
  })),
  certifications: (fallbackData.certifications || []).slice(0, 8),
  achievements: (fallbackData.achievements || []).slice(0, 8),
});

const parseJsonObject = (value = "") => {
  const trimmed = String(value || "").trim();

  if (!trimmed) {
    throw new Error("Empty AI response");
  }

  const withoutFences = trimmed.replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/\s*```$/i, "").trim();

  try {
    return JSON.parse(withoutFences);
  } catch (err) {
    const firstBrace = withoutFences.indexOf("{");
    const lastBrace = withoutFences.lastIndexOf("}");

    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
      return JSON.parse(withoutFences.slice(firstBrace, lastBrace + 1));
    }

    throw err;
  }
};

const normalizeComparableText = (value = "") =>
  String(value || "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .replace(/[^\w\s]/g, "")
    .trim();

const projectsLookUnchanged = (originalProjects = [], updatedProjects = []) => {
  if (!originalProjects.length || !updatedProjects.length) {
    return true;
  }

  return originalProjects.every((project, index) => {
    const originalPoints = normalizeComparableText(project?.points || "");
    const updatedPoints = normalizeComparableText(updatedProjects[index]?.points || "");
    return !updatedPoints || originalPoints === updatedPoints;
  });
};

const summaryLooksUnchanged = (originalSummary = "", updatedSummary = "") =>
  normalizeComparableText(originalSummary) === normalizeComparableText(updatedSummary);

const createRoleTargetedSummaryFallback = (role, fallbackData) => {
  const skills = (fallbackData.skills || []).slice(0, 5).join(", ");
  const experienceRoles = (fallbackData.experience || [])
    .map((item) => item.role)
    .filter(Boolean)
    .slice(0, 2)
    .join(" and ");

  if (skills && experienceRoles) {
    return `Role-focused candidate targeting ${role} opportunities with hands-on experience in ${experienceRoles} and practical knowledge of ${skills}. Prepared to contribute with strong fundamentals, project execution, and technology aligned to ${role}.`;
  }

  if (skills) {
    return `Role-focused candidate targeting ${role} opportunities with practical knowledge of ${skills}. Prepared to contribute with strong fundamentals, project execution, and technology aligned to ${role}.`;
  }

  return `Role-focused candidate targeting ${role} opportunities with practical project experience and foundational knowledge relevant to ${role}. Prepared to contribute with strong fundamentals and consistent execution.`;
};

const createRoleTargetedProjectFallbacks = (role, fallbackData) =>
  (fallbackData.projects || []).map((project) => ({
    ...project,
    points: [
      `Built ${project.title || "this project"} with emphasis on capabilities relevant to ${role}${project.tech ? ` using ${project.tech}` : ""}.`,
      `Applied practical development, integration, and problem-solving skills to support responsibilities aligned with ${role}.`,
    ].join("\n"),
  }));

const callGroqForRoleContent = async (role, fallbackData, extraInstruction = "") => {
  const seedProfile = buildRoleSeedProfile(fallbackData);
  const response = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    temperature: 0.9,
    messages: [
      {
        role: "user",
        content: `
You are an expert ATS resume writer helping tailor a candidate's resume for a target role.

Generate a fresh role-based resume summary and fresh project descriptions for a ${role} application.

Rules:
- Use only the extracted basic facts provided below.
- Do not copy or paraphrase the original summary or original project descriptions.
- Create a new summary that sounds like it was written for ${role}.
- Keep the summary concise, professional, ATS-friendly, and clearly role-aligned.
- Keep each project title exactly the same.
- Keep the tech stack exactly the same.
- Write new project bullet points that make each project sound relevant to ${role}.
- Base the bullets on project title, tech stack, and the candidate's overall skills and experience.
- Do not invent unsupported metrics, companies, tools, dates, or achievements.
- Prefer strong, role-aligned phrasing over generic wording.
- Return valid JSON only.
${extraInstruction}

JSON shape:
{
  "summary": "string",
  "projects": [
    { "title": "string", "tech": "string", "points": "bullet 1\\nbullet 2" }
  ]
}

Target role: ${role}

Extracted basic candidate profile:
${JSON.stringify(seedProfile, null, 2)}
        `.trim(),
      },
    ],
  });

  const aiText = response?.choices?.[0]?.message?.content || "";
  const parsed = parseJsonObject(aiText);

  const projects = Array.isArray(parsed.projects)
    ? parsed.projects.map((project, index) => ({
        title: project?.title || fallbackData.projects[index]?.title || "Project",
        tech: project?.tech || fallbackData.projects[index]?.tech || "",
        points: project?.points || fallbackData.projects[index]?.points || "",
      }))
    : fallbackData.projects || [];

  return {
    summary: String(parsed?.summary || fallbackData.summary || "").trim(),
    projects,
  };
};

const rewriteSummaryWithGroq = async (role, fallbackData) => {
  const seedProfile = buildRoleSeedProfile(fallbackData);
  const response = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    temperature: 0.9,
    messages: [
      {
        role: "user",
        content: `
You are an expert ATS resume writer.

Write a fresh resume summary for a ${role} application using only the extracted basic facts below.

Rules:
- Do not copy or paraphrase the original resume summary.
- Keep it truthful to the extracted facts.
- Make it clearly aligned to ${role}.
- Keep it concise, professional, and ATS-friendly.
- Return only the rewritten summary text.

Extracted basic candidate profile:
${JSON.stringify(seedProfile, null, 2)}
        `.trim(),
      },
    ],
  });

  return String(
    response?.choices?.[0]?.message?.content || createRoleTargetedSummaryFallback(role, fallbackData)
  )
    .replace(/^["`]+|["`]+$/g, "")
    .trim();
};

const rewriteProjectsWithGroq = async (role, fallbackData) => {
  if (!fallbackData.projects?.length) {
    return [];
  }

  const seedProfile = buildRoleSeedProfile(fallbackData);

  const rewrittenProjects = await Promise.all(
    fallbackData.projects.map(async (project) => {
      const response = await groq.chat.completions.create({
        model: "llama-3.3-70b-versatile",
        temperature: 0.9,
        messages: [
          {
            role: "user",
            content: `
You are an expert ATS resume writer.

Write fresh project bullet points for a ${role} application using only the extracted basic facts below.

Rules:
- Keep the project title exactly the same.
- Keep the tech stack exactly the same.
- Do not copy or paraphrase the original project description.
- Keep the facts truthful to the extracted data.
- Use stronger ${role}-relevant phrasing.
- Make the project sound relevant to ${role}.
- Return valid JSON only in this shape:
{"points":"bullet 1\\nbullet 2"}

Project title:
${project.title}

Project tech:
${project.tech}

Extracted basic candidate profile:
${JSON.stringify(seedProfile, null, 2)}
            `.trim(),
          },
        ],
      });

      const parsed = parseJsonObject(response?.choices?.[0]?.message?.content || "");

      return {
        ...project,
        points: String(parsed?.points || project.points || "").trim(),
      };
    })
  );

  return rewrittenProjects;
};

const enhanceRoleContent = async (role, fallbackData) => {
  if (!process.env.GROQ_API_KEY) {
    return {
      summary: createRoleTargetedSummaryFallback(role, fallbackData),
      projects: createRoleTargetedProjectFallbacks(role, fallbackData),
    };
  }

  try {
    let result = await callGroqForRoleContent(role, fallbackData);

    let summaryUnchanged = summaryLooksUnchanged(fallbackData.summary, result.summary);
    const projectsUnchanged = projectsLookUnchanged(fallbackData.projects || [], result.projects || []);

    if (summaryUnchanged || projectsUnchanged) {
      result = await callGroqForRoleContent(
        role,
        fallbackData,
        `
Additional requirement:
- Your previous rewrite was too close to the original.
- Rewrite again with noticeably different wording while preserving the same facts.
- The summary must explicitly position the candidate for ${role}.
- Each project bullet must be rephrased to sound more relevant to ${role}, not copied from the source.
        `.trim()
      );
    }

    summaryUnchanged = summaryLooksUnchanged(fallbackData.summary, result.summary);
    const projectsStillUnchanged = projectsLookUnchanged(fallbackData.projects || [], result.projects || []);

    if (summaryUnchanged) {
      result.summary = await rewriteSummaryWithGroq(role, fallbackData);
    }

    if (projectsStillUnchanged) {
      result.projects = await rewriteProjectsWithGroq(role, fallbackData);
    }

    if (!result.summary || summaryLooksUnchanged(fallbackData.summary, result.summary)) {
      result.summary = createRoleTargetedSummaryFallback(role, fallbackData);
    }

    if (!result.projects?.length || projectsLookUnchanged(fallbackData.projects || [], result.projects || [])) {
      result.projects = createRoleTargetedProjectFallbacks(role, fallbackData);
    }

    console.log("Groq role enhancement applied for:", role);
    return result;
  } catch (err) {
    console.log("Groq role enhancement failed, using fallback content:", err.message);
    return {
      summary: createRoleTargetedSummaryFallback(role, fallbackData),
      projects: createRoleTargetedProjectFallbacks(role, fallbackData),
    };
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
    const enhancedContent = await enhanceRoleContent(role, fallbackData);
    const finalData = {
      ...fallbackData,
      summary: enhancedContent.summary || fallbackData.summary,
      projects: enhancedContent.projects,
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
