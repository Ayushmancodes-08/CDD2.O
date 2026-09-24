import { pingMongoAtlas, getMongoDb } from '@/lib/mongodb';
import { GOOGLE_SCRIPT_URL } from '@/lib/cdd-constants';

export const dynamic = 'force-dynamic';

/**
 * GET /api/health
 * Public Uptime & Health Check Endpoint
 * Compatible with UptimeRobot, BetterStack, StatusPage, and Cron Pingers.
 */
export async function GET() {
  const startTime = Date.now();
  const dbHealth = await pingMongoAtlas();

  let registrationCount = 0;
  if (dbHealth.connected) {
    try {
      const db = await getMongoDb();
      if (db) {
        registrationCount = await db.collection('club_registrations').countDocuments();
      }
    } catch (e) {
      // countDocuments non-fatal
    }
  }

  const isHealthy = dbHealth.connected || dbHealth.mode === 'fallback_local';
  const responseTimeMs = Date.now() - startTime;

  return Response.json(
    {
      status: isHealthy ? 'healthy' : 'degraded',
      service: 'IIC PMEC Registration Portal (CDD 2.0)',
      timestamp: new Date().toISOString(),
      uptimeSeconds: Math.floor(process.uptime()),
      responseTimeMs,
      database: {
        connected: dbHealth.connected,
        mode: dbHealth.mode,
        latencyMs: dbHealth.latencyMs,
        acidTransactions: dbHealth.connected,
        databaseName: dbHealth.database || 'cdd_portal',
        activeRegistrations: registrationCount,
        error: dbHealth.error || null,
      },
      integrations: {
        googleAppsScript: Boolean(process.env.GOOGLE_SCRIPT_URL || GOOGLE_SCRIPT_URL),
        emailSmtp: Boolean(process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD),
        upiMerchant: Boolean(process.env.NEXT_PUBLIC_CLUB_UPI_ID),
      },
    },
    {
      status: isHealthy ? 200 : 503,
      headers: {
        'Cache-Control': 'no-store, max-age=0',
      },
    }
  );
}
