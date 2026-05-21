"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendOTPEmail = void 0;
const mail_1 = __importDefault(require("@sendgrid/mail"));
mail_1.default.setApiKey(process.env.SENDGRID_API_KEY);
const sendOTPEmail = async (to, code) => {
    await mail_1.default.send({
        to,
        from: process.env.EMAIL_FROM,
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
exports.sendOTPEmail = sendOTPEmail;
