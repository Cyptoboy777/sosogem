import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const apiKey = req.headers.get('X-API-Key') || process.env.SODEX_API_KEY || '';
  const nonce = req.headers.get('X-API-Nonce') || Date.now().toString();
  const sign = req.headers.get('X-API-Sign') || '0x01mockedsignature...';
  
  try {
    const res = await fetch('https://mainnet-gw.sodex.dev/api/v1/spot/account/balance', {
      headers: {
        'X-API-Key': apiKey,
        'X-API-Nonce': nonce,
        'X-API-Sign': sign,
        'Content-Type': 'application/json',
      },
    });
    
    if (!res.ok) {
      throw new Error(`SoDEX API responded with status ${res.status}`);
    }
    
    const data = await res.json();
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to fetch balance' }, { status: 500 });
  }
}
