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
      SOL: sol ? parseFloat(sol.lastPx) : 65.88,
      BTC_change: btc ? parseFloat(btc.changePct) : 2.69,
      ETH_change: eth ? parseFloat(eth.changePct) : 3.81,
      SOL_change: sol ? parseFloat(sol.changePct) : 4.25
    };
  } catch (error) {
    console.error('Failed to fetch live prices from SoDEX:', error);
    return {
      BTC: 62840,
      ETH: 1639.8,
      SOL: 65.88,
      BTC_change: 2.69,
      ETH_change: 3.81,
      SOL_change: 4.25
    };
  }
}

export async function GET(req: NextRequest) {
  const apiKey = req.headers.get('X-API-Key') || process.env.SODEX_API_KEY || '';
  const nonce = req.headers.get('X-API-Nonce') || Date.now().toString();
  const sign = req.headers.get('X-API-Sign') || '0x01mockedsignature...';

  const isPlaceholder = !apiKey || apiKey === 'your_sodex_api_key_here' || apiKey === 'your_sodex_api_key';
  const livePrices = await getLiveSodexPrices();

  const btcAmount = 0.085;
  const ethAmount = 0.65;
  const solAmount = 23.1;

  const btcVal = btcAmount * livePrices.BTC;
  const ethVal = ethAmount * livePrices.ETH;
  const solVal = solAmount * livePrices.SOL;

  const totalValue = btcVal + ethVal + solVal;

  const MOCK_BALANCE = {
    totalValue,
    assets: [
      {
        symbol: 'BTC',
        name: 'Bitcoin',
        amount: btcAmount,
        price: livePrices.BTC,
        value: btcVal,
        change24h: livePrices.BTC_change,
        allocation: (btcVal / totalValue) * 100
      },
      {
        symbol: 'ETH',
        name: 'Ethereum',
        amount: ethAmount,
        price: livePrices.ETH,
        value: ethVal,
        change24h: livePrices.ETH_change,
        allocation: (ethVal / totalValue) * 100
      },
      {
        symbol: 'SOL',
        name: 'Solana',
        amount: solAmount,
        price: livePrices.SOL,
        value: solVal,
        change24h: livePrices.SOL_change,
        allocation: (solVal / totalValue) * 100
      }
    ]
  };

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
    // Map the real balances returned to use the real prices from the tickers
    let parsedAssets: any[] = [];
    let calculatedTotalValue = 0;

    if (data && Array.isArray(data)) {
      data.forEach((item: any) => {
        const symbol = item.currency ? item.currency.replace(/^v/, '') : '';
        const balance = parseFloat(item.balance || '0');
        if (balance > 0 && ['BTC', 'ETH', 'SOL'].includes(symbol)) {
          const price = livePrices[symbol as keyof typeof livePrices] as number;
          const change = livePrices[`${symbol}_change` as keyof typeof livePrices] as number;
          const val = balance * price;
          calculatedTotalValue += val;
          parsedAssets.push({
            symbol,
            name: symbol === 'BTC' ? 'Bitcoin' : symbol === 'ETH' ? 'Ethereum' : 'Solana',
            amount: balance,
            price,
            value: val,
            change24h: change,
            allocation: 0 // Will recalculate below
          });
        }
      });
    }

    if (parsedAssets.length === 0) {
      // Return mock data if account is empty/new
      return NextResponse.json(MOCK_BALANCE);
    }

    parsedAssets = parsedAssets.map(asset => ({
      ...asset,
      allocation: (asset.value / calculatedTotalValue) * 100
    }));

    return NextResponse.json({
      totalValue: calculatedTotalValue,
      assets: parsedAssets
    });
  } catch (error: any) {
    console.error('SoDEX balance fetch error. Falling back to mock data:', error);
    return NextResponse.json(MOCK_BALANCE);
  }
}
