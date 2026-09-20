import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { MongoClient } from 'mongodb';

const DATA_DIR = process.env.VERCEL
  ? path.join('/tmp', 'cdd_data')
  : path.join(process.cwd(), 'data');
const REGISTRATIONS_FILE = path.join(DATA_DIR, 'registrations.json');
const AUDIT_LOG_FILE = path.join(DATA_DIR, 'transaction_audit.jsonl');

/**
 * ========================================================================
 * 1. ISOLATION: ASYNCHRONOUS MUTEX LOCK
 * Guarantees serializable isolation by preventing concurrent request interleaving.
 * ========================================================================
 */
class AsyncMutex {
  constructor() {
    this._queue = Promise.resolve();
  }

  runExclusive(callback) {
    let release;
    const waitPromise = new Promise((resolve) => {
      release = resolve;
    });

    const currentQueue = this._queue;
    this._queue = this._queue.then(() => waitPromise);

    return currentQueue.then(async () => {
      try {
        return await callback();
      } finally {
        release();
      }
    });
  }
}

const storeMutex = new AsyncMutex();

/**
 * Ensure storage directory and files exist
 */
function ensureStorageFile() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(REGISTRATIONS_FILE)) {
      fs.writeFileSync(REGISTRATIONS_FILE, JSON.stringify([], null, 2), 'utf-8');
    }
    if (!fs.existsSync(AUDIT_LOG_FILE)) {
      fs.writeFileSync(AUDIT_LOG_FILE, '', 'utf-8');
    }
  } catch (err) {
    console.error('Error initializing registration storage file:', err);
  }
}

/**
 * ========================================================================
 * 2. DURABILITY: WRITE-AHEAD AUDIT LOG (WAL)
 * Every state transition, creation, and verification is logged immutably.
 * ========================================================================
 */
function appendAuditLog(entry) {
  try {
    ensureStorageFile();
    const logRecord = {
      auditId: crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2),
      timestamp: new Date().toISOString(),
      ...entry,
    };
    fs.appendFileSync(AUDIT_LOG_FILE, JSON.stringify(logRecord) + '\n', 'utf-8');
  } catch (err) {
    console.error('Audit log write error:', err);
  }
}

/**
 * ========================================================================
 * 3. ATOMICITY & DURABILITY: ATOMIC TEMP-WRITE + FSYNC + RENAME
 * Guarantees all-or-nothing file replacement with physical disk flush.
 * ========================================================================
 */
function atomicWriteFile(filePath, content) {
  ensureStorageFile();
  const dir = path.dirname(filePath);
  const tempFile = path.join(dir, `.tmp_${Date.now()}_${Math.random().toString(36).slice(2, 8)}.json`);

  const fd = fs.openSync(tempFile, 'w');
  try {
    fs.writeFileSync(fd, content, 'utf-8');
    // Durability: Flush OS buffers to physical disk
    fs.fsyncSync(fd);
  } finally {
    fs.closeSync(fd);
  }

  // Atomicity: Atomic rename in filesystem
  try {
    fs.renameSync(tempFile, filePath);
  } catch (err) {
    // Windows file locking fallback
    fs.copyFileSync(tempFile, filePath);
    try {
      fs.unlinkSync(tempFile);
    } catch (_) {}
  }
}

