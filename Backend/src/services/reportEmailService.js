const nodemailer = require("nodemailer");

const buildTransport = () => {
  const smtpHost = process.env.SMTP_HOST;
  const smtpPort = Number(process.env.SMTP_PORT || 587);
  const smtpUser = process.env.SMTP_USER || process.env.EMAIL_USER;
  const smtpPass = process.env.SMTP_PASS || process.env.EMAIL_PASS;

  if (smtpHost && smtpUser && smtpPass) {
    return nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpPort === 465,
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
    });
  }

  if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
    return nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  }

  return null;
};

const formatList = (items = []) => {
  if (!items.length) return "<li>No additional notes for this section.</li>";
  return items.map((item) => `<li>${item}</li>`).join("");
};

const sanitizeFilename = (value) =>
  String(value || "report")
    .replace(/[^a-z0-9_-]+/gi, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase();

const escapePdfText = (value) =>
  String(value || "")
    .replace(/\\/g, "\\\\")
    .replace(/\(/g, "\\(")
    .replace(/\)/g, "\\)");

const buildPdfBuffer = (lines = []) => {
  const pageWidth = 595;
  const pageHeight = 842;
  const marginLeft = 50;
  const marginTop = 780;
  const lineHeight = 16;
  const maxLinesPerPage = 42;

  const pages = [];
  for (let index = 0; index < lines.length; index += maxLinesPerPage) {
    pages.push(lines.slice(index, index + maxLinesPerPage));
  }

  if (!pages.length) {
    pages.push(["Interview report"]);
  }

  const objects = [];
  objects.push("<< /Type /Catalog /Pages 2 0 R >>");

  const pageObjectIds = [];
  const contentObjectIds = [];
  let nextObjectId = 3;

  pages.forEach(() => {
    pageObjectIds.push(nextObjectId++);
    contentObjectIds.push(nextObjectId++);
  });

  const fontObjectId = nextObjectId++;
  objects.push(`<< /Type /Pages /Count ${pages.length} /Kids [${pageObjectIds.map((id) => `${id} 0 R`).join(" ")}] >>`);

  pages.forEach((pageLines, pageIndex) => {
    const textCommands = pageLines.map((line, lineIndex) => {
      const y = marginTop - lineIndex * lineHeight;
      return `BT /F1 12 Tf 1 0 0 1 ${marginLeft} ${y} Tm (${escapePdfText(line)}) Tj ET`;
    }).join("\n");

    const contentStream = `<< /Length ${Buffer.byteLength(textCommands, "utf8")} >>\nstream\n${textCommands}\nendstream`;
    objects.push(
      `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${pageWidth} ${pageHeight}] /Resources << /Font << /F1 ${fontObjectId} 0 R >> >> /Contents ${contentObjectIds[pageIndex]} 0 R >>`
    );
    objects.push(contentStream);
  });

  objects.push("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>");

  let pdf = "%PDF-1.4\n";
  const offsets = [0];

  objects.forEach((object, index) => {
    offsets.push(Buffer.byteLength(pdf, "utf8"));
    pdf += `${index + 1} 0 obj\n${object}\nendobj\n`;
  });

  const xrefStart = Buffer.byteLength(pdf, "utf8");
  pdf += `xref\n0 ${objects.length + 1}\n`;
  pdf += "0000000000 65535 f \n";
  offsets.slice(1).forEach((offset) => {
    pdf += `${String(offset).padStart(10, "0")} 00000 n \n`;
  });
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefStart}\n%%EOF`;

  return Buffer.from(pdf, "utf8");
};

exports.sendInterviewReportEmail = async ({ to, name, session }) => {
  const transporter = buildTransport();

  if (!transporter || !to || !session?.scoreData) {
    return { sent: false, reason: "missing_configuration_or_data" };
  }

  const { topic, level, mode, scoreData, summary = {}, previousAttempt = null, history = [] } = session;
  const scoreDelta = previousAttempt
    ? scoreData.totalScore - (previousAttempt.scoreData?.totalScore || 0)
    : null;

  const subject = `Hire Ready AI Interview Report - ${topic}`;
  const from = process.env.EMAIL_FROM || process.env.SMTP_USER || process.env.EMAIL_USER;
  const pdfLines = [
    `Hire Ready AI Interview Report`,
    ``,
    `Candidate: ${name || "Candidate"}`,
    `Mode: ${mode}`,
    `Topic: ${topic}`,
    `Level: ${level}`,
    `Completed: ${session.completedAt ? new Date(session.completedAt).toLocaleString("en-IN") : "N/A"}`,
    ``,
    `Overall Score: ${scoreData.totalScore}/100`,
    `Technical Score: ${scoreData.technicalScore}/100`,
    `Communication Score: ${scoreData.communicationScore}/100`,
    `Confidence Score: ${scoreData.confidenceScore}/100`,
    ``,
    scoreDelta === null
      ? "Improvement: This is your first stored attempt in this domain."
      : `Improvement: ${scoreDelta >= 0 ? "+" : ""}${scoreDelta} points compared with your previous attempt.`,
    `Attempts tracked in this domain: ${history.length}`,
    ``,
    `Strengths:`,
    ...((summary.strengths || []).length ? summary.strengths.map((item) => `- ${item}`) : ["- No strengths captured yet."]),
    ``,
    `Improvements:`,
    ...((summary.improvements || []).length ? summary.improvements.map((item) => `- ${item}`) : ["- No improvements captured yet."]),
    ``,
    `AI Summary:`,
    ...((summary.aiFeedback || []).length ? summary.aiFeedback.map((item) => `- ${item}`) : ["- No AI summary available."]),
  ];
  const pdfBuffer = buildPdfBuffer(pdfLines);
  const attachmentName = `feedback-${sanitizeFilename(topic)}-${session.sessionId || "report"}.pdf`;

  const html = `
    <div style="font-family: Arial, sans-serif; color: #0f172a; line-height: 1.6;">
      <h2 style="margin-bottom: 8px;">Interview report for ${name || "Candidate"}</h2>
      <p style="margin-top: 0;">Your ${mode} interview for <strong>${topic}</strong> at <strong>${level}</strong> level has been analyzed.</p>
      <div style="display: flex; gap: 12px; flex-wrap: wrap; margin: 20px 0;">
        <div style="padding: 14px 18px; border-radius: 12px; background: #ecfeff; border: 1px solid #99f6e4;"><strong>Overall</strong><br/>${scoreData.totalScore}/100</div>
        <div style="padding: 14px 18px; border-radius: 12px; background: #f0fdf4; border: 1px solid #86efac;"><strong>Technical</strong><br/>${scoreData.technicalScore}/100</div>
        <div style="padding: 14px 18px; border-radius: 12px; background: #fff7ed; border: 1px solid #fdba74;"><strong>Communication</strong><br/>${scoreData.communicationScore}/100</div>
        <div style="padding: 14px 18px; border-radius: 12px; background: #eff6ff; border: 1px solid #93c5fd;"><strong>Confidence</strong><br/>${scoreData.confidenceScore}/100</div>
      </div>
      <p><strong>Improvement:</strong> ${
        scoreDelta === null
          ? "This is your first stored attempt in this domain."
          : `${scoreDelta >= 0 ? "+" : ""}${scoreDelta} points compared with your previous attempt.`
      }</p>
      <p><strong>Total attempts tracked in this domain:</strong> ${history.length}</p>
      <h3>Strengths</h3>
      <ul>${formatList(summary.strengths)}</ul>
      <h3>Improvements</h3>
      <ul>${formatList(summary.improvements)}</ul>
      <h3>AI Summary</h3>
      <ul>${formatList(summary.aiFeedback)}</ul>
    </div>
  `;

  const text = [
    `Interview report for ${name || "Candidate"}`,
    `Mode: ${mode}`,
    `Topic: ${topic}`,
    `Level: ${level}`,
    `Overall Score: ${scoreData.totalScore}/100`,
    `Technical Score: ${scoreData.technicalScore}/100`,
    `Communication Score: ${scoreData.communicationScore}/100`,
    `Confidence Score: ${scoreData.confidenceScore}/100`,
    scoreDelta === null
      ? "Improvement: This is your first stored attempt in this domain."
      : `Improvement: ${scoreDelta >= 0 ? "+" : ""}${scoreDelta} points vs previous attempt.`,
    `Attempts tracked in this domain: ${history.length}`,
    "",
    "Strengths:",
    ...(summary.strengths || []),
    "",
    "Improvements:",
    ...(summary.improvements || []),
    "",
    "AI Summary:",
    ...(summary.aiFeedback || []),
  ].join("\n");

  await transporter.sendMail({
    from,
    to,
    subject,
    html,
    text,
    attachments: [
      {
        filename: attachmentName,
        content: pdfBuffer,
        contentType: "application/pdf",
      },
    ],
  });

  return { sent: true };
};
