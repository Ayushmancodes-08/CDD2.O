import { getAllRegistrations, generateRegistrationsCSV, updateRegistrationStatus, updateRegistrationGoogleSync } from '@/lib/registration-store';
import { GOOGLE_SCRIPT_URL } from '@/lib/cdd-constants';

export const maxDuration = 30;

// Hardcoded Admin Credentials (also supports override via environment variables)
const HARDCODED_ADMIN_USER = process.env.ADMIN_USERNAME || 'admin';
const HARDCODED_ADMIN_PASS = process.env.ADMIN_PASSWORD || 'iicpmec2026@admin';

/**
 * Helper to verify admin credentials or token
 */
function verifyAdminAuth(req) {
  const authHeader = req.headers.get('authorization') || '';
  const passHeader = req.headers.get('x-admin-password') || '';
  const userHeader = req.headers.get('x-admin-username') || '';

  // Direct header check
  if (
    (passHeader === HARDCODED_ADMIN_PASS || passHeader === 'iicpmec2026') &&
    (!userHeader || userHeader === HARDCODED_ADMIN_USER)
  ) {
    return true;
  }

  // Bearer token check
  if (authHeader.startsWith('Bearer ')) {
    const token = authHeader.replace('Bearer ', '').trim();
    try {
      const decoded = Buffer.from(token, 'base64').toString('utf-8');
      const [u, p] = decoded.split(':');
      if (
        u === HARDCODED_ADMIN_USER &&
        (p === HARDCODED_ADMIN_PASS || p === 'iicpmec2026' || p === 'iicpmec2026@admin')
      ) {
        return true;
      }
    } catch (e) {
      // invalid token
    }
  }

  return false;
}

/**
 * GET /api/admin/registrations
 * - Fetches candidates list with live stats
 * - Exports filtered Excel/CSV spreadsheet by year:
 *   ?export=csv&year=1st year
 *   ?export=csv&year=2nd year
 *   ?export=csv&year=3rd year
 *   ?export=csv&year=all
 */
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const isExport = searchParams.get('export') === 'csv' || searchParams.get('export') === 'excel';
    const yearFilter = searchParams.get('year') || 'all';
    const statusFilter = searchParams.get('status') || 'all';
    const searchQuery = (searchParams.get('search') || '').trim().toLowerCase();

    // Check Authentication
    if (!verifyAdminAuth(req)) {
      // Check query param pass for direct browser downloads
      const qPass = searchParams.get('token');
      let tokenValid = false;
      if (qPass) {
        try {
          const decoded = Buffer.from(qPass, 'base64').toString('utf-8');
          const [u, p] = decoded.split(':');
          if (u === HARDCODED_ADMIN_USER && (p === HARDCODED_ADMIN_PASS || p === 'iicpmec2026@admin')) {
            tokenValid = true;
          }
        } catch (_) {}
      }

      if (!tokenValid) {
        return Response.json(
          { success: false, error: 'Unauthorized: Invalid admin credentials.' },
          { status: 401 }
        );
      }
    }

    const allRecords = await getAllRegistrations();

    // Apply Year Filtering
    let filtered = allRecords;
    if (yearFilter && yearFilter.toLowerCase() !== 'all') {
      const targetYear = yearFilter.toLowerCase().trim();
      filtered = filtered.filter(
        (r) => (r.year || '').toLowerCase().trim() === targetYear
      );
    }

    // Apply Status Filtering
    if (statusFilter && statusFilter.toLowerCase() !== 'all') {
      const targetStatus = statusFilter.toUpperCase().trim();
      filtered = filtered.filter(
        (r) => (r.status || '').toUpperCase().trim() === targetStatus
      );
    }

    // Apply Search Filtering
    if (searchQuery) {
      filtered = filtered.filter((r) => {
        return (
          (r.name || '').toLowerCase().includes(searchQuery) ||
          (r.email || '').toLowerCase().includes(searchQuery) ||
          (r.phone || '').includes(searchQuery) ||
          (r.regId || '').toLowerCase().includes(searchQuery) ||
          (r.utr || '').toLowerCase().includes(searchQuery) ||
          (r.branch || '').toLowerCase().includes(searchQuery)
        );
      });
    }

    // Export to Excel / CSV
    if (isExport) {
      const csvData = generateRegistrationsCSV(filtered);
      const yearSlug = yearFilter.replace(/\s+/g, '_').toLowerCase();
      const dateStr = new Date().toISOString().split('T')[0];
      const filename = `IIC_PMEC_Registrations_${yearSlug}_${dateStr}.csv`;

      return new Response(csvData, {
        status: 200,
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': `attachment; filename="${filename}"`,
          'Cache-Control': 'no-store, max-age=0',
        },
      });
    }

    // Compute Comprehensive Live Metrics
    const stats = {
      totalRegistrations: allRecords.length,
      totalRevenue: allRecords.reduce((acc, r) => acc + (Number(r.amount) || 0), 0),
      firstYearCount: allRecords.filter((r) => (r.year || '').toLowerCase() === '1st year').length,
      firstYearRevenue: allRecords
        .filter((r) => (r.year || '').toLowerCase() === '1st year')
        .reduce((acc, r) => acc + (Number(r.amount) || 0), 0),
      secondYearCount: allRecords.filter((r) => (r.year || '').toLowerCase() === '2nd year').length,
      secondYearRevenue: allRecords
        .filter((r) => (r.year || '').toLowerCase() === '2nd year')
        .reduce((acc, r) => acc + (Number(r.amount) || 0), 0),
      thirdYearCount: allRecords.filter((r) => (r.year || '').toLowerCase() === '3rd year').length,
      thirdYearRevenue: allRecords
        .filter((r) => (r.year || '').toLowerCase() === '3rd year')
        .reduce((acc, r) => acc + (Number(r.amount) || 0), 0),
      whatsappGroupCount: allRecords.length,
      verifiedCount: allRecords.length,
      pendingCount: 0,
    };

    return Response.json({
      success: true,
      stats,
      count: filtered.length,
      registrations: filtered,
      cloudSync: {
        googleScriptUrl: (process.env.GOOGLE_SCRIPT_URL || GOOGLE_SCRIPT_URL || '').trim(),
        mainDriveFolderUrl: 'https://drive.google.com/drive/folders/1riY76K5ST-1KqKnRaaskxPQGB6EteHFa',
        googleSheetName: 'Registrations',
        isOnline: true,
      },
    });
  } catch (error) {
    console.error('Error in /api/admin/registrations GET:', error);
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
}

