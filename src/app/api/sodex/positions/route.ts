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
  const apiKey = req.headers.get('X-API-Key') || process.env.SODEX_API_KEY || '';
  const nonce = req.headers.get('X-API-Nonce') || Date.now().toString();
  const sign = req.headers.get('X-API-Sign') || '0x01mockedsignature...';

  const isPlaceholder = !apiKey || apiKey === 'your_sodex_api_key_here' || apiKey === 'your_sodex_api_key';
  const livePrices = await getLiveBinancePrices();

  const entryPrice = 172.50;
  const markPrice = livePrices.SOL;
  const size = 10;
  const pnl = (markPrice - entryPrice) * size;
  const pnlPercent = (pnl / (entryPrice * size)) * 100;

  const MOCK_POSITIONS = [
    {
      id: 'pos-01',
      symbol: 'SOL',
      type: 'PERP',
      side: 'LONG',
      entryPrice,
      markPrice,
      size,
      value: markPrice * size,
      pnl,
      pnlPercent,
      leverage: 5
    }
  ];

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

