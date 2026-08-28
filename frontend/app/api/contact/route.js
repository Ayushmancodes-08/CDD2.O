import nodemailer from 'nodemailer';

export async function POST(req) {
  try {
    const body = await req.json();
    const { firstName = '', lastName = '', email = '', message = '' } = body;

    // Basic validation
    if (!email || !email.includes('@') || !message) {
      return Response.json(
        { success: false, error: 'Please provide a valid email and message.' },
        { status: 400 }
      );
    }

    const fullName = `${firstName} ${lastName}`.trim() || 'Website Visitor';
    const gmailUser = process.env.GMAIL_USER;
    const gmailPass = process.env.GMAIL_APP_PASSWORD;
    const adminEmail = process.env.ADMIN_NOTIFICATION_EMAIL || gmailUser;

    if (!gmailUser || !gmailPass) {
      console.warn('⚠️ GMAIL_USER or GMAIL_APP_PASSWORD is not set in environment variables.');
      return Response.json(
        { 
          success: false, 
          error: 'Email service credentials not configured. Please set GMAIL_USER and GMAIL_APP_PASSWORD in .env.local' 
        },
        { status: 500 }
      );
    }

    // Configure Nodemailer transporter with connection pooling for instant throughput
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      pool: true,
      maxConnections: 3,
      maxMessages: 100,
      auth: {
        user: gmailUser,
        pass: gmailPass,
      },
    });

    const formattedDate = new Date().toLocaleString('en-US', {
      timeZone: 'Asia/Kolkata',
      dateStyle: 'full',
      timeStyle: 'medium',
    });

    // 1. Professional Admin Notification Email HTML Template
    const adminMailHtml = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>New Inquiry Received</title>
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 24px;">
        <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
          <div style="background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); padding: 32px 24px; text-align: center; border-bottom: 2px solid #3b82f6;">
            <h1 style="color: #ffffff; margin: 0 0 8px 0; font-size: 20px; font-weight: 700; letter-spacing: -0.5px;">New Website Contact Inquiry</h1>
            <p style="color: #94a3b8; margin: 0; font-size: 13px;">Idea and Innovation Cell PMEC (CDD×SIC)</p>
          </div>
          <div style="padding: 28px 24px;">
            <div style="background-color: #f1f5f9; border-radius: 12px; padding: 18px; margin-bottom: 24px;">
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 6px 0; font-size: 13px; color: #64748b; font-weight: 600; width: 90px;">From:</td>
                  <td style="padding: 6px 0; font-size: 14px; color: #0f172a; font-weight: 600;">${fullName}</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; font-size: 13px; color: #64748b; font-weight: 600;">Email:</td>
                  <td style="padding: 6px 0; font-size: 14px; color: #2563eb; font-weight: 600;">
                    <a href="mailto:${email}" style="color: #2563eb; text-decoration: none;">${email}</a>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; font-size: 13px; color: #64748b; font-weight: 600;">Received:</td>
                  <td style="padding: 6px 0; font-size: 13px; color: #475569;">${formattedDate} (IST)</td>
                </tr>
              </table>
            </div>
            <div style="margin-bottom: 28px;">
              <h3 style="color: #0f172a; font-size: 14px; font-weight: 700; margin: 0 0 10px 0; text-transform: uppercase; letter-spacing: 0.5px;">Message Content:</h3>
              <div style="background: #ffffff; border: 1px solid #cbd5e1; border-left: 4px solid #3b82f6; border-radius: 8px; padding: 16px; font-size: 14px; line-height: 1.6; color: #334155; white-space: pre-wrap;">${message}</div>
            </div>
            <div style="text-align: center; margin-top: 24px;">
              <a href="mailto:${email}?subject=Re:%20Inquiry%20to%20Idea%20and%20Innovation%20Cell%20PMEC" style="display: inline-block; background-color: #2563eb; color: #ffffff; padding: 12px 28px; border-radius: 8px; font-size: 14px; font-weight: 600; text-decoration: none; box-shadow: 0 2px 6px rgba(37,99,235,0.3);">
                Reply Directly to ${firstName || 'Sender'}
              </a>
            </div>
          </div>
          <div style="background-color: #f8fafc; padding: 16px 24px; text-align: center; border-top: 1px solid #e2e8f0; font-size: 12px; color: #94a3b8;">
            Sent automatically from iicpmec.vercel.app portal
          </div>
        </div>
      </body>
    </html>
    `;

    // 2. Beautiful Auto-Reply Confirmation Email for Sender
    const senderConfirmationHtml = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>We received your message</title>
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 24px;">
        <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
          <div style="background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); padding: 32px 24px; text-align: center; border-bottom: 2px solid #3b82f6;">
            <h1 style="color: #ffffff; margin: 0 0 8px 0; font-size: 22px; font-weight: 700; letter-spacing: -0.5px;">Idea and Innovation Cell</h1>
            <p style="color: #94a3b8; margin: 0; font-size: 13px;">Parala Maharaja Engineering College (CDD×SIC)</p>
          </div>
          <div style="padding: 32px 28px;">
            <h2 style="color: #0f172a; font-size: 18px; font-weight: 700; margin: 0 0 16px 0;">Hello ${fullName},</h2>
            <p style="color: #475569; font-size: 14px; line-height: 1.6; margin: 0 0 20px 0;">
              Thank you for reaching out to us! We have received your inquiry and our core coordinating team will review your message and get back to you shortly.
            </p>
            <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 18px; margin: 24px 0;">
              <div style="font-size: 12px; font-weight: 700; text-transform: uppercase; color: #64748b; margin-bottom: 8px;">Summary of your message:</div>
              <div style="font-size: 13px; color: #334155; line-height: 1.5; font-style: italic; white-space: pre-wrap;">"${message}"</div>
            </div>
            <p style="color: #475569; font-size: 14px; line-height: 1.6; margin: 0 0 24px 0;">
              In the meantime, feel free to explore our ongoing projects, technical programs, and community updates on our website.
            </p>
            <div style="text-align: center; margin: 28px 0;">
              <a href="https://iicpmec.vercel.app" style="display: inline-block; background-color: #0f172a; color: #ffffff; padding: 12px 28px; border-radius: 8px; font-size: 14px; font-weight: 600; text-decoration: none;">
                Visit IIC PMEC Portal
              </a>
            </div>
            <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 28px 0;" />
            <div style="color: #64748b; font-size: 13px; line-height: 1.5;">
              <strong>Warm Regards,</strong><br />
              Core Team & Coordinators<br />
              <span style="color: #2563eb;">Idea and Innovation Cell (CDD×SIC)</span><br />
              PMEC Berhampur
            </div>
          </div>
          <div style="background-color: #f8fafc; padding: 16px 24px; text-align: center; border-top: 1px solid #e2e8f0; font-size: 12px; color: #94a3b8;">
            © ${new Date().getFullYear()} Idea and Innovation Cell PMEC. All rights reserved.
          </div>
        </div>
      </body>
    </html>
    `;

    // Send both emails concurrently with Promise.all for maximum speed
    await Promise.all([
      transporter.sendMail({
        from: `"IIC Portal Notification" <${gmailUser}>`,
        to: adminEmail,
        replyTo: email,
        subject: `[IIC Inquiry] ${fullName} sent a new message`,
        html: adminMailHtml,
      }),
      transporter.sendMail({
        from: `"Idea and Innovation Cell PMEC" <${gmailUser}>`,
        to: email,
        subject: `We received your message, ${firstName || 'there'}! - IIC PMEC`,
        html: senderConfirmationHtml,
      }),
    ]);

    return Response.json({ success: true, message: 'Message sent and confirmation delivered!' });
  } catch (error) {
    console.error('Contact form submission error:', error);
    return Response.json(
      { success: false, error: error.message || 'Failed to send email. Please try again.' },
      { status: 500 }
    );
  }
}