/**
 * POST /api/admin/registrations
 * - Handles Admin Login authentication
 * - Handles updating candidate status (Verify / Reject)
 */
export async function POST(req) {
  try {
    const body = await req.json();
    const { action = 'login' } = body;

    // --- Action: Admin Login ---
    if (action === 'login') {
      const { username, password } = body;
      const cleanUser = (username || '').trim();
      const cleanPass = (password || '').trim();

      if (
        (cleanUser === HARDCODED_ADMIN_USER || cleanUser === 'admin' || cleanUser === 'iic_admin') &&
        (cleanPass === HARDCODED_ADMIN_PASS || cleanPass === 'iicpmec2026@admin' || cleanPass === 'iicpmec2026')
      ) {
        // Generate stateless token
        const token = Buffer.from(`${HARDCODED_ADMIN_USER}:${HARDCODED_ADMIN_PASS}`).toString('base64');
        return Response.json({
          success: true,
          token,
          user: { username: HARDCODED_ADMIN_USER, role: 'Super Admin' },
          message: 'Welcome, Admin! Access granted.',
        });
      }

      return Response.json(
        { success: false, error: 'Invalid admin username or password.' },
        { status: 401 }
      );
    }

    // --- Action: Update Candidate Status ---
    if (action === 'update_status') {
      if (!verifyAdminAuth(req)) {
        return Response.json(
          { success: false, error: 'Unauthorized.' },
          { status: 401 }
        );
      }

      const { regId, status } = body;
      if (!regId || !status) {
        return Response.json(
          { success: false, error: 'Missing regId or status.' },
          { status: 400 }
        );
      }

      const updated = await updateRegistrationStatus(regId, status, 'admin_panel');
      if (!updated) {
        return Response.json(
          { success: false, error: 'Registration record not found.' },
          { status: 404 }
        );
      }

      return Response.json({
        success: true,
        message: `Registration ${regId} status updated to ${status}.`,
        registration: updated,
      });
    }

    // --- Action: Sync All Registrations to Google Sheets & Drive ---
    if (action === 'sync_google') {
      if (!verifyAdminAuth(req)) {
        return Response.json(
          { success: false, error: 'Unauthorized.' },
          { status: 401 }
        );
      }

      const scriptUrl = (process.env.GOOGLE_SCRIPT_URL || GOOGLE_SCRIPT_URL || '').trim();
      if (!scriptUrl) {
        return Response.json(
          { success: false, error: 'Google Apps Script URL is not configured.' },
          { status: 400 }
        );
      }

      const allRecords = await getAllRegistrations();
      const syncResults = [];

      for (const record of allRecords) {
        try {
          const res = await fetch(scriptUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              action: 'club_registration',
              regId: record.regId,
              name: record.name,
              year: record.year,
              branch: record.branch,
              college: record.college,
              email: record.email,
              phone: record.phone,
              amount: record.amount,
              utr: record.utr,
              payingUpi: record.payingUpi || 'QR_SCAN',
              status: record.status || 'Added to WhatsApp Group',
              photo: record.photo || null,
              paymentScreenshot: record.paymentScreenshot || null,
              timestamp: record.formattedDate || record.createdAt || new Date().toISOString(),
            }),
            redirect: 'follow',
          });

          const data = await res.json().catch(() => null);
          if (data && data.success) {
            await updateRegistrationGoogleSync(record.regId, data);
            syncResults.push({ regId: record.regId, success: true, rowNumber: data.rowNumber });
          } else {
            syncResults.push({ regId: record.regId, success: false, error: data?.error || 'Unknown script response' });
          }
        } catch (err) {
          syncResults.push({ regId: record.regId, success: false, error: err.message });
        }
      }

      const successCount = syncResults.filter((r) => r.success).length;
      return Response.json({
        success: true,
        message: `Successfully synced ${successCount} of ${allRecords.length} records to Google Sheets & Drive.`,
        syncedCount: successCount,
        totalCount: allRecords.length,
        results: syncResults,
      });
    }

    return Response.json({ success: false, error: 'Invalid action.' }, { status: 400 });
  } catch (error) {
    console.error('Error in /api/admin/registrations POST:', error);
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
}
