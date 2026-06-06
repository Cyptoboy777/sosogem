'use client';

import * as React from 'react';
import { motion as motionFramer, AnimatePresence } from 'framer-motion';
import { 
  Zap, 
  TrendingUp, 
  TrendingDown, 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle2, 
  HelpCircle,
  Key
} from 'lucide-react';
import { useSettings, useWallet } from '@/components/Providers';
import { SoDEXClient } from '@/lib/sodex';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog } from '@/components/ui/dialog';
import { useToast } from '@/components/ui/toast';
import { cn, formatCurrency, formatPercent, shortenAddress } from '@/lib/utils';
import { SmartSignal } from '@/types';
import { ApiKeyWarning } from '@/components/ApiKeyWarning';

const INITIAL_SIGNALS: SmartSignal[] = [
  {
    id: 'sig-1',
    token: 'Solana',
    symbol: 'SOL',
    direction: 'BUY',
    confidence: 94,
    riskLevel: 'MEDIUM',
    entryPrice: 178.50,
    targetPrice: 195.00,
    stopLoss: 169.50,
    reason: 'Breakout above $175 horizontal resistance backed by Form 19b-4 ETF listings. Strong rotation from L2 networks back into SOL layer-1 DEX liquidity.',
    upside: '+9.24%',
    timestamp: '10 mins ago',
  },
  {
    id: 'sig-2',
    token: 'Bitcoin',
    symbol: 'BTC',
    direction: 'BUY',
    confidence: 88,
    riskLevel: 'LOW',
    entryPrice: 68600.00,
    targetPrice: 72500.00,
    stopLoss: 66300.00,
    reason: 'Fidelity and BlackRock record continuous net inflows absorbing Spot CEX liquidity. Reseting derivatives funding rates signal a leverage flush.',
    upside: '+5.68%',
    timestamp: '35 mins ago',
  },
  {
    id: 'sig-3',
    token: 'Ethereum',
    symbol: 'ETH',
    direction: 'BUY',
    confidence: 91,
    riskLevel: 'LOW',
    entryPrice: 3790.00,
    targetPrice: 4100.00,
    stopLoss: 3650.00,
    reason: 'Network gas fees reach historic lows, boosting on-chain contract interactions and mainnet ether burn. Accumulation patterns ahead of S-1 listing reviews.',
    upside: '+8.18%',
    timestamp: '1 hour ago',
  },
  {
    id: 'sig-4',
    token: 'Dogecoin',
    symbol: 'DOGE',
    direction: 'SELL',
    confidence: 74,
    riskLevel: 'HIGH',
    entryPrice: 0.1580,
    targetPrice: 0.1380,
    stopLoss: 0.1690,
    reason: 'Relative Strength Index (RSI) registers bearish divergence on 4h timeframe. Volume decay on meme-ecosystem assets indicate rotational risk to large caps.',
    upside: '+12.65%',
    timestamp: '2 hours ago',
  }
];

