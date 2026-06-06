'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, 
  BrainCircuit, 
  Zap, 
  TrendingUp, 
  ShieldCheck, 
  Settings as SettingsIcon, 
  Menu, 
  X
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<any>;
  color: string;
}

const NAV_ITEMS: NavItem[] = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard, color: 'text-blue-400' },
  { name: 'AI Research', href: '/research', icon: BrainCircuit, color: 'text-purple-400' },
  { name: 'Smart Signals', href: '/signals', icon: Zap, color: 'text-amber-400' },
  { name: 'Trade Terminal', href: '/trade', icon: TrendingUp, color: 'text-neon-cyan' },
  { name: 'Portfolio Guardian', href: '/portfolio', icon: ShieldCheck, color: 'text-neon-emerald' },
  { name: 'Settings', href: '/settings', icon: SettingsIcon, color: 'text-neutral-400' },
];

export const Sidebar: React.FC = () => {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <>
      {/* Mobile Hamburger Toggle Header */}
      <header className="md:hidden fixed top-0 left-0 right-0 h-16 bg-[#060608]/80 backdrop-blur-md border-b border-white/5 z-40 flex items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-neon-violet to-neon-cyan flex items-center justify-center font-display font-extrabold text-sm text-black">
            SG
          </div>
          <span className="font-display font-bold tracking-tight text-white text-base">
            SosuGem <span className="text-neon-cyan text-xs">Alpha</span>
          </span>
        </Link>
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 text-neutral-400 hover:text-white border border-white/5 rounded-lg bg-white/5"
        >
          {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </header>

      {/* Sidebar Desktop Drawer */}
      <aside className={cn(
        "fixed inset-y-0 left-0 w-64 border-r border-white/5 bg-[#08080e]/60 backdrop-blur-xl z-50 transition-transform duration-300 md:translate-x-0 md:flex flex-col justify-between p-6",
        isOpen ? "translate-x-0 pt-20" : "-translate-x-full"
      )}>
        <div className="flex flex-col gap-8">
          {/* Logo Section */}
          <div className="hidden md:flex items-center gap-3 px-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-neon-violet to-neon-cyan flex items-center justify-center font-display font-black text-base text-black shadow-[0_0_20px_rgba(139,92,246,0.3)]">
              Ω
            </div>
            <div className="flex flex-col">
              <span className="font-display font-bold text-white tracking-tight leading-none text-base">
                SosuGem
              </span>
              <span className="text-[10px] text-neon-cyan font-semibold tracking-wider uppercase mt-1">
                Alpha Terminal
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="flex flex-col gap-1.5">
            {NAV_ITEMS.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className={cn(
                    "relative flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all group",
                    isActive 
                      ? "text-white bg-white/5 border border-white/10 shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)]"
                      : "text-neutral-400 hover:text-white hover:bg-white/[0.02]"
                  )}
                >
                  {/* Left Active Glow Indicator */}
                  {isActive && (
                    <motion.div 
                      layoutId="active-nav-indicator"
                      className="absolute left-2 w-1.5 h-6 rounded-full bg-gradient-to-b from-neon-cyan to-neon-violet"
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    />
                  )}
                  
                  <item.icon className={cn(
                    "h-5 w-5 transition-transform group-hover:scale-110",
                    isActive ? item.color : "text-neutral-400 group-hover:text-white"
                  )} />
                  
                  <span className="tracking-wide">{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Footer Buildathon Badge */}
        <div className="flex flex-col gap-3 px-2 border-t border-white/5 pt-4">
          <div className="rounded-xl bg-gradient-to-tr from-neon-violet/10 to-neon-cyan/5 border border-neon-violet/20 p-3 flex flex-col gap-1">
            <span className="text-[10px] text-neutral-400 uppercase tracking-widest font-semibold">
              SoSoValue Wave 2
            </span>
            <span className="text-xs font-bold text-white">
              Buildathon Submission
            </span>
            <span className="text-[10px] text-neon-cyan mt-1 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-neon-cyan animate-pulse"></span>
              Agent Autonomous
            </span>
          </div>
        </div>
      </aside>

      {/* Backdrop overlay for mobile menu */}
      {isOpen && (
        <div 
          onClick={() => setIsOpen(false)}
          className="md:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-45"
        />
      )}
    </>
  );
};
export default Sidebar;
