'use client';

import * as React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ToastProvider, useToast } from './ui/toast';
import { UserSettings } from '@/types';

// Create a client for React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: false,
    },
  },
});

// Settings Context
interface SettingsContextProps {
  settings: UserSettings;
  updateSettings: (newSettings: Partial<UserSettings>) => void;
}

const SettingsContext = React.createContext<SettingsContextProps | undefined>(undefined);

export const useSettings = () => {
  const context = React.useContext(SettingsContext);
  if (!context) throw new Error("useSettings must be used within SettingsProvider");
  return context;
};

// Wallet Context
interface WalletContextProps {
  isConnected: boolean;
  address: string | null;
  walletType: 'metamask' | 'phantom' | null;
  balance: number;
  isConnecting: boolean;
  connectWallet: (type: 'metamask' | 'phantom') => Promise<void>;
  disconnectWallet: () => void;
}

const WalletContext = React.createContext<WalletContextProps | undefined>(undefined);

export const useWallet = () => {
  const context = React.useContext(WalletContext);
  if (!context) throw new Error("useWallet must be used within WalletProvider");
  return context;
};

const DEFAULT_SETTINGS: UserSettings = {
  geminiApiKey: '',
  sosoValueApiKey: '',
  sodexApiKey: '',
  sodexSecretKey: '',
  sandboxMode: true,
  hasSeenPrivateKeyWarning: false,
  geminiSet: false,
  sosoSet: false,
  sodexSet: false,
};

export const Providers: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Settings State
  const [settings, setSettings] = React.useState<UserSettings>(DEFAULT_SETTINGS);
  
  // Wallet State
  const [isConnected, setIsConnected] = React.useState(false);
  const [address, setAddress] = React.useState<string | null>(null);
  const [walletType, setWalletType] = React.useState<'metamask' | 'phantom' | null>(null);
  const [isConnecting, setIsConnecting] = React.useState(false);
  const [balance, setBalance] = React.useState(12.54); // default ETH/SOL

  const { toast } = useToast();

  // Load settings on mount
  React.useEffect(() => {
    async function initSettings() {
      let currentSettings = { ...DEFAULT_SETTINGS };
      
      if (typeof window !== 'undefined') {
        const stored = localStorage.getItem('sosugem_settings');
        if (stored) {
          try {
            currentSettings = { ...currentSettings, ...JSON.parse(stored) };
          } catch {
            // ignore
          }
        }
      }

      // Check server API key status
      try {
        const res = await fetch('/api/settings/status');
        if (res.ok) {
          const status = await res.json();
          currentSettings.geminiSet = !!status.geminiSet;
          currentSettings.sosoSet = !!status.sosoSet;
          currentSettings.sodexSet = !!status.sodexSet;
          
          // If server has keys loaded, we can disable sandbox mode
          if (status.geminiSet) {
            currentSettings.sandboxMode = false;
          }
        }
      } catch (err) {
        console.error('Failed to load server key status:', err);
      }

      setSettings(currentSettings);
    }

    initSettings();
  }, []);

  const updateSettings = React.useCallback((newSettings: Partial<UserSettings>) => {
    setSettings(prev => {
      const updated = { ...prev, ...newSettings };
      localStorage.setItem('sosugem_settings', JSON.stringify(updated));
      return updated;
    });
  }, []);

  // Wallet Connection Simulation
  const connectWallet = React.useCallback(async (type: 'metamask' | 'phantom') => {
    setIsConnecting(true);
    // Simulate chain check and wallet connection latency
    await new Promise(resolve => setTimeout(resolve, 1200));

    if (type === 'metamask') {
      setAddress('0x71C7656EC7ab88b098defB751B7401B5f6d8976F');
      setBalance(4.82); // 4.82 ETH
    } else {
      setAddress('SosuG11pha55eXpRtW9aTz89jKwQv93j9eU');
      setBalance(142.6); // 142.6 SOL
    }
    
    setWalletType(type);
    setIsConnected(true);
    setIsConnecting(false);
    toast(
      'Wallet Connected',
      `Successfully linked to ${type === 'phantom' ? 'Phantom' : 'MetaMask'} address.`,
      'success'
    );
  }, [toast]);

  const disconnectWallet = React.useCallback(() => {
    setIsConnected(false);
    setAddress(null);
    setWalletType(null);
    toast('Wallet Disconnected', 'Your active wallet connection has been closed.', 'info');
  }, [toast]);

  return (
    <QueryClientProvider client={queryClient}>
      <SettingsContext.Provider value={{ settings, updateSettings }}>
        <WalletContext.Provider 
          value={{ 
            isConnected, 
            address, 
            walletType, 
            balance, 
            isConnecting, 
            connectWallet, 
            disconnectWallet 
          }}
        >
          {children}
        </WalletContext.Provider>
      </SettingsContext.Provider>
    </QueryClientProvider>
  );
};

// Top-level Provider wrapper that wraps ToastProvider first so providers can use useToast
export const AppProviders: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <ToastProvider>
      <Providers>
        {children}
      </Providers>
    </ToastProvider>
  );
};
