import { NextRequest, NextResponse } from 'next/server';
import { isAdminUser } from '@/lib/adminAuth';
import { fetchServerSession } from '@/lib/serverSession';
import type { User } from '@/lib/backendApi';

type AccessCheckResult =
  | { ok: true; user: User }
  | { ok: false; response: NextResponse };

export async function requireAdminApiAccess(
  request: NextRequest
): Promise<AccessCheckResult> {
  const cookieHeader = request.headers.get('cookie') || '';
  const session = await fetchServerSession(cookieHeader);
  const user = (session?.user as User | undefined) ?? null;

  if (!user) {
    return {
      ok: false,
      response: NextResponse.json(
        { error: 'Unauthorized', message: 'Login required' },
        { status: 401 }
      ),
    };
  }

  if (!isAdminUser(user)) {
    return {
      ok: false,
      response: NextResponse.json(
        { error: 'Forbidden', message: 'Admin access required' },
        { status: 403 }
      ),
    };
  }

  return { ok: true, user };
}
