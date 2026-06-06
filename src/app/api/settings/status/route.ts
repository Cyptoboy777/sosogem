import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    geminiSet: !!process.env.GEMINI_API_KEY,
    sosoSet: !!process.env.SOSOVALUE_API_KEY,
    sodexSet: !!process.env.SODEX_API_KEY && !!process.env.SODEX_SECRET_KEY,
  });
}
