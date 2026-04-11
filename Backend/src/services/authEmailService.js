const nodemailer = require("nodemailer");

const buildTransport = () => {
  const smtpHost = process.env.SMTP_HOST;
  const smtpPort = Number(process.env.SMTP_PORT || 587);
  const smtpUser = process.env.SMTP_USER || process.env.EMAIL_USER;
  const smtpPass = process.env.SMTP_PASS || process.env.EMAIL_PASS;

  console.log("Building email transporter...");
  console.log("SMTP_HOST:", smtpHost);
  console.log("SMTP_PORT:", smtpPort);
  console.log("SMTP_USER:", smtpUser);
  console.log("EMAIL_USER:", process.env.EMAIL_USER);

  if (smtpHost && smtpUser && smtpPass) {
    console.log("Using SMTP configuration");
    return nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpPort === 465,
      requireTLS: true,
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
    });
  }

  if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
    console.log("Using Gmail service");
    return nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  }

  console.log("No email configuration found");
  return null;
};

exports.sendVerificationEmail = async ({ to, name, verificationUrl, loginUrl }) => {
  console.log("=== Starting Email Send ===");
  console.log("To:", to);
  console.log("Name:", name);
  console.log("Verification URL:", verificationUrl);

  const transporter = buildTransport();

  if (!transporter) {
    console.error("Email transporter failed to build - missing configuration");
    return { sent: false, reason: "missing_transporter_configuration" };
  }

  if (!to || !verificationUrl || !loginUrl) {
    console.error("Missing required email parameters");
    return { sent: false, reason: "missing_email_data" };
  }

  const from = process.env.EMAIL_FROM || process.env.SMTP_USER || process.env.EMAIL_USER;

  try {
    console.log("Sending email from:", from);
    
    const result = await transporter.sendMail({
      from,
      to,
      subject: "Verify your Hire Ready AI account",
      html: `
        <div style="font-family: Arial, sans-serif; color: #0f172a; line-height: 1.6;">
          <h2>Welcome to Hire Ready AI, ${name || "there"}</h2>
          <p>Your account has been created. Please verify your email before logging in.</p>
          <p>
            <a href="${verificationUrl}" style="display:inline-block;padding:12px 18px;border-radius:10px;background:#7c3aed;color:#fff;text-decoration:none;font-weight:600;">Verify Email</a>
          </p>
          <p>After verification, you can log in here:</p>
          <p>
            <a href="${loginUrl}" style="display:inline-block;padding:12px 18px;border-radius:10px;background:#0f766e;color:#fff;text-decoration:none;font-weight:600;">Go To Login</a>
          </p>
          <p>This verification link will expire in 24 hours.</p>
        </div>
      `,
      text: [
        `Welcome to Hire Ready AI, ${name || "there"}.`,
        "Please verify your email before logging in.",
        `Verify: ${verificationUrl}`,
        `Login: ${loginUrl}`,
        "This verification link expires in 24 hours.",
      ].join("\n"),
    });

    console.log("Email sent successfully:", result.messageId);
    return { sent: true, messageId: result.messageId };
  } catch (error) {
    console.error("===== EMAIL SEND ERROR =====");
    console.error("Error message:", error.message);
    console.error("Error code:", error.code);
    console.error("Error response:", error.response);
    console.error("=============================");
    return { sent: false, reason: "send_failed", error: error.message };
  }
};
