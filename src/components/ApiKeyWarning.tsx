'use client';

import * as React from 'react';
import Link from 'next/link';
import { Key, ShieldAlert, Settings as SettingsIcon, ExternalLink } from 'lucide-react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';

interface ApiKeyWarningProps {
  title: string;
  description: string;
}

export const ApiKeyWarning: React.FC<ApiKeyWarningProps> = ({ title, description }) => {
  return (
    <div className="max-w-md mx-auto py-12 px-4">
      <Card className="border border-amber-500/25 bg-amber-500/[0.02] shadow-2xl relative overflow-hidden">
        {/* Glow effect */}
        <div className="absolute -top-12 -right-12 w-32 h-32 rounded-full bg-amber-500/5 blur-2xl" />
        
        <CardContent className="p-6 text-center space-y-5">
          <div className="w-12 h-12 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mx-auto text-amber-400">
            <Key className="h-6 w-6" />
          </div>

          <div className="space-y-2">
            <h3 className="font-display text-base font-bold text-white tracking-tight">
              {title}
            </h3>
            <p className="text-xs text-muted-text leading-relaxed">
              {description}
            </p>
          </div>

          <div className="flex flex-col gap-2 pt-2">
            <Link href="/settings">
              <Button variant="cyan" className="w-full flex items-center justify-center gap-1.5 h-10 text-xs font-bold">
                <SettingsIcon className="h-4 w-4" />
                Check API Status in Settings
              </Button>
            </Link>
            
            <div className="flex items-center justify-center gap-1 text-[10px] text-muted-text pt-1">
              <ShieldAlert className="h-3.5 w-3.5" />
              <span>Define credentials in <code>.env.local</code> and restart your server</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
export default ApiKeyWarning;
