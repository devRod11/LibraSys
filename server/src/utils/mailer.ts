import sgMail from "@sendgrid/mail";

const apiKey = process.env.SENDGRID_API_KEY;
const emailFrom = process.env.EMAIL_FROM;

if (!apiKey) {
  throw new Error("SENDGRID_API_KEY is missing");
}

if (!emailFrom) {
  throw new Error("EMAIL_FROM is missing");
}

sgMail.setApiKey(apiKey);

export const sendOTPEmail = async (to: string, code: string) => {
  await sgMail.send({
    to,
    from: emailFrom,
    subject: "Your LibraSys Verification Code",
    html: `
      <div style="font-family: Arial; padding: 20px;">
        <h2>LibraSys Admin Verification</h2>

        <p>Your OTP verification code is:</p>

        <div style="font-size: 32px; font-weight: bold; letter-spacing: 5px;">
          ${code}
        </div>

        <p>This code expires in 2 minutes.</p>

        <hr />

        <small>If you did not request this login, ignore this email.</small>
      </div>
    `,
  });
};

export const sendStudentWelcomeEmail = async (
  to: string,
  studentName: string,
  studentId: string,
  password: string
) => {
  await sgMail.send({
    to,
    from: emailFrom,

    subject: "Welcome to LibraSys",

    html: `
      <div style="font-family: Arial; padding: 20px;">

        <h2>Welcome to LibraSys 📚</h2>

        <p>Hello <strong>${studentName}</strong>,</p>

        <p>
          Your LibraSys student account has been created successfully.
        </p>

        <div
          style="
            background:#f5f5f5;
            padding:15px;
            border-radius:8px;
            margin-top:15px;
          "
        >

          <p>
            <strong>Student ID:</strong>
            ${studentId}
          </p>

          <p>
            <strong>Email:</strong>
            ${to}
          </p>

          <p>
            <strong>Password:</strong>
            ${password}
          </p>

        </div>

        <p style="margin-top:20px;">
          You may now log in to the LibraSys system.
        </p>

        <hr />

        <small>
          LibraSys Library Management System
        </small>

      </div>
    `,
  });
};
