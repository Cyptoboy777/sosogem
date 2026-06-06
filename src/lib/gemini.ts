import { GoogleGenerativeAI } from '@google/generative-ai';
import { SoSoValueClient } from './sosovalue';
import { SodexSDK } from './sodex';

export const GEMINI_SYSTEM_INSTRUCTION = `
You are "SosuGem Alpha", an elite, institutional-grade AI crypto research analyst and autonomous portfolio guardian designed for the SoSoValue Buildathon.
Your goal is to provide premium, mathematical, and data-backed analysis on cryptocurrency markets.

You have access to real-time tools:
1. SoSoValue market statistics (prices, 24h shifts, and Bitcoin/Ethereum spot ETF net inflow flows).
2. SoSoValue aggregated news feeds and sentiment.
3. SoDEX account balances, active perpetual leverage positions, and order routing.

Formatting Guidelines:
- Return answers in structured Markdown. Use clean headers, bullet points, and tables.
- Use metric summaries (e.g. Risk Level, Sentiment Score, Price Target).
- Integrate actual figures from the tools. Never make up prices or ETF inflows.
- Explain the logic behind your findings. For example, if you suggest a trade, explain the risk, sizing, and entry/exit ranges.
- DO NOT generate code blocks containing standard React code. Always respond with text/markdown formatting.
- Be concise, authoritative, and direct. Avoid chatty fluff.
`;

// Declarations of our function tools for Gemini API
export const GEMINI_TOOLS = [
  {
    functionDeclarations: [
      {
        name: 'get_market_statistics',
        description: 'Get current crypto market price statistics, total market cap, and Bitcoin/Ethereum spot ETF net flows.',
        parameters: { type: 'OBJECT', properties: {} }
      },
      {
        name: 'get_crypto_news',
        description: 'Fetch real-time, AI-aggregated crypto market news headlines, sources, publish time, and sentiment analysis scores.',
        parameters: { type: 'OBJECT', properties: {} }
      },
      {
        name: 'get_coin_details',
        description: 'Fetch comprehensive data on major cryptocurrencies including market cap, 24h trading volume, price peaks, and price history.',
        parameters: { type: 'OBJECT', properties: {} }
      },
      {
        name: 'get_account_balances',
        description: 'Fetch the active trading account balances, showing tokens, asset amounts, and total portfolio valuations from SoDEX.',
        parameters: { type: 'OBJECT', properties: {} }
      },
      {
        name: 'get_active_perp_positions',
        description: 'Fetch all open leveraged perpetual positions including size, side, leverage, entry price, and current PnL from SoDEX.',
        parameters: { type: 'OBJECT', properties: {} }
      },
      {
        name: 'execute_trade',
        description: 'Place a buy or sell trade (spot or perpetual contract) on the SoDEX platform. Spot or Perps limit/market orders.',
        parameters: {
          type: 'OBJECT',
          properties: {
            symbol: { type: 'STRING', description: 'The asset symbol (e.g. BTC, ETH, SOL, or SOL-PERP)' },
            side: { type: 'STRING', enum: ['BUY', 'SELL', 'LONG', 'SHORT'], description: 'The trade side.' },
            type: { type: 'STRING', enum: ['SPOT', 'PERP'], description: 'Trading spot asset or perp contract.' },
            price: { type: 'NUMBER', description: 'Limit price to purchase/sell.' },
            size: { type: 'NUMBER', description: 'Amount of assets to trade.' },
            leverage: { type: 'NUMBER', description: 'Multiplier (only applicable if type is PERP)' },
            orderType: { type: 'STRING', enum: ['market', 'limit'], description: 'The order execution type.' }
          },
          required: ['symbol', 'side', 'type', 'price', 'size', 'orderType']
        }
      }
    ]
  }
];

