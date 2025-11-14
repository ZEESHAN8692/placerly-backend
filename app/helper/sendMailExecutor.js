import transporter from "../config/email.js";
import dotenv from "dotenv";
dotenv.config();

const sendMailExecutor = ({ to, subject, owner, executor, inviteLink }) => {
  return transporter.sendMail({
    from: `"Placerly" <${process.env.EMAIL_FROM}>`,
    to,
    subject,
    html: `
      <div style="background: linear-gradient(135deg, #0B1F3A, #0A1526, #08101D); padding: 30px; border-radius: 12px; color: #fff;">
        <div style="background: rgba(255,255,255,0.08); padding: 25px; border-radius: 10px;">
          
          <h2>Hello ${executor.name},</h2>

          <p>
            <strong>${owner.name}</strong> has added you as their
            <strong>Executor</strong> on <strong>Placerly</strong>.
          </p>

          <a href="${inviteLink}" 
             style="display:inline-block;margin-top:15px;padding:12px 22px;background:#4EC6FF;color:#000;text-decoration:none;border-radius:6px;font-weight:bold;">
            Accept Invitation
          </a>

          <p>This link will expire in <strong>7 days</strong>.</p>

          <p>Thank you,<br>Placerly Team</p>
        </div>
      </div>
    `,
  });
};

export const sendMailAcceptExecutor = ({ to, subject, owner, executor }) => {
  return transporter.sendMail({
    from: `"Placerly" <${process.env.EMAIL_FROM}>`,
    to,
    subject,
    html: `
      <div style="background: linear-gradient(135deg, #0B1F3A, #0A1526, #08101D); padding: 30px; border-radius: 12px; color: #fff;">
        <div style="background: rgba(255,255,255,0.08); padding: 25px; border-radius: 10px;">
          
          <h2>Hello ${executor.name},</h2>
          
          <p>
            <strong>${owner.name}</strong> and Email <strong>${executor.email}</strong> have accepted your
            <strong>Executor</strong> invitation on <strong>Placerly</strong>.
          </p>

          <p>Thank you,<br>Placerly Team</p>
        </div>
      </div>
    `,
  });
};


export const ExecutorHasNotAccount = ({ to, subject, executor }) => {
  return transporter.sendMail({
    from: `"Placerly" <${process.env.EMAIL_FROM}>`,
    to,
    subject,
    html: `
      <div style="background: linear-gradient(135deg, #0B1F3A, #0A1526, #08101D); padding: 30px; border-radius: 12px; color: #fff;">
        <div style="background: rgba(255,255,255,0.08); padding: 25px; border-radius: 10px;">
          
          <h2>Hello ${executor.name},</h2>
          
          <p>
            Please use the following email and password to login to your account on <strong>Placerly</strong>:
            <br>
            Email: <strong>${executor.email}</strong>
            <br>
            Password: <strong>${executor.password}</strong>
          </p>
          
          <p>Thank you,<br>Placerly Team</p>
        </div>
      </div>
    `,
  });
};

export default sendMailExecutor;