import { NextRequest, NextResponse } from 'next/server';

const MOCK_POSITIONS = [
  {
    id: 'pos-01',
    symbol: 'SOL',
    type: 'PERP',
    side: 'LONG',
    entryPrice: 172.50,
    markPrice: 179.80,
    size: 10,
    value: 1798.00,
    pnl: 73.00,
    pnlPercent: 4.23,
    leverage: 5
  }
];

export async function GET(req: NextRequest) {
  const apiKey = req.headers.get('X-API-Key') || process.env.SODEX_API_KEY || '';
  const nonce = req.headers.get('X-API-Nonce') || Date.now().toString();
  const sign = req.headers.get('X-API-Sign') || '0x01mockedsignature...';

  const isPlaceholder = !apiKey || apiKey === 'your_sodex_api_key_here' || apiKey === 'your_sodex_api_key';

  if (isPlaceholder) {
    return NextResponse.json(MOCK_POSITIONS);
  }
  
  try {
    const res = await fetch('https://mainnet-gw.sodex.dev/api/v1/perps/account/positions', {
      headers: {
        'X-API-Key': apiKey,
        'X-API-Nonce': nonce,
        'X-API-Sign': sign,
        'Content-Type': 'application/json',
      },
    });
    
    if (!res.ok) {
      console.warn(`SoDEX positions API responded with status ${res.status}. Falling back to mock data.`);
      return NextResponse.json(MOCK_POSITIONS);
    }
    
    const data = await res.json();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('SoDEX positions fetch error. Falling back to mock data:', error);
    return NextResponse.json(MOCK_POSITIONS);
  }
}

