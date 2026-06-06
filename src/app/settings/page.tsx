'use client';

import * as React from 'react';
import { 
  Settings as SettingsIcon, 
  ShieldAlert, 
  CheckCircle2, 
  Database,
  BrainCircuit,
  Key,
  AlertTriangle,
  RefreshCw,
  Server,
  Lock
} from 'lucide-react';
import { useSettings } from '@/components/Providers';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/toast';

export default function Settings() {
  const { settings, updateSettings } = useSettings();
  const { toast } = useToast();
  const [checking, setChecking] = React.useState(false);

  const handleRefreshStatus = async () => {
    setChecking(true);
    try {
      const res = await fetch('/api/settings/status');
      if (res.ok) {
        const status = await res.json();
        updateSettings({
          geminiSet: !!status.geminiSet,
          sosoSet: !!status.sosoSet,
          sodexSet: !!status.sodexSet,
          sandboxMode: !status.geminiSet
        });
        toast('Connection Refreshed', 'Backend API credentials status successfully updated.', 'success');
      } else {
        throw new Error('Failed to retrieve status');
      }
    } catch (err: any) {
      toast('Sync Error', err.message || 'Failed to sync API key status with the backend.', 'error');
    } finally {
      setChecking(false);
    }
  };

  return (
    <div className="space-y-6 pt-4 pb-12 max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-xl font-display font-extrabold text-white tracking-tight flex items-center gap-2">
            <SettingsIcon className="h-5 w-5 text-neutral-400" />
            Terminal Configurations
          </h2>
          <p className="text-xs text-muted-text">
            Verify active server-side credentials and integration endpoints.
          </p>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleRefreshStatus}
          disabled={checking}
          className="border-white/5 bg-white/[0.02] hover:bg-white/5 hover:border-white/10 text-xs text-white cursor-pointer"
        >
          <RefreshCw className={`h-3.5 w-3.5 mr-1.5 ${checking ? 'animate-spin' : ''}`} />
          {checking ? 'Refreshing...' : 'Refresh Status'}
        </Button>
      </div>

      {/* Security warning block */}
      <div className="flex gap-3 p-4 rounded-xl border border-neon-cyan/20 bg-neon-cyan/5 text-xs text-neutral-200 leading-relaxed relative overflow-hidden">
        <div className="absolute top-0 right-0 w-24 h-24 rounded-full bg-neon-cyan/5 blur-xl" />
        <Lock className="h-5 w-5 text-neon-cyan flex-shrink-0 mt-0.5" />
        <div className="space-y-1 z-10">
          <span className="font-bold block text-white">Server-Side Credentials Vault</span>
          <p>
            To align with enterprise security protocols, all API credentials (Google Gemini, SoSoValue, and SoDEX) must be defined on the backend server environment inside your <span className="font-mono text-white bg-white/5 px-1 rounded">.env.local</span> file. Keys are never transmitted, exposed, or stored on the client browser.
          </p>
        </div>
      </div>

      {/* API Integrations Status list */}
      <div className="space-y-4">
        {/* Gemini API Status Card */}
        <Card className="glass-panel border-white/5 hover:border-white/10 transition-all overflow-hidden relative">
          {settings.geminiSet && (
            <div className="absolute -top-12 -right-12 w-32 h-32 rounded-full bg-neon-emerald/5 blur-2xl animate-pulse" />
          )}
          <CardContent className="p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex gap-3.5 items-start">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-tr from-neon-violet/20 to-neon-cyan/20 border border-white/10 flex items-center justify-center text-neon-cyan mt-0.5">
                <BrainCircuit className="h-5.5 w-5.5" />
              </div>
              <div className="space-y-1">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">Google Gemini API</h4>
                <p className="text-[10px] text-muted-text max-w-md leading-relaxed">
                  Powers the autonomous on-chain research companion, conversational sentiment routing, and AI trade reasoning engines.
                </p>
              </div>
            </div>
            
            <div className="flex-shrink-0">
              {settings.geminiSet ? (
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-neon-emerald/30 bg-neon-emerald/10 text-[10px] font-bold text-neon-emerald shadow-[0_0_15px_rgba(16,185,129,0.15)]">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  CONFIGURED / ONLINE
                </div>
              ) : (
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 text-[10px] font-bold text-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.15)]">
                  <AlertTriangle className="h-3.5 w-3.5" />
                  MISSING KEY
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* SoSoValue API Status Card */}
        <Card className="glass-panel border-white/5 hover:border-white/10 transition-all overflow-hidden relative">
          {settings.sosoSet && (
            <div className="absolute -top-12 -right-12 w-32 h-32 rounded-full bg-neon-emerald/5 blur-2xl animate-pulse" />
          )}
          <CardContent className="p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex gap-3.5 items-start">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-tr from-neon-violet/20 to-neon-cyan/20 border border-white/10 flex items-center justify-center text-neon-cyan mt-0.5">
                <Database className="h-5.5 w-5.5" />
              </div>
              <div className="space-y-1">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">SoSoValue API</h4>
                <p className="text-[10px] text-muted-text max-w-md leading-relaxed">
                  Streams institutional cryptocurrency indexes, Spot ETF net flow charts, live on-chain news articles, and macro token data.
                </p>
              </div>
            </div>
            
            <div className="flex-shrink-0">
              {settings.sosoSet ? (
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-neon-emerald/30 bg-neon-emerald/10 text-[10px] font-bold text-neon-emerald shadow-[0_0_15px_rgba(16,185,129,0.15)]">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  CONFIGURED / ONLINE
                </div>
              ) : (
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 text-[10px] font-bold text-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.15)]">
                  <AlertTriangle className="h-3.5 w-3.5" />
                  MISSING KEY
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* SoDEX API Status Card */}
        <Card className="glass-panel border-white/5 hover:border-white/10 transition-all overflow-hidden relative">
          {settings.sodexSet && (
            <div className="absolute -top-12 -right-12 w-32 h-32 rounded-full bg-neon-emerald/5 blur-2xl animate-pulse" />
          )}
          <CardContent className="p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex gap-3.5 items-start">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-tr from-neon-violet/20 to-neon-cyan/20 border border-white/10 flex items-center justify-center text-neon-cyan mt-0.5">
                <Key className="h-5.5 w-5.5" />
              </div>
              <div className="space-y-1">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">SoDEX Routing Nodes</h4>
                <p className="text-[10px] text-muted-text max-w-md leading-relaxed">
                  Authenticates secure signature routing, handles wallet balance calculations, checks open contracts, and deploys spot/perp orders.
                </p>
              </div>
            </div>
            
            <div className="flex-shrink-0">
              {settings.sodexSet ? (
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-neon-emerald/30 bg-neon-emerald/10 text-[10px] font-bold text-neon-emerald shadow-[0_0_15px_rgba(16,185,129,0.15)]">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  CONFIGURED / ONLINE
                </div>
              ) : (
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 text-[10px] font-bold text-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.15)]">
                  <AlertTriangle className="h-3.5 w-3.5" />
                  MISSING KEY
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Guide Card */}
      <Card className="glass-panel border border-white/5 bg-white/[0.005]">
        <CardHeader className="pb-2">
          <CardTitle className="text-xs font-bold text-white flex items-center gap-1.5">
            <Server className="h-4 w-4 text-neon-cyan" />
            How to configure server credentials
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3.5 text-[10.5px] text-muted-text leading-relaxed">
          <p>
            Open or create the file <code className="text-white bg-white/5 px-1 py-0.5 rounded font-mono">.env.local</code> in the root folder of the project, and append your API credentials using the structure shown below:
          </p>
          <pre className="p-3.5 rounded-lg border border-white/5 bg-black/40 text-neutral-300 font-mono text-[9px] overflow-x-auto leading-normal">
{`# Google Gemini (https://aistudio.google.com/)
GEMINI_API_KEY=your_gemini_api_key_here

# SoSoValue API (https://sosovalue.com/)
SOSOVALUE_API_KEY=your_sosovalue_api_key_here

# SoDEX API Routing Credentials
SODEX_API_KEY=your_sodex_public_api_key
SODEX_SECRET_KEY=your_sodex_secret_key`}
          </pre>
          <div className="flex items-start gap-2 bg-amber-500/5 border border-amber-500/10 p-3 rounded-lg text-amber-300/95">
            <ShieldAlert className="h-4 w-4 flex-shrink-0 mt-0.5 text-amber-400" />
            <p>
              <strong>Important:</strong> After adding or updating variables in <code className="text-white font-mono bg-white/5 px-1 py-0.5 rounded">.env.local</code>, you must restart your local development server for Next.js to register the updated environment configurations.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
