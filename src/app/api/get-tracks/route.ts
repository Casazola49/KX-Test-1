// This file is no longer needed and can be removed.
// Data fetching is now handled directly within page components using the Admin SDK.
// Keeping it empty to prevent any old logic from running.
import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({ message: "This API route is deprecated." }, { status: 410 });
}
