import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  let auth = req.headers.get('Authorization') || '';
  let apiKey = '';
  if (auth.startsWith('Bearer ')) {
    apiKey = auth.substring(7).trim();
  }
  if (!apiKey) {
    apiKey = process.env.SOSOVALUE_API_KEY || '';
  }

  // Fetch prices from SoDEX tickers to maintain alignment
  let btcPrice = 62840;
  let btcChange = 2.69;
  let ethPrice = 1639.8;
  let ethChange = 3.81;
  let solPrice = 65.88;
  let solChange = 4.25;

  try {
    const sodexRes = await fetch('https://mainnet-gw.sodex.dev/api/v1/spot/markets/tickers');
    if (sodexRes.ok) {
      const tickers = await sodexRes.json();
      const btcTicker = tickers.find((item: any) => item.symbol === 'vBTC_vUSDC');
      const ethTicker = tickers.find((item: any) => item.symbol === 'vETH_vUSDC');
      const solTicker = tickers.find((item: any) => item.symbol === 'vSOL_vUSDC');
      if (btcTicker) {
        btcPrice = parseFloat(btcTicker.lastPx);
        btcChange = parseFloat(btcTicker.changePct);
      }
      if (ethTicker) {
        ethPrice = parseFloat(ethTicker.lastPx);
        ethChange = parseFloat(ethTicker.changePct);
      }
      if (solTicker) {
        solPrice = parseFloat(solTicker.lastPx);
        solChange = parseFloat(solTicker.changePct);
      }
    }
  } catch (error) {
    console.error('Failed to fetch prices from SoDEX tickers in stats route:', error);
  }

  // Fetch real ETF flows using x-soso-api-key header
  let etfNetInflow = 242300000;
  let etfEthInflow = 48900000;

  if (apiKey && apiKey !== 'your_sosovalue_api_key_here' && apiKey !== 'your_sosovalue_api_key') {
    try {
      const btcEtfRes = await fetch('https://openapi.sosovalue.com/openapi/v1/etfs/summary-history?symbol=BTC&country_code=US', {
        headers: {
          'x-soso-api-key': apiKey,
          'Content-Type': 'application/json'
        }
      });
      if (btcEtfRes.ok) {
        const btcEtfData = await btcEtfRes.json();
        if (btcEtfData.code === 0 && btcEtfData.data && btcEtfData.data.length > 0) {
          etfNetInflow = btcEtfData.data[0].total_net_inflow;
        }
      }
    } catch (err) {
      console.error('Failed to fetch real BTC ETF inflows:', err);
    }

    try {
      const ethEtfRes = await fetch('https://openapi.sosovalue.com/openapi/v1/etfs/summary-history?symbol=ETH&country_code=US', {
        headers: {
          'x-soso-api-key': apiKey,
          'Content-Type': 'application/json'
        }
      });
      if (ethEtfRes.ok) {
        const ethEtfData = await ethEtfRes.json();
        if (ethEtfData.code === 0 && ethEtfData.data && ethEtfData.data.length > 0) {
          etfEthInflow = ethEtfData.data[0].total_net_inflow;
        }
      }
    } catch (err) {
      console.error('Failed to fetch real ETH ETF inflows:', err);
    }
  }

  const totalMarketCap = 2500000000000 * (btcPrice / 62840);
  const marketCapChange24h = btcChange;

  return NextResponse.json({
    btcPrice,
    btcChange24h: btcChange,
    ethPrice,
    ethChange24h: ethChange,
    solPrice,
    solChange24h: solChange,
    totalMarketCap,
    marketCapChange24h,
    etfNetInflow,
    etfEthInflow
  });
}
