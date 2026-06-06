import { NextRequest, NextResponse } from 'next/server';

const MOCK_BALANCE = {
  totalValue: 12450.80,
  assets: [
    {
      symbol: 'BTC',
      name: 'Bitcoin',
      amount: 0.085,
      price: 68650.00,
      value: 5835.25,
      change24h: 3.42,
      allocation: 46.8
    },
    {
      symbol: 'ETH',
      name: 'Ethereum',
      amount: 0.65,
      price: 3792.00,
      value: 2464.80,
      change24h: 2.15,
      allocation: 19.8
    },
    {
      symbol: 'SOL',
      name: 'Solana',
      amount: 23.1,
      price: 179.80,
      value: 4153.40,
      change24h: 8.76,
      allocation: 33.4
    }
  ]
};

export async function GET(req: NextRequest) {
  const apiKey = req.headers.get('X-API-Key') || process.env.SODEX_API_KEY || '';
  const nonce = req.headers.get('X-API-Nonce') || Date.now().toString();
  const sign = req.headers.get('X-API-Sign') || '0x01mockedsignature...';

  const isPlaceholder = !apiKey || apiKey === 'your_sodex_api_key_here' || apiKey === 'your_sodex_api_key';

  if (isPlaceholder) {
    return NextResponse.json(MOCK_BALANCE);
  }
  
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
      console.warn(`SoDEX balance API responded with status ${res.status}. Falling back to mock data.`);
      return NextResponse.json(MOCK_BALANCE);
    }
    
    const data = await res.json();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('SoDEX balance fetch error. Falling back to mock data:', error);
    return NextResponse.json(MOCK_BALANCE);
  }
}

