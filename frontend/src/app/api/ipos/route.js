import { NextResponse } from 'next/server';

export async function GET(request) {
  try {
    const backendUrl = (process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000').replace(/\/$/, '');
    const { searchParams } = new URL(request.url);
    const qs = searchParams.toString() ? `?${searchParams.toString()}` : '';

    const res = await fetch(`${backendUrl}/api/ipos${qs}`, {
      headers: { 'Accept': 'application/json' },
      next: { revalidate: 60 },
      cache: 'force-cache'
    });

    if (!res.ok) {
      return NextResponse.json(
        { success: false, message: `Backend responded with status ${res.status}` },
        { status: res.status }
      );
    }

    const data = await res.json();
    return NextResponse.json(data, {
      status: 200,
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300'
      }
    });
  } catch (error) {
    console.error('Next.js API route /api/ipos error:', error.message);
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to fetch IPOs' },
      { status: 500 }
    );
  }
}
