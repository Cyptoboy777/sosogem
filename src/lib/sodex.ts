import { AssetPosition, PortfolioAsset } from '@/types';

export class SodexSDK {
  private apiKey: string;
  private secretKey: string;
  private baseUrl: string;

  constructor(apiKey: string = '', secretKey: string = '', baseUrl: string = '/api/sodex') {
    this.apiKey = apiKey;
    this.secretKey = secretKey;
    this.baseUrl = baseUrl;
  }

  // Get current account balances
  async getBalances(): Promise<{ totalValue: number; assets: PortfolioAsset[] }> {
    const nonce = Date.now().toString();
    const res = await fetch(`${this.baseUrl}/balance`, {
      headers: {
        'X-API-Key': this.apiKey,
        'X-API-Nonce': nonce,
        'X-API-Sign': '0x01signature...'
      }
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || `SoDEX balance fetch failed with status ${res.status}`);
    }

    return await res.json();
  }

  // Get active leveraged positions
  async getPositions(): Promise<AssetPosition[]> {
    const nonce = Date.now().toString();
    const res = await fetch(`${this.baseUrl}/positions`, {
      headers: {
        'X-API-Key': this.apiKey,
        'X-API-Nonce': nonce,
        'X-API-Sign': '0x01signature...'
      }
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || `SoDEX positions fetch failed with status ${res.status}`);
    }

    return await res.json();
  }

  // Get recent trade execution logs
  async getTradeHistory(): Promise<any[]> {
    const res = await fetch(`${this.baseUrl}/history`, {
      headers: { 
        'X-API-Key': this.apiKey,
        'Content-Type': 'application/json'
      }
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || `SoDEX history fetch failed with status ${res.status}`);
    }

    return await res.json();
  }

  // Execute a spot order
  async placeSpotOrder(params: {
    symbol: string;
    side: 'BUY' | 'SELL';
    price: number;
    size: number;
    orderType: 'market' | 'limit';
  }): Promise<{ success: boolean; txHash: string; orderId: string; error?: string }> {
    try {
      const res = await fetch(`${this.baseUrl}/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': this.apiKey
        },
        body: JSON.stringify({
          type: 'SPOT',
          payload: {
            accountID: 12345,
            symbolID: params.symbol === 'BTC' ? 1 : params.symbol === 'ETH' ? 2 : 3,
            orders: [
              {
                type: 'newOrder',
                params: {
                  accountID: 12345,
                  symbolID: params.symbol === 'BTC' ? 1 : params.symbol === 'ETH' ? 2 : 3,
                  side: params.side.toLowerCase(),
                  price: params.price.toString(),
                  size: params.size.toString(),
                  orderType: params.orderType,
                  modifier: 0,
                  reduceOnly: false,
                  positionSide: 0
                }
              }
            ]
          }
        })
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || `SoDEX Spot order rejected: status ${res.status}`);
      }

      return await res.json();
    } catch (err: any) {
      return { success: false, txHash: '', orderId: '', error: err.message };
    }
  }

  // Execute a perp order
  async placePerpOrder(params: {
    symbol: string;
    side: 'LONG' | 'SHORT';
    price: number;
    size: number;
    leverage: number;
    orderType: 'market' | 'limit';
  }): Promise<{ success: boolean; txHash: string; orderId: string; error?: string }> {
    try {
      const res = await fetch(`${this.baseUrl}/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': this.apiKey
        },
        body: JSON.stringify({
          type: 'PERP',
          payload: {
            accountID: 12345,
            symbolID: 1, // mapping
            orders: [
              {
                type: 'newOrder',
                params: {
                  accountID: 12345,
                  symbolID: 1,
                  side: params.side.toLowerCase(),
                  price: params.price.toString(),
                  size: params.size.toString(),
                  orderType: params.orderType,
                  modifier: 0,
                  reduceOnly: false,
                  positionSide: params.side === 'LONG' ? 1 : 2
                }
              }
            ]
          }
        })
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || `SoDEX Perp order rejected: status ${res.status}`);
      }

      return await res.json();
    } catch (err: any) {
      return { success: false, txHash: '', orderId: '', error: err.message };
    }
  }

  // Close position
  async closePosition(positionId: string): Promise<boolean> {
    const nonce = Date.now().toString();
    const res = await fetch(`${this.baseUrl}/positions/close`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': this.apiKey,
        'X-API-Nonce': nonce,
        'X-API-Sign': '0x01signed...'
      },
      body: JSON.stringify({ positionId })
    });
    return res.ok;
  }

  // Gemini tool declarations
  getGeminiToolDeclaration() {
    return [
      {
        name: 'get_account_balances',
        description: 'Fetch the active trading account balances, showing tokens, asset amounts, and total portfolio valuations from SoDEX.',
        parameters: { type: 'OBJECT', properties: {} }
      },
      {
        name: 'get_active_perp_positions',
        description: 'Fetch all open leveraged perpetual positions including size, side, leverage, entry price, and current PnL from SoDEX.',
        parameters: { type: 'OBJECT', properties: {} }
      },
      {
        name: 'execute_trade',
        description: 'Place a buy or sell trade (spot or perpetual contract) on the SoDEX platform. Spot or Perps limit/market orders.',
        parameters: {
          type: 'OBJECT',
          properties: {
            symbol: { type: 'STRING', description: 'The asset symbol (e.g. BTC, ETH, SOL, or SOL-PERP)' },
            side: { type: 'STRING', enum: ['BUY', 'SELL', 'LONG', 'SHORT'], description: 'The trade side.' },
            type: { type: 'STRING', enum: ['SPOT', 'PERP'], description: 'Trading spot asset or perp contract.' },
            price: { type: 'NUMBER', description: 'Limit price to purchase/sell.' },
            size: { type: 'NUMBER', description: 'Amount of assets to trade.' },
            leverage: { type: 'NUMBER', description: 'Multiplier (only applicable if type is PERP)' },
            orderType: { type: 'STRING', enum: ['market', 'limit'], description: 'The order execution type.' }
          },
          required: ['symbol', 'side', 'type', 'price', 'size', 'orderType']
        }
      }
    ];
  }
}
