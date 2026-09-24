import { pingMongoAtlas, getMongoDb } from '@/lib/mongodb';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  // Security Check: If CRON_SECRET is configured, enforce Bearer authorization
  if (process.env.CRON_SECRET) {
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return new NextResponse('Unauthorized', { status: 401 });
    }
  }

  const start = Date.now();
  try {
    const pingResult = await pingMongoAtlas();
    const latencyMs = Date.now() - start;

    // Record uptime heartbeat into MongoDB Atlas
    if (pingResult.connected) {
      try {
        const db = await getMongoDb();
        if (db) {
          await db.collection('uptime_heartbeats').insertOne({
            timestamp: new Date(),
            createdAt: new Date(),
            status: 'ALIVE',
            latencyMs,
            source: 'vercel_cron',
          });
        }
      } catch (hbErr) {
        console.warn('Heartbeat insert non-fatal warning:', hbErr.message);
      }
    }

    return NextResponse.json({
      success: pingResult.connected,
      message: pingResult.connected
        ? 'MongoDB Atlas cluster pinged and warmed successfully'
        : 'Running in resilient standalone fallback mode',
      latencyMs,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Cron Keep-Alive Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to ping database',
      },
      { status: 500 }
    );
  }
}
