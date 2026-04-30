import { NextRequest, NextResponse } from 'next/server';
import { revalidateTag } from 'next/cache';
import { ALL_WP_TAGS, WP_TAGS, type WpTag } from '@/lib/wordpress';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

interface RevalidatePayload {
  tag?: string;
  tags?: string[];
}

function isValidTag(value: string): value is WpTag {
  return (ALL_WP_TAGS as readonly string[]).includes(value);
}

export async function POST(request: NextRequest) {
  const secret = request.nextUrl.searchParams.get('secret');
  const expected = process.env.WORDPRESS_REVALIDATION_SECRET;

  if (!expected) {
    return NextResponse.json(
      { ok: false, error: 'Server misconfigured: missing WORDPRESS_REVALIDATION_SECRET' },
      { status: 500 },
    );
  }

  if (secret !== expected) {
    return NextResponse.json({ ok: false, error: 'Invalid secret' }, { status: 401 });
  }

  let payload: RevalidatePayload;
  try {
    payload = (await request.json()) as RevalidatePayload;
  } catch {
    return NextResponse.json({ ok: false, error: 'Invalid JSON body' }, { status: 400 });
  }

  const requestedTags: string[] = payload.tags ?? (payload.tag ? [payload.tag] : []);

  if (requestedTags.length === 0) {
    for (const tag of ALL_WP_TAGS) revalidateTag(tag);
    return NextResponse.json({ ok: true, revalidated: ALL_WP_TAGS, mode: 'all' });
  }

  const validTags = requestedTags.filter(isValidTag);
  const unknown = requestedTags.filter((t) => !isValidTag(t));

  for (const tag of validTags) revalidateTag(tag);

  return NextResponse.json({
    ok: true,
    revalidated: validTags,
    ignored: unknown,
    available: Object.values(WP_TAGS),
  });
}

export async function GET() {
  return NextResponse.json(
    { ok: true, message: 'POST with ?secret=... and { tag } or { tags: [] } body' },
    { status: 200 },
  );
}
