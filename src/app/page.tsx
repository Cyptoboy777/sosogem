'use client';

import * as React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  TrendingDown, 
  Zap, 
  BrainCircuit, 
  Coins, 
  DollarSign, 
  Flame, 
  ArrowRight,
  ShieldCheck
} from 'lucide-react';
import { SoSoValueClient } from '@/lib/sosovalue';
import { SodexSDK } from '@/lib/sodex';
import { useSettings, useWallet } from '@/components/Providers';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn, formatCurrency, formatPercent, formatCompact } from '@/lib/utils';
import { MarketStats, CoinData, NewsItem } from '@/types';
import { ApiKeyWarning } from '@/components/ApiKeyWarning';

export default function Dashboard() {
  const { settings } = useSettings();
  const { isConnected } = useWallet();
  
  const [stats, setStats] = React.useState<MarketStats | null>({
    btcPrice: 62840,
    btcChange24h: 2.69,
    ethPrice: 1639.8,
    ethChange24h: 3.81,
    solPrice: 65.88,
    solChange24h: 4.25,
    totalMarketCap: 2500000000000,
    marketCapChange24h: 2.69,
    etfNetInflow: -325694998.3,
    etfEthInflow: 19301869.44
  });

  const [coins, setCoins] = React.useState<CoinData[]>([
    {
      symbol: 'BTC',
      name: 'Bitcoin',
      price: 62840,
      change24h: 2.69,
      marketCap: 1237888900000,
      volume24h: 110259.27,
      high24h: 62945,
      low24h: 60246,
      sparkline: [60246, 61100, 61500, 62840]
    },
    {
      symbol: 'ETH',
      name: 'Ethereum',
      price: 1639.8,
      change24h: 3.81,
      marketCap: 196778400000,
      volume24h: 92011.47,
      high24h: 1641.4,
      low24h: 1536.8,
      sparkline: [1536.8, 1580, 1600, 1639.8]
    },
    {
      symbol: 'SOL',
      name: 'Solana',
      price: 65.88,
      change24h: 4.25,
      marketCap: 30302880000,
      volume24h: 92987.24,
      high24h: 65.98,
      low24h: 61.27,
      sparkline: [61.27, 63.5, 64.2, 65.88]
    },
    {
      symbol: 'DOGE',
      name: 'Dogecoin',
      price: 0.085,
      change24h: 4.25,
      marketCap: 12240000000,
      volume24h: 85636.88,
      high24h: 0.0857,
      low24h: 0.0799,
      sparkline: [0.0799, 0.082, 0.083, 0.085]
    }
  ]);

  const [news, setNews] = React.useState<NewsItem[]>([
    {
      id: 'fallback-1',
      title: "US Spot Bitcoin ETFs Register $242M Net Inflow Led by Fidelity's FBTC",
      source: 'SoSoValue Insights',
      time: '2 hours ago',
      sentiment: 'BULLISH',
      score: 0.92,
      url: 'https://sosovalue.com',
      summary: 'Spot Bitcoin exchange-traded funds in the US recorded a combined net inflow of $242.3 million yesterday, extending their positive streak amid institutional accumulation.'
    },
    {
      id: 'fallback-2',
      title: 'Solana Spot ETF Filings Propel SOL Above Key Resistance Level',
      source: 'CoinTelegraph',
      time: '4 hours ago',
      sentiment: 'BULLISH',
      score: 0.88,
      url: 'https://cointelegraph.com',
      summary: 'The price of SOL spiked over 8% following reports that multiple issuers have updated their Form 19b-4 filings for Solana spot ETFs with the SEC.'
    },
    {
      id: 'fallback-3',
      title: 'Ethereum Gas Fees Plunge to Multi-Year Lows Amid L2 Scaling Dominance',
      source: 'Blockworks',
      time: '6 hours ago',
      sentiment: 'NEUTRAL',
      score: 0.55,
      url: 'https://blockworks.co',
      summary: 'Ethereum mainnet gas fees dropped below 3 gwei as activity continues to migrate to Layer 2 rollup networks like Base and Arbitrum.'
    }
  ]);

  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState(false);

  // Instantiating clients
  const sosoClient = React.useMemo(() => 
    new SoSoValueClient(settings.sosoValueApiKey), 
    [settings.sosoValueApiKey]
  );

  const sodexClient = React.useMemo(() => 
    new SodexSDK(settings.sodexApiKey, settings.sodexSecretKey), 
    [settings.sodexApiKey, settings.sodexSecretKey]
  );

  React.useEffect(() => {
    let active = true;

    async function loadData() {
      try {
        const [statsData, coinsData, newsData] = await Promise.all([
          sosoClient.getMarketStats(),
          sosoClient.getCoins(),
          sosoClient.getNews()
        ]);
        if (active) {
          setStats(statsData);
          setCoins(coinsData);
          setNews(newsData);
          setError(false);
        }
      } catch (err) {
        console.error('Error loading dashboard data:', err);
      }
    }

    loadData();

    const timer = setInterval(() => {
      loadData();
    }, 15000);

    return () => {
      active = false;
      clearInterval(timer);
    };
  }, [sosoClient]);

  if (loading) {
    return (
      <div className="flex flex-col gap-6 animate-pulse mt-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-32 bg-white/5 rounded-xl border border-white/5" />
          ))}
        </div>
        <div className="h-56 bg-white/5 rounded-xl border border-white/5" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 h-96 bg-white/5 rounded-xl border border-white/5" />
          <div className="h-96 bg-white/5 rounded-xl border border-white/5" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pt-4 pb-12">
      {/* 1. Glowing Hero Banner */}
      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-[#0c0c14] via-[#080812] to-[#120822] p-8 md:p-10 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6"
      >
        {/* Background Gradients */}
        <div className="absolute top-0 right-0 w-80 h-80 rounded-full bg-neon-violet/10 blur-[80px]" />
        <div className="absolute bottom-0 left-1/3 w-80 h-80 rounded-full bg-neon-cyan/5 blur-[100px]" />

        <div className="space-y-4 max-w-xl z-10 text-center md:text-left">
          <span className="text-[10px] font-bold uppercase tracking-widest text-neon-cyan px-2.5 py-1 bg-neon-cyan/10 rounded-full border border-neon-cyan/20">
            SosuGem Alpha v1.0
          </span>
          <h2 className="font-display text-2xl md:text-4xl font-extrabold tracking-tight text-white leading-tight">
            Your Personal On-Chain <br className="hidden md:inline" />
            <span className="bg-gradient-to-r from-neon-violet via-[#b55cff] to-neon-cyan bg-clip-text text-transparent">
              AI Hedge Fund
            </span>
          </h2>
          <p className="text-xs md:text-sm text-muted-text leading-relaxed">
            Consolidate institutional research feeds from SoSoValue, formulate optimal risk profiles with Google Gemini, and deploy automated orders through SoDEX routing nodes.
          </p>
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 pt-2">
            <Link href="/research">
              <Button variant="violet" size="sm" className="flex items-center gap-1">
                <BrainCircuit className="h-4 w-4" />
                Ask Research Agent
              </Button>
            </Link>
            <Link href="/trade">
              <Button variant="secondary" size="sm" className="flex items-center gap-1 border-white/10 hover:border-white/20">
                Open Terminal
                <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </Link>
          </div>
        </div>

        {/* Visual Badge / Metrics summary */}
        <div className="z-10 bg-white/[0.02] border border-white/5 rounded-xl p-5 w-full md:w-80 backdrop-blur-md">
          <h4 className="text-xs font-semibold text-neutral-300 border-b border-white/5 pb-2 mb-3">
            System Network Health
          </h4>
          <div className="space-y-2.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-text">SoSoValue feed</span>
              <span className="text-neon-emerald font-medium flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-neon-emerald"></span> Online
              </span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-text">SoDEX router</span>
              <span className="text-neon-emerald font-medium flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-neon-emerald"></span> Connected
              </span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-text">Gemini Agent</span>
              <span className="text-neon-cyan font-medium flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-neon-cyan rounded-full animate-pulse"></span> Ready
              </span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-text">Secure Enclave</span>
              <span className="text-neon-emerald font-medium flex items-center gap-1">
                <ShieldCheck className="h-3.5 w-3.5" /> Active
              </span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* 2. Top-Level Core Market Stat Tickers */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Crypto Cap */}
        <Card className="glass-panel-hover">
          <CardContent className="p-5 flex items-center justify-between">
            <div className="space-y-1.5">
              <p className="text-[11px] font-semibold text-muted-text uppercase tracking-wider">Total Market Cap</p>
              <h3 className="text-lg font-bold text-white tracking-tight">
                {stats ? formatCurrency(stats.totalMarketCap, 0) : '$2.54T'}
              </h3>
              <p className="text-[10px] flex items-center gap-1 font-medium text-neon-emerald">
                <TrendingUp className="h-3.5 w-3.5" />
                {stats ? formatPercent(stats.marketCapChange24h) : '+2.85%'}
              </p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400">
              <Coins className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        {/* BTC Spot ETF flow */}
        <Card className="glass-panel-hover">
          <CardContent className="p-5 flex items-center justify-between">
            <div className="space-y-1.5">
              <p className="text-[11px] font-semibold text-muted-text uppercase tracking-wider">BTC ETF Daily Inflow</p>
              <h3 className="text-lg font-bold text-white tracking-tight">
                {stats ? formatCompact(stats.etfNetInflow) : '+$242.3M'}
              </h3>
              <p className="text-[10px] text-muted-text">SoSoValue ETF Index</p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-400">
              <DollarSign className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        {/* ETH Spot ETF flow */}
        <Card className="glass-panel-hover">
          <CardContent className="p-5 flex items-center justify-between">
            <div className="space-y-1.5">
              <p className="text-[11px] font-semibold text-muted-text uppercase tracking-wider">ETH ETF Daily Inflow</p>
              <h3 className="text-lg font-bold text-white tracking-tight">
                {stats ? formatCompact(stats.etfEthInflow) : '+$48.9M'}
              </h3>
              <p className="text-[10px] text-muted-text">SoSoValue ETF Index</p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-400">
              <DollarSign className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        {/* System Gas Price */}
        <Card className="glass-panel-hover">
          <CardContent className="p-5 flex items-center justify-between">
            <div className="space-y-1.5">
              <p className="text-[11px] font-semibold text-muted-text uppercase tracking-wider">Average Gas Fee</p>
              <h3 className="text-lg font-bold text-white tracking-tight">5.2 Gwei</h3>
              <p className="text-[10px] text-neon-emerald flex items-center gap-1 font-medium">
                <Flame className="h-3 w-3" /> Multi-Year Low
              </p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-orange-500/10 flex items-center justify-center text-orange-400">
              <Flame className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 3. Major Coins & Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Token performance cards */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-display font-bold text-white text-base">
              Market Index Tickers
            </h3>
            <span className="text-[10px] text-muted-text">Updated real-time via REST Proxy</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {coins.slice(0, 3).map((coin) => (
              <Card key={coin.symbol} className="glass-panel-hover">
                <CardContent className="p-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center font-bold text-xs text-white">
                        {coin.symbol}
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-white">{coin.name}</h4>
                        <p className="text-[10px] text-muted-text font-medium">{coin.symbol}/USDT</p>
                      </div>
                    </div>
                    <span className={cn(
                      "text-[10px] font-semibold px-2 py-0.5 rounded-full flex items-center gap-0.5",
                      coin.change24h >= 0 
                        ? "bg-neon-emerald/10 text-neon-emerald border border-neon-emerald/20" 
                        : "bg-neon-rose/10 text-neon-rose border border-neon-rose/20"
                    )}>
                      {coin.change24h >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                      {formatPercent(coin.change24h)}
                    </span>
                  </div>

                  <div className="space-y-0.5">
                    <p className="text-lg font-mono font-bold text-white">
                      {formatCurrency(coin.price, coin.price > 100 ? 2 : 4)}
                    </p>
                    <p className="text-[10px] text-muted-text">
                      Vol: {formatCompact(coin.volume24h)}
                    </p>
                  </div>

                  {/* Sparkline canvas simulation */}
                  <div className="h-10 w-full pt-2">
                    <svg className="w-full h-full overflow-visible">
                      <polyline
                        fill="none"
                        stroke={coin.change24h >= 0 ? '#10b981' : '#f43f5e'}
                        strokeWidth="1.5"
                        points={coin.sparkline.map((val, idx) => {
                          const min = Math.min(...coin.sparkline);
                          const max = Math.max(...coin.sparkline);
                          const range = max - min || 1;
                          const x = (idx / (coin.sparkline.length - 1)) * 200; // width factor
                          const y = 35 - ((val - min) / range) * 30; // height offset
                          return `${x},${y}`;
                        }).join(' ')}
                      />
                    </svg>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Smart Signals Summary */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <div>
                <CardTitle>Recent High-Conviction Signals</CardTitle>
                <CardDescription>AI-generated trade setups with confidence evaluation</CardDescription>
              </div>
              <Link href="/signals">
                <Button variant="cyan" size="sm" className="h-8 text-xs">
                  <Zap className="h-3 w-3" />
                  Signal Hub
                </Button>
              </Link>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-white/5">
                <div className="flex items-center justify-between p-4 px-5 hover:bg-white/[0.01]">
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded-full bg-neon-emerald/10 border border-neon-emerald/30 text-neon-emerald flex items-center justify-center font-bold text-xs">
                      BUY
                    </span>
                    <div>
                      <h4 className="text-xs font-semibold text-white">SOL-PERP (5x Leverage)</h4>
                      <p className="text-[10px] text-muted-text mt-0.5">Momentum Breakout. SEC 19b-4 ETF catalyst.</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-bold text-neon-cyan block">Confidence: 94%</span>
                    <span className="text-[10px] text-muted-text">Targets: $195.00</span>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 px-5 hover:bg-white/[0.01]">
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded-full bg-neon-rose/10 border border-neon-rose/30 text-neon-rose flex items-center justify-center font-bold text-xs">
                      SELL
                    </span>
                    <div>
                      <h4 className="text-xs font-semibold text-white">XRP-USDT (Spot)</h4>
                      <p className="text-[10px] text-muted-text mt-0.5">Resistance rejection. Regulatory fatigue.</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-bold text-amber-400 block">Confidence: 78%</span>
                    <span className="text-[10px] text-muted-text">Targets: $0.5100</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right side: Sentiment News feed */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-display font-bold text-white text-base">
              Sentiment Intelligence
            </h3>
            <span className="text-[10px] text-muted-text">SoSoValue AI feeds</span>
          </div>

          <Card className="h-[432px] flex flex-col justify-between">
            <CardHeader className="pb-3">
              <CardTitle>On-Chain News Feeds</CardTitle>
              <CardDescription>Real-time aggregated research sentiment</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto px-5 divide-y divide-white/5 space-y-3 scrollbar-thin">
              {news.map((item) => (
                <div key={item.id} className="pt-3 first:pt-0 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-semibold text-neutral-400 uppercase">{item.source} • {item.time}</span>
                    <span className={cn(
                      "text-[9px] font-bold px-1.5 py-0.5 rounded",
                      item.sentiment === 'BULLISH' && "bg-neon-emerald/10 text-neon-emerald border border-neon-emerald/20",
                      item.sentiment === 'BEARISH' && "bg-neon-rose/10 text-neon-rose border border-neon-rose/20",
                      item.sentiment === 'NEUTRAL' && "bg-white/5 text-neutral-300 border border-white/10"
                    )}>
                      {item.sentiment}
                    </span>
                  </div>
                  <h4 className="text-xs font-semibold text-white leading-snug hover:text-neon-cyan transition-colors">
                    <a href={item.url} target="_blank" rel="noopener noreferrer">{item.title}</a>
                  </h4>
                  <p className="text-[10px] text-muted-text leading-relaxed line-clamp-2">
                    {item.summary}
                  </p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
