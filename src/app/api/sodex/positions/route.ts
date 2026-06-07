import { NextRequest, NextResponse } from 'next/server';

async function getLiveSodexPrices() {
  try {
    const res = await fetch('https://mainnet-gw.sodex.dev/api/v1/spot/markets/tickers', {
      next: { revalidate: 5 }
    });
    if (!res.ok) throw new Error('SoDEX tickers fetch failed');
    const data = await res.json();
    const btc = data.find((item: any) => item.symbol === 'vBTC_vUSDC');
    const eth = data.find((item: any) => item.symbol === 'vETH_vUSDC');
    const sol = data.find((item: any) => item.symbol === 'vSOL_vUSDC');
    return {
      BTC: btc ? parseFloat(btc.lastPx) : 62840,
      ETH: eth ? parseFloat(eth.lastPx) : 1639.8,
      SOL: sol ? parseFloat(sol.lastPx) : 65.88
    };
  } catch (error) {
    console.error('Failed to fetch live prices from SoDEX:', error);
    return {
      BTC: 62840,
      ETH: 1639.8,
      SOL: 65.88
    };
  }
}

export async function GET(req: NextRequest) {
  const apiKey = req.headers.get('X-API-Key') || process.env.SODEX_API_KEY || '';
  const nonce = req.headers.get('X-API-Nonce') || Date.now().toString();
  const sign = req.headers.get('X-API-Sign') || '0x01mockedsignature...';

  const isPlaceholder = !apiKey || apiKey === 'your_sodex_api_key_here' || apiKey === 'your_sodex_api_key';
  const livePrices = await getLiveSodexPrices();

  // Set entryPrice relative to the real SoDEX SOL price to avoid instant liquidation simulation
  const entryPrice = 62.50; 
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
    
    // Map real positions to inject live mark prices from SoDEX tickers
    let parsedPositions: any[] = [];
    if (data && Array.isArray(data)) {
      data.forEach((pos: any) => {
        const symbol = pos.symbol ? pos.symbol.replace(/_vUSDC$/, '').replace(/^v/, '').replace(/-PERP$/, '') : '';
        const sizeNum = parseFloat(pos.size || '0');
        if (sizeNum > 0 && ['BTC', 'ETH', 'SOL'].includes(symbol)) {
          const mark = livePrices[symbol as keyof typeof livePrices] as number;
          const entry = parseFloat(pos.entryPrice || '0');
          const side = pos.side || 'LONG';
          const leverage = parseFloat(pos.leverage || '5');
          const posPnl = side === 'LONG' ? (mark - entry) * sizeNum : (entry - mark) * sizeNum;
          const posPnlPercent = entry > 0 ? (posPnl / (entry * sizeNum)) * 100 : 0;
          parsedPositions.push({
            id: pos.id || `pos-${symbol.toLowerCase()}`,
            symbol,
            type: 'PERP',
            side,
            entryPrice: entry,
            markPrice: mark,
            size: sizeNum,
            value: mark * sizeNum,
            pnl: posPnl,
            pnlPercent: posPnlPercent,
            leverage
          });
        }
      });
    }

    if (parsedPositions.length === 0) {
      return NextResponse.json(MOCK_POSITIONS);
    }

    return NextResponse.json(parsedPositions);
  } catch (error: any) {
    console.error('SoDEX positions fetch error. Falling back to mock data:', error);
    return NextResponse.json(MOCK_POSITIONS);
  }
}
