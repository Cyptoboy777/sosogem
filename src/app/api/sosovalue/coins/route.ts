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

  const MOCK_COINS = [
    {
      symbol: 'BTC',
      name: 'Bitcoin',
      price: livePrices.BTC,
      change24h: 3.42,
      marketCap: 1350000000000,
      volume24h: 28500000000,
      high24h: livePrices.BTC * 1.01,
      low24h: livePrices.BTC * 0.98,
      sparkline: [
        livePrices.BTC * 0.98,
        livePrices.BTC * 0.99,
        livePrices.BTC * 0.985,
        livePrices.BTC * 0.995,
        livePrices.BTC * 1.002,
        livePrices.BTC * 1.01,
        livePrices.BTC * 1.005,
        livePrices.BTC * 1.008,
        livePrices.BTC * 1.012,
        livePrices.BTC
      ]
    },
    {
      symbol: 'ETH',
      name: 'Ethereum',
      price: livePrices.ETH,
      change24h: 2.15,
      marketCap: 455000000000,
      volume24h: 14200000000,
      high24h: livePrices.ETH * 1.01,
      low24h: livePrices.ETH * 0.98,
      sparkline: [
        livePrices.ETH * 0.975,
        livePrices.ETH * 0.98,
        livePrices.ETH * 0.978,
        livePrices.ETH * 0.985,
        livePrices.ETH * 0.99,
        livePrices.ETH * 1.001,
        livePrices.ETH * 0.995,
        livePrices.ETH * 1.002,
        livePrices.ETH * 1.008,
        livePrices.ETH
      ]
    },
    {
      symbol: 'SOL',
      name: 'Solana',
      price: livePrices.SOL,
      change24h: 8.76,
      marketCap: 82000000000,
      volume24h: 3800000000,
      high24h: livePrices.SOL * 1.02,
      low24h: livePrices.SOL * 0.96,
      sparkline: [
        livePrices.SOL * 0.95,
        livePrices.SOL * 0.965,
        livePrices.SOL * 0.96,
        livePrices.SOL * 0.975,
        livePrices.SOL * 0.985,
        livePrices.SOL * 1.002,
        livePrices.SOL * 0.995,
        livePrices.SOL * 1.01,
        livePrices.SOL * 1.015,
        livePrices.SOL
      ]
    }
  ];

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

