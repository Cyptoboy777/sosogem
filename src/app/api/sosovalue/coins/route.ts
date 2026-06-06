import { NextRequest, NextResponse } from 'next/server';

const MOCK_COINS = [
  {
    symbol: 'BTC',
    name: 'Bitcoin',
    price: 68650,
    change24h: 3.42,
    marketCap: 1350000000000,
    volume24h: 28500000000,
    high24h: 69200,
    low24h: 67100,
    sparkline: [67100, 67400, 67200, 67900, 68100, 68900, 68500, 68950, 69200, 68650]
  },
  {
    symbol: 'ETH',
    name: 'Ethereum',
    price: 3792,
    change24h: 2.15,
    marketCap: 455000000000,
    volume24h: 14200000000,
    high24h: 3820,
    low24h: 3680,
    sparkline: [3680, 3710, 3690, 3720, 3740, 3780, 3760, 3790, 3820, 3792]
  },
  {
    symbol: 'SOL',
    name: 'Solana',
    price: 179.8,
    change24h: 8.76,
    marketCap: 82000000000,
    volume24h: 3800000000,
    high24h: 182.5,
    low24h: 171.2,
    sparkline: [171.2, 173.4, 172.9, 175.1, 177.3, 180.2, 179.1, 181.5, 182.5, 179.8]
  }
];

export async function GET(req: NextRequest) {
  let auth = req.headers.get('Authorization') || '';
  let apiKey = '';
  if (auth.startsWith('Bearer ')) {
    apiKey = auth.substring(7).trim();
  }
  if (!apiKey) {
    apiKey = process.env.SOSOVALUE_API_KEY || '';
  }

  const isPlaceholder = !apiKey || apiKey === 'your_sosovalue_api_key_here' || apiKey === 'your_sosovalue_api_key';

  if (isPlaceholder) {
    return NextResponse.json(MOCK_COINS);
  }
  
  try {
    const res = await fetch('https://openapi.sosovalue.com/api/v1/openapi/pub/coin/price', {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
    });
    
    if (!res.ok) {
      console.warn(`SoSoValue API responded with status ${res.status}. Falling back to mock data.`);
      return NextResponse.json(MOCK_COINS);
    }
    
    const data = await res.json();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('SoSoValue Coins fetch error. Falling back to mock data:', error);
    return NextResponse.json(MOCK_COINS);
  }
}

