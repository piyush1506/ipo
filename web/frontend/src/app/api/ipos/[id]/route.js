import { NextResponse } from 'next/server';

export async function GET(request, { params }) {
  try {
    const { id } = await params;
    const backendUrl = (process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000').replace(/\/$/, '');

    const res = await fetch(`${backendUrl}/api/ipos/${encodeURIComponent(id)}`, {
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
    console.error('Next.js API route /api/ipos/[id] error:', error.message);
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to fetch IPO detail' },
      { status: 500 }
    );
  }
}
