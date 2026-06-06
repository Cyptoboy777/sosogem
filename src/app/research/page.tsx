'use client';

import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Send, 
  Sparkles, 
  BrainCircuit, 
  RefreshCw, 
  TrendingUp, 
  ArrowRight,
  Info
} from 'lucide-react';
import { useSettings } from '@/components/Providers';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/toast';
import { cn } from '@/lib/utils';
import { ApiKeyWarning } from '@/components/ApiKeyWarning';

interface Message {
  id: string;
  role: 'user' | 'model';
  content: string;
  timestamp: string;
}

const QUICK_PROMPTS = [
  "Latest Solana memecoins with potential",
  "Bitcoin Spot ETF flow analysis",
  "Evaluate market risk profile"
];

// Simple, robust client-side markdown formatter for tables and bold text
// to avoid importing buggy external md parsers that cause hydration mismatches
function renderMarkdown(text: string) {
  const lines = text.split('\n');
  let inTable = false;
  let tableHeaders: string[] = [];
  let tableRows: string[][] = [];

  const renderedElements: React.ReactNode[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    // Check if line is a table row (starts and ends with |)
    if (line.startsWith('|') && line.endsWith('|')) {
      // Check if it's separator row
      if (line.includes('---') || line.includes(':---')) {
        continue;
      }
      
      const cells = line.split('|').map(c => c.trim()).filter((c, idx, arr) => idx > 0 && idx < arr.length - 1);
      
      if (!inTable) {
        inTable = true;
        tableHeaders = cells;
      } else {
        tableRows.push(cells);
      }
      continue;
    } else {
      // If we were in a table and hit a non-table line, render the table
      if (inTable) {
        renderedElements.push(
          <div key={`table-${i}`} className="overflow-x-auto my-4 rounded-lg border border-white/10 bg-black/30">
            <table className="min-w-full divide-y divide-white/10 text-xs">
              <thead className="bg-white/5">
                <tr>
                  {tableHeaders.map((h, idx) => (
                    <th key={idx} className="px-4 py-2 text-left font-bold text-white uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {tableRows.map((row, rowIdx) => (
                  <tr key={rowIdx} className="hover:bg-white/[0.02]">
                    {row.map((cell, cellIdx) => (
                      <td key={cellIdx} className="px-4 py-2.5 font-mono text-neutral-200">
                        {cell.startsWith('🟢') || cell.startsWith('🔴') || cell.startsWith('🔥') ? (
                          <span className="flex items-center gap-1">{cell}</span>
                        ) : cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
        inTable = false;
        tableHeaders = [];
        tableRows = [];
      }
    }

    // Render Headers
    if (line.startsWith('### ')) {
      renderedElements.push(<h3 key={i} className="text-sm font-bold text-white mt-4 mb-2 font-display flex items-center gap-1.5"><Sparkles className="h-4 w-4 text-neon-cyan" /> {line.substring(4)}</h3>);
    } else if (line.startsWith('#### ')) {
      renderedElements.push(<h4 key={i} className="text-xs font-semibold text-neon-cyan mt-3 mb-1">{line.substring(5)}</h4>);
    } else if (line.startsWith('* ') || line.startsWith('- ')) {
      // Bullet list item
      renderedElements.push(<li key={i} className="text-xs text-neutral-300 ml-4 list-disc py-0.5">{line.substring(2)}</li>);
    } else if (line.length > 0) {
      // Normal paragraph (supporting simple bold formatting **text**)
      const parts = line.split('**');
      const inlineChildren = parts.map((part, idx) => {
        if (idx % 2 === 1) {
          return <strong key={idx} className="text-white font-semibold">{part}</strong>;
        }
        return part;
      });
      renderedElements.push(<p key={i} className="text-xs text-neutral-300 leading-relaxed mb-2">{inlineChildren}</p>);
    }
  }

  // Handle trailing table if text ends
  if (inTable) {
    renderedElements.push(
      <div key={`table-end`} className="overflow-x-auto my-4 rounded-lg border border-white/10 bg-black/30">
        <table className="min-w-full divide-y divide-white/10 text-xs">
          <thead className="bg-white/5">
            <tr>
              {tableHeaders.map((h, idx) => (
                <th key={idx} className="px-4 py-2 text-left font-bold text-white uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {tableRows.map((row, rowIdx) => (
              <tr key={rowIdx} className="hover:bg-white/[0.02]">
                {row.map((cell, cellIdx) => (
                  <td key={cellIdx} className="px-4 py-2.5 font-mono text-neutral-200">{cell}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  return renderedElements;
}

export default function Research() {
  const { settings } = useSettings();
  const { toast } = useToast();
  const [messages, setMessages] = React.useState<Message[]>([
    {
      id: 'welcome',
      role: 'model',
      content: `### 🤖 SosuGem Research Terminal Initialized

I am your autonomous on-chain research analyst. I have full read access to SoSoValue ETF indices, sentiment trackers, on-chain news, and token metrics.

How can I assist you with your investment strategy today? Try requesting:
* A valuation and catalyst check for Solana (SOL)
* Institutional flows check for Bitcoin ETFs
* A general overview of active cryptocurrency market opportunities`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [inputValue, setInputValue] = React.useState('');
  const [sending, setSending] = React.useState(false);
  const messagesEndRef = React.useRef<HTMLDivElement>(null);

  if (!settings.geminiApiKey && !settings.geminiSet) {
    return (
      <ApiKeyWarning 
        title="Gemini API Key Required"
        description="A Google Gemini API Key is required to run our autonomous on-chain research companion and query active market data. Please configure it to continue."
      />
    );
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  React.useEffect(() => {
    scrollToBottom();
  }, [messages, sending]);

  const handleSend = async (textToSend: string) => {
    if (!textToSend.trim() || sending) return;

    const userMsg: Message = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInputValue('');
    setSending(true);

    try {
      const chatHistory = [...messages, userMsg].map(m => ({
        role: m.role,
        content: m.content
      }));

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-gemini-key': settings.geminiApiKey,
          'x-soso-key': settings.sosoValueApiKey,
          'x-sodex-key': settings.sodexApiKey,
          'x-sodex-secret-key': settings.sodexSecretKey
        },
        body: JSON.stringify({ messages: chatHistory })
      });

      if (!res.ok) {
        throw new Error('API request failed');
      }

      const data = await res.json();
      
      const modelMsg: Message = {
        id: `msg-${Date.now() + 1}`,
        role: 'model',
        content: data.content,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      
      setMessages(prev => [...prev, modelMsg]);
    } catch (err: any) {
      toast('Chat Error', err.message || 'Failed to fetch agent research response', 'error');
    } finally {
      setSending(false);
    }
  };

  const handleQuickPrompt = (prompt: string) => {
    handleSend(prompt);
  };

  const clearChat = () => {
    setMessages([
      {
        id: 'welcome',
        role: 'model',
        content: `### 🤖 SosuGem Research Terminal Initialized

I am your autonomous on-chain research analyst. I have full read access to SoSoValue ETF indices, sentiment trackers, on-chain news, and token metrics.

How can I assist you with your investment strategy today? Try requesting:
* A valuation and catalyst check for Solana (SOL)
* Institutional flows check for Bitcoin ETFs
* A general overview of active cryptocurrency market opportunities`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
  };

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col justify-between max-w-4xl mx-auto space-y-4">
      {/* 1. Chat Header */}
      <div className="flex items-center justify-between border-b border-white/5 pb-3">
        <div className="flex items-center gap-2">
          <BrainCircuit className="h-5 w-5 text-neon-cyan" />
          <div>
            <h2 className="text-sm font-semibold text-white">AI Research Terminal</h2>
            <p className="text-[10px] text-muted-text">Gemini 2.5 + SoSoValue Context</p>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={clearChat} className="h-8 text-xs border-white/5 hover:bg-white/5">
          <RefreshCw className="h-3 w-3 mr-1" />
          Reset Chat
        </Button>
      </div>

      {/* 2. Messages area */}
      <div className="flex-1 overflow-y-auto px-1 space-y-4 pr-2 scrollbar-thin">
        <AnimatePresence initial={false}>
          {messages.map((m) => (
            <motion.div
              key={m.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className={cn(
                "flex gap-3",
                m.role === 'user' ? "justify-end" : "justify-start"
              )}
            >
              {/* Profile Icon for Agent */}
              {m.role === 'model' && (
                <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-neon-violet to-neon-cyan flex items-center justify-center text-[10px] font-black text-black flex-shrink-0 mt-1 shadow-[0_0_10px_rgba(139,92,246,0.2)]">
                  SG
                </div>
              )}

              <div className="flex flex-col gap-1 max-w-[85%]">
                <div className={cn(
                  "p-4 rounded-2xl border text-sm leading-relaxed",
                  m.role === 'user' 
                    ? "bg-[#8b5cf6]/10 border-[#8b5cf6]/35 text-white rounded-tr-none shadow-[0_0_15px_-3px_rgba(139,92,246,0.15)]"
                    : "bg-[#0d0d16]/70 border-white/5 text-neutral-200 rounded-tl-none glass-panel"
                )}>
                  {m.role === 'model' ? renderMarkdown(m.content) : m.content}
                </div>
                <span className={cn("text-[9px] text-muted-text px-1.5", m.role === 'user' ? "text-right" : "text-left")}>
                  {m.timestamp}
                </span>
              </div>
            </motion.div>
          ))}

          {sending && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex gap-3 justify-start"
            >
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-neon-violet to-neon-cyan flex items-center justify-center text-[10px] font-black text-black flex-shrink-0 mt-1 animate-pulse">
                SG
              </div>
              <div className="flex flex-col gap-1">
                <div className="p-4 py-3 rounded-2xl border border-white/5 bg-[#0d0d16]/70 glass-panel rounded-tl-none flex items-center gap-1.5 text-xs text-muted-text">
                  <span className="w-2 h-2 rounded-full bg-neon-cyan animate-bounce [animation-delay:-0.3s]"></span>
                  <span className="w-2 h-2 rounded-full bg-neon-cyan animate-bounce [animation-delay:-0.15s]"></span>
                  <span className="w-2 h-2 rounded-full bg-neon-cyan animate-bounce"></span>
                  <span>Agent formulating research report...</span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <div ref={messagesEndRef} />
      </div>

      {/* 3. Input & Quick Prompts container */}
      <div className="space-y-3 pt-2">
        {/* Quick Prompts helper list */}
        {messages.length === 1 && (
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[10px] font-semibold text-muted-text uppercase tracking-wider flex items-center gap-1 mr-1">
              <Info className="h-3.5 w-3.5" /> Suggestions:
            </span>
            {QUICK_PROMPTS.map((p) => (
              <button
                key={p}
                onClick={() => handleQuickPrompt(p)}
                className="text-[10px] font-medium border border-white/5 bg-white/[0.02] hover:bg-white/5 hover:border-white/10 rounded-full px-3 py-1 text-neutral-300 transition-all cursor-pointer flex items-center gap-0.5 group"
              >
                <span>{p}</span>
                <ArrowRight className="h-2.5 w-2.5 opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
            ))}
          </div>
        )}

        {/* Action input bar */}
        <form 
          onSubmit={(e) => {
            e.preventDefault();
            handleSend(inputValue);
          }}
          className="flex gap-2 relative bg-black/30 border border-white/10 rounded-xl p-1 focus-within:border-neon-violet/40 focus-within:ring-1 focus-within:ring-neon-violet/20 transition-all"
        >
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Query market catalysts, indices, or request a coin risk evaluation..."
            className="flex-1 bg-transparent border-0 h-11 focus:ring-0 focus:ring-offset-0 placeholder:text-muted-text/30"
            disabled={sending}
          />
          <Button 
            type="submit" 
            variant="violet" 
            size="icon" 
            className="h-11 w-11 rounded-lg flex-shrink-0 cursor-pointer"
            disabled={!inputValue.trim() || sending}
          >
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </div>
  );
}
