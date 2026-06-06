import { NextRequest, NextResponse } from 'next/server';

const MOCK_STATS = {
  btcPrice: 68650,
  btcChange24h: 3.42,
  ethPrice: 3792,
  ethChange24h: 2.15,
  solPrice: 179.8,
  solChange24h: 8.76,
  totalMarketCap: 2540000000000,
  marketCapChange24h: 2.85,
  etfNetInflow: 242300000,
  etfEthInflow: 48900000
};

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
    return NextResponse.json(MOCK_STATS);
  }
  
  try {
    const res = await fetch('https://openapi.sosovalue.com/api/v1/openapi/pub/etf/btc/stats', {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
    });
    
    if (!res.ok) {
      console.warn(`SoSoValue stats API responded with status ${res.status}. Falling back to mock data.`);
      return NextResponse.json(MOCK_STATS);
    }
    
    const data = await res.json();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('SoSoValue stats fetch error. Falling back to mock data:', error);
    return NextResponse.json(MOCK_STATS);
  }
}

