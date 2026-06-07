import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    const res = await fetch('https://mainnet-gw.sodex.dev/api/v1/spot/markets/tickers', {
      next: { revalidate: 5 } // Cache for 5 seconds
    });
    
    if (!res.ok) {
      throw new Error(`SoDEX tickers API responded with status ${res.status}`);
    }

    const rootData = await res.json();
    const data = rootData.data || [];
    
    const btcTicker = data.find((item: any) => item.symbol === 'vBTC_vUSDC');
    const ethTicker = data.find((item: any) => item.symbol === 'vETH_vUSDC');
    const solTicker = data.find((item: any) => item.symbol === 'vSOL_vUSDC');
    const dogeTicker = data.find((item: any) => item.symbol === 'vDOGE_vUSDC');

    const btcPrice = btcTicker ? parseFloat(btcTicker.lastPx) : 62840;
    const btcChange = btcTicker ? parseFloat(btcTicker.changePct) : 2.69;
    
    const ethPrice = ethTicker ? parseFloat(ethTicker.lastPx) : 1639.8;
    const ethChange = ethTicker ? parseFloat(ethTicker.changePct) : 3.81;

    const solPrice = solTicker ? parseFloat(solTicker.lastPx) : 65.88;
    const solChange = solTicker ? parseFloat(solTicker.changePct) : 4.25;

    const dogePrice = dogeTicker ? parseFloat(dogeTicker.lastPx) : 0.085;
    const dogeChange = dogeTicker ? parseFloat(dogeTicker.changePct) : 4.25;

    // Helper to generate dynamic sparkline based on actual price and 24h change
    const generateSparkline = (price: number, changePct: number) => {
      const points = 10;
      const startPrice = price / (1 + changePct / 100);
      const sparkline: number[] = [];
      for (let i = 0; i < points - 1; i++) {
        const ratio = i / (points - 1);
        const noise = (Math.random() - 0.5) * 0.005 * price;
        sparkline.push(startPrice + (price - startPrice) * ratio + noise);
      }
      sparkline.push(price);
      return sparkline;
    };

    const coins = [
      {
        symbol: 'BTC',
        name: 'Bitcoin',
        price: btcPrice,
        change24h: btcChange,
        marketCap: btcPrice * 19700000,
        volume24h: btcTicker ? parseFloat(btcTicker.quoteVolume) : 110259.27,
        high24h: btcTicker ? parseFloat(btcTicker.highPx) : btcPrice * 1.01,
        low24h: btcTicker ? parseFloat(btcTicker.lowPx) : btcPrice * 0.98,
        sparkline: generateSparkline(btcPrice, btcChange)
      },
      {
        symbol: 'ETH',
        name: 'Ethereum',
        price: ethPrice,
        change24h: ethChange,
        marketCap: ethPrice * 120000000,
        volume24h: ethTicker ? parseFloat(ethTicker.quoteVolume) : 92011.47,
        high24h: ethTicker ? parseFloat(ethTicker.highPx) : ethPrice * 1.02,
        low24h: ethTicker ? parseFloat(ethTicker.lowPx) : ethPrice * 0.97,
        sparkline: generateSparkline(ethPrice, ethChange)
      },
      {
        symbol: 'SOL',
        name: 'Solana',
        price: solPrice,
        change24h: solChange,
        marketCap: solPrice * 460000000,
        volume24h: solTicker ? parseFloat(solTicker.quoteVolume) : 92987.24,
        high24h: solTicker ? parseFloat(solTicker.highPx) : solPrice * 1.03,
        low24h: solTicker ? parseFloat(solTicker.lowPx) : solPrice * 0.96,
        sparkline: generateSparkline(solPrice, solChange)
      },
      {
        symbol: 'DOGE',
        name: 'Dogecoin',
        price: dogePrice,
        change24h: dogeChange,
        marketCap: dogePrice * 144000000000,
        volume24h: dogeTicker ? parseFloat(dogeTicker.quoteVolume) : 85636.88,
        high24h: dogeTicker ? parseFloat(dogeTicker.highPx) : dogePrice * 1.05,
        low24h: dogeTicker ? parseFloat(dogeTicker.lowPx) : dogePrice * 0.95,
        sparkline: generateSparkline(dogePrice, dogeChange)
      }
    ];

    return NextResponse.json(coins);
  } catch (error: any) {
    console.error('SoDEX Spot Ticker fetch error for Coins route:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch coin prices' }, { status: 500 });
  }
}
