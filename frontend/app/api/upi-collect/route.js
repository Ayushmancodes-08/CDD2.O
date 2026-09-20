/**
 * POST /api/upi-collect
 * Server-side UPI Detection, Verification & Dynamic Intent Pipeline
 */

import {
  validateUPI,
  generateUPIUri,
  DEFAULT_CLUB_UPI,
  DEFAULT_PAYEE_NAME,
  getAppUpiLinks,
} from '@/lib/upi';
import { normalizePhone } from '@/lib/registration-store';

export async function POST(req) {
  try {
    const body = await req.json();
    const { vpa, amount, name, phone } = body;

    const cleanVpa = (vpa || '').trim().toLowerCase();

    // 1. NPCI Format and Structure Validation
    const validation = validateUPI(cleanVpa);
    if (!validation.isValid) {
      return Response.json(
        { success: false, error: validation.reason || 'Please provide a valid UPI ID (e.g. yourname@oksbi).' },
        { status: 400 }
      );
    }

    const numAmount = Number(amount) || 300;
    const cleanPhone = normalizePhone(phone);

    const appLinks = getAppUpiLinks({
      vpa: DEFAULT_CLUB_UPI,
      name: DEFAULT_PAYEE_NAME,
      amount: numAmount,
      note: `CDD-Reg-${(name || 'Member').trim().replace(/[^a-zA-Z0-9]/g, '').slice(0, 15)}`,
    });

    const intentUrl = appLinks.generic;

    const waText = `Hi ${name || 'Student'}! Here is your official IIC PMEC Membership payment link for ₹${numAmount}:\n\n${intentUrl}\n\nTap the link above on your phone to pay directly via Google Pay, PhonePe, or Paytm!`;
    const waLink = `https://wa.me/91${cleanPhone}?text=${encodeURIComponent(waText)}`;

    let customerName = null;
    let liveVerified = false;

    // 2. Real-Time VPA Verification with NPCI network via Razorpay Gateway (if configured)
    if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
      try {
        const auth = Buffer.from(
          `${process.env.RAZORPAY_KEY_ID}:${process.env.RAZORPAY_KEY_SECRET}`
        ).toString('base64');

        const vpaCheckRes = await fetch('https://api.razorpay.com/v1/payments/validate/vpa', {
          method: 'POST',
          headers: {
            Authorization: `Basic ${auth}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ vpa: cleanVpa }),
        });

        const vpaData = await vpaCheckRes.json();
        if (vpaData) {
          if (vpaData.success === false) {
            return Response.json(
              {
                success: false,
                error: `The UPI ID "${cleanVpa}" was not found on the bank network. Please check for spelling mistakes or try your mobile number handle (e.g. 9876543210@paytm).`,
              },
              { status: 400 }
            );
          }
          if (vpaData.customer_name) {
            customerName = vpaData.customer_name;
            liveVerified = true;
          }
        }
      } catch (gwErr) {
        console.warn('Live VPA validation fallback to handle validation:', gwErr.message);
      }
    }

    // 3. Return Successful Verification & Complete Payment Details
    return Response.json({
      success: true,
      verified: true,
      liveVerified,
      vpa: cleanVpa,
      username: validation.username,
      handle: validation.handle,
      bankName: validation.bankName,
      customerName,
      payeeVpa: DEFAULT_CLUB_UPI,
      payeeName: DEFAULT_PAYEE_NAME,
      amount: numAmount,
      intentUrl,
      appLinks,
      waLink,
      message: customerName
        ? `Verified: ${customerName} (${validation.bankName})`
        : `Verified UPI ID on ${validation.bankName}`,
    });
  } catch (err) {
    console.error('Error in /api/upi-collect:', err);
    return Response.json(
      { success: false, error: err.message || 'Failed to verify UPI ID.' },
      { status: 500 }
    );
  }
}
