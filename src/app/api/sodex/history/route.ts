import { NextRequest, NextResponse } from 'next/server';

const MOCK_HISTORY = [
  {
    id: 'tx-01',
    symbol: 'BTC',
    type: 'SPOT',
    side: 'BUY',
    price: 67800,
    size: 0.02,
    status: 'FILLED',
    timestamp: '2026-06-06T15:30:22Z',
    txHash: '0x1b2c4e5f6g7h8i9j0k1l2m3n4o5p6q7r'
  },
  {
    id: 'tx-02',
    symbol: 'ETH',
    type: 'SPOT',
    side: 'SELL',
    price: 3810,
    size: 0.5,
    status: 'FILLED',
    timestamp: '2026-06-06T12:15:10Z',
    txHash: '0x9a8b7c6d5e4f3g2h1i0j9k8l7m6n5o4p'
  }
];

export async function GET(req: NextRequest) {
  const apiKey = req.headers.get('X-API-Key') || process.env.SODEX_API_KEY || '';

  const isPlaceholder = !apiKey || apiKey === 'your_sodex_api_key_here' || apiKey === 'your_sodex_api_key';

  if (isPlaceholder) {
    return NextResponse.json(MOCK_HISTORY);
  }
  
  try {
    const res = await fetch('https://mainnet-gw.sodex.dev/api/v1/spot/account/orders?status=filled', {
      headers: {
        'X-API-Key': apiKey,
        'Content-Type': 'application/json',
      },
    });
    
    if (!res.ok) {
      console.warn(`SoDEX history API responded with status ${res.status}. Falling back to mock data.`);
      return NextResponse.json(MOCK_HISTORY);
    }
    
    const data = await res.json();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('SoDEX history fetch error. Falling back to mock data:', error);
    return NextResponse.json(MOCK_HISTORY);
  }
}

