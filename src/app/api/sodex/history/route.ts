import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const apiKey = req.headers.get('X-API-Key') || process.env.SODEX_API_KEY || '';
  
  try {
    const res = await fetch('https://mainnet-gw.sodex.dev/api/v1/spot/account/orders?status=filled', {
      headers: {
        'X-API-Key': apiKey,
        'Content-Type': 'application/json',
      },
    });
    
    if (!res.ok) {
      throw new Error(`SoDEX API responded with status ${res.status}`);
    }
    
    const data = await res.json();
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to fetch trade history' }, { status: 500 });
  }
}
