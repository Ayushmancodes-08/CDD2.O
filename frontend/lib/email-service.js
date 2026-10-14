import nodemailer from 'nodemailer';

/**
 * Configure Nodemailer transporter with connection pooling
 */
export function getEmailTransporter() {
  const gmailUser = (process.env.GMAIL_USER || '').trim();
  const gmailPass = (process.env.GMAIL_APP_PASSWORD || '').trim();
  if (!gmailUser || !gmailPass) return null;

  return nodemailer.createTransport({
    service: 'gmail',
    pool: true,
    maxConnections: 3,
    maxMessages: 100,
    auth: {
      user: gmailUser,
      pass: gmailPass,
    },
  });
}

/**
 * 1. Send Application Received / Under Review Email
 * Sent immediately after student submits the 3-phase form.
 */
export async function sendApplicationReceivedEmail(record) {
  try {
    const transporter = getEmailTransporter();
    if (!transporter) {
      console.warn('⚠️ GMAIL credentials not configured; skipping email.');
      return false;
    }

    const gmailUser = (process.env.GMAIL_USER || '').trim();
    const adminEmail = (process.env.ADMIN_NOTIFICATION_EMAIL || gmailUser).trim();

    const studentMailHtml = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Registration Submitted - Under Verification</title>
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #0f172a; margin: 0; padding: 24px; color: #f8fafc;">
        <div style="max-width: 620px; margin: 0 auto; background: #1e293b; border-radius: 16px; overflow: hidden; border: 1px solid rgba(255,255,255,0.1); box-shadow: 0 10px 25px rgba(0,0,0,0.5);">
          
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #1e3a8a 0%, #0369a1 100%); padding: 32px 24px; text-align: center;">
            <span style="display: inline-block; background: rgba(255,255,255,0.15); padding: 4px 12px; border-radius: 20px; font-size: 11px; font-weight: 700; letter-spacing: 0.15em; text-transform: uppercase; color: #ffffff; margin-bottom: 8px;">Notice Ref: PMEC/Startup/03/2026</span>
            <h1 style="color: #ffffff; margin: 0; font-size: 22px; font-weight: 800; letter-spacing: -0.02em;">Idea & Innovation Cell (IIC PMEC)</h1>
            <p style="color: #e0f2fe; margin: 6px 0 0 0; font-size: 14px;">Coding, Design & Development Club (CDD)</p>
          </div>

          <!-- Application ID Banner -->
          <div style="background: rgba(245, 158, 11, 0.12); border-bottom: 1px solid rgba(245, 158, 11, 0.25); padding: 18px 24px; text-align: center;">
            <p style="margin: 0 0 4px 0; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.1em; color: #fbbf24;">Application Reference ID</p>
            <p style="margin: 0; font-family: monospace; font-size: 24px; font-weight: 800; letter-spacing: 2px; color: #ffffff;">${record.regId}</p>
            <span style="display: inline-block; margin-top: 6px; padding: 3px 10px; border-radius: 12px; background: #f59e0b; color: #000000; font-size: 11px; font-weight: 700; text-transform: uppercase;">Pending Admin Verification</span>
          </div>

          <!-- Body Content -->
          <div style="padding: 28px 24px;">
            <h2 style="color: #ffffff; font-size: 18px; margin: 0 0 12px 0;">Hello ${record.name},</h2>
            <p style="color: #cbd5e1; font-size: 14px; line-height: 1.6; margin: 0 0 20px 0;">
              Thank you for submitting your membership registration for the <strong>Coding Design and Development Club (CDD)</strong> under Idea and Innovation Cell, PMEC Berhampur.
            </p>

            <div style="background: rgba(59, 130, 246, 0.1); border-left: 4px solid #3b82f6; padding: 14px 16px; border-radius: 8px; margin-bottom: 22px;">
              <p style="color: #bfdbfe; font-size: 13px; margin: 0; line-height: 1.5;">
                <strong>Next Step:</strong> Our admin team is currently verifying your bank payment receipt and UTR number (<code>${record.utr}</code>). Once approved by the admin, you will receive an official confirmation email with the exclusive link to join the official WhatsApp group!
              </p>
            </div>

            <!-- Details Summary Table -->
            <div style="background: #0f172a; border-radius: 12px; padding: 18px; margin-bottom: 24px; border: 1px solid rgba(255,255,255,0.06);">
              <h3 style="color: #38bdf8; font-size: 12px; text-transform: uppercase; letter-spacing: 0.1em; margin: 0 0 12px 0; border-bottom: 1px solid rgba(255,255,255,0.06); padding-bottom: 8px;">Submitted Profile Summary</h3>
              <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
                <tr>
                  <td style="padding: 6px 0; color: #94a3b8;">Reg ID / Roll No:</td>
                  <td style="padding: 6px 0; color: #ffffff; font-weight: 700; font-family: monospace; text-align: right;">${record.rollNo || record.registrationNumber || 'N/A'}</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; color: #94a3b8;">Academic Year:</td>
                  <td style="padding: 6px 0; color: #ffffff; font-weight: 600; text-align: right;">${record.year}</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; color: #94a3b8;">Branch:</td>
                  <td style="padding: 6px 0; color: #ffffff; font-weight: 600; text-align: right;">${record.branch}</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; color: #94a3b8;">College:</td>
                  <td style="padding: 6px 0; color: #ffffff; font-weight: 600; text-align: right;">Parala Maharaja Engineering College</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; color: #94a3b8;">Contact No (WhatsApp):</td>
                  <td style="padding: 6px 0; color: #ffffff; font-weight: 600; text-align: right;">+91 ${record.phone}</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; color: #94a3b8;">Membership Fee:</td>
                  <td style="padding: 6px 0; color: #10b981; font-weight: 700; text-align: right;">₹${record.amount}</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; color: #94a3b8;">UTR / Transaction ID:</td>
                  <td style="padding: 6px 0; color: #e2e8f0; font-family: monospace; text-align: right;">${record.utr}</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; color: #94a3b8;">Current Status:</td>
                  <td style="padding: 6px 0; color: #fbbf24; font-weight: 600; text-align: right;">Pending Admin Approval</td>
                </tr>
              </table>
            </div>

            <p style="color: #94a3b8; font-size: 12px; line-height: 1.5; margin: 0;">
              Please keep your Application Reference ID (<strong>${record.regId}</strong>) safe. For queries, contact the Idea and Innovation Cell or reply to this email.
            </p>
          </div>

          <!-- Footer -->
          <div style="background: #0b1120; padding: 18px 24px; text-align: center; border-top: 1px solid rgba(255,255,255,0.06);">
            <p style="color: #64748b; font-size: 11px; margin: 0;">
              &copy; ${new Date().getFullYear()} Idea and Innovation Cell (IIC PMEC / CDD), Parala Maharaja Engineering College, Berhampur.
            </p>
          </div>
        </div>
      </body>
    </html>
    `;

    await transporter.sendMail({
      from: `"Idea & Innovation Cell PMEC" <${gmailUser}>`,
      to: record.email,
      subject: `Registration Received: ${record.name} [ID: ${record.regId}] - Pending Admin Approval`,
      html: studentMailHtml,
    });

    return true;
  } catch (err) {
    console.error('Error sending application received email:', err);
    return false;
  }
}

/**
 * 2. Send Official Approval Confirmation Email with WhatsApp Group Link
 * Dispatched when the Admin reviews the student details & payment proof and clicks "Approve".
 */
export async function sendApprovalEmail(record, whatsappUrl) {
  try {
    const transporter = getEmailTransporter();
    if (!transporter) {
      console.warn('⚠️ GMAIL credentials not configured; skipping approval email.');
      return false;
    }

    const gmailUser = (process.env.GMAIL_USER || '').trim();
    const finalWhatsAppUrl = whatsappUrl || process.env.NEXT_PUBLIC_WHATSAPP_GROUP_URL || 'https://chat.whatsapp.com/HPR6RiuFLhxJz34y52IvjY';

    const approvalMailHtml = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Membership Approved - Welcome to CDD (IIC PMEC)</title>
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #090d16; margin: 0; padding: 24px; color: #f8fafc;">
        <div style="max-width: 620px; margin: 0 auto; background: #111827; border-radius: 16px; overflow: hidden; border: 1px solid rgba(255,255,255,0.12); box-shadow: 0 15px 35px rgba(0,0,0,0.6);">
          
          <!-- Header Banner -->
          <div style="background: linear-gradient(135deg, #059669 0%, #0284c7 100%); padding: 36px 24px; text-align: center;">
            <span style="display: inline-block; background: rgba(255,255,255,0.2); padding: 4px 14px; border-radius: 20px; font-size: 11px; font-weight: 800; letter-spacing: 0.15em; text-transform: uppercase; color: #ffffff; margin-bottom: 10px;">Membership Approved ✓</span>
            <h1 style="color: #ffffff; margin: 0; font-size: 26px; font-weight: 800; letter-spacing: -0.02em;">Welcome to CDD Club!</h1>
            <p style="color: #d1fae5; margin: 6px 0 0 0; font-size: 14px;">Idea & Innovation Cell (IIC PMEC / CDD×SIC)</p>
          </div>

          <!-- Official Member Pass Banner -->
          <div style="background: rgba(16, 185, 129, 0.12); border-bottom: 1px solid rgba(16, 185, 129, 0.25); padding: 18px 24px; text-align: center;">
            <p style="margin: 0 0 4px 0; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; color: #34d399;">Official Member Pass ID</p>
            <p style="margin: 0; font-family: monospace; font-size: 26px; font-weight: 800; letter-spacing: 2px; color: #ffffff;">${record.regId}</p>
            <p style="margin: 4px 0 0 0; font-size: 12px; color: #10b981; font-weight: 600;">Status: Verified Active Member</p>
          </div>

          <!-- Body Content -->
          <div style="padding: 30px 24px;">
            <h2 style="color: #ffffff; font-size: 19px; margin: 0 0 12px 0;">Congratulations ${record.name}!</h2>
            <p style="color: #cbd5e1; font-size: 14px; line-height: 1.6; margin: 0 0 24px 0;">
              Your payment and registration details have been <strong>successfully verified and approved</strong> by the CDD administration under Idea and Innovation Cell, Parala Maharaja Engineering College. You are now officially inducted as a member!
            </p>

            <!-- WhatsApp Group Call to Action Box -->
            <div style="background: linear-gradient(135deg, rgba(37, 211, 102, 0.18) 0%, rgba(18, 140, 126, 0.18) 100%); border: 2px solid #25d366; border-radius: 14px; padding: 24px 20px; text-align: center; margin-bottom: 26px; box-shadow: 0 8px 20px rgba(37, 211, 102, 0.2);">
              <h3 style="color: #25d366; font-size: 18px; margin: 0 0 8px 0; font-weight: 800;">Official WhatsApp Group Invite</h3>
              <p style="color: #f1f5f9; font-size: 13.5px; margin: 0 0 18px 0; line-height: 1.5;">
                Click the button below to join the exclusive official <strong>CDD Members WhatsApp Group</strong>. All official orientation notices, workshop schedules, and project assignments will be shared here.
              </p>
              <a href="${finalWhatsAppUrl}" target="_blank" style="display: inline-block; background-color: #25d366; color: #ffffff; font-weight: 800; font-size: 15px; padding: 14px 34px; border-radius: 9999px; text-decoration: none; box-shadow: 0 4px 15px rgba(37, 211, 102, 0.45); letter-spacing: 0.5px;">
                👉 Join Official WhatsApp Group Now 👈
              </a>
              <p style="color: #86efac; font-size: 11px; margin: 12px 0 0 0;">
                (Confidential: Please do not share this link with non-registered students)
              </p>
            </div>

            <!-- Details Summary Table -->
            <div style="background: #0b1120; border-radius: 12px; padding: 18px; margin-bottom: 24px; border: 1px solid rgba(255,255,255,0.08);">
              <h3 style="color: #38bdf8; font-size: 12px; text-transform: uppercase; letter-spacing: 0.1em; margin: 0 0 12px 0; border-bottom: 1px solid rgba(255,255,255,0.08); padding-bottom: 8px;">Verified Member Records</h3>
              <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
                <tr>
                  <td style="padding: 6px 0; color: #94a3b8;">Reg ID / Roll No:</td>
                  <td style="padding: 6px 0; color: #ffffff; font-weight: 700; font-family: monospace; text-align: right;">${record.rollNo || record.registrationNumber || 'N/A'}</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; color: #94a3b8;">Academic Tier:</td>
                  <td style="padding: 6px 0; color: #ffffff; font-weight: 600; text-align: right;">${record.year}</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; color: #94a3b8;">Engineering Branch:</td>
                  <td style="padding: 6px 0; color: #ffffff; font-weight: 600; text-align: right;">${record.branch}</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; color: #94a3b8;">Institution:</td>
                  <td style="padding: 6px 0; color: #ffffff; font-weight: 600; text-align: right;">Parala Maharaja Engineering College</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; color: #94a3b8;">Membership Fee Deposited:</td>
                  <td style="padding: 6px 0; color: #10b981; font-weight: 700; text-align: right;">₹${record.amount}</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; color: #94a3b8;">Verified UTR / Ref No:</td>
                  <td style="padding: 6px 0; color: #e2e8f0; font-family: monospace; text-align: right;">${record.utr}</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; color: #94a3b8;">Verification Status:</td>
                  <td style="padding: 6px 0; color: #10b981; font-weight: 700; text-align: right;">APPROVED / VERIFIED ✓</td>
                </tr>
              </table>
            </div>

            <p style="color: #94a3b8; font-size: 12px; line-height: 1.5; margin: 0;">
              Welcome aboard! Get ready to build, code, and innovate with us. If you have any questions, reach out to the Head Coordinators or reply to this email.
            </p>
          </div>

          <!-- Footer -->
          <div style="background: #070b14; padding: 20px 24px; text-align: center; border-top: 1px solid rgba(255,255,255,0.06);">
            <p style="color: #64748b; font-size: 11px; margin: 0 0 4px 0;">
              Faculty In-Charge, Coding Design and Development | Idea and Innovation Cell
            </p>
            <p style="color: #475569; font-size: 10px; margin: 0;">
              &copy; ${new Date().getFullYear()} Parala Maharaja Engineering College, Sitalapalli, Berhampur.
            </p>
          </div>
        </div>
      </body>
    </html>
    `;

    await transporter.sendMail({
      from: `"Idea & Innovation Cell PMEC" <${gmailUser}>`,
      to: record.email,
      subject: `🎉 Membership Approved: Welcome to CDD (IIC PMEC) [Pass ID: ${record.regId}]`,
      html: approvalMailHtml,
    });

    return true;
  } catch (err) {
    console.error('Error sending approval confirmation email:', err);
    return false;
  }
}
