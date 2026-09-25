/**
 * NPCI Compliant UPI URI & Deep-Link Utility
 * Official Club Payee: Ayushman Patra (BHARATPE2O0M0B8D0A10111@unitype)
 */

export const DEFAULT_CLUB_UPI = process.env.NEXT_PUBLIC_CLUB_UPI_ID || 'BHARATPE2O0M0B8D0A10111@unitype';
export const DEFAULT_PAYEE_NAME = process.env.NEXT_PUBLIC_CLUB_PAYEE_NAME || 'BharatPe Merchant';
export const DEFAULT_TAP_TO_PAY_UPI = process.env.NEXT_PUBLIC_TAP_TO_PAY_UPI || '8480496340-2@ybl';
export const DEFAULT_TAP_TO_PAY_NAME = process.env.NEXT_PUBLIC_TAP_TO_PAY_NAME || 'Ayushman Patra';
export const DEFAULT_WHATSAPP_GROUP = process.env.NEXT_PUBLIC_WHATSAPP_GROUP_URL || 'https://chat.whatsapp.com/DeHa9ful3zBI9troj4vg4f';
export const OFFICIAL_QR_IMAGE = '/cdd-upi-qr.jpg';

/**
 * Recognized NPCI PSP and Bank UPI Handles
 */
export const KNOWN_UPI_HANDLES = {
  // BharatPe Merchant Handles
  '@unitype': 'BharatPe (Unity Small Finance Bank)',
  '@bharatpe': 'BharatPe',

  // Google Pay
  '@oksbi': 'State Bank of India (Google Pay)',
  '@okhdfcbank': 'HDFC Bank (Google Pay)',
  '@okaxis': 'Axis Bank (Google Pay)',
  '@okicici': 'ICICI Bank (Google Pay)',

  // PhonePe
  '@ybl': 'PhonePe (Yes Bank)',
  '@ibl': 'PhonePe (ICICI Bank)',
  '@axl': 'PhonePe (Axis Bank)',

  // Paytm
  '@paytm': 'Paytm Payments Bank',

  // Amazon Pay
  '@apl': 'Amazon Pay (Axis Bank)',
  '@rapl': 'Amazon Pay (RBL Bank)',

  // Airtel
  '@airtel': 'Airtel Payments Bank',

  // Major Public/Private Banks
  '@sbi': 'State Bank of India',
  '@hdfcbank': 'HDFC Bank',
  '@icici': 'ICICI Bank',
  '@axisbank': 'Axis Bank',
  '@kotak': 'Kotak Mahindra Bank',
  '@kmbl': 'Kotak Mahindra Bank',
  '@barodampay': 'Bank of Baroda',
  '@pnb': 'Punjab National Bank',
  '@idfcbank': 'IDFC FIRST Bank',
  '@indus': 'IndusInd Bank',
  '@federal': 'Federal Bank',
  '@fbl': 'Federal Bank (Fi / Jupiter)',
  '@canara': 'Canara Bank',
  '@unionbank': 'Union Bank of India',
  '@ubi': 'Union Bank of India',
  '@iob': 'Indian Overseas Bank',
  '@postbank': 'India Post Payments Bank (IPPB)',
  '@jio': 'Jio Payments Bank',
  '@citi': 'Citibank India',
  '@sc': 'Standard Chartered',
  '@hsbc': 'HSBC India',
  '@rbl': 'RBL Bank',

  // FinTechs & NeoBanks
  '@jupiteraxis': 'Jupiter Money (Axis Bank)',
  '@slice': 'Slice (Axis Bank / RBL)',
  '@cred': 'CRED (Axis Bank)',
  '@fam': 'FamPay (IDFC Bank)',
  '@fi': 'Fi Money (Federal Bank)',
  '@naviaxis': 'Navi (Axis Bank)',
  '@superyes': 'super.money (Yes Bank)',
  '@freecharge': 'Freecharge',
  '@mobikwik': 'MobiKwik',
  '@upi': 'BHIM / NPCI Official',
};

/**
 * Validates whether a given string is a valid NPCI UPI ID (VPA)
 * Returns { isValid, vpa, username, handle, bankName, isKnownProvider, reason }
 */
export function validateUPI(vpa) {
  if (!vpa || typeof vpa !== 'string') {
    return { isValid: false, reason: 'Please enter a UPI ID.' };
  }

  const clean = vpa.trim().toLowerCase();

  // Format check: must contain exactly one '@'
  const parts = clean.split('@');
  if (parts.length !== 2) {
    return { isValid: false, reason: 'UPI ID must contain username and handle separated by "@" (e.g. name@oksbi).' };
  }

  const [username, handlePart] = parts;
  const handle = `@${handlePart}`;

  if (!username || username.length < 2) {
    return { isValid: false, reason: 'Username before "@" must be at least 2 characters.' };
  }

  // Username syntax: alphanumeric, dot, hyphen, underscore
  const usernameRegex = /^[a-zA-Z0-9.\-_]{2,64}$/;
  if (!usernameRegex.test(username)) {
    return { isValid: false, reason: 'Username contains invalid characters (only letters, numbers, dot, hyphen, underscore allowed).' };
  }

  // Handle syntax: alphanumeric (2 to 32 chars)
  const handleRegex = /^[a-zA-Z0-9]{2,32}$/;
  if (!handleRegex.test(handlePart)) {
    return { isValid: false, reason: 'Bank handle contains invalid characters.' };
  }

  const knownBank = KNOWN_UPI_HANDLES[handle] || null;

  return {
    isValid: true,
    vpa: clean,
    username,
    handle,
    bankName: knownBank || `${handlePart.toUpperCase()} (UPI PSP)`,
    isKnownProvider: !!knownBank,
  };
}

/**
 * Generate standard NPCI UPI URI
 * NOTE: The 'pa' (Payee Address) parameter MUST retain the literal '@' symbol.
 * Encoding '@' as '%40' breaks parsing on BHIM, Google Pay, and several banking apps.
 */
export function generateUPIUri({
  vpa = DEFAULT_CLUB_UPI,
  name = DEFAULT_PAYEE_NAME,
  amount = 300,
  note = 'IIC PMEC Registration',
} = {}) {
  // Clean VPA: remove spaces, preserve '@'
  const cleanVpa = (vpa || DEFAULT_CLUB_UPI).trim().replace(/\s+/g, '');
  // BharatPe merchant handles are registered under 'BharatPe Merchant' in NPCI switch
  const isBharatPe = cleanVpa.toLowerCase().endsWith('@unitype') || cleanVpa.toLowerCase().endsWith('@bharatpe');
  const resolvedName = isBharatPe ? 'BharatPe Merchant' : (name || DEFAULT_PAYEE_NAME);
  const cleanName = encodeURIComponent(resolvedName.trim());
  const cleanNote = encodeURIComponent((note || 'IIC PMEC Membership').trim().slice(0, 30));
  const formattedAmount = Number(amount || 300).toFixed(2);

  return `upi://pay?pa=${cleanVpa}&pn=${cleanName}&am=${formattedAmount}&cu=INR&tn=${cleanNote}`;
}

/**
 * Generate App-Specific UPI Deep Links for Mobile Devices
 */
export function getAppUpiLinks(options = {}) {
  const baseUri = generateUPIUri(options);
  // Extract query string after 'upi://pay?'
  const query = baseUri.replace('upi://pay?', '');

  return {
    generic: baseUri,
    gpay: `tez://upi/pay?${query}`,
    phonepe: `phonepe://pay?${query}`,
    paytm: `paytmmp://pay?${query}`,
    bhim: baseUri,
  };
}
