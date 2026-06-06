'use client';

import * as React from 'react';
import { usePathname } from 'next/navigation';
import { Wallet2, AlertCircle, ChevronDown, Check, LogOut } from 'lucide-react';
import { useWallet, useSettings } from './Providers';
import { Button } from './ui/button';
import { Dialog } from './ui/dialog';
import { shortenAddress, formatCurrency } from '@/lib/utils';

export const Navbar: React.FC = () => {
  const pathname = usePathname();
  const { isConnected, address, walletType, balance, isConnecting, connectWallet, disconnectWallet } = useWallet();
  const { settings } = useSettings();
  const [showWalletModal, setShowWalletModal] = React.useState(false);
  const [showDropdown, setShowDropdown] = React.useState(false);

  // Get route title
  const getTitle = () => {
    switch (pathname) {
      case '/': return 'Global Terminal Dashboard';
      case '/research': return 'AI Research Agent';
      case '/signals': return 'Smart Signals Radar';
      case '/trade': return 'Autonomous Trading Terminal';
      case '/portfolio': return 'Portfolio Guardian';
      case '/settings': return 'Terminal Settings';
      default: return 'Alpha Terminal';
    }
  };

  const handleWalletSelect = async (type: 'metamask' | 'phantom') => {
    setShowWalletModal(false);
    await connectWallet(type);
  };

  return (
    <>
      <nav className="h-16 border-b border-white/5 bg-[#060608]/40 backdrop-blur-md px-6 flex items-center justify-between z-30 relative">
        {/* Left Side: Breadcrumb/Title */}
        <div className="flex items-center gap-3">
          <h1 className="font-display font-semibold text-lg text-white tracking-tight">
            {getTitle()}
          </h1>
          
          {/* Mode status indicator */}
          {settings.sandboxMode ? (
            <span className="text-[10px] font-semibold bg-amber-500/10 border border-amber-500/30 text-amber-400 px-2 py-0.5 rounded-full flex items-center gap-1 shadow-[0_0_10px_rgba(245,158,11,0.05)]">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"></span>
              Sandbox Mode
            </span>
          ) : (
            <span className="text-[10px] font-semibold bg-neon-emerald/10 border border-neon-emerald/30 text-neon-emerald px-2 py-0.5 rounded-full flex items-center gap-1 shadow-[0_0_10px_rgba(16,185,129,0.05)]">
              <span className="w-1.5 h-1.5 rounded-full bg-neon-emerald"></span>
              Live Node
            </span>
          )}
        </div>

        {/* Right Side: Wallet Connector */}
        <div className="flex items-center gap-3">
          {isConnected ? (
            <div className="relative">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setShowDropdown(!showDropdown)}
                className="flex items-center gap-2 border border-white/10 hover:border-white/20 bg-white/5 text-white pr-2.5 h-9"
              >
                <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-neon-violet to-neon-cyan flex items-center justify-center text-[10px] text-black font-extrabold">
                  {walletType === 'phantom' ? 'P' : 'M'}
                </div>
                <span className="text-xs font-mono font-medium">{shortenAddress(address!)}</span>
                <ChevronDown className="h-3 w-3 text-neutral-400" />
              </Button>

              {/* Wallet Dropdown Options */}
              {showDropdown && (
                <>
                  <div 
                    onClick={() => setShowDropdown(false)}
                    className="fixed inset-0 z-30"
                  />
                  <div className="absolute right-0 mt-2 w-48 rounded-xl border border-white/10 bg-[#0c0c14] glass-panel shadow-2xl z-40 p-1 animate-in fade-in slide-in-from-top-2 duration-150">
                    <div className="px-3 py-2 border-b border-white/5">
                      <p className="text-[10px] text-muted-text uppercase tracking-widest font-semibold">Balance</p>
                      <p className="text-sm font-bold text-white mt-0.5">
                        {balance.toFixed(2)} {walletType === 'phantom' ? 'SOL' : 'ETH'}
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        setShowDropdown(false);
                        disconnectWallet();
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2.5 text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-lg transition-colors text-left cursor-pointer"
                    >
                      <LogOut className="h-4 w-4" />
                      Disconnect Wallet
                    </button>
                  </div>
                </>
              )}
            </div>
          ) : (
            <Button
              variant="cyan"
              size="sm"
              onClick={() => setShowWalletModal(true)}
              className="flex items-center gap-1.5 h-9"
              disabled={isConnecting}
            >
              <Wallet2 className="h-4 w-4" />
              <span>{isConnecting ? 'Linking...' : 'Link Wallet'}</span>
            </Button>
          )}
        </div>
      </nav>

      {/* Wallet Selector Dialog Modal */}
      <Dialog 
        isOpen={showWalletModal} 
        onClose={() => setShowWalletModal(false)}
        title="Select Wallet Connection"
      >
        <div className="flex flex-col gap-3 py-2">
          <p className="text-xs text-muted-text mb-2 leading-relaxed">
            Link your web3 wallet to enable order routing, perpetual position execution, and real-time risk guardian features.
          </p>
          
          {/* Phantom Solana Wallet */}
          <button
            onClick={() => handleWalletSelect('phantom')}
            className="flex items-center justify-between p-4 rounded-xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.05] transition-all hover:border-purple-500/30 group text-left cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-600/20 flex items-center justify-center text-lg font-black text-purple-400 group-hover:scale-105 transition-transform">
                👻
              </div>
              <div>
                <h4 className="text-sm font-semibold text-white">Phantom Wallet</h4>
                <p className="text-[11px] text-muted-text mt-0.5">Solana & EVM Multi-chain Network</p>
              </div>
            </div>
            <div className="h-5 w-5 rounded-full border border-white/10 group-hover:border-purple-400 flex items-center justify-center transition-colors">
              <span className="w-2.5 h-2.5 rounded-full bg-transparent group-hover:bg-purple-400/40 transition-colors"></span>
            </div>
          </button>

          {/* MetaMask EVM Wallet */}
          <button
            onClick={() => handleWalletSelect('metamask')}
            className="flex items-center justify-between p-4 rounded-xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.05] transition-all hover:border-orange-500/30 group text-left cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-orange-600/20 flex items-center justify-center text-lg font-black text-orange-400 group-hover:scale-105 transition-transform">
                🦊
              </div>
              <div>
                <h4 className="text-sm font-semibold text-white">MetaMask</h4>
                <p className="text-[11px] text-muted-text mt-0.5">EVM Native Network (Ethereum, Base)</p>
              </div>
            </div>
            <div className="h-5 w-5 rounded-full border border-white/10 group-hover:border-orange-400 flex items-center justify-center transition-colors">
              <span className="w-2.5 h-2.5 rounded-full bg-transparent group-hover:bg-orange-400/40 transition-colors"></span>
            </div>
          </button>
        </div>
      </Dialog>
    </>
  );
};
export default Navbar;
