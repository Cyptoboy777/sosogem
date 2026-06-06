export interface CoinData {
  symbol: string;
  name: string;
  price: number;
  change24h: number;
  marketCap: number;
  volume24h: number;
  high24h: number;
  low24h: number;
  sparkline: number[];
}

export interface MarketStats {
  btcPrice: number;
  btcChange24h: number;
  ethPrice: number;
  ethChange24h: number;
  solPrice: number;
  solChange24h: number;
  totalMarketCap: number;
  marketCapChange24h: number;
  etfNetInflow: number; // BTC spot ETF net flow
  etfEthInflow: number; // ETH spot ETF net flow
}

export interface SmartSignal {
  id: string;
  token: string;
  symbol: string;
  direction: 'BUY' | 'SELL';
  confidence: number;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  entryPrice: number;
  targetPrice: number;
  stopLoss: number;
  reason: string;
  upside: string;
  timestamp: string;
  executed?: boolean;
  txHash?: string;
}

export interface NewsItem {
  id: string;
  title: string;
  source: string;
  time: string;
  sentiment: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
  score: number; // 0 to 1
  url: string;
  summary: string;
}

export interface UserSettings {
  geminiApiKey: string;
  sosoValueApiKey: string;
  sodexApiKey: string;
  sodexSecretKey: string;
  sandboxMode: boolean;
  hasSeenPrivateKeyWarning: boolean;
  geminiSet: boolean;
  sosoSet: boolean;
  sodexSet: boolean;
}

export interface AssetPosition {
  id: string;
  symbol: string;
  type: 'SPOT' | 'PERP';
  side: 'LONG' | 'SHORT';
  entryPrice: number;
  markPrice: number;
  size: number;
  value: number;
  pnl: number;
  pnlPercent: number;
  leverage?: number;
}

export interface PortfolioAsset {
  symbol: string;
  name: string;
  amount: number;
  price: number;
  value: number;
  change24h: number;
  allocation: number;
}

export interface PortfolioSummary {
  totalValue: number;
  unrealizedPnl: number;
  unrealizedPnlPercent: number;
  riskScore: number; // 0 - 100
  assets: PortfolioAsset[];
  guardianLogs: string[];
}
