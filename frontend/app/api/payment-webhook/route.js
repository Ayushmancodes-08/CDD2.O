import { verifyRegistrationByUTR, normalizeUTR } from '@/lib/registration-store';

/**
 * Helper to extract 12-digit UTR and numeric Amount from raw bank SMS text
 * Common bank patterns:
 * - "credited by Rs.300.00 ... UPI/426491029481"
 * - "A/c credited with INR 225.00 on ... Ref No 426491029481"
 * - "received Rs.150 ... UPI Ref: 426491029481"
 */
function parseBankSMS(text) {
  if (!text || typeof text !== 'string') return null;

  // 1. Extract 12-digit UTR/Ref (standard Indian UPI reference number)
  // Usually preceded by UPI/, Ref, UTR, Txn, etc. or any 12 continuous digits
  let utr = null;
  const utrMatch = text.match(/(?:UPI\/|UTR[:\s]*|Ref[:\s]*|Txn[:\s]*|RRN[:\s]*)([A-Za-z0-9]{10,18})/i) ||
                   text.match(/\b([0-9]{12})\b/);
  if (utrMatch) {
    utr = utrMatch[1];
  }

  // 2. Extract Amount
  let amount = null;
  const amtMatch = text.match(/(?:Rs\.?|INR)\s*([0-9]+(?:\.[0-9]{1,2})?)/i) ||
                   text.match(/credited\s*(?:by|with)?\s*(?:Rs\.?|INR)?\s*([0-9]+(?:\.[0-9]{1,2})?)/i);
  if (amtMatch) {
    amount = parseFloat(amtMatch[1]);
  }

  return { utr, amount };
}

/**
 * POST /api/payment-webhook
 * Autonomous Payment Matching Endpoint
 */
export async function POST(req) {
  try {
    const contentType = req.headers.get('content-type') || '';
    let utr = null;
    let amount = null;
    let source = 'webhook';

    if (contentType.includes('application/json')) {
      const body = await req.json();
      
      // If structured payload
      if (body.utr) {
        utr = normalizeUTR(body.utr);
        amount = Number(body.amount) || 0;
      } else if (body.sms || body.message || body.text) {
        // Raw SMS passed in JSON body
        const parsed = parseBankSMS(body.sms || body.message || body.text);
        if (parsed) {
          utr = parsed.utr;
          amount = parsed.amount;
        }
      }
    } else {
      // Raw text SMS passed directly
      const rawText = await req.text();
      const parsed = parseBankSMS(rawText);
      if (parsed) {
        utr = parsed.utr;
        amount = parsed.amount;
      }
    }

    if (!utr) {
      return Response.json(
        {
          success: false,
          error: 'Could not extract valid UPI Reference Number (UTR) from the request payload.',
        },
        { status: 400 }
      );
    }

    // Perform autonomous match against pending club registrations
    const result = await verifyRegistrationByUTR(utr, amount, source);

    if (result.matched) {
      return Response.json({
        success: true,
        matched: true,
        message: `Successfully verified registration for ${result.registration.name} (${result.registration.regId})!`,
        regId: result.registration.regId,
        name: result.registration.name,
        amount: result.registration.amount,
        status: 'VERIFIED',
      });
    }

    return Response.json({
      success: true,
      matched: false,
      message: `Received transaction for UTR ${utr} (${amount ? '₹' + amount : 'Amount N/A'}), but no matching pending registration was found in database.`,
      utr,
      amount,
    });
  } catch (error) {
    console.error('Error in /api/payment-webhook:', error);
    return Response.json(
      { success: false, error: error.message || 'Payment webhook verification failed.' },
      { status: 500 }
    );
  }
}
