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
 * 1. Send Immediate Application Received Email ("We got your registration!! We are verifying everything")
 * Sent immediately after student submits the registration form.
 */
export async function sendApplicationReceivedEmail(record) {
  try {
    const transporter = getEmailTransporter();
    if (!transporter) {
      console.warn('⚠️ GMAIL credentials not configured; skipping email.');
      return false;
    }

    const gmailUser = (process.env.GMAIL_USER || 'ideainnovationcell.pmec@gmail.com').trim();
    const adminEmail = (process.env.ADMIN_NOTIFICATION_EMAIL || gmailUser || 'ideainnovationcell.pmec@gmail.com').trim();

    const studentMailHtml = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>We got your registration! - Under Verification</title>
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #0b1120; margin: 0; padding: 24px; color: #f8fafc;">
        <div style="max-width: 620px; margin: 0 auto; background: #131d33; border-radius: 18px; overflow: hidden; border: 1px solid rgba(255,255,255,0.12); box-shadow: 0 15px 35px rgba(0,0,0,0.5);">
          
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #1e3a8a 0%, #0369a1 100%); padding: 32px 24px; text-align: center;">
            <span style="display: inline-block; background: rgba(255,255,255,0.18); padding: 4px 12px; border-radius: 20px; font-size: 11px; font-weight: 700; letter-spacing: 0.15em; text-transform: uppercase; color: #ffffff; margin-bottom: 8px;">Notice Ref: PMEC/Startup/03/2026</span>
            <h1 style="color: #ffffff; margin: 0; font-size: 22px; font-weight: 800; letter-spacing: -0.02em;">Idea & Innovation Cell (IIC PMEC)</h1>
            <p style="color: #e0f2fe; margin: 6px 0 0 0; font-size: 14px;">Coding, Design & Development Club (CDD)</p>
          </div>

          <!-- Application ID Banner -->
          <div style="background: rgba(245, 158, 11, 0.12); border-bottom: 1px solid rgba(245, 158, 11, 0.25); padding: 18px 24px; text-align: center;">
            <p style="margin: 0 0 4px 0; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; color: #fbbf24;">Application Reference ID</p>
            <p style="margin: 0; font-family: monospace; font-size: 24px; font-weight: 800; letter-spacing: 2px; color: #ffffff;">${record.regId}</p>
            <span style="display: inline-block; margin-top: 8px; padding: 4px 12px; border-radius: 20px; background: #f59e0b; color: #000000; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px;">
              ⏳ Verification In Progress
            </span>
          </div>

          <!-- Body Content -->
          <div style="padding: 28px 24px;">
            <h2 style="color: #ffffff; font-size: 19px; margin: 0 0 10px 0;">Hello ${record.name},</h2>
            <p style="color: #e2e8f0; font-size: 15px; font-weight: 600; margin: 0 0 14px 0;">
              We got your registration!! 🎉
            </p>
            <p style="color: #cbd5e1; font-size: 14px; line-height: 1.6; margin: 0 0 20px 0;">
              Thank you for applying to the <strong>Coding, Design and Development Club (CDD)</strong> under Idea and Innovation Cell, Parala Maharaja Engineering College. We have successfully received your registration details, student photo ID, and Canara Bank payment proof.
            </p>

            <!-- Verification In Progress Box -->
            <div style="background: rgba(245, 158, 11, 0.1); border-left: 4px solid #f59e0b; padding: 16px 18px; border-radius: 8px; margin-bottom: 24px;">
              <h3 style="color: #fbbf24; font-size: 13px; text-transform: uppercase; letter-spacing: 0.08em; margin: 0 0 6px 0; font-weight: 800;">
                🔍 We are verifying everything
              </h3>
              <p style="color: #fde68a; font-size: 13px; margin: 0; line-height: 1.55;">
                Our admin team is currently cross-checking your 12-digit UTR/Reference number (<code>${record.utr}</code>) and payment receipt against the official Canara Bank account records.
              </p>
              <p style="color: #cbd5e1; font-size: 12.5px; margin: 8px 0 0 0; line-height: 1.5;">
                <strong>What happens next:</strong> Once your payment is verified and approved by the admin team, you will immediately receive an official <strong>Club Welcome Email</strong> containing your exclusive link to join the <strong>Official Induction WhatsApp Group</strong>!
              </p>
            </div>

            <!-- Details Summary Table -->
            <div style="background: #0b1120; border-radius: 12px; padding: 18px; margin-bottom: 24px; border: 1px solid rgba(255,255,255,0.08);">
              <h3 style="color: #38bdf8; font-size: 12px; text-transform: uppercase; letter-spacing: 0.1em; margin: 0 0 12px 0; border-bottom: 1px solid rgba(255,255,255,0.08); padding-bottom: 8px;">Submitted Profile Summary</h3>
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
                  <td style="padding: 6px 0; color: #94a3b8;">Branch:</td>
                  <td style="padding: 6px 0; color: #ffffff; font-weight: 600; text-align: right;">${record.branch}</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; color: #94a3b8;">Institution:</td>
                  <td style="padding: 6px 0; color: #ffffff; font-weight: 600; text-align: right;">Parala Maharaja Engineering College</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; color: #94a3b8;">WhatsApp Phone:</td>
                  <td style="padding: 6px 0; color: #ffffff; font-weight: 600; text-align: right;">+91 ${record.phone}</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; color: #94a3b8;">Membership Fee:</td>
                  <td style="padding: 6px 0; color: #10b981; font-weight: 700; text-align: right;">₹${record.amount}/-</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; color: #94a3b8;">Payment Method:</td>
                  <td style="padding: 6px 0; color: #ffffff; font-weight: 600; text-align: right;">Canara Bank Direct Transfer</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; color: #94a3b8;">Bank UTR / Ref No:</td>
                  <td style="padding: 6px 0; color: #e2e8f0; font-family: monospace; font-weight: 700; text-align: right;">${record.utr}</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; color: #94a3b8;">Status:</td>
                  <td style="padding: 6px 0; color: #fbbf24; font-weight: 700; text-align: right;">Verification In Progress ⏳</td>
                </tr>
              </table>
            </div>

            <p style="color: #94a3b8; font-size: 12px; line-height: 1.5; margin: 0;">
              Please save this email for your records. If you have any questions or notice an error in your submission, reply directly to this email or contact the club coordinator.
            </p>
          </div>

          <!-- Footer -->
          <div style="background: #070b14; padding: 18px 24px; text-align: center; border-top: 1px solid rgba(255,255,255,0.06);">
            <p style="color: #64748b; font-size: 11px; margin: 0;">
              &copy; ${new Date().getFullYear()} Idea and Innovation Cell (IIC PMEC / CDD), Parala Maharaja Engineering College, Berhampur.
            </p>
          </div>
        </div>
      </body>
    </html>
    `;

    // 1. Send Acknowledgement to the Student
    await transporter.sendMail({
      from: `"Idea & Innovation Cell PMEC" <${gmailUser}>`,
      to: record.email,
      subject: `We got your registration!! We are verifying everything | CDD (IIC PMEC) [Ref: ${record.regId}]`,
      html: studentMailHtml,
    });

    // 2. Also send real-time notification alert to Admin (ideainnovationcell.pmec@gmail.com)
    if (adminEmail) {
      await transporter.sendMail({
        from: `"IIC Portal Alerts" <${gmailUser}>`,
        to: adminEmail,
        subject: `⚡ New Registration: ${record.name} (${record.rollNo || record.registrationNumber}) [₹${record.amount}] - Pending Verification`,
        text: `New registration submitted:\n\nName: ${record.name}\nReg ID/Roll No: ${record.rollNo || record.registrationNumber}\nYear: ${record.year}\nBranch: ${record.branch}\nFee: ₹${record.amount}\nUTR: ${record.utr}\nPhone: +91 ${record.phone}\nEmail: ${record.email}\nRef: ${record.regId}\n\nReview & Approve in Admin Dashboard: /secret-admin-cdd`,
      }).catch((adminErr) => console.warn('Non-fatal admin alert error:', adminErr.message));
    }

    return true;
  } catch (err) {
    console.error('Error sending application received email:', err);
    return false;
  }
}

/**
 * 2. Send Official Warming Club Welcome Email with WhatsApp Group Link
 * Dispatched when the Admin reviews the student details & bank UTR and clicks "Approve".
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
        <title>Welcome to CDD Club! - Official Induction</title>
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #080d1a; margin: 0; padding: 24px; color: #f8fafc;">
        <div style="max-width: 620px; margin: 0 auto; background: #0f172a; border-radius: 18px; overflow: hidden; border: 1px solid rgba(255,255,255,0.12); box-shadow: 0 15px 40px rgba(0,0,0,0.6);">
          
          <!-- Header Banner -->
          <div style="background: linear-gradient(135deg, #059669 0%, #0284c7 100%); padding: 36px 24px; text-align: center;">
            <span style="display: inline-block; background: rgba(255,255,255,0.22); padding: 5px 16px; border-radius: 20px; font-size: 11px; font-weight: 800; letter-spacing: 0.15em; text-transform: uppercase; color: #ffffff; margin-bottom: 10px;">
              OFFICIALLY INDUCTED MEMBER ✓
            </span>
            <h1 style="color: #ffffff; margin: 0; font-size: 26px; font-weight: 800; letter-spacing: -0.02em;">Welcome to CDD Club! 🚀</h1>
            <p style="color: #d1fae5; margin: 6px 0 0 0; font-size: 14px;">Idea & Innovation Cell (IIC PMEC / CDD×SIC)</p>
          </div>

          <!-- Official Member Pass Banner -->
          <div style="background: rgba(16, 185, 129, 0.12); border-bottom: 1px solid rgba(16, 185, 129, 0.25); padding: 18px 24px; text-align: center;">
            <p style="margin: 0 0 4px 0; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.12em; color: #34d399;">Official Member Pass ID</p>
            <p style="margin: 0; font-family: monospace; font-size: 26px; font-weight: 800; letter-spacing: 2px; color: #ffffff;">${record.regId}</p>
            <p style="margin: 4px 0 0 0; font-size: 12px; color: #10b981; font-weight: 700;">Status: VERIFIED & ACTIVE MEMBER ✓</p>
          </div>

          <!-- Body Content -->
          <div style="padding: 30px 24px;">
            <h2 style="color: #ffffff; font-size: 20px; margin: 0 0 12px 0;">Congratulations ${record.name}! 🎊</h2>
            <p style="color: #cbd5e1; font-size: 14.5px; line-height: 1.6; margin: 0 0 24px 0;">
              Your bank payment of <strong>₹${record.amount}/-</strong> and membership application have been <strong>successfully verified and approved</strong> by the CDD administration under Idea and Innovation Cell, Parala Maharaja Engineering College. You are now officially inducted as an active club member for your complete tenure!
            </p>

            <!-- Warm WhatsApp Group Call to Action Box -->
            <div style="background: linear-gradient(135deg, rgba(37, 211, 102, 0.2) 0%, rgba(18, 140, 126, 0.2) 100%); border: 2px solid #25d366; border-radius: 16px; padding: 26px 22px; text-align: center; margin-bottom: 28px; box-shadow: 0 10px 25px rgba(37, 211, 102, 0.25);">
              <h3 style="color: #25d366; font-size: 19px; margin: 0 0 8px 0; font-weight: 800;">Official WhatsApp Group Invite</h3>
              <p style="color: #f8fafc; font-size: 14px; margin: 0 0 20px 0; line-height: 1.55;">
                Click the button below to join the exclusive official <strong>CDD Members WhatsApp Group</strong>. All orientation notices, workshop schedules, git repos, hackathons, and project teams will be shared here!
              </p>
              <a href="${finalWhatsAppUrl}" target="_blank" style="display: inline-block; background-color: #25d366; color: #ffffff; font-weight: 800; font-size: 15px; padding: 15px 36px; border-radius: 9999px; text-decoration: none; box-shadow: 0 5px 20px rgba(37, 211, 102, 0.5); letter-spacing: 0.5px;">
                👉 Join Official WhatsApp Group Now 👈
              </a>
              <p style="color: #86efac; font-size: 11px; margin: 14px 0 0 0;">
                (Confidential: Please do not share this link with non-registered or unverified students)
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
                  <td style="padding: 6px 0; color: #10b981; font-weight: 700; text-align: right;">₹${record.amount}/-</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; color: #94a3b8;">Verified UTR / Ref No:</td>
                  <td style="padding: 6px 0; color: #e2e8f0; font-family: monospace; font-weight: 700; text-align: right;">${record.utr}</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; color: #94a3b8;">Verification Status:</td>
                  <td style="padding: 6px 0; color: #10b981; font-weight: 700; text-align: right;">APPROVED & ACTIVE ✓</td>
                </tr>
              </table>
            </div>

            <!-- Warm Welcome Message -->
            <div style="background: rgba(59, 130, 246, 0.08); border-left: 4px solid #38bdf8; padding: 16px 18px; border-radius: 8px; margin-bottom: 24px;">
              <h4 style="color: #38bdf8; font-size: 13px; text-transform: uppercase; margin: 0 0 6px 0; font-weight: 700;">What to expect next:</h4>
              <p style="color: #cbd5e1; font-size: 13px; margin: 0; line-height: 1.55;">
                Orientation sessions, technology workshops (Fullstack Web, Mobile Apps, AI/ML, Cloud, IoT), open-source contribution drives, and project team allocations will begin shortly. Stay active in the WhatsApp group for instructions.
              </p>
            </div>

            <p style="color: #94a3b8; font-size: 12px; line-height: 1.5; margin: 0;">
              Welcome aboard to the journey of building and innovating! For any assistance, reach out directly to the coordinators or reply to this email.
            </p>
          </div>

          <!-- Footer -->
          <div style="background: #070b14; padding: 20px 24px; text-align: center; border-top: 1px solid rgba(255,255,255,0.06);">
            <p style="color: #64748b; font-size: 11px; margin: 0 0 4px 0;">
              Faculty In-Charge & Student Leads, Coding Design & Development (CDD × SIC)
            </p>
            <p style="color: #475569; font-size: 10px; margin: 0;">
              &copy; ${new Date().getFullYear()} Idea and Innovation Cell, Parala Maharaja Engineering College, Sitalapalli, Berhampur.
            </p>
          </div>
        </div>
      </body>
    </html>
    `;

    // 1. Send to the newly inducted candidate
    await transporter.sendMail({
      from: `"Idea & Innovation Cell PMEC" <${gmailUser}>`,
      to: record.email,
      subject: `🎉 Welcome to CDD Club! Official Induction & WhatsApp Group Link | IIC PMEC [Pass: ${record.regId}]`,
      html: approvalMailHtml,
    });

    // 2. Also send an official confirmation copy to Admin notification email
    const adminEmail = (process.env.ADMIN_NOTIFICATION_EMAIL || gmailUser || 'ideainnovationcell.pmec@gmail.com').trim();
    if (adminEmail && record.email.toLowerCase().trim() !== adminEmail.toLowerCase().trim()) {
      await transporter.sendMail({
        from: `"IIC Portal Alerts" <${gmailUser}>`,
        to: adminEmail,
        subject: `[CONFIRMATION] Approved & Sent WhatsApp Link: ${record.name} (${record.rollNo || record.registrationNumber}) [Pass: ${record.regId}]`,
        html: approvalMailHtml,
      }).catch((ccErr) => console.warn('Non-fatal admin confirmation copy error:', ccErr.message));
    }

    return true;
  } catch (err) {
    console.error('Error sending approval confirmation email:', err);
    return false;
  }
}
