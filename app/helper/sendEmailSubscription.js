import transporter from "../config/email.js";
import dotenv from "dotenv";
dotenv.config();

const sendEmailSubscription = async (to, subscription) => {
  try {

    const planName = subscription?.planId?.planName || subscription.planName || "Subscription Plan";
    const amount = subscription.amountPaid?.toFixed(2) || "0.00";
    const currency = (subscription.currency || "USD").toUpperCase();
    const start = new Date(subscription.startDate).toLocaleDateString("en-GB");
    const end = new Date(subscription.endDate).toLocaleDateString("en-GB");
    const paymentId = subscription.paymentId || "-";
    const createdAt = new Date(subscription.createdAt || new Date()).toLocaleString("en-GB");


    const bgGradient = "linear-gradient(135deg, #0B1F3A 0%, #0A1526 50%, #08101D 100%)";
    const cardBg = "#071122";

    let addressHtml = "<div style='color:#E6EEF8;font-size:13px;'>No address provided</div>";
    try {
      const addressObj =
        typeof subscription.address === "string"
          ? JSON.parse(subscription.address)
          : subscription.address;

      if (addressObj) {
        addressHtml = `
          <div style="font-size:13px; color:#E6EEF8; line-height:1.4;">
            ${addressObj.fullName ? `<div><strong>${escapeHtml(addressObj.fullName)}</strong></div>` : ""}
            ${addressObj.line1 ? `<div>${escapeHtml(addressObj.line1)}</div>` : ""}
            ${addressObj.street ? `<div>${escapeHtml(addressObj.street)}</div>` : ""}
            ${
              (addressObj.city || addressObj.state || addressObj.postalCode)
                ? `<div>${[addressObj.city, addressObj.state, addressObj.postalCode].filter(Boolean).join(", ")}</div>`
                : ""
            }
            ${addressObj.country ? `<div>${escapeHtml(addressObj.country)}</div>` : ""}
          </div>
        `;
      }
    } catch (e) {
      console.error("Address parse error:", e);
    }

    // --- Email HTML ---
    const html = `
      <!doctype html>
      <html>
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <title>Payment Receipt</title>
      </head>
      <body style="margin:0;padding:0;background:${bgGradient};font-family:Inter, system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
        <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
          <tr>
            <td align="center" style="padding:40px 16px;">
              <table width="600" cellpadding="0" cellspacing="0" role="presentation" style="max-width:600px;background:${cardBg};border-radius:16px;overflow:hidden;box-shadow:0 10px 30px rgba(2,6,23,0.6);">
                <tr>
                  <td style="padding:28px 32px 18px 32px; background: ${bgGradient};">
                    <table width="100%" role="presentation">
                      <tr>
                        <td style="vertical-align:middle;">
                          <h1 style="margin:0;color:#E6EEF8;font-size:20px;font-weight:700;">Payment Receipt</h1>
                          <p style="margin:6px 0 0 0;color:#D7EAF8;font-size:13px;">
                            Thank you for your purchase — here are the details of your subscription.
                          </p>
                        </td>
                        <td align="right" style="vertical-align:middle;">
                          <div style="width:56px;height:56px;border-radius:12px;background:rgba(255,255,255,0.06);display:flex;align-items:center;justify-content:center">
                            <span style="color:#F9C74F;font-weight:700">PL</span>
                          </div>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <tr>
                  <td style="padding:22px 32px 32px 32px;">
                    <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="color:#E6EEF8;">
                      <tr>
                        <td style="vertical-align:top;padding-right:20px;">
                          <h2 style="margin:0 0 8px 0;font-size:18px;color:#F8FAFC;">${escapeHtml(planName)}</h2>
                          <div style="font-size:13px;color:#CFE9FF;margin-bottom:8px;">Subscription Plan</div>

                          <div style="font-size:13px;color:#E6EEF8;margin-top:12px;">
                            <strong>Amount Paid:</strong> ${escapeHtml(amount)} ${escapeHtml(currency)}
                          </div>

                          <div style="font-size:13px;color:#E6EEF8;margin-top:8px;">
                            <strong>Period:</strong> ${escapeHtml(start)} — ${escapeHtml(end)}
                          </div>

                          <div style="font-size:13px;color:#E6EEF8;margin-top:8px;">
                            <strong>Payment ID:</strong> <span style="font-family:monospace">${escapeHtml(paymentId)}</span>
                          </div>
                        </td>

                        <td style="vertical-align:top;padding-left:20px;border-left:1px solid rgba(255,255,255,0.04);width:240px">
                          <div style="font-size:13px;color:#CFE9FF;margin-bottom:8px;">Billing Address</div>
                          ${addressHtml}
                        </td>
                      </tr>

                      <tr>
                        <td colspan="2" style="padding-top:22px;">
                          <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background:rgba(255,255,255,0.02);border-radius:10px;padding:12px;">
                            <tr>
                              <td style="font-size:14px;color:#E6EEF8;">
                                <strong>Invoice Date:</strong> ${escapeHtml(createdAt)}
                              </td>
                              <td align="right" style="font-size:16px;color:#F8FAFC;font-weight:700;">
                                ${escapeHtml(amount)} ${escapeHtml(currency)}
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>

                      <tr>
                        <td colspan="2" style="padding-top:18px;color:#CFE9FF;font-size:13px;line-height:1.5;">
                          If you have any questions about this invoice, reply to this email or contact our support.
                        </td>
                      </tr>

                      <tr>
                        <td colspan="2" style="padding-top:24px;text-align:center;">
                          <a href="${process.env.CLIENT_URL || "#"}" style="display:inline-block;padding:10px 18px;border-radius:10px;background:#22C55E;color:#071122;font-weight:700;text-decoration:none;">Go to Dashboard</a>
                        </td>
                      </tr>

                      <tr>
                        <td colspan="2" style="padding-top:22px;font-size:12px;color:#8FB6D6;opacity:0.9;">
                          <div>Placerly • 123 Your Street • Your City</div>
                          <div style="margin-top:6px;color:#7EA7C8">This email is your payment receipt — no signature is required.</div>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `;

    // Send email via transporter
    await transporter.sendMail({
      from: `"Placerly" <${process.env.EMAIL_FROM}>`,
      to,
      subject: `Payment Receipt - ${planName}`,
      html,
    });

    console.log(`✅ Subscription email sent to ${to}`);
  } catch (error) {
    console.error("❌ Error sending subscription email:", error);
  }
};

// Helper — Escape HTML
function escapeHtml(str) {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export default sendEmailSubscription;
