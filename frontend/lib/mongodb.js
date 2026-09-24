import { MongoClient } from 'mongodb';
import dns from 'dns';

// Ensure IPv4 resolution priority and public DNS fallback for robust Atlas SRV lookup across platforms
try {
  if (dns.setDefaultResultOrder) {
    dns.setDefaultResultOrder('ipv4first');
  }
  dns.setServers(['8.8.8.8', '1.1.1.1', '8.8.4.4']);
} catch (_) {}

/**
 * ==============================================================================
 * UNIFIED MONGODB ATLAS POOLING & ACID ENGINE
 * ==============================================================================
 * Implements official Next.js / Vercel connection caching across serverless
 * container invocations with majority write concern, connection pooling,
 * and multi-document ACID transactions.
 * ==============================================================================
 */

const MONGO_URL = (process.env.MONGO_URL || process.env.MONGODB_URI || '').trim();
const DB_NAME = (process.env.DB_NAME || 'cdd_portal').trim();

// MongoDB Client Connection Options tailored for Serverless & Atlas Replica Sets
const CLIENT_OPTIONS = {
  maxPoolSize: 10,
  minPoolSize: 1,
  maxIdleTimeMS: 30000,
  serverSelectionTimeoutMS: 8000,
  connectTimeoutMS: 10000,
  socketTimeoutMS: 45000,
  retryWrites: true,
  retryReads: true,
  writeConcern: {
    w: 'majority',
    journal: true, // Durability: wait for on-disk journal commit
  },
  readConcern: {
    level: 'majority', // Isolation: read only committed data
  },
};

let cachedClient = null;
let cachedPromise = null;
let indexesInitialized = false;

/**
 * Get cached MongoClient promise (Singleton pattern for Next.js & Serverless)
 */
export async function getMongoClient() {
  if (!MONGO_URL) return null;

  if (cachedClient) {
    return cachedClient;
  }

  if (!cachedPromise) {
    if (process.env.NODE_ENV === 'development') {
      // In development, preserve client across hot-reloads in global
      if (!global._mongoClientPromise) {
        const client = new MongoClient(MONGO_URL, CLIENT_OPTIONS);
        global._mongoClientPromise = client.connect();
      }
      cachedPromise = global._mongoClientPromise;
    } else {
      // In production (Vercel), create a fresh promise per container lifecycle
      const client = new MongoClient(MONGO_URL, CLIENT_OPTIONS);
      cachedPromise = client.connect();
    }
  }

  try {
    cachedClient = await cachedPromise;
    // Auto-ensure indexes once per container lifecycle
    if (!indexesInitialized) {
      await ensureMongoIndexes(cachedClient.db(DB_NAME)).catch((e) => {
        console.warn('Non-fatal MongoDB index initialization warning:', e.message);
      });
      indexesInitialized = true;
    }
    return cachedClient;
  } catch (err) {
    cachedPromise = null;
    cachedClient = null;
    console.warn('MongoDB Atlas connection failed:', err.message);
    return null;
  }
}

/**
 * Get MongoDB Database instance
 */
export async function getMongoDb() {
  const client = await getMongoClient();
  if (!client) return null;
  return client.db(DB_NAME);
}

/**
 * Fast ping and health metric for MongoDB Atlas
 */
export async function pingMongoAtlas() {
  if (!MONGO_URL) {
    return {
      connected: false,
      mode: 'fallback_local',
      error: 'MONGO_URL is not configured in environment variables',
      latencyMs: 0,
    };
  }

  const start = Date.now();
  try {
    const client = await getMongoClient();
    if (!client) {
      return {
        connected: false,
        mode: 'fallback_local',
        error: 'Could not establish connection to MongoDB Atlas cluster',
        latencyMs: Date.now() - start,
      };
    }

    const db = client.db(DB_NAME);
    const pingResult = await db.command({ ping: 1 });
    const latencyMs = Date.now() - start;

    return {
      connected: pingResult.ok === 1,
      mode: 'mongodb_atlas',
      database: DB_NAME,
      latencyMs,
      timestamp: new Date().toISOString(),
    };
  } catch (err) {
    return {
      connected: false,
      mode: 'fallback_local',
      error: err.message || 'Ping failed',
      latencyMs: Date.now() - start,
    };
  }
}

/**
 * Ensures strict unique indexes for Consistency and Isolation
 */
export async function ensureMongoIndexes(db) {
  if (!db) return;
  try {
    const registrations = db.collection('club_registrations');
    await registrations.createIndex({ utr: 1 }, { unique: true });
    await registrations.createIndex({ email: 1 }, { unique: true });
    await registrations.createIndex({ phone: 1 }, { unique: true });
    await registrations.createIndex({ regId: 1 }, { unique: true });
    await registrations.createIndex({ sessionId: 1 }, { sparse: true });
    await registrations.createIndex({ createdAt: -1 });

    // Uptime Heartbeats Collection with TTL of 30 days (auto-cleans old pings)
    const heartbeats = db.collection('uptime_heartbeats');
    await heartbeats.createIndex({ timestamp: -1 });
    await heartbeats.createIndex(
      { createdAt: 1 },
      { expireAfterSeconds: 30 * 24 * 60 * 60 } // 30 Days TTL
    );

    // Audit logs collection
    const auditLogs = db.collection('transaction_audit_logs');
    await auditLogs.createIndex({ timestamp: -1 });
    await auditLogs.createIndex({ regId: 1 });
  } catch (err) {
    // Indexes might already exist
    if (err.code !== 85 && err.code !== 86) {
      console.warn('Index check note:', err.message);
    }
  }
}

/**
 * ==============================================================================
 * ACID TRANSACTION EXECUTOR
 * ==============================================================================
 * Executes the given async operations inside a native multi-document
 * transaction with Read/Write Majority isolation.
 * Automatically commits on success or aborts and rolls back on error.
 * ==============================================================================
 */
export async function runMongoTransaction(operation) {
  const client = await getMongoClient();
  if (!client) {
    throw new Error('Database is offline: MongoDB Atlas connection unavailable.');
  }

  const session = client.startSession();
  const transactionOptions = {
    readPreference: 'primary',
    readConcern: { level: 'majority' },
    writeConcern: { w: 'majority', journal: true },
  };

  try {
    let result;
    await session.withTransaction(async () => {
      const db = client.db(DB_NAME);
      result = await operation({ db, session, client });
    }, transactionOptions);

    return result;
  } finally {
    await session.endSession();
  }
}
