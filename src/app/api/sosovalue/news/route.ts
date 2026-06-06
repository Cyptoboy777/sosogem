import { NextRequest, NextResponse } from 'next/server';

const MOCK_NEWS = [
  {
    id: '1',
    title: "US Spot Bitcoin ETFs Register $242M Net Inflow Led by Fidelity's FBTC",
    source: 'SoSoValue Insights',
    time: '2 hours ago',
    sentiment: 'BULLISH',
    score: 0.92,
    url: 'https://sosovalue.xyz',
    summary: 'Spot Bitcoin exchange-traded funds in the US recorded a combined net inflow of $242.3 million yesterday, extending their positive streak amid institutional accumulation.'
  },
  {
    id: '2',
    title: 'Solana Spot ETF Filings Propel SOL Above Key Resistance Level',
    source: 'CoinTelegraph',
    time: '4 hours ago',
    sentiment: 'BULLISH',
    score: 0.88,
    url: 'https://cointelegraph.com',
    summary: 'The price of SOL spiked over 8% following reports that multiple issuers have updated their Form 19b-4 filings for Solana spot ETFs with the SEC.'
  },
  {
    id: '3',
    title: 'Ethereum Gas Fees Plunge to Multi-Year Lows Amid L2 Scaling Dominance',
    source: 'Blockworks',
    time: '6 hours ago',
    sentiment: 'NEUTRAL',
    score: 0.55,
    url: 'https://blockworks.co',
    summary: 'Ethereum mainnet gas fees dropped below 3 gwei as activity continues to migrate to Layer 2 rollup networks like Base and Arbitrum.'
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
    return NextResponse.json(MOCK_NEWS);
  }
  
  try {
    const res = await fetch('https://openapi.sosovalue.com/api/v1/openapi/pub/news/list', {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
    });
    
    if (!res.ok) {
      console.warn(`SoSoValue news API responded with status ${res.status}. Falling back to mock data.`);
      return NextResponse.json(MOCK_NEWS);
    }
    
    const data = await res.json();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('SoSoValue news fetch error. Falling back to mock data:', error);
    return NextResponse.json(MOCK_NEWS);
  }
}

