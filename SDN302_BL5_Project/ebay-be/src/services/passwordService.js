import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Gửi mail reset mật khẩu
export const sendPasswordResetEmail = async (email, token) => {
  const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;

  const mailOptions = {
    from: `"Support Team" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Password Reset Request",
    html: `
      <p>You requested to reset your password.</p>
      <p>Click <a href="${resetLink}">here</a> to set a new password. This link is valid for 15 minutes.</p>
    `,
  };

  await transporter.sendMail(mailOptions);
};

// Gửi mail khi mật khẩu đã đổi thành công
export const sendPasswordChangedEmail = async (email) => {
  const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

  const mailOptions = {
    from: `"Support Team" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Your password has been changed",
    html: `
      <p>Your password was successfully changed.</p>
      <p>If you did not perform this action, please contact support immediately.</p>
    `,
  };

  await transporter.sendMail(mailOptions);
};
