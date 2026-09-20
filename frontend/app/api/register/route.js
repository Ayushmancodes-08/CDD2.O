import nodemailer from 'nodemailer';
import { addRegistration, getAllRegistrations, generateRegistrationsCSV, normalizePhone, normalizeUTR } from '@/lib/registration-store';
import { GOOGLE_SCRIPT_URL } from '@/lib/cdd-constants';

export const maxDuration = 30; // Max allowed serverless timeout on Vercel Hobby tier

const YEAR_FEE_MAP = {
  '1st year': 300,
  '2nd year': 225,
  '3rd year': 150
};

const VALID_BRANCHES = [
  'Automobile Engineering',
  'Chemical Engineering',
  'Civil Engineering',
  'Computer Science and Engineering',
  'Electrical Engineering',
  'Electronics and Telecommunication Engineering',
  'Mechanical Engineering',
  'Metallurgy and Materials Engineering'
];

/**
 * Configure Nodemailer transporter with connection pooling
 */
function getEmailTransporter() {
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
 * Send Asynchronous Confirmation Email (Non-blocking with error resilience)
 */
async function sendRegistrationEmail(record, whatsappUrl) {
  try {
    const transporter = getEmailTransporter();
    if (!transporter) {
      console.warn('⚠️ GMAIL credentials not configured; skipping confirmation email.');
      return;
    }

    const gmailUser = (process.env.GMAIL_USER || '').trim();
    const adminEmail = (process.env.ADMIN_NOTIFICATION_EMAIL || gmailUser).trim();

    const studentMailHtml = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Registration Confirmation - IIC PMEC</title>
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #0f172a; margin: 0; padding: 24px; color: #f8fafc;">
        <div style="max-width: 620px; margin: 0 auto; background: #1e293b; border-radius: 16px; overflow: hidden; border: 1px solid rgba(255,255,255,0.1); box-shadow: 0 10px 25px rgba(0,0,0,0.5);">
          
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #0284c7 0%, #0369a1 100%); padding: 32px 24px; text-align: center;">
            <span style="display: inline-block; background: rgba(255,255,255,0.15); padding: 4px 12px; border-radius: 20px; font-size: 11px; font-weight: 700; letter-spacing: 0.15em; text-transform: uppercase; color: #ffffff; margin-bottom: 8px;">Recruitment 2026-27</span>
            <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 800; letter-spacing: -0.02em;">Idea & Innovation Cell (IIC PMEC)</h1>
            <p style="color: #e0f2fe; margin: 6px 0 0 0; font-size: 14px;">Coding, Design & Development × Student Innovation Center</p>
          </div>

          <!-- Application ID Banner -->
          <div style="background: rgba(14, 165, 233, 0.12); border-bottom: 1px solid rgba(14, 165, 233, 0.2); padding: 18px 24px; text-align: center;">
            <p style="margin: 0 0 4px 0; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.1em; color: #38bdf8;">Your Application Pass ID</p>
            <p style="margin: 0; font-family: monospace; font-size: 26px; font-weight: 800; letter-spacing: 2px; color: #ffffff;">${record.regId}</p>
          </div>

          <!-- Body Content -->
          <div style="padding: 28px 24px;">
            <h2 style="color: #ffffff; font-size: 18px; margin: 0 0 12px 0;">Hello ${record.name},</h2>
            <p style="color: #cbd5e1; font-size: 14px; line-height: 1.6; margin: 0 0 20px 0;">
              Your club membership application for <strong>Idea & Innovation Cell</strong> has been successfully registered. We are excited to see your interest in building, designing, and innovating with us!
            </p>

            <!-- Details Summary Table -->
            <div style="background: #0f172a; border-radius: 12px; padding: 18px; margin-bottom: 24px; border: 1px solid rgba(255,255,255,0.06);">
              <h3 style="color: #38bdf8; font-size: 12px; text-transform: uppercase; letter-spacing: 0.1em; margin: 0 0 12px 0; border-bottom: 1px solid rgba(255,255,255,0.06); padding-bottom: 8px;">Registration Summary</h3>
              <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
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
                  <td style="padding: 6px 0; color: #94a3b8;">Membership Fee:</td>
                  <td style="padding: 6px 0; color: #10b981; font-weight: 700; text-align: right;">₹${record.amount}</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; color: #94a3b8;">UPI Ref (UTR):</td>
                  <td style="padding: 6px 0; color: #e2e8f0; font-family: monospace; text-align: right;">${record.utr}</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; color: #94a3b8;">Verification Status:</td>
                  <td style="padding: 6px 0; color: #f59e0b; font-weight: 600; text-align: right;">Pending Bank Settlement</td>
                </tr>
              </table>
            </div>

            <!-- WhatsApp Group Call to Action -->
            <div style="background: linear-gradient(135deg, rgba(37, 211, 102, 0.15) 0%, rgba(18, 140, 126, 0.15) 100%); border: 1px solid rgba(37, 211, 102, 0.3); border-radius: 12px; padding: 20px; text-align: center; margin-bottom: 24px;">
              <h3 style="color: #25d366; font-size: 16px; margin: 0 0 8px 0; font-weight: 700;">Important Next Step</h3>
              <p style="color: #e2e8f0; font-size: 13px; margin: 0 0 16px 0; line-height: 1.5;">
                Join the official recruitment WhatsApp announcement group to receive updates regarding interview schedules, tasks, and orientation.
              </p>
              <a href="${whatsappUrl}" target="_blank" style="display: inline-block; background-color: #25d366; color: #ffffff; font-weight: 700; font-size: 14px; padding: 12px 28px; border-radius: 9999px; text-decoration: none; box-shadow: 0 4px 12px rgba(37, 211, 102, 0.35);">
                Join Candidates WhatsApp Group &rarr;
              </a>
            </div>

            <p style="color: #94a3b8; font-size: 12px; line-height: 1.5; margin: 0;">
              Keep your Application Pass ID (<strong>${record.regId}</strong>) handy for future reference. If you notice any discrepancy, reply directly to this email.
            </p>
          </div>

          <!-- Footer -->
          <div style="background: #0b1120; padding: 18px 24px; text-align: center; border-top: 1px solid rgba(255,255,255,0.06);">
            <p style="color: #64748b; font-size: 11px; margin: 0;">
              &copy; ${new Date().getFullYear()} Idea and Innovation Cell (IIC PMEC / CDD×SIC), Parala Maharaja Engineering College.
            </p>
          </div>
        </div>
      </body>
    </html>
    `;

    // Dispatch to Student
    await transporter.sendMail({
      from: `"IIC PMEC Recruitment" <${gmailUser}>`,
      to: record.email,
      subject: `Registration Confirmed: ${record.regId} - IIC PMEC Club Membership`,
      html: studentMailHtml,
    });

    // Notify Admin
    if (adminEmail) {
      await transporter.sendMail({
        from: `"IIC Portal Alerts" <${gmailUser}>`,
        to: adminEmail,
        subject: `⚡ New Registration: ${record.name} (${record.year} - ${record.branch}) [₹${record.amount}]`,
        text: `New registration received:\nID: ${record.regId}\nName: ${record.name}\nYear: ${record.year}\nBranch: ${record.branch}\nUTR: ${record.utr}\nAmount: ₹${record.amount}\nPhone: ${record.phone}\nEmail: ${record.email}`,
      });
    }
  } catch (err) {
    console.error('Non-fatal error dispatching registration email:', err);
  }
}

/**
 * Asynchronously sync to Google Sheets & Drive (AppScript)
 */
async function syncToGoogleSheet(record) {
  const scriptUrl = process.env.GOOGLE_SCRIPT_URL || GOOGLE_SCRIPT_URL;
  if (!scriptUrl) return;

  try {
    const controller = new AbortController();
    // Allow up to 18 seconds for Google Drive to create 2 files and write to Sheets
    const timeout = setTimeout(() => controller.abort(), 18000);

    const res = await fetch(scriptUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'club_registration',
        regId: record.regId,
        name: record.name,
        year: record.year,
        branch: record.branch,
        college: record.college,
        email: record.email,
        phone: record.phone,
        amount: record.amount,
        utr: record.utr,
        payingUpi: record.payingUpi || '',
        status: record.status || 'Pending Verification',
        photo: record.photo || null,
        paymentScreenshot: record.paymentScreenshot || null,
        timestamp: record.formattedDate || new Date().toISOString(),
      }),
      redirect: 'follow',
      signal: controller.signal,
    });
    clearTimeout(timeout);

    const data = await res.json().catch(() => null);
    if (data && data.success) {
      console.log(`✅ Registration ${record.regId} synced to Google Sheets & Drive successfully.`);
    }
  } catch (err) {
    console.warn('Non-fatal Google Script sync error:', err.message);
  }
}

/**
 * POST /api/register
 */
export async function POST(req) {
  try {
    const body = await req.json();
    const {
      name,
      year,
      branch,
      college,
      email,
      phone,
      photo,
      paymentScreenshot,
      utr,
      payingUpi
    } = body;

    // 1. Strict Server-Side Validations
    if (!name || typeof name !== 'string' || name.trim().length < 2) {
      return Response.json(
        { success: false, error: 'Please enter your full legal name.' },
        { status: 400 }
      );
    }

    if (!year || !YEAR_FEE_MAP[year.toLowerCase()]) {
      return Response.json(
        { success: false, error: 'Please select a valid academic year (1st, 2nd, or 3rd year).' },
        { status: 400 }
      );
    }

    const normalizedYear = year.toLowerCase();
    const expectedAmount = YEAR_FEE_MAP[normalizedYear];

    if (!branch || !VALID_BRANCHES.includes(branch)) {
      return Response.json(
        { success: false, error: 'Please select a valid engineering branch from the dropdown.' },
        { status: 400 }
      );
    }

    const cleanEmail = (email || '').trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!cleanEmail || !emailRegex.test(cleanEmail)) {
      return Response.json(
        { success: false, error: 'Please enter a valid email address.' },
        { status: 400 }
      );
    }

    const cleanPhone = normalizePhone(phone);
    if (!cleanPhone || cleanPhone.length !== 10) {
      return Response.json(
        { success: false, error: 'Please enter a valid 10-digit WhatsApp phone number.' },
        { status: 400 }
      );
    }

    const cleanUTR = normalizeUTR(utr);
    if (!cleanUTR || cleanUTR.length < 10 || cleanUTR.length > 20) {
      return Response.json(
        { success: false, error: 'Please enter a valid 12-digit UPI Reference / UTR number from your payment receipt.' },
        { status: 400 }
      );
    }

    if (!paymentScreenshot) {
      return Response.json(
        { success: false, error: 'Please upload a screenshot of your completed UPI payment.' },
        { status: 400 }
      );
    }

    // 2. Add Registration (Atomic with deduplication)
    const record = await addRegistration({
      name: name.trim(),
      year: normalizedYear,
      branch,
      college: 'Parala Maharaja Engineering College',
      email: cleanEmail,
      phone: cleanPhone,
      amount: expectedAmount,
      utr: cleanUTR,
      payingUpi: (payingUpi || '').trim(),
      photo: photo || null,
      paymentScreenshot: paymentScreenshot || null,
    });

    const whatsappGroupUrl = process.env.NEXT_PUBLIC_WHATSAPP_GROUP_URL || 'https://chat.whatsapp.com/invite';

    // 3. Trigger Asynchronous Background Tasks (Zero latency for the user)
    sendRegistrationEmail(record, whatsappGroupUrl).catch((e) => console.error('Email error:', e));
    syncToGoogleSheet(record).catch((e) => console.error('Sheets error:', e));

    return Response.json({
      success: true,
      message: 'Registration submitted successfully!',
      registration: {
        regId: record.regId,
        name: record.name,
        year: record.year,
        branch: record.branch,
        college: record.college,
        email: record.email,
        phone: record.phone,
        amount: record.amount,
        utr: record.utr,
        status: record.status,
        formattedDate: record.formattedDate,
      },
      whatsappGroupUrl,
    });
  } catch (error) {
    console.error('Error in /api/register:', error);
    const isConflict = error.message && (
      error.message.includes('already exists') ||
      error.message.includes('already been submitted') ||
      error.message.includes('Duplicate submission')
    );

    return Response.json(
      {
        success: false,
        error: error.message || 'An unexpected error occurred. Please try again or contact the club coordinator.',
      },
      { status: isConflict ? 409 : 500 }
    );
  }
}

/**
 * GET /api/register
 * - Export registrations to CSV or view list
 */
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const isExport = searchParams.get('export') === 'csv' || searchParams.get('export') === 'excel';
    const records = await getAllRegistrations();

    if (isExport) {
      const csvData = generateRegistrationsCSV(records);
      const filename = `iic_registrations_${new Date().toISOString().split('T')[0]}.csv`;

      return new Response(csvData, {
        status: 200,
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': `attachment; filename="${filename}"`,
        },
      });
    }

    // Strip large base64 image data for light JSON response
    const sanitized = records.map(r => ({
      regId: r.regId,
      name: r.name,
      year: r.year,
      branch: r.branch,
      college: r.college,
      email: r.email,
      phone: r.phone,
      amount: r.amount,
      utr: r.utr,
      status: r.status,
      createdAt: r.createdAt,
      formattedDate: r.formattedDate,
      hasPhoto: Boolean(r.photo),
      hasScreenshot: Boolean(r.paymentScreenshot),
    }));

    return Response.json({
      success: true,
      count: sanitized.length,
      registrations: sanitized,
    });
  } catch (error) {
    console.error('Error fetching registrations:', error);
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
}
