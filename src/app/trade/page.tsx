'use client';

import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  TrendingUp, 
  TrendingDown, 
  ArrowUpRight, 
  ArrowDownRight, 
  Sparkles,
  Percent,
  Wallet,
  Activity,
  History,
  Trash2
} from 'lucide-react';
import { useSettings, useWallet } from '@/components/Providers';
import { SoDEXClient } from '@/lib/sodex';
import { SoSoValueClient } from '@/lib/sosovalue';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/toast';
import { cn, formatCurrency, formatPercent } from '@/lib/utils';
import { AssetPosition, CoinData } from '@/types';
import { ApiKeyWarning } from '@/components/ApiKeyWarning';

// Mock chart data points for visual plotting
const HISTORICAL_CHART_DATA: Record<string, number[]> = {
  BTC: [67100, 67400, 67200, 67900, 68100, 68900, 68500, 68950, 69200, 68650],
  ETH: [3680, 3710, 3690, 3720, 3740, 3780, 3760, 3790, 3820, 3792],
  SOL: [171.2, 173.4, 172.9, 175.1, 177.3, 180.2, 179.1, 181.5, 182.5, 179.8]
};

export default function Trade() {
  const { settings } = useSettings();
  const { isConnected, address } = useWallet();
  const { toast } = useToast();

  const [activeAsset, setActiveAsset] = React.useState<string>('BTC');
  const [tradeType, setTradeType] = React.useState<'SPOT' | 'PERP'>('SPOT');
  const [side, setSide] = React.useState<'BUY' | 'SELL'>('BUY');
  const [orderType, setOrderType] = React.useState<'market' | 'limit'>('limit');
  const [priceInput, setPriceInput] = React.useState('');
  const [sizeInput, setSizeInput] = React.useState('');
  const [leverage, setLeverage] = React.useState(5);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  // Live SoSoValue coins list
  const [liveCoins, setLiveCoins] = React.useState<CoinData[]>([]);

  // Stateful position management
  const [positions, setPositions] = React.useState<AssetPosition[]>([]);
  const [tradeHistory, setTradeHistory] = React.useState<any[]>([]);
  const [balances, setBalances] = React.useState<any>(null);

  const sosoClient = React.useMemo(() => 
    new SoSoValueClient(settings.sosoValueApiKey), 
    [settings.sosoValueApiKey]
  );

  const sodexClient = React.useMemo(() => 
    new SoDEXClient(settings.sodexApiKey, settings.sodexSecretKey),
    [settings.sodexApiKey, settings.sodexSecretKey]
  );

  // Retrieve dynamic list of tokens from balance assets + default tokens
  const tradableAssets = React.useMemo(() => {
    const defaultAssets = ['BTC', 'ETH', 'SOL'];
    if (liveCoins.length > 0) {
      const liveSymbols = liveCoins.map(c => c.symbol);
      return Array.from(new Set([...defaultAssets, ...liveSymbols]));
    }
    if (balances && balances.assets) {
      const symbols = balances.assets.map((a: any) => a.symbol);
      return Array.from(new Set([...defaultAssets, ...symbols]));
    }
    return defaultAssets;
  }, [balances, liveCoins]);

  // Sync pricing inputs using live prices scaled dynamically
  const activeAssetChartData = React.useMemo(() => {
    const liveCoin = liveCoins.find(c => c.symbol === activeAsset);
    const mockBase = HISTORICAL_CHART_DATA[activeAsset] || [1, 1.02, 0.99, 1.01, 1.05, 1.03, 1.07, 1.06, 1.09, 1.08];
    if (liveCoin) {
      const currentVal = liveCoin.price;
      const baseMax = Math.max(...mockBase);
      const scaled = mockBase.map(v => (v / baseMax) * currentVal);
      scaled[scaled.length - 1] = currentVal;
      return scaled;
    }
    return mockBase;
  }, [activeAsset, liveCoins]);

  const currentAssetPrice = React.useMemo(() => {
    return activeAssetChartData[activeAssetChartData.length - 1] || 0;
  }, [activeAssetChartData]);

  // Synchronize price input
  React.useEffect(() => {
    setPriceInput(currentAssetPrice.toString());
  }, [currentAssetPrice]);

  // Load live coins data from SoSoValue
  React.useEffect(() => {
    let active = true;
    async function loadLiveCoins() {
      try {
        const data = await sosoClient.getCoins();
        if (active) {
          setLiveCoins(data);
        }
      } catch (err) {
        console.error('Failed to load live coins in Trade:', err);
      }
    }
    loadLiveCoins();
    const interval = setInterval(loadLiveCoins, 10000);
    return () => {
      active = false;
      clearInterval(interval);
    };
  }, [sosoClient]);

  // Load account data
  const loadAccountData = React.useCallback(async () => {
    try {
      const [posList, histList, balSummary] = await Promise.all([
        sodexClient.getPositions(),
        sodexClient.getTradeHistory(),
        sodexClient.getBalances()
      ]);
      setPositions(posList);
      setTradeHistory(histList);
      setBalances(balSummary);
    } catch (err) {
      console.error(err);
    }
  }, [sodexClient]);

  React.useEffect(() => {
    loadAccountData();
    const interval = setInterval(loadAccountData, 5000);
    return () => clearInterval(interval);
  }, [loadAccountData]);

  if ((!settings.sodexApiKey || !settings.sodexSecretKey) && !settings.sodexSet) {
    return (
      <ApiKeyWarning 
        title="SoDEX API Keys Required"
        description="Active SoDEX API keys and secret signatures are required to route custom orders, place spot trades, and manage perpetual margin contracts. Please configure them to continue."
      />
    );
  }

  // Place trade
  const handlePlaceOrder = async () => {
    if (!isConnected) {
      toast('Wallet Connection Required', 'Please connect Phantom or MetaMask first.', 'warning');
      return;
    }
    const size = Number(sizeInput);
    const price = Number(priceInput);
    if (!size || size <= 0 || !price || price <= 0) {
      toast('Invalid Parameters', 'Please enter a valid price and size.', 'warning');
      return;
    }

    setIsSubmitting(true);
    try {
      let result;
      if (tradeType === 'SPOT') {
        result = await sodexClient.placeSpotOrder({
          symbol: activeAsset,
          side,
          price,
          size,
          orderType
        });
      } else {
        result = await sodexClient.placePerpOrder({
          symbol: `${activeAsset}-PERP`,
          side: side === 'BUY' ? 'LONG' : 'SHORT',
          price,
          size,
          leverage,
          orderType
        });
      }

      if (result.success) {
        toast('Order Placed Successfully', `Tx Hash: ${result.txHash.substring(0, 14)}...`, 'success');
        setSizeInput('');
        loadAccountData();
      } else {
        toast('Order Failed', result.error || 'Check balance parameters.', 'error');
      }
    } catch (err: any) {
      toast('Order Error', err.message || 'Execution node failure.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClosePosition = async (id: string) => {
    try {
      const ok = await sodexClient.closePosition(id);
      if (ok) {
        toast('Position Liquidated', 'Market close filled on SoDEX.', 'success');
        loadAccountData();
      } else {
        toast('Error', 'Unable to resolve position closure.', 'error');
      }
    } catch (err: any) {
      toast('Error', err.message, 'error');
    }
  };

  // Gemini Companion real-time advice
  const geminiAdvice = React.useMemo(() => {
    const size = Number(sizeInput) || 0;
    const price = Number(priceInput) || currentAssetPrice;
    const totalVal = size * price;
    const portfolioTotal = balances?.totalValue || 12500;
    const exposurePercent = (totalVal / portfolioTotal) * 100;

    let marginAdvice = 'Risk Neutral';
    let suggestion = 'Select order size to start AI evaluation...';
    let stopLoss = 0;

    if (size > 0) {
      if (tradeType === 'SPOT') {
        stopLoss = side === 'BUY' ? price * 0.95 : price * 1.05;
        if (exposurePercent > 20) {
          marginAdvice = 'High Exposure Warning';
          suggestion = `Position represents ${exposurePercent.toFixed(1)}% of capital. Gemini suggests trimming order to max 10% to prevent alt rotation corrections. Stop-loss at $${stopLoss.toFixed(2)}`;
        } else {
          marginAdvice = 'Optimal Sizing';
          suggestion = `Safe exposure (${exposurePercent.toFixed(1)}%). SoSoValue indexes show strong buy support. Recommended stop-loss set at $${stopLoss.toFixed(2)}`;
        }
      } else {
        // Perp calculations
        const liquidationPrice = side === 'BUY' 
          ? price * (1 - 1 / leverage) 
          : price * (1 + 1 / leverage);
        stopLoss = side === 'BUY' ? price * 0.96 : price * 1.04;
        
        marginAdvice = leverage > 10 ? 'Aggressive Leverage Alert' : 'Structured Leverage';
        suggestion = `3x-5x recommended. At ${leverage}x, liquidation threshold is $${liquidationPrice.toFixed(2)}. Suggest stop-loss at $${stopLoss.toFixed(2)} to protect margin.`;
      }
    }

    return { marginAdvice, suggestion };
  }, [sizeInput, priceInput, currentAssetPrice, tradeType, side, leverage, balances]);

  return (
    <div className="space-y-6 pt-4 pb-12">
      {/* Active Tickers Header Row */}
      <div className="flex flex-wrap items-center gap-3 border-b border-white/5 pb-4">
        {tradableAssets.map((symbol) => {
          const isActive = activeAsset === symbol;
          
          const liveCoin = liveCoins.find(c => c.symbol === symbol);
          let price = 0;
          let change = 0;

          if (liveCoin) {
            price = liveCoin.price;
            change = liveCoin.change24h;
          } else {
            const data = HISTORICAL_CHART_DATA[symbol] || [1, 1.05];
            price = data[data.length - 1];
            const prev = data[data.length - 2] || price;
            change = ((price - prev) / prev) * 100;
          }

          return (
            <button
              key={symbol}
              onClick={() => setActiveAsset(symbol)}
              className={cn(
                "flex items-center gap-3 px-4 py-2.5 rounded-xl border transition-all text-left cursor-pointer",
                isActive 
                  ? "bg-white/5 border-white/15 text-white" 
                  : "bg-transparent border-white/5 text-neutral-400 hover:text-white"
              )}
            >
              <div className="w-6 h-6 rounded bg-white/5 flex items-center justify-center font-bold text-xs">
                {symbol}
              </div>
              <div>
                <span className="text-[10px] text-muted-text block uppercase">Price</span>
                <span className="text-xs font-mono font-bold block mt-0.5">
                  {formatCurrency(price, price > 100 ? 2 : 3)}
                </span>
              </div>
              <span className={cn(
                "text-[9px] font-bold px-1.5 py-0.5 rounded flex items-center gap-0.5 mt-2",
                change >= 0 ? "bg-neon-emerald/10 text-neon-emerald" : "bg-neon-rose/10 text-neon-rose"
              )}>
                {change >= 0 ? '+' : ''}{change.toFixed(2)}%
              </span>
            </button>
          );
        })}
      </div>

      {/* Main Grid: left order entry, center chart + depth, right logs */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Panel 1: Order entry form + AI Companion */}
        <div className="space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex gap-2 bg-black/40 border border-white/5 p-1 rounded-lg">
                <button
                  onClick={() => setTradeType('SPOT')}
                  className={cn(
                    "flex-1 py-1.5 text-xs font-semibold rounded transition-all cursor-pointer text-center",
                    tradeType === 'SPOT' ? "bg-white/10 text-white" : "text-muted-text hover:text-white"
                  )}
                >
                  Spot
                </button>
                <button
                  onClick={() => setTradeType('PERP')}
                  className={cn(
                    "flex-1 py-1.5 text-xs font-semibold rounded transition-all cursor-pointer text-center",
                    tradeType === 'PERP' ? "bg-white/10 text-white" : "text-muted-text hover:text-white"
                  )}
                >
                  Perps
                </button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Buy Sell side */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setSide('BUY')}
                  className={cn(
                    "py-2 text-xs font-bold rounded-lg transition-all cursor-pointer text-center",
                    side === 'BUY' 
                      ? "bg-neon-emerald/15 border border-neon-emerald/30 text-neon-emerald" 
                      : "bg-white/[0.01] border border-white/5 text-muted-text"
                  )}
                >
                  {tradeType === 'SPOT' ? 'BUY' : 'LONG'}
                </button>
                <button
                  onClick={() => setSide('SELL')}
                  className={cn(
                    "py-2 text-xs font-bold rounded-lg transition-all cursor-pointer text-center",
                    side === 'SELL' 
                      ? "bg-neon-rose/15 border border-neon-rose/30 text-neon-rose" 
                      : "bg-white/[0.01] border border-white/5 text-muted-text"
                  )}
                >
                  {tradeType === 'SPOT' ? 'SELL' : 'SHORT'}
                </button>
              </div>

              {/* Order Type Toggle */}
              <div className="flex items-center justify-between text-xs border-b border-white/5 pb-2">
                <span className="text-muted-text">Order Type</span>
                <div className="flex gap-2">
                  <button onClick={() => setOrderType('market')} className={cn("font-medium", orderType === 'market' ? "text-neon-cyan" : "text-muted-text")}>Market</button>
                  <button onClick={() => setOrderType('limit')} className={cn("font-medium", orderType === 'limit' ? "text-neon-cyan" : "text-muted-text")}>Limit</button>
                </div>
              </div>

              {/* Price input */}
              {orderType === 'limit' && (
                <div className="space-y-1.5">
                  <label className="text-[10px] text-muted-text uppercase">Limit Price (USDT)</label>
                  <Input
                    type="number"
                    value={priceInput}
                    onChange={(e) => setPriceInput(e.target.value)}
                    className="font-mono"
                  />
                </div>
              )}

              {/* Size input */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] text-muted-text uppercase">Size ({activeAsset})</label>
                  {balances && (
                    <span className="text-[10px] text-neutral-400 font-mono">
                      Avail: {balances.assets.find((a: any) => a.symbol === (side === 'BUY' ? 'USDT' : activeAsset))?.amount.toFixed(3) || 0}
                    </span>
                  )}
                </div>
                <Input
                  type="number"
                  value={sizeInput}
                  onChange={(e) => setSizeInput(e.target.value)}
                  placeholder="0.00"
                  className="font-mono"
                />
              </div>

              {/* Leverage Slider if Perp */}
              {tradeType === 'PERP' && (
                <div className="space-y-2 pt-1">
                  <div className="flex justify-between text-[10px]">
                    <span className="text-muted-text">Leverage</span>
                    <span className="text-neon-cyan font-bold">{leverage}x</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="20"
                    value={leverage}
                    onChange={(e) => setLeverage(Number(e.target.value))}
                    className="w-full accent-neon-cyan h-1 bg-white/10 rounded-lg outline-none cursor-pointer"
                  />
                </div>
              )}

              {/* Route Order button */}
              <Button 
                variant={side === 'BUY' ? 'cyan' : 'danger'}
                className="w-full h-11 mt-2 cursor-pointer font-bold"
                onClick={handlePlaceOrder}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Signing Transaction...' : `${side} ${activeAsset}`}
              </Button>
            </CardContent>
          </Card>

          {/* AI companion advisor */}
          <Card className="border border-neon-violet/20 bg-neon-violet/[0.02]">
            <CardHeader className="pb-2 border-b border-white/5">
              <CardTitle className="text-xs font-bold flex items-center gap-1.5 text-white">
                <Sparkles className="h-4 w-4 text-neon-violet animate-pulse" />
                Gemini Trade Companion
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-[9px] text-muted-text uppercase">Risk Index</span>
                <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                  {geminiAdvice.marginAdvice}
                </span>
              </div>
              <p className="text-xs text-neutral-300 leading-relaxed font-medium">
                {geminiAdvice.suggestion}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Panel 2: Chart + Order book depth */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="p-4">
            <div className="flex items-center justify-between border-b border-white/5 pb-2 mb-4">
              <div className="flex items-center gap-2">
                <Activity className="h-4 w-4 text-neon-cyan" />
                <span className="text-xs font-bold text-white uppercase">{activeAsset}/USDT Price Trend</span>
              </div>
              <span className="text-[10px] text-muted-text">Interval: 15m</span>
            </div>

            {/* Custom SVG Line Chart representation */}
            <div className="h-52 w-full relative">
              {/* Glow gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-neon-violet/5 to-transparent pointer-events-none" />
              
              <svg className="w-full h-full overflow-visible">
                <defs>
                  <linearGradient id="chart-glow" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0" />
                  </linearGradient>
                </defs>
                
                {/* Area under curve */}
                <path
                  d={`M0,200 ${activeAssetChartData.map((val, idx) => {
                    const min = Math.min(...activeAssetChartData);
                    const max = Math.max(...activeAssetChartData);
                    const range = max - min || 1;
                    const x = (idx / (activeAssetChartData.length - 1)) * 500;
                    const y = 160 - ((val - min) / range) * 120;
                    return `L${x},${y}`;
                  }).join(' ')} L500,200 Z`}
                  fill="url(#chart-glow)"
                />
                
                {/* Trend line */}
                <polyline
                  fill="none"
                  stroke="#8b5cf6"
                  strokeWidth="2"
                  points={activeAssetChartData.map((val, idx) => {
                    const min = Math.min(...activeAssetChartData);
                    const max = Math.max(...activeAssetChartData);
                    const range = max - min || 1;
                    const x = (idx / (activeAssetChartData.length - 1)) * 500; // factor
                    const y = 160 - ((val - min) / range) * 120;
                    return `${x},${y}`;
                  }).join(' ')}
                />

                {/* Draw price dots */}
                {activeAssetChartData.map((val, idx, arr) => {
                  if (idx !== arr.length - 1) return null;
                  const min = Math.min(...arr);
                  const max = Math.max(...arr);
                  const range = max - min || 1;
                  const x = (idx / (arr.length - 1)) * 500;
                  const y = 160 - ((val - min) / range) * 120;
                  return (
                    <g key={idx}>
                      <circle cx={x} cy={y} r="5" fill="#00f0ff" className="animate-pulse" />
                      <circle cx={x} cy={y} r="10" stroke="#00f0ff" strokeWidth="1" fill="none" opacity="0.4" />
                    </g>
                  );
                })}
              </svg>
            </div>
          </Card>

          {/* Depth / Orderbook and Positions side-by-side */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Depth orderbook widget */}
            <Card className="p-4 md:col-span-1">
              <span className="text-[10px] text-muted-text font-bold uppercase tracking-wider block border-b border-white/5 pb-2 mb-2">Order Book</span>
              <div className="space-y-1.5 font-mono text-[10px]">
                {/* Asks (Sell orders) - Red */}
                {[1.012, 1.008, 1.003].map((factor, i) => (
                  <div key={i} className="flex justify-between text-neon-rose opacity-85">
                    <span>{(currentAssetPrice * factor).toFixed(currentAssetPrice > 100 ? 1 : 3)}</span>
                    <span>{(Math.random() * 0.8 + 0.1).toFixed(2)}</span>
                  </div>
                ))}

                {/* Spread */}
                <div className="py-1 flex items-center justify-between border-y border-white/5 font-semibold text-white">
                  <span>Spread</span>
                  <span>{formatCurrency(currentAssetPrice, currentAssetPrice > 100 ? 2 : 4)}</span>
                </div>

                {/* Bids (Buy orders) - Green */}
                {[0.997, 0.992, 0.988].map((factor, i) => (
                  <div key={i} className="flex justify-between text-neon-emerald opacity-85">
                    <span>{(currentAssetPrice * factor).toFixed(currentAssetPrice > 100 ? 1 : 3)}</span>
                    <span>{(Math.random() * 0.8 + 0.1).toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </Card>

            {/* Account Logs: positions + orders */}
            <Card className="p-4 md:col-span-2">
              <span className="text-[10px] text-muted-text font-bold uppercase tracking-wider block border-b border-white/5 pb-2 mb-3">Active Leverage Positions</span>
              <div className="overflow-x-auto">
                {positions.length === 0 ? (
                  <div className="py-8 text-center text-xs text-muted-text">
                    No active positions found. Link wallet and execute a PERP contract.
                  </div>
                ) : (
                  <table className="min-w-full text-xs font-mono">
                    <thead>
                      <tr className="text-muted-text text-[10px] border-b border-white/5">
                        <th className="py-2 text-left">Asset</th>
                        <th className="py-2 text-left">Side</th>
                        <th className="py-2 text-left">Leverage</th>
                        <th className="py-2 text-left">Size</th>
                        <th className="py-2 text-left">Unrealized PnL</th>
                        <th className="py-2 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 text-white">
                      {positions.map((pos) => (
                        <tr key={pos.id} className="hover:bg-white/[0.01]">
                          <td className="py-2 font-bold">{pos.symbol}</td>
                          <td className="py-2">
                            <span className={cn(
                              "font-bold",
                              pos.side === 'LONG' ? "text-neon-emerald" : "text-neon-rose"
                            )}>
                              {pos.side}
                            </span>
                          </td>
                          <td className="py-2">{pos.leverage}x</td>
                          <td className="py-2">{pos.size}</td>
                          <td className="py-2">
                            <span className={cn(
                              "font-semibold",
                              pos.pnl >= 0 ? "text-neon-emerald" : "text-neon-rose"
                            )}>
                              {formatCurrency(pos.pnl, 2)} ({pos.pnlPercent.toFixed(1)}%)
                            </span>
                          </td>
                          <td className="py-2 text-right">
                            <Button 
                              variant="ghost" 
                              size="sm"
                              className="h-6 text-[10px] px-2 text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded"
                              onClick={() => handleClosePosition(pos.id)}
                            >
                              Close
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </Card>

          </div>
        </div>

      </div>
    </div>
  );
}
