import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/config';
import { db } from '@/lib/db';
import { requestDocuments, requests, requestTeamAssignments } from '@/lib/db/schema';
import { eq, and, isNull } from 'drizzle-orm';
import { createReadStream } from 'fs';
import { stat } from 'fs/promises';
import { join } from 'path';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const docId = parseInt(id, 10);

    const [doc] = await db
      .select({
        id: requestDocuments.id,
        requestId: requestDocuments.requestId,
        originalName: requestDocuments.originalName,
        storageKey: requestDocuments.storageKey,
        mimeType: requestDocuments.mimeType,
        sizeBytes: requestDocuments.sizeBytes,
        requesterId: requests.requesterId,
      })
      .from(requestDocuments)
      .innerJoin(requests, eq(requestDocuments.requestId, requests.id))
      .where(eq(requestDocuments.id, docId))
      .limit(1);

    if (!doc) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }

    const isRequester = doc.requesterId == session.user.id;
    const isAdmin = session.user.roleCode === 'admin';
    let isDeveloperAssigned = false;

    if (session.user.roleCode === 'developer') {
      const [assignment] = await db
        .select({ id: requestTeamAssignments.id })
        .from(requestTeamAssignments)
        .where(
          and(
            eq(requestTeamAssignments.requestId, doc.requestId),
            eq(requestTeamAssignments.assignedUserId, session.user.id),
            isNull(requestTeamAssignments.unassignedAt)
          )
        )
        .limit(1);
      isDeveloperAssigned = !!assignment;
    }

    if (!isRequester && !isAdmin && !isDeveloperAssigned) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    const filePath = join(process.cwd(), 'uploads', doc.storageKey);

    try {
      await stat(filePath);
    } catch {
      return NextResponse.json({ error: 'File not found on disk' }, { status: 404 });
    }

    const fileStream = createReadStream(filePath);
    const chunks: Buffer[] = [];

    for await (const chunk of fileStream) {
      chunks.push(Buffer.from(chunk));
    }

    const buffer = Buffer.concat(chunks);

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': doc.mimeType,
        'Content-Disposition': `attachment; filename="${encodeURIComponent(doc.originalName)}"`,
        'Content-Length': doc.sizeBytes.toString(),
        'X-Content-Type-Options': 'nosniff',
      },
    });
  } catch (error) {
    console.error('Download error:', error);
    return NextResponse.json({ error: 'Download failed' }, { status: 500 });
  }
}