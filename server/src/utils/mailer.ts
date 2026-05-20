import sgMail from "@sendgrid/mail";

sgMail.setApiKey(process.env.SENDGRID_API_KEY!);

export const sendOTPEmail = async (
  to: string,
  code: string
) => {
  await sgMail.send({
    to,
    from: process.env.EMAIL_FROM!,
    subject: "Your LibraSys Verification Code",
    html: `
      <div style="font-family: Arial; padding: 20px;">
        <h2>LibraSys Admin Verification</h2>

        <p>Your OTP verification code is:</p>

        <div style="
          font-size: 32px;
          font-weight: bold;
          letter-spacing: 5px;
          margin: 20px 0;
        ">
          ${code}
        </div>

        <p>This code expires in 2 minutes.</p>

        <hr />

        <small>
          If you did not request this login, please ignore this email.
        </small>
      </div>
    `,
  });
};