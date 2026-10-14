import { addRegistration, getAllRegistrations, generateRegistrationsCSV, normalizePhone, normalizeUTR } from '@/lib/registration-store';
import { GOOGLE_SCRIPT_URL } from '@/lib/cdd-constants';
import { sendApplicationReceivedEmail } from '@/lib/email-service';

export const maxDuration = 30; // Max allowed serverless timeout on Vercel Hobby tier

const YEAR_FEE_MAP = {
  '1st year': 300,
  'first year': 300,
  'first-year student': 300,
  '2nd year': 225,
  'second year': 225,
  'second-year student': 225,
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
 * Asynchronously sync to Google Sheets & Drive (AppScript)
 */
async function syncToGoogleSheet(record) {
  const scriptUrl = (process.env.GOOGLE_SCRIPT_URL || GOOGLE_SCRIPT_URL || '').trim();
  if (!scriptUrl) {
    console.warn('⚠️ Google Apps Script URL not configured; skipping Sheets sync.');
    return;
  }

  try {
    const controller = new AbortController();
    // Allow up to 22 seconds for Google Drive to create subfolder, upload 2 files, and append row
    const timeout = setTimeout(() => controller.abort(), 22000);

    const res = await fetch(scriptUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'club_registration',
        regId: record.regId,
        rollNo: record.rollNo || record.registrationNumber || '',
        registrationNumber: record.rollNo || record.registrationNumber || record.regId,
        name: record.name,
        year: record.year,
        branch: record.branch,
        college: record.college,
        email: record.email,
        phone: record.phone,
        amount: record.amount,
        amountPaid: record.amount,
        utr: record.utr,
        payingUpi: record.payingUpi || 'Canara Bank Direct Transfer',
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
      console.log(`✅ Registration ${record.regId} synced to Google Sheets & Drive (Row: ${data.rowNumber}).`);
      return data;
    } else {
      console.warn(`⚠️ Google Script returned non-success for ${record.regId}:`, data);
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
      rollNo,
      registrationNumber,
      year,
      branch,
      college,
      email,
      phone,
      photo,
      paymentScreenshot,
      utr,
      payingUpi,
      sessionId,
    } = body;

    // 1. Strict Server-Side Validations
    if (!name || typeof name !== 'string' || name.trim().length < 2) {
      return Response.json(
        { success: false, error: 'Please enter your full legal name.' },
        { status: 400 }
      );
    }

    const cleanRollNo = (rollNo || registrationNumber || '').trim();
    if (!cleanRollNo || cleanRollNo.length < 2) {
      return Response.json(
        { success: false, error: 'Please enter your Reg ID / Roll No.' },
        { status: 400 }
      );
    }

    if (!year || !YEAR_FEE_MAP[year.toLowerCase()]) {
      return Response.json(
        { success: false, error: 'Please select a valid academic year (First-Year or Second-Year Student).' },
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

    if (!photo) {
      return Response.json(
        { success: false, error: 'Please upload your passport size professional photo.' },
        { status: 400 }
      );
    }

    const cleanUTR = normalizeUTR(utr);
    if (!cleanUTR || cleanUTR.length < 10 || cleanUTR.length > 20) {
      return Response.json(
        { success: false, error: 'Please enter a valid 12-digit UPI / Bank Reference (UTR) number from your payment receipt.' },
        { status: 400 }
      );
    }

    if (!paymentScreenshot) {
      return Response.json(
        { success: false, error: 'Please upload a screenshot of your completed bank transfer / UPI payment receipt.' },
        { status: 400 }
      );
    }

    // 2. Pre-flight Deduplication Check
    try {
      const existingList = await getAllRegistrations();
      const duplicate = existingList.find(
        (r) =>
          r.utr === cleanUTR ||
          (r.rollNo && r.rollNo.toLowerCase() === cleanRollNo.toLowerCase()) ||
          (r.registrationNumber && r.registrationNumber.toLowerCase() === cleanRollNo.toLowerCase()) ||
          r.email === cleanEmail ||
          r.phone === cleanPhone
      );
      if (duplicate) {
        let dupMsg = 'A registration already exists with this information.';
        if (duplicate.utr === cleanUTR) {
          dupMsg = `This Transaction UTR (${cleanUTR}) has already been submitted under Application ID ${duplicate.regId}. Duplicate transactions are strictly prohibited.`;
        } else if (
          (duplicate.rollNo && duplicate.rollNo.toLowerCase() === cleanRollNo.toLowerCase()) ||
          (duplicate.registrationNumber && duplicate.registrationNumber.toLowerCase() === cleanRollNo.toLowerCase())
        ) {
          dupMsg = `A registration for Reg ID / Roll No "${cleanRollNo}" has already been submitted (Application ID: ${duplicate.regId}). Each student can register only once.`;
        } else if (duplicate.email === cleanEmail) {
          dupMsg = `A registration with email "${cleanEmail}" already exists (Application ID: ${duplicate.regId}).`;
        } else if (duplicate.phone === cleanPhone) {
          dupMsg = `A registration with phone number "${cleanPhone}" already exists (Application ID: ${duplicate.regId}).`;
        }

        return Response.json(
          {
            success: false,
            error: dupMsg,
            existingRegId: duplicate.regId,
          },
          { status: 409 }
        );
      }
    } catch (preErr) {
      console.warn('Pre-check warning:', preErr.message);
    }

    // 3. Add Registration (Atomic with deduplication)
    const record = await addRegistration({
      name: name.trim(),
      rollNo: cleanRollNo,
      registrationNumber: cleanRollNo,
      year: normalizedYear,
      branch,
      college: 'Parala Maharaja Engineering College',
      email: cleanEmail,
      phone: cleanPhone,
      amount: expectedAmount,
      utr: cleanUTR,
      payingUpi: (payingUpi || 'BANK_TRANSFER').trim(),
      sessionId: (sessionId || '').trim() || null,
      photo: photo || null,
      paymentScreenshot: paymentScreenshot || null,
    });

    // 3. Reliable Execution: Await application received email & google sheet sync
    await Promise.allSettled([
      sendApplicationReceivedEmail(record).catch((e) => console.error('Application received email error:', e)),
      syncToGoogleSheet(record).catch((e) => console.error('Sheets error:', e)),
    ]);

    return Response.json({
      success: true,
      message: 'Registration submitted successfully! Your application is pending admin verification.',
      registration: {
        regId: record.regId,
        name: record.name,
        rollNo: record.rollNo || cleanRollNo,
        registrationNumber: record.registrationNumber || cleanRollNo,
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
    const isSummary = searchParams.get('summary') === 'true';
    const records = await getAllRegistrations();

    if (isSummary) {
      return Response.json({
        success: true,
        count: records.length,
      });
    }

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
