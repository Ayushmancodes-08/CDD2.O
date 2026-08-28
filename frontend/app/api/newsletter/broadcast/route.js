import nodemailer from 'nodemailer';
import { getAllSubscribers } from '@/lib/subscribers-store';

/**
 * POST /api/newsletter/broadcast
 * - Send a newsletter update to all subscribed users simultaneously
 * Body: { subject, title, message, adminPassword }
 */
export async function POST(req) {
  try {
    const body = await req.json();
    const { subject = '', title = '', message = '', adminPassword = '' } = body;

    // Optional admin password protection if set in env
    const expectedPassword = process.env.ADMIN_PASSWORD || 'iicpmec2026';
    if (adminPassword && adminPassword !== expectedPassword) {
      return Response.json({ success: false, error: 'Unauthorized: Invalid admin password.' }, { status: 401 });
    }

    if (!subject || !message) {
      return Response.json({ success: false, error: 'Subject and message are required.' }, { status: 400 });
    }

    const gmailUser = process.env.GMAIL_USER;
    const gmailPass = process.env.GMAIL_APP_PASSWORD;

    if (!gmailUser || !gmailPass) {
      return Response.json(
        { success: false, error: 'Email service credentials not configured in .env.local' },
        { status: 500 }
      );
    }

    const subscribers = await getAllSubscribers();
    const emails = subscribers.map(s => s.email).filter(Boolean);

    if (emails.length === 0) {
      return Response.json({ success: false, error: 'No subscribers found in database to broadcast to.' }, { status: 400 });
    }

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: gmailUser,
        pass: gmailPass,
      },
    });

    const broadcastHtml = `
    <!DOCTYPE html>
    <html>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f8fafc; margin: 0; padding: 24px;">
        <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
          <div style="background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); padding: 32px 24px; text-align: center; border-bottom: 2px solid #3b82f6;">
            <h1 style="color: #ffffff; margin: 0 0 8px 0; font-size: 22px; font-weight: 700;">Idea and Innovation Cell</h1>
            <p style="color: #94a3b8; margin: 0; font-size: 13px;">Parala Maharaja Engineering College (CDD×SIC)</p>
          </div>
          <div style="padding: 32px 28px;">
            ${title ? `<h2 style="color: #0f172a; font-size: 18px; font-weight: 700; margin-top: 0;">${title}</h2>` : ''}
            <div style="color: #334155; font-size: 14px; line-height: 1.7; white-space: pre-wrap;">${message}</div>
            
            <div style="text-align: center; margin: 32px 0 16px 0;">
              <a href="https://iicpmec.vercel.app" style="display: inline-block; background-color: #2563eb; color: #ffffff; padding: 12px 28px; border-radius: 8px; font-size: 14px; font-weight: 600; text-decoration: none;">
                Visit IIC PMEC Portal
              </a>
            </div>
            <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 28px 0;" />
            <div style="color: #64748b; font-size: 12px; line-height: 1.5;">
              You received this email because you subscribed to the Idea and Innovation Cell newsletter.<br />
              PMEC Berhampur, Odisha.
            </div>
          </div>
        </div>
      </body>
    </html>
    `;

    // Send email using BCC so all subscribers receive it in a single blast with privacy protected
    await transporter.sendMail({
      from: `"Idea and Innovation Cell PMEC" <${gmailUser}>`,
      to: gmailUser, // To admin
      bcc: emails,    // All subscribers in BCC
      subject: subject,
      html: broadcastHtml,
    });

    return Response.json({
      success: true,
      message: `Newsletter broadcasted successfully to ${emails.length} subscriber(s)!`,
      recipientCount: emails.length,
    });
  } catch (error) {
    console.error('Broadcast error:', error);
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
}
