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

exports.sendVerificationEmail = async ({ to, name, verificationUrl, loginUrl }) => {
  const transporter = buildTransport();

  if (!transporter || !to || !verificationUrl || !loginUrl) {
    return { sent: false, reason: "missing_configuration_or_data" };
  }

  const from = process.env.EMAIL_FROM || process.env.SMTP_USER || process.env.EMAIL_USER;

  await transporter.sendMail({
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

  return { sent: true };
};
