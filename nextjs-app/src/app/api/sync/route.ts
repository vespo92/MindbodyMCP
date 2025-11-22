import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { MindbodySyncService, SyncEntity } from '@/lib/sync';

// ============================================================================
// SYNC API ROUTE - Triggers data synchronization
// ============================================================================

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const entities = body.entities as SyncEntity[] | undefined;

    const syncService = new MindbodySyncService(prisma);
    const results = await syncService.syncAll({ entities });

    return NextResponse.json({
      success: true,
      results,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('Sync error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const syncService = new MindbodySyncService(prisma);
    const status = await syncService.getSyncStatus();

    return NextResponse.json({
      success: true,
      status,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('Sync status error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
