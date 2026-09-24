import { pingMongoAtlas, getMongoDb } from '@/lib/mongodb';

export const dynamic = 'force-dynamic';

/**
 * GET /api/uptime
 * Returns uptime history and recent heartbeats
 */
export async function GET() {
  const ping = await pingMongoAtlas();
  let recentHeartbeats = [];

  if (ping.connected) {
    try {
      const db = await getMongoDb();
      if (db) {
        recentHeartbeats = await db
          .collection('uptime_heartbeats')
          .find({})
          .sort({ timestamp: -1 })
          .limit(20)
          .project({ _id: 0 })
          .toArray();
      }
    } catch (e) {
      console.warn('Non-fatal error reading heartbeats:', e.message);
    }
  }

  return Response.json({
    status: ping.connected ? 'online' : 'standby',
    currentPing: ping,
    heartbeatsCount: recentHeartbeats.length,
    recentHeartbeats,
    timestamp: new Date().toISOString(),
  });
}

/**
 * POST /api/uptime
 * Uptime "Putter" - Inserts a heartbeat ping into MongoDB Atlas
 * Keeps the Atlas cluster warm and records uptime tracking.
 */
export async function POST(req) {
  const start = Date.now();
  const ping = await pingMongoAtlas();
  const latencyMs = Date.now() - start;

  let inserted = false;
  let error = null;

  if (ping.connected) {
    try {
      const db = await getMongoDb();
      if (db) {
        let source = 'external_pinger';
        try {
          const body = await req.json();
          if (body && body.source) source = body.source;
        } catch (e) {
          // Empty or non-json body allowed
        }

        const heartbeat = {
          timestamp: new Date(),
          createdAt: new Date(),
          status: 'UP',
          latencyMs,
          source,
          userAgent: req.headers.get('user-agent') || 'system',
        };

        await db.collection('uptime_heartbeats').insertOne(heartbeat);
        inserted = true;
      }
    } catch (err) {
      error = err.message;
    }
  }

  return Response.json({
    success: ping.connected,
    message: ping.connected
      ? 'MongoDB Atlas heartbeat recorded and cluster warmed'
      : 'Cluster standby mode active',
    heartbeatRecorded: inserted,
    latencyMs,
    error,
    timestamp: new Date().toISOString(),
  });
}