export default function Signals() {
  const { settings } = useSettings();
  const { isConnected, address } = useWallet();
  const { toast } = useToast();
  
  const [signals, setSignals] = React.useState<SmartSignal[]>(INITIAL_SIGNALS);
  const [selectedSignal, setSelectedSignal] = React.useState<SmartSignal | null>(null);
  const [isExecuting, setIsExecuting] = React.useState(false);
  const [executionLeverage, setExecutionLeverage] = React.useState(5);
  const [executionType, setExecutionType] = React.useState<'SPOT' | 'PERP'>('SPOT');
  const [executionSize, setExecutionSize] = React.useState(0.5); // size factor (0.5 BTC, etc.)

  const sodexClient = React.useMemo(() => 
    new SoDEXClient(settings.sodexApiKey, settings.sodexSecretKey),
    [settings.sodexApiKey, settings.sodexSecretKey]
  );

  if ((!settings.sodexApiKey || !settings.sodexSecretKey) && !settings.sodexSet) {
    return (
      <ApiKeyWarning 
        title="SoDEX API Keys Required"
        description="Active SoDEX API keys and secret signatures are required to route signals and execute signed spot/perp orders. Please configure them to continue."
      />
    );
  }

  const handleOpenExecution = (signal: SmartSignal) => {
    if (!isConnected) {
      toast('Wallet Not Linked', 'Please link MetaMask or Phantom in the navigation bar to proceed.', 'warning');
      return;
    }
    setSelectedSignal(signal);
    
    // Auto-select trade type
    if (signal.riskLevel === 'HIGH' || signal.symbol === 'SOL') {
      setExecutionType('PERP');
      setExecutionSize(signal.symbol === 'SOL' ? 10 : 25);
    } else {
      setExecutionType('SPOT');
      setExecutionSize(signal.symbol === 'BTC' ? 0.05 : 0.8);
    }
  };

  const handleExecute = async () => {
    if (!selectedSignal) return;
    setIsExecuting(true);

    try {
      // Simulate signing delay
      await new Promise(resolve => setTimeout(resolve, 1500));

      let result;
      if (executionType === 'SPOT') {
        result = await sodexClient.placeSpotOrder({
          symbol: selectedSignal.symbol,
          side: selectedSignal.direction === 'BUY' ? 'BUY' : 'SELL',
          price: selectedSignal.entryPrice,
          size: executionSize,
          orderType: 'market'
        });
      } else {
        result = await sodexClient.placePerpOrder({
          symbol: `${selectedSignal.symbol}-PERP`,
          side: selectedSignal.direction === 'BUY' ? 'LONG' : 'SHORT',
          price: selectedSignal.entryPrice,
          size: executionSize,
          leverage: executionLeverage,
          orderType: 'market'
        });
      }

      if (result.success) {
        setSignals(prev => prev.map(s => 
          s.id === selectedSignal.id 
            ? { ...s, executed: true, txHash: result.txHash } 
            : s
        ));
        toast(
          'Trade Executed',
          `Order filled. Tx Hash: ${result.txHash.substring(0, 12)}...`,
          'success'
        );
      } else {
        toast('Trade Failed', result.error || 'Failed to place order', 'error');
      }
    } catch (err: any) {
      toast('Execution Error', err.message || 'An unexpected error occurred during trade placement', 'error');
    } finally {
      setIsExecuting(false);
      setSelectedSignal(null);
    }
  };

  return (
    <div className="space-y-6 pt-4 pb-12">
      {/* Page Header */}
      <div className="space-y-1.5">
        <h2 className="text-xl font-display font-extrabold text-white tracking-tight flex items-center gap-2">
          <Zap className="h-5 w-5 text-amber-400" />
          SosuGem Smart Signals
        </h2>
        <p className="text-xs text-muted-text max-w-2xl leading-relaxed">
          High-probability trade strategies parsed by Google Gemini from SoSoValue open-chain metrics. Click "Execute on SoDEX" to sign and route orders directly to the DEX mainnet.
        </p>
      </div>

      {/* Signals Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {signals.map((sig) => (
          <motionFramer.div
            key={sig.id}
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
          >
            <Card className="glass-panel relative flex flex-col justify-between h-full border border-white/5 hover:border-white/10 transition-colors">
              {/* Executed Badge */}
              {sig.executed && (
                <div className="absolute top-0 right-0 left-0 bottom-0 bg-black/60 backdrop-blur-[2px] z-10 rounded-xl flex flex-col items-center justify-center gap-2">
                  <CheckCircle2 className="h-10 w-10 text-neon-emerald" />
                  <span className="text-xs font-bold text-white uppercase tracking-wider">Executed on SoDEX</span>
                  <span className="text-[10px] text-muted-text font-mono bg-black/50 border border-white/10 px-2 py-0.5 rounded">
                    Tx: {sig.txHash?.substring(0, 16)}...
                  </span>
                </div>
              )}

              <CardHeader className="pb-3 flex flex-row items-center justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-white">{sig.token}</span>
                    <span className="text-[10px] font-semibold bg-white/5 border border-white/10 text-neutral-300 px-2 py-0.5 rounded">
                      {sig.symbol}
                    </span>
                  </div>
                  <CardDescription>{sig.timestamp}</CardDescription>
                </div>
                
                {/* Sentiment side label */}
                <span className={cn(
                  "text-xs font-black px-2.5 py-1 rounded-lg border",
                  sig.direction === 'BUY'
                    ? "bg-neon-emerald/10 border-neon-emerald/30 text-neon-emerald shadow-[0_0_10px_rgba(16,185,129,0.15)]"
                    : "bg-neon-rose/10 border-neon-rose/30 text-neon-rose shadow-[0_0_10px_rgba(244,63,94,0.15)]"
                )}>
                  {sig.direction}
                </span>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Setup targets info */}
                <div className="grid grid-cols-3 gap-2 bg-white/[0.02] border border-white/5 rounded-lg p-3 text-center">
                  <div>
                    <span className="text-[9px] text-muted-text block uppercase">Entry Price</span>
                    <span className="text-xs font-mono font-bold text-white mt-1 block">
                      {formatCurrency(sig.entryPrice, sig.entryPrice > 10 ? 2 : 4)}
                    </span>
                  </div>
                  <div>
                    <span className="text-[9px] text-muted-text block uppercase">Price Target</span>
                    <span className="text-xs font-mono font-bold text-neon-cyan mt-1 block">
                      {formatCurrency(sig.targetPrice, sig.targetPrice > 10 ? 2 : 4)}
                    </span>
                  </div>
                  <div>
                    <span className="text-[9px] text-muted-text block uppercase">Stop Loss</span>
                    <span className="text-xs font-mono font-bold text-neon-rose mt-1 block">
                      {formatCurrency(sig.stopLoss, sig.stopLoss > 10 ? 2 : 4)}
                    </span>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <span className="text-[9px] text-muted-text uppercase tracking-wider font-semibold">Gemini Trade Reason</span>
                  <p className="text-xs text-neutral-300 leading-relaxed font-medium">
                    {sig.reason}
                  </p>
                </div>
              </CardContent>

              <CardFooter className="flex items-center justify-between border-t border-white/5 pt-4 mt-auto">
                <div className="flex items-center gap-3">
                  <div className="flex flex-col">
                    <span className="text-[9px] text-muted-text uppercase">Confidence</span>
                    <span className="text-xs font-black text-white mt-0.5">{sig.confidence}%</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[9px] text-muted-text uppercase">Risk Level</span>
                    <span className={cn(
                      "text-[10px] font-bold mt-0.5 flex items-center gap-0.5",
                      sig.riskLevel === 'LOW' && "text-neon-emerald",
                      sig.riskLevel === 'MEDIUM' && "text-amber-400",
                      sig.riskLevel === 'HIGH' && "text-neon-rose"
                    )}>
                      {sig.riskLevel === 'HIGH' && <AlertTriangle className="h-3 w-3" />}
                      {sig.riskLevel}
                    </span>
                  </div>
                </div>

                <Button 
                  variant={sig.direction === 'BUY' ? 'cyan' : 'danger'} 
                  size="sm"
                  onClick={() => handleOpenExecution(sig)}
                >
                  <Zap className="h-3.5 w-3.5 mr-1" />
                  Route Order
                </Button>
              </CardFooter>
            </Card>
          </motionFramer.div>
        ))}
      </div>

      {/* Signal Placement Modal Confirmation */}
      <Dialog
        isOpen={selectedSignal !== null}
        onClose={() => setSelectedSignal(null)}
        title="Execute Autonomous Trade Setup"
      >
        {selectedSignal && (
          <div className="space-y-4 py-2">
            {/* Catalyst summary */}
            <div className="p-3.5 rounded-xl border border-white/5 bg-white/[0.01] space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-white uppercase">{selectedSignal.token} setup</span>
                <span className={cn(
                  "text-[9px] font-black px-1.5 py-0.5 rounded",
                  selectedSignal.direction === 'BUY' ? "bg-neon-emerald/10 text-neon-emerald" : "bg-neon-rose/10 text-neon-rose"
                )}>
                  {selectedSignal.direction}
                </span>
              </div>
              <p className="text-[11px] text-muted-text leading-relaxed">
                {selectedSignal.reason}
              </p>
            </div>

            {/* Config form */}
            <div className="space-y-3.5">
              {/* Spot or perp toggle */}
              <div className="flex gap-2">
                <button
                  onClick={() => setExecutionType('SPOT')}
                  className={cn(
                    "flex-1 py-2 text-xs font-semibold rounded-lg border transition-all cursor-pointer text-center",
                    executionType === 'SPOT' 
                      ? "bg-white/10 border-white/20 text-white" 
                      : "bg-transparent border-white/5 text-muted-text hover:text-white"
                  )}
                >
                  Spot Asset
                </button>
                <button
                  onClick={() => setExecutionType('PERP')}
                  className={cn(
                    "flex-1 py-2 text-xs font-semibold rounded-lg border transition-all cursor-pointer text-center",
                    executionType === 'PERP' 
                      ? "bg-white/10 border-white/20 text-white" 
                      : "bg-transparent border-white/5 text-muted-text hover:text-white"
                  )}
                >
                  Perpetual Contract
                </button>
              </div>

              {/* Leverage Slider (if Perp) */}
              {executionType === 'PERP' && (
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-muted-text">Leverage Multiplier</span>
                    <span className="font-bold text-neon-cyan">{executionLeverage}x</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="20"
                    value={executionLeverage}
                    onChange={(e) => setExecutionLeverage(Number(e.target.value))}
                    className="w-full accent-neon-cyan bg-white/15 h-1 rounded-lg outline-none cursor-pointer"
                  />
                  <p className="text-[9px] text-muted-text">
                    Warning: Leverage magnifies gains and losses. Max collateral risk.
                  </p>
                </div>
              )}

              {/* Trade Size Input */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-muted-text">Execution size ({selectedSignal.symbol})</span>
                  <span className="font-mono text-white font-semibold">
                    Cost: {formatCurrency(selectedSignal.entryPrice * executionSize, 2)}
                  </span>
                </div>
                <div className="flex gap-2 items-center">
                  <input
                    type="number"
                    value={executionSize}
                    onChange={(e) => setExecutionSize(Number(e.target.value))}
                    step={selectedSignal.symbol === 'BTC' ? '0.01' : '1'}
                    className="flex h-10 flex-1 rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-sm font-mono text-white placeholder-muted-text/30 focus:border-neon-violet/50 focus:outline-none"
                  />
                  <div className="flex gap-1.5">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="h-10 text-[10px] px-2.5" 
                      onClick={() => setExecutionSize(selectedSignal.symbol === 'BTC' ? 0.02 : selectedSignal.symbol === 'ETH' ? 0.2 : 5)}
                    >
                      MIN
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="h-10 text-[10px] px-2.5" 
                      onClick={() => setExecutionSize(selectedSignal.symbol === 'BTC' ? 0.1 : selectedSignal.symbol === 'ETH' ? 1.0 : 20)}
                    >
                      MID
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Warning block about keys */}
            <div className="flex gap-2 p-3 rounded-lg border border-yellow-500/20 bg-yellow-500/5 text-[10px] leading-relaxed text-yellow-300">
              <Key className="h-4 w-4 text-yellow-400 flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-bold block">Secure Execution Routing</span>
                {settings.sandboxMode 
                  ? "Sandbox mode is ACTIVE. Order will execute in a simulated, non-custodial environment."
                  : `Connecting to secure route node. Signing with linked wallet: ${shortenAddress(address!)}`}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2 pt-2">
              <Button 
                variant="outline" 
                className="flex-1" 
                onClick={() => setSelectedSignal(null)}
                disabled={isExecuting}
              >
                Cancel
              </Button>
              <Button 
                variant="violet" 
                className="flex-1" 
                onClick={handleExecute}
                disabled={isExecuting}
              >
                {isExecuting ? 'Routing Order...' : 'Sign & Route Order'}
              </Button>
            </div>
          </div>
        )}
      </Dialog>
    </div>
  );
}