// High fidelity simulator for sandbox responses
export function getMockResearchResponse(query: string, soso: SoSoValueClient, sodex: SodexSDK): string {
  const q = query.toLowerCase();

  if (q.includes('solana') || q.includes('sol') || q.includes('memecoin')) {
    return `### 📊 SosuGem AI Research Report: Solana (SOL) & Ecosystem Analysis

#### 1. Core Summary Metrics
| Metric | Value | Status |
| :--- | :--- | :--- |
| **Current Price** | $179.80 | 🟢 Bullish (+8.76% 24h) |
| **Sentiment Score** | 0.88 / 1.00 | 🔥 High Positive Sentiment |
| **Risk Profile** | Medium-High | Volatility Expansion |
| **ETF Outlook** | Progressing | 19b-4 Filings Submitted |

#### 2. Key Catalyst: Spot ETF Momentum
The SEC's recent acceptance of Form 19b-4 filings for Solana Spot ETFs (VanEck/21Shares) has injected strong speculative volume. Capital flows from L2 networks are rotating back to SOL native assets, driving price acceleration above the $175 resistance.

#### 3. On-Chain & Memecoin Landscape
Solana DEX volumes have captured 32% of total crypto spot volumes, outperforming Ethereum on select daily timeframes. The memecoin narrative continues to serve as a high-velocity capital sink:
- **WIF / BONK:** Consolidating at major support; showing accumulation by whale clusters.
- **Micro-caps:** Increasing activity on pump.fun, but liquidity concentration remains low. Focus on tokens with verified developers and locked liquidity contracts.

#### 4. Recommended Opportunities & Order Strategy
- **Entry Range:** $174.50 - $177.20 (retest of support)
- **Target Price:** $195.00
- **Stop Loss:** $168.00
- **Execution Config:** SPOT BUY or 3x LONG on **SOL-PERP** on SoDEX.
`;
  }

  if (q.includes('btc') || q.includes('bitcoin') || q.includes('etf')) {
    return `### 📊 SosuGem AI Research Report: Bitcoin (BTC) Institutional Flows

#### 1. Core Summary Metrics
| Metric | Value | Status |
| :--- | :--- | :--- |
| **Current Price** | $68,650.00 | 🟢 Modest Growth (+3.42% 24h) |
| **ETF Net Inflow (Cumulative)** | +$242.3M | Strong Institutional Accumulation |
| **DEX/CEX Volume Ratio** | 0.08 | Centralized Liquidity Dominance |
| **Risk Profile** | Low-Medium | Institutional Safety Net |

#### 2. ETF Inflow Sentiment Analysis
SoSoValue feeds register record inflows into US spot ETFs (+$240M Net Inflows in last 24h), primarily driven by Fidelity's FBTC and BlackRock's IBIT. This continuous bidding absorbs spot exchange liquidations and creates a strong floors at the $67,000 range.

#### 3. Market Structure & Liquidation Profile
A derivatives liquidation flush cleared $150M of leverage long positions. Funding rates have normalized to **0.005%**, resetting the leverage profile and preparing BTC for a healthy range-bound test towards $70,000.

#### 4. Execution Recommendation
- **Entry Range:** $67,500 - $68,200 (limit order range)
- **Target:** $72,500
- **Stop-Loss:** $65,900
- **Sizing:** 15% of active capital, SPOT BUY on SoDEX.
`;
  }

  // General response
  return `### 📊 SosuGem AI Research Report: Multi-Asset Market Overview

#### 1. Core Market Metrics
* **Total Market Cap:** $2.54T (+2.85% 24h)
* **Bitcoin dominance:** 53.2%
* **Sentiment Index:** 68/100 (Greed)
* **ETF Flow Momentum:** Strong positive inflow (+242.3M)

#### 2. Market Brief
Markets are exhibiting strong bullish structure led by Solana ecosystem gains (+8.76%) and institutional ETF bidding for Bitcoin. Ethereum is consolidating near $3,800 following low gas fee resets and ongoing L2 migration.

#### 3. Recommended Actions
- **Accumulate:** SOL on pullbacks below $175.
- **Hold:** BTC spot positions; leverage profiles have cleared out, limiting downside.
- **Hedging:** Consider opening a small hedged Short position on high-beta altcoins if total market cap drops below $2.50T.

*Use the **Trade** tab to configure your orders or execute instantly using the **Signals** cards.*
`;
}
