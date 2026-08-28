import nodemailer from 'nodemailer';
import { addSubscriber, getAllSubscribers, generateSubscribersCSV } from '@/lib/subscribers-store';

/**
 * GET /api/newsletter
 * - Returns JSON list of subscribers or downloads Excel/CSV spreadsheet
 * Usage:
 * - GET /api/newsletter -> JSON list & count
 * - GET /api/newsletter?export=csv -> Downloadable Excel CSV file
 */
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const isExport = searchParams.get('export') === 'csv' || searchParams.get('export') === 'excel';
    const subscribers = await getAllSubscribers();

    if (isExport) {
      const csvData = generateSubscribersCSV(subscribers);
      const filename = `iic_subscribers_${new Date().toISOString().split('T')[0]}.csv`;

      return new Response(csvData, {
        status: 200,
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': `attachment; filename="${filename}"`,
        },
      });
    }

    return Response.json({
      success: true,
      count: subscribers.length,
      subscribers,
    });
  } catch (error) {
    console.error('Error fetching subscribers:', error);
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
}

/**
 * POST /api/newsletter
 * - Adds subscriber to permanent Excel/Database store
 * - Sends Welcome email to subscriber & alert to admin
 */
export async function POST(req) {
  try {
    const body = await req.json();
    const { email = '' } = body;

    if (!email || !email.includes('@')) {
      return Response.json(
        { success: false, error: 'Please provide a valid email address.' },
        { status: 400 }
      );
    }

    // 1. Permanently record subscriber to Excel/Database store
    const record = await addSubscriber(email, 'website_footer');

    const gmailUser = process.env.GMAIL_USER;
    const gmailPass = process.env.GMAIL_APP_PASSWORD;
    const adminEmail = process.env.ADMIN_NOTIFICATION_EMAIL || gmailUser;

    // If Gmail credentials are set, send notifications & welcome email
    if (gmailUser && gmailPass) {
      try {
        const transporter = nodemailer.createTransport({
          service: 'gmail',
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

        // Admin Notification for new subscriber
        const adminMailHtml = `
        <!DOCTYPE html>
        <html>
          <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f8fafc; padding: 20px;">
            <div style="max-width: 500px; margin: 0 auto; background: #ffffff; border-radius: 12px; padding: 24px; border: 1px solid #e2e8f0;">
              <h2 style="color: #0f172a; margin-top: 0;">📬 New Newsletter Subscriber</h2>
              <p style="color: #475569; font-size: 14px;">A new user has subscribed to the Idea and Innovation Cell newsletter:</p>
              <div style="background: #f1f5f9; padding: 12px 16px; border-radius: 8px; font-weight: 600; color: #2563eb; font-size: 15px;">
                ${email}
              </div>
              <p style="color: #94a3b8; font-size: 12px; margin-top: 16px;">Subscribed at: ${formattedDate} (IST)</p>
              <div style="margin-top: 20px; text-align: center;">
                <a href="https://iicpmec.vercel.app/api/newsletter?export=csv" style="display: inline-block; background: #0f172a; color: #ffffff; padding: 10px 20px; border-radius: 6px; font-size: 12px; text-decoration: none; font-weight: 600;">
                  📥 Download All Subscribers (Excel/CSV)
                </a>
              </div>
            </div>
          </body>
        </html>
        `;

        // Welcome Email to Subscriber
        const welcomeHtml = `
        <!DOCTYPE html>
        <html>
          <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f8fafc; padding: 24px;">
            <div style="max-width: 550px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
              <div style="background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); padding: 28px 24px; text-align: center; border-bottom: 2px solid #3b82f6;">
                <h1 style="color: #ffffff; margin: 0; font-size: 20px; font-weight: 700;">Welcome to Idea & Innovation Cell!</h1>
                <p style="color: #94a3b8; margin: 4px 0 0 0; font-size: 13px;">IIC PMEC (CDD×SIC)</p>
              </div>
              <div style="padding: 28px 24px; color: #334155; font-size: 14px; line-height: 1.6;">
                <p style="margin-top: 0;">Hey there! 🎉</p>
                <p>Thank you for subscribing to our community newsletter. You'll be the first to know about:</p>
                <ul style="color: #475569; padding-left: 20px;">
                  <li>Upcoming Hackathons & Coding Contests</li>
                  <li>Hands-on Technical Workshops (AI/ML, Web, App Dev)</li>
                  <li>Open Source projects and student innovation spotlights</li>
                </ul>
                <div style="text-align: center; margin: 28px 0;">
                  <a href="https://iicpmec.vercel.app" style="display: inline-block; background-color: #2563eb; color: #ffffff; padding: 12px 24px; border-radius: 8px; font-size: 14px; font-weight: 600; text-decoration: none;">
                    Explore Current Projects
                  </a>
                </div>
                <p style="color: #64748b; font-size: 13px; margin-bottom: 0;">
                  Cheers,<br />
                  <strong>Idea and Innovation Cell Team</strong><br />
                  PMEC Berhampur
                </p>
              </div>
            </div>
          </body>
        </html>
        `;

        await transporter.sendMail({
          from: `"IIC PMEC Newsletter" <${gmailUser}>`,
          to: adminEmail,
          subject: `[IIC Newsletter] New Subscriber: ${email}`,
          html: adminMailHtml,
        });

        await transporter.sendMail({
          from: `"Idea and Innovation Cell PMEC" <${gmailUser}>`,
          to: email,
          subject: `Welcome to Idea and Innovation Cell PMEC! 🚀`,
          html: welcomeHtml,
        });
      } catch (mailErr) {
        console.warn('Could not send notification email, subscriber still recorded:', mailErr);
      }
    }

    return Response.json({
      success: true,
      message: 'Subscribed successfully and added to subscriber list!',
      subscriber: record,
    });
  } catch (error) {
    console.error('Newsletter submission error:', error);
    return Response.json(
      { success: false, error: error.message || 'Failed to subscribe. Please try again.' },
      { status: 500 }
    );
  }
}
