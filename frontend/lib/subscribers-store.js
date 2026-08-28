import fs from 'fs';
import path from 'path';
import { MongoClient } from 'mongodb';

const DATA_DIR = path.join(process.cwd(), 'data');
const SUBSCRIBERS_FILE = path.join(DATA_DIR, 'subscribers.json');

// Ensure data directory and file exist
function ensureStorageFile() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(SUBSCRIBERS_FILE)) {
      fs.writeFileSync(SUBSCRIBERS_FILE, JSON.stringify([], null, 2), 'utf-8');
    }
  } catch (err) {
    console.error('Error initializing subscriber storage file:', err);
  }
}

let mongoClient = null;
let mongoDb = null;

async function getMongoDb() {
  if (!process.env.MONGO_URL) return null;
  try {
    if (!mongoClient) {
      mongoClient = new MongoClient(process.env.MONGO_URL);
      await mongoClient.connect();
      mongoDb = mongoClient.db(process.env.DB_NAME || 'cdd_portal');
    }
    return mongoDb;
  } catch (err) {
    console.warn('MongoDB connection fallback to local storage:', err.message);
    return null;
  }
}

/**
 * Add or update a subscriber
 */
export async function addSubscriber(email, source = 'website_footer') {
  const cleanEmail = email.trim().toLowerCase();
  const now = new Date();
  const istDate = now.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' });

  const record = {
    email: cleanEmail,
    subscribedAt: now.toISOString(),
    formattedDate: istDate,
    source,
    status: 'active'
  };

  // 1. Try MongoDB
  try {
    const db = await getMongoDb();
    if (db) {
      await db.collection('newsletter_subscribers').updateOne(
        { email: cleanEmail },
        { $set: record },
        { upsert: true }
      );
    }
  } catch (err) {
    console.error('MongoDB save error:', err);
  }

  // 2. Always persist to local storage file as well
  try {
    ensureStorageFile();
    let currentList = [];
    if (fs.existsSync(SUBSCRIBERS_FILE)) {
      const content = fs.readFileSync(SUBSCRIBERS_FILE, 'utf-8');
      currentList = JSON.parse(content || '[]');
    }

    const existingIndex = currentList.findIndex(item => item.email === cleanEmail);
    if (existingIndex >= 0) {
      currentList[existingIndex] = { ...currentList[existingIndex], ...record };
    } else {
      currentList.push(record);
    }

    fs.writeFileSync(SUBSCRIBERS_FILE, JSON.stringify(currentList, null, 2), 'utf-8');
  } catch (err) {
    console.error('Local file save error:', err);
  }

  return record;
}

/**
 * Retrieve all subscribers
 */
export async function getAllSubscribers() {
  // 1. Try MongoDB first
  try {
    const db = await getMongoDb();
    if (db) {
      const list = await db.collection('newsletter_subscribers').find({}).toArray();
      if (list && list.length > 0) {
        return list.map(({ _id, ...rest }) => rest);
      }
    }
  } catch (err) {
    console.warn('MongoDB fetch error, reading local file:', err.message);
  }

  // 2. Fallback to local storage
  try {
    ensureStorageFile();
    if (fs.existsSync(SUBSCRIBERS_FILE)) {
      const content = fs.readFileSync(SUBSCRIBERS_FILE, 'utf-8');
      return JSON.parse(content || '[]');
    }
  } catch (err) {
    console.error('Error reading subscribers file:', err);
  }

  return [];
}

/**
 * Generate Excel-compatible CSV string
 */
export function generateSubscribersCSV(subscribers) {
  const headers = ['Email Address', 'Subscription Date (IST)', 'Timestamp (ISO)', 'Status', 'Source'];
  const rows = subscribers.map(sub => [
    `"${(sub.email || '').replace(/"/g, '""')}"`,
    `"${(sub.formattedDate || '').replace(/"/g, '""')}"`,
    `"${(sub.subscribedAt || '').replace(/"/g, '""')}"`,
    `"${(sub.status || 'active').replace(/"/g, '""')}"`,
    `"${(sub.source || 'website').replace(/"/g, '""')}"`
  ]);

  return [headers.join(','), ...rows.map(r => r.join(','))].join('\r\n');
}
