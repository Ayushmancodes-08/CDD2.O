import crypto from 'crypto';
import {
  generateUPIUri,
  getAppUpiLinks,
  DEFAULT_CLUB_UPI,
  DEFAULT_PAYEE_NAME,
  DEFAULT_TAP_TO_PAY_UPI,
  DEFAULT_TAP_TO_PAY_NAME,
} from '@/lib/upi';
import {
  YEAR_FEE_MAP,
  VALID_BRANCHES,
  normalizePhone,
  getAllRegistrations,
} from '@/lib/registration-store';

export const dynamic = 'force-dynamic';

/**
 * POST /api/register/session
 * Generates an official registration session and pre-filled UPI payment links.
 */
export async function POST(req) {
  try {
    const body = await req.json();
    const { name, year, branch, college, email, phone } = body;

    // 1. Validation
    if (!name || typeof name !== 'string' || name.trim().length < 2) {
      return Response.json(
        { success: false, error: 'Please enter your full legal name (minimum 2 characters).' },
        { status: 400 }
      );
    }

    const normalizedYear = (year || '').toLowerCase().trim();
    if (!YEAR_FEE_MAP[normalizedYear]) {
      return Response.json(
        { success: false, error: 'Please select a valid academic year (1st, 2nd, or 3rd year).' },
        { status: 400 }
      );
    }

    if (!branch || !VALID_BRANCHES.includes(branch)) {
      return Response.json(
        { success: false, error: 'Please select an approved engineering branch.' },
        { status: 400 }
      );
    }

    const cleanEmail = (email || '').trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!cleanEmail || !emailRegex.test(cleanEmail)) {
      return Response.json(
        { success: false, error: 'Please provide a valid email address.' },
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

    // 2. Prevent Duplicate Registrations Before Paying
    try {
      const existingList = await getAllRegistrations();
      const duplicate = existingList.find(
        (r) => r.email === cleanEmail || r.phone === cleanPhone
      );
      if (duplicate) {
        return Response.json(
          {
            success: false,
            error: `A registration is already recorded for this ${
              duplicate.email === cleanEmail ? 'email address' : 'phone number'
            } (ID: ${duplicate.regId}). Each candidate can only register once.`,
            existingRegId: duplicate.regId,
          },
          { status: 409 }
        );
      }
    } catch (checkErr) {
      console.warn('Non-fatal pre-registration duplicate check warning:', checkErr.message);
    }

    // 3. Calculate Fee & Generate Session
    const amount = YEAR_FEE_MAP[normalizedYear];
    const sessionRand = crypto.randomBytes(3).toString('hex').toUpperCase();
    const sessionId = `CDD26-${sessionRand}`;

    // Clean student name for UPI note (alphanumeric only, max 10 chars)
    const safeName = name.trim().replace(/[^a-zA-Z0-9]/g, '').slice(0, 10);
    const upiNote = `CDD-${sessionRand}-${safeName}`;

    // 4. Generate Standard NPCI Deep-Link & Specific App URIs using Tap-to-Pay VPA (8480496340-2@ybl)
    const upiOptions = {
      vpa: DEFAULT_TAP_TO_PAY_UPI,
      name: DEFAULT_TAP_TO_PAY_NAME,
      amount,
      note: upiNote,
    };

    const upiUri = generateUPIUri(upiOptions);
    const appLinks = getAppUpiLinks(upiOptions);

    return Response.json({
      success: true,
      sessionId,
      amount,
      note: upiNote,
      upiUri,
      appLinks,
      tapToPayUpi: DEFAULT_TAP_TO_PAY_UPI,
      payee: {
        vpa: DEFAULT_CLUB_UPI,
        tapToPayVpa: DEFAULT_TAP_TO_PAY_UPI,
        name: DEFAULT_TAP_TO_PAY_NAME,
      },
      student: {
        name: name.trim(),
        year: normalizedYear,
        branch,
        college: 'Parala Maharaja Engineering College',
        email: cleanEmail,
        phone: cleanPhone,
      },
    });
  } catch (error) {
    console.error('Error generating registration session:', error);
    return Response.json(
      { success: false, error: 'Failed to create registration session. Please check your network and try again.' },
      { status: 500 }
    );
  }
}
