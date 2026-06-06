import { MarketStats, CoinData, NewsItem } from '@/types';

// Endpoints are proxied via Next.js API route handlers to avoid exposing client keys
const SOSOVALUE_API_URL = '/api/sosovalue';

export class SoSoValueClient {
  private apiKey: string;

  constructor(apiKey: string = '') {
    this.apiKey = apiKey;
  }

  // Get active price & market cap stats
  async getMarketStats(): Promise<MarketStats> {
    const res = await fetch(`${SOSOVALUE_API_URL}/stats`, {
      headers: { 
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.error || `SoSoValue stats fetch failed with status ${res.status}`);
    }
    
    return await res.json();
  }

  // Fetch full details of major tokens
  async getCoins(): Promise<CoinData[]> {
    const res = await fetch(`${SOSOVALUE_API_URL}/coins`, {
      headers: { 
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.error || `SoSoValue coins fetch failed with status ${res.status}`);
    }
    
    return await res.json();
  }

  // Get live crypto news and sentiment
  async getNews(): Promise<NewsItem[]> {
    const res = await fetch(`${SOSOVALUE_API_URL}/news`, {
      headers: { 
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.error || `SoSoValue news fetch failed with status ${res.status}`);
    }
    
    return await res.json();
  }

  // Custom tool declarations for Gemini Function Calling
  getGeminiToolDeclaration() {
    return [
      {
        name: 'get_market_statistics',
        description: 'Get current crypto market price statistics, total market cap, and Bitcoin/Ethereum spot ETF net flows from SoSoValue.',
        parameters: { type: 'OBJECT', properties: {} }
      },
      {
        name: 'get_crypto_news',
        description: 'Fetch real-time, AI-aggregated crypto market news headlines, sources, publish time, and sentiment analysis scores from SoSoValue.',
        parameters: { type: 'OBJECT', properties: {} }
      },
      {
        name: 'get_coin_details',
        description: 'Fetch comprehensive data on major cryptocurrencies including market cap, 24h trading volume, price peaks, and price history.',
        parameters: { type: 'OBJECT', properties: {} }
      }
    ];
  }
}