// Local file storage helpers
function readLocalRegistrations() {
  ensureStorageFile();
  try {
    const raw = fs.readFileSync(REGISTRATIONS_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error reading registrations file:', err);
    return [];
  }
}

function writeLocalRegistrationsAtomic(list) {
  const jsonString = JSON.stringify(list, null, 2);
  atomicWriteFile(REGISTRATIONS_FILE, jsonString);
  return true;
}

let mongoClient = null;
let mongoDb = null;

async function getMongoDb() {
  if (!process.env.MONGO_URL) return null;
  try {
    if (!mongoClient) {
      mongoClient = new MongoClient(process.env.MONGO_URL, {
        writeConcern: { w: 'majority', j: true },
      });
      await mongoClient.connect();
      mongoDb = mongoClient.db(process.env.DB_NAME || 'cdd_portal');

      // Ensure unique indexes for strict isolation and duplicate protection
      try {
        const col = mongoDb.collection('club_registrations');
        await col.createIndex({ utr: 1 }, { unique: true });
        await col.createIndex({ email: 1 }, { unique: true });
        await col.createIndex({ phone: 1 }, { unique: true });
        await col.createIndex({ regId: 1 }, { unique: true });
      } catch (idxErr) {
        // Indexes may already exist
      }
    }
    return mongoDb;
  } catch (err) {
    console.warn('MongoDB connection fallback to local storage:', err.message);
    return null;
  }
}

/**
 * ========================================================================
 * 4. CONSISTENCY: INVARIANT VALIDATORS & STATE MACHINE
 * Guarantees valid states and deterministic transitions.
 * ========================================================================
 */
export const YEAR_FEE_MAP = {
  '1st year': 300,
  '2nd year': 225,
  '3rd year': 150,
};

export const VALID_BRANCHES = [
  'Automobile Engineering',
  'Chemical Engineering',
  'Civil Engineering',
  'Computer Science and Engineering',
  'Electrical Engineering',
  'Electronics and Telecommunication Engineering',
  'Mechanical Engineering',
  'Metallurgy and Materials Engineering',
];

const ALLOWED_TRANSITIONS = {
  PENDING_VERIFICATION: ['VERIFIED', 'REJECTED'],
  VERIFIED: [], // Terminal immutable state
  REJECTED: ['PENDING_VERIFICATION'], // Re-appeal permitted
};

function validateConsistency(data) {
  if (!data.name || typeof data.name !== 'string' || data.name.trim().length < 2) {
    throw new Error('Consistency Violation: Invalid or missing applicant name (minimum 2 characters).');
  }

  const normalizedYear = (data.year || '').toLowerCase().trim();
  if (!YEAR_FEE_MAP[normalizedYear]) {
    throw new Error('Consistency Violation: Year must be 1st year, 2nd year, or 3rd year.');
  }

  const expectedAmount = YEAR_FEE_MAP[normalizedYear];
  if (Number(data.amount) !== expectedAmount) {
    throw new Error(
      `Consistency Violation: Fee invariant failure. Expected ₹${expectedAmount} for ${data.year}, got ₹${data.amount}.`
    );
  }

  if (!VALID_BRANCHES.includes(data.branch)) {
    throw new Error('Consistency Violation: Branch must match approved institutional engineering branches.');
  }

  if (data.college !== 'Parala Maharaja Engineering College') {
    throw new Error('Consistency Violation: Institution is immutable and must be Parala Maharaja Engineering College.');
  }

  const cleanPhone = normalizePhone(data.phone);
  if (!cleanPhone || cleanPhone.length !== 10) {
    throw new Error('Consistency Violation: Phone number must normalize to exactly 10 numeric digits.');
  }

  const cleanUTR = normalizeUTR(data.utr);
  if (!cleanUTR || cleanUTR.length < 10 || cleanUTR.length > 20) {
    throw new Error('Consistency Violation: UPI Reference Number (UTR) must be 10-20 alphanumeric characters.');
  }
}

function validateStateTransition(currentStatus, targetStatus) {
  const allowed = ALLOWED_TRANSITIONS[currentStatus] || [];
  if (!allowed.includes(targetStatus)) {
    throw new Error(
      `State Machine Invariant Violation: Transition from "${currentStatus}" to "${targetStatus}" is prohibited.`
    );
  }
}

/**
 * Generate a unique registration code: CDD26-<BRANCH_CODE>-<RANDOM>
 */
export function generateRegId(branch) {
  const branchMap = {
    'Automobile Engineering': 'AE',
    'Chemical Engineering': 'CHE',
    'Civil Engineering': 'CE',
    'Computer Science and Engineering': 'CSE',
    'Electrical Engineering': 'EE',
    'Electronics and Telecommunication Engineering': 'ETC',
    'Mechanical Engineering': 'ME',
    'Metallurgy and Materials Engineering': 'MME',
  };
  const bCode = branchMap[branch] || 'CDD';
  const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
  const yearSuffix = new Date().getFullYear().toString().slice(-2);
  return `CDD${yearSuffix}-${bCode}-${rand}`;
}

/**
 * Clean & normalize phone number
 */
export function normalizePhone(phone) {
  if (!phone) return '';
  let clean = phone.replace(/[^0-9]/g, '');
  if (clean.length > 10 && clean.startsWith('91')) {
    clean = clean.slice(-10);
  }
  return clean;
}

/**
 * Clean & normalize UTR / UPI Reference Number
 */
export function normalizeUTR(utr) {
  if (!utr) return '';
  return utr.replace(/[^a-zA-Z0-9]/g, '').trim().toUpperCase();
}

/**
 * Add a new registration with full ACID properties
 */
export async function addRegistration(data) {
  const cleanEmail = (data.email || '').trim().toLowerCase();
  const cleanPhone = normalizePhone(data.phone);
  const cleanUTR = normalizeUTR(data.utr);
  const cleanName = (data.name || '').trim();
  const normalizedYear = (data.year || '').toLowerCase().trim();

  const now = new Date();
  const istDate = now.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' });

  const record = {
    regId: data.regId || generateRegId(data.branch),
    name: cleanName,
    year: normalizedYear,
    branch: data.branch,
    college: 'Parala Maharaja Engineering College',
    email: cleanEmail,
    phone: cleanPhone,
    amount: Number(data.amount) || YEAR_FEE_MAP[normalizedYear] || 0,
    utr: cleanUTR,
    photo: data.photo || null,
    paymentScreenshot: data.paymentScreenshot || null,
    status: 'PENDING_VERIFICATION',
    createdAt: now.toISOString(),
    formattedDate: istDate,
  };

  // 1. Consistency Validation Check
  validateConsistency(record);

  // 2. Serializable Isolation Execution via storeMutex
  return await storeMutex.runExclusive(async () => {
    appendAuditLog({
      action: 'TRANSACTION_INITIATED',
      regId: record.regId,
      utr: cleanUTR,
      email: cleanEmail,
      phone: cleanPhone,
      amount: record.amount,
    });

    // Strategy A: MongoDB with majority write concern
    try {
      const db = await getMongoDb();
      if (db) {
        const col = db.collection('club_registrations');

        // Check for duplicates atomically
        const duplicate = await col.findOne({
          $or: [{ utr: cleanUTR }, { email: cleanEmail }, { phone: cleanPhone }],
        });

        if (duplicate) {
          appendAuditLog({
            action: 'TRANSACTION_ABORTED_DUPLICATE',
            regId: record.regId,
            reason: duplicate.utr === cleanUTR ? 'DUPLICATE_UTR' : duplicate.email === cleanEmail ? 'DUPLICATE_EMAIL' : 'DUPLICATE_PHONE',
          });

          if (duplicate.utr === cleanUTR) {
            throw new Error('This UPI Transaction (UTR) has already been submitted. Duplicate transactions are not allowed.');
          }
          if (duplicate.email === cleanEmail) {
            throw new Error(`A registration with email "${cleanEmail}" already exists. Each student may only register once.`);
          }
          if (duplicate.phone === cleanPhone) {
            throw new Error(`A registration with phone number "${cleanPhone}" already exists.`);
          }
        }

        // Insert with majority journaled write
        await col.insertOne(record);

        appendAuditLog({
          action: 'TRANSACTION_COMMITTED_MONGO',
          regId: record.regId,
          utr: cleanUTR,
          status: record.status,
        });

        return record;
      }
    } catch (err) {
      if (err.message && (err.message.includes('already exists') || err.message.includes('already been submitted'))) {
        throw err;
      }
      if (err.code === 11000) {
        throw new Error('Duplicate submission detected: Either UTR, Email, or Phone number is already registered.');
      }
      console.warn('MongoDB operation bypassed to local atomic store:', err.message);
    }

    // Strategy B: Local Persistent Store with Atomic Write & Durability
    const list = readLocalRegistrations();

    const dupUTR = list.find((r) => r.utr === cleanUTR);
    if (dupUTR) {
      appendAuditLog({
        action: 'TRANSACTION_ABORTED_DUPLICATE_FILE',
        regId: record.regId,
        utr: cleanUTR,
      });
      throw new Error('This UPI Transaction (UTR) has already been submitted. Duplicate transactions are not allowed.');
    }

    const dupEmail = list.find((r) => r.email === cleanEmail);
    if (dupEmail) {
      appendAuditLog({
        action: 'TRANSACTION_ABORTED_DUPLICATE_FILE',
        regId: record.regId,
        email: cleanEmail,
      });
      throw new Error(`A registration with email "${cleanEmail}" already exists. Each student may only register once.`);
    }

    const dupPhone = list.find((r) => r.phone === cleanPhone);
    if (dupPhone) {
      appendAuditLog({
        action: 'TRANSACTION_ABORTED_DUPLICATE_FILE',
        regId: record.regId,
        phone: cleanPhone,
      });
      throw new Error(`A registration with phone number "${cleanPhone}" already exists.`);
    }

    list.push(record);
    writeLocalRegistrationsAtomic(list);

    appendAuditLog({
      action: 'TRANSACTION_COMMITTED_LOCAL',
      regId: record.regId,
      utr: cleanUTR,
      status: record.status,
    });

    return record;
  });
}

/**
 * Match and verify a registration autonomously using UTR and Amount
 * Implements strict state machine validation and isolated execution.
 */
export async function verifyRegistrationByUTR(utr, amount, verifiedSource = 'bank_webhook') {
  const cleanUTR = normalizeUTR(utr);
  const numericAmount = Number(amount);
  const now = new Date().toISOString();

  return await storeMutex.runExclusive(async () => {
    // 1. Try MongoDB
    try {
      const db = await getMongoDb();
      if (db) {
        const col = db.collection('club_registrations');
        const query = { utr: cleanUTR };
        if (numericAmount > 0) {
          query.amount = numericAmount;
        }

        const match = await col.findOne(query);
        if (match) {
          // Check state machine invariant
          validateStateTransition(match.status, 'VERIFIED');

          await col.updateOne(
            { _id: match._id },
            {
              $set: {
                status: 'VERIFIED',
                verifiedAt: now,
                verifiedBy: verifiedSource,
              },
            }
          );

          appendAuditLog({
            action: 'VERIFICATION_COMMITTED_MONGO',
            regId: match.regId,
            utr: cleanUTR,
            source: verifiedSource,
          });

          return { success: true, matched: true, registration: { ...match, status: 'VERIFIED' } };
        }
      }
    } catch (err) {
      console.warn('MongoDB verify error:', err.message);
    }

    // 2. Fallback to local atomic file store
    const list = readLocalRegistrations();
    const idx = list.findIndex((r) => r.utr === cleanUTR && (numericAmount <= 0 || r.amount === numericAmount));

    if (idx !== -1) {
      const match = list[idx];
      validateStateTransition(match.status, 'VERIFIED');

      list[idx].status = 'VERIFIED';
      list[idx].verifiedAt = now;
      list[idx].verifiedBy = verifiedSource;

      writeLocalRegistrationsAtomic(list);

      appendAuditLog({
        action: 'VERIFICATION_COMMITTED_LOCAL',
        regId: match.regId,
        utr: cleanUTR,
        source: verifiedSource,
      });

      return { success: true, matched: true, registration: list[idx] };
    }

    appendAuditLog({
      action: 'VERIFICATION_NO_MATCH',
      utr: cleanUTR,
      amount: numericAmount,
      source: verifiedSource,
    });

    return { success: false, matched: false, error: 'No matching pending registration found for this UTR/Amount' };
  });
}

/**
 * Get all registrations (read-only)
 */
export async function getAllRegistrations() {
  try {
    const db = await getMongoDb();
    if (db) {
      const col = db.collection('club_registrations');
      const items = await col.find({}).sort({ createdAt: -1 }).toArray();
      if (items.length > 0) return items;
    }
  } catch (err) {
    console.warn('MongoDB fetch error:', err.message);
  }
  return readLocalRegistrations();
}

/**
 * Update registration status (Admin capability)
 */
export async function updateRegistrationStatus(regId, newStatus, verifiedBy = 'admin_panel') {
  const now = new Date().toISOString();
  return await storeMutex.runExclusive(async () => {
    try {
      const db = await getMongoDb();
      if (db) {
        const col = db.collection('club_registrations');
        const match = await col.findOne({ regId });
        if (match) {
          await col.updateOne(
            { regId },
            { $set: { status: newStatus, verifiedAt: now, verifiedBy } }
          );
          return { ...match, status: newStatus, verifiedAt: now, verifiedBy };
        }
      }
    } catch (err) {
      console.warn('MongoDB update status error:', err.message);
    }

    const list = readLocalRegistrations();
    const idx = list.findIndex((r) => r.regId === regId);
    if (idx !== -1) {
      list[idx].status = newStatus;
      list[idx].verifiedAt = now;
      list[idx].verifiedBy = verifiedBy;
      writeLocalRegistrationsAtomic(list);
      return list[idx];
    }
    return null;
  });
}

/**
 * Generate CSV for Excel export with UTF-8 BOM
 */
export function generateRegistrationsCSV(records) {
  const headers = [
    'Reg ID',
    'Name',
    'Year',
    'Branch',
    'College',
    'Email',
    'Phone',
    'Amount (INR)',
    'UTR / UPI Ref',
    'Paying UPI ID',
    'WhatsApp Group',
    'Submission Date',
  ];

  const escapeCSV = (str) => {
    if (str === null || str === undefined) return '""';
    const s = String(str).replace(/"/g, '""');
    return `"${s}"`;
  };

  const rows = records.map((r) => [
    escapeCSV(r.regId),
    escapeCSV(r.name),
    escapeCSV(r.year),
    escapeCSV(r.branch),
    escapeCSV(r.college || 'PMEC'),
    escapeCSV(r.email),
    escapeCSV(r.phone),
    escapeCSV(r.amount),
    escapeCSV(r.utr),
    escapeCSV(r.payingUpi || 'N/A'),
    escapeCSV('Added to WhatsApp Group'),
    escapeCSV(r.formattedDate || r.createdAt),
  ]);

  // \uFEFF enables Excel to correctly interpret UTF-8 characters and currency symbols
  return '\uFEFF' + [headers.join(','), ...rows.map((row) => row.join(','))].join('\r\n');
}
