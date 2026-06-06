import { NextRequest, NextResponse } from 'next/server';

async function getLiveBinancePrices() {
  try {
    const res = await fetch('https://api.binance.com/api/v3/ticker/price');
    if (!res.ok) throw new Error('Binance price fetch failed');
    const data = await res.json();
    const btc = data.find((item: any) => item.symbol === 'BTCUSDT');
    const eth = data.find((item: any) => item.symbol === 'ETHUSDT');
    const sol = data.find((item: any) => item.symbol === 'SOLUSDT');
    return {
      BTC: btc ? parseFloat(btc.price) : 68650,
      ETH: eth ? parseFloat(eth.price) : 3792,
      SOL: sol ? parseFloat(sol.price) : 179.8
    };
  } catch (error) {
    console.error('Failed to fetch live prices from Binance:', error);
    return {
      BTC: 68650,
      ETH: 3792,
      SOL: 179.8
    };
  }
}

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
  const livePrices = await getLiveBinancePrices();

  const MOCK_STATS = {
    btcPrice: livePrices.BTC,
    btcChange24h: 3.42,
    ethPrice: livePrices.ETH,
    ethChange24h: 2.15,
    solPrice: livePrices.SOL,
    solChange24h: 8.76,
    totalMarketCap: 2540000000000,
    marketCapChange24h: 2.85,
    etfNetInflow: 242300000,
    etfEthInflow: 48900000
  };

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

