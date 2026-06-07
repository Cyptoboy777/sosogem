import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { GEMINI_SYSTEM_INSTRUCTION, GEMINI_TOOLS } from '@/lib/gemini';
import { SoSoValueClient } from '@/lib/sosovalue';
import { SodexSDK } from '@/lib/sodex';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { messages } = body;

    // Get keys from headers or environment variables
    const geminiKey = req.headers.get('x-gemini-key') || process.env.GEMINI_API_KEY || '';
    const sosoKey = req.headers.get('x-soso-key') || process.env.SOSOVALUE_API_KEY || '';
    const sodexKey = req.headers.get('x-sodex-key') || process.env.SODEX_API_KEY || '';
    const sodexSecret = req.headers.get('x-sodex-secret-key') || process.env.SODEX_SECRET_KEY || '';

    const sandbox = !geminiKey;

    // Build absolute base URL for server-side fetches to avoid relative URL errors
    const protocol = req.headers.get('x-forwarded-proto') || 'http';
    const host = req.headers.get('host') || 'localhost:3000';
    const baseUrl = `${protocol}://${host}`;

    const sosoClient = new SoSoValueClient(sosoKey, `${baseUrl}/api/sosovalue`);
    const sodexClient = new SodexSDK(sodexKey, sodexSecret, `${baseUrl}/api/sodex`);

    if (sandbox) {
      return NextResponse.json({
        role: 'model',
        content: `### ⚠️ Gemini API Key Required

A Google Gemini API key is required to query live metrics and generate AI-driven crypto research reports. Please configure it in your Settings panel or local \`.env.local\` file to enable Chat features.`,
      });
    }

    // 1. Pre-fetch SoSoValue & SoDEX context in parallel to minimize latency
    let marketStats = null;
    let cryptoNews = null;
    let coinDetails = null;
    let accountBalances = null;
    let activePositions = null;

    try {
      const results = await Promise.allSettled([
        sosoClient.getMarketStats(),
        sosoClient.getNews(),
        sosoClient.getCoins(),
        sodexKey && sodexSecret ? sodexClient.getBalances() : Promise.resolve(null),
        sodexKey && sodexSecret ? sodexClient.getPositions() : Promise.resolve(null)
      ]);

      if (results[0].status === 'fulfilled') marketStats = results[0].value;
      if (results[1].status === 'fulfilled') cryptoNews = results[1].value;
      if (results[2].status === 'fulfilled') coinDetails = results[2].value;
      if (results[3].status === 'fulfilled') accountBalances = results[3].value;
      if (results[4].status === 'fulfilled') activePositions = results[4].value;
    } catch (e) {
      console.error("Error pre-fetching context:", e);
    }

    // 2. Build dynamic system instruction with real-time data
    const dynamicSystemInstruction = `${GEMINI_SYSTEM_INSTRUCTION}

=== REAL-TIME CONTEXT FROM SOSOVALUE AND SODEX ===
Current Server Time: ${new Date().toISOString()}
- Market Statistics & ETF Flows: ${JSON.stringify(marketStats)}
- Latest Crypto News & Sentiment (SoSoValue): ${JSON.stringify(cryptoNews)}
- Coin Details (BTC, ETH, SOL, DOGE): ${JSON.stringify(coinDetails)}
- SoDEX User Balances: ${JSON.stringify(accountBalances)}
- SoDEX User Active Perpetual Positions: ${JSON.stringify(activePositions)}
==================================================

Guidelines on utilizing the provided real-time context:
1. Refer to the real-time figures above for all crypto prices, 24h percentage changes, and Spot ETF inflows. Never make up prices or invent inflows.
2. If queried about speculative projects like "latest Solana memecoins with potential" or "Ecosystem coins", provide a high-caliber, data-backed synthesis using the current SOL price trend and latest SoSoValue news sentiment. Highlight major established ecosystem tokens such as BONK and WIF as examples, explain their market cap sizes, their correlation to SOL's volume/price, and provide an objective risk warning (e.g., liquidity constraints, pump.fun velocity). NEVER respond with a refusal that you cannot identify them. Instead, deliver the most premium report possible using the active context.
3. If asked about user balances or positions, read from the SoDEX User Balances and SoDEX User Active Perpetual Positions above. Give a precise breakdown of the assets, valuation in USD, entry prices, mark prices, leverage, and unrealized PnL.
4. You are an autonomous agent capable of executing spot and perp orders via the SoDEX Router when the user requests it. If the user commands a trade, call the execute_trade tool.
`;

    // 3. Initialize Gemini model with the dynamic system prompt
    const genAI = new GoogleGenerativeAI(geminiKey);
    let model = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
      systemInstruction: dynamicSystemInstruction,
      tools: GEMINI_TOOLS as any
    });

    // Prepare history format for Gemini
    let contents = messages.map((m: any) => ({
      role: m.role === 'user' ? 'user' : 'model',
      parts: [{ text: m.content }],
    }));

    console.log("Incoming messages to chat API:", JSON.stringify(messages, null, 2));

    // 4. Run multi-step function calling execution loop
    let loopCount = 0;
    const maxLoops = 5;
    let finalContent = "";
    let useFallback = false;

    while (loopCount < maxLoops) {
      let response;
      let functionCalls;

      try {
        const result = await model.generateContent({
          contents,
        });

        response = await result.response;
        functionCalls = response.functionCalls() || [];
      } catch (err: any) {
        console.error("Gemini generation error:", err);
        if (!useFallback) {
          console.warn("Retrying with gemini-1.5-flash fallback...");
          useFallback = true;
          model = genAI.getGenerativeModel({
            model: 'gemini-1.5-flash',
            systemInstruction: dynamicSystemInstruction,
            tools: GEMINI_TOOLS as any
          });
          continue; // Retry this loop iteration with the fallback model
        }
        throw err;
      }

      console.log(`Gemini loop ${loopCount} function calls:`, JSON.stringify(functionCalls, null, 2));

      if (functionCalls.length === 0) {
        // No function calls, this is the final text response from the model
        finalContent = response.text();
        break;
      }

      // We have function calls, execute them and gather responses
      const functionResponseParts = [];

      for (const call of functionCalls) {
        const { name, args } = call;
        let data: any = null;
        try {
          if (name === 'get_market_statistics') {
            data = await sosoClient.getMarketStats();
          } else if (name === 'get_crypto_news') {
            data = await sosoClient.getNews();
          } else if (name === 'get_coin_details') {
            data = await sosoClient.getCoins();
          } else if (name === 'get_account_balances') {
            data = await sodexClient.getBalances();
          } else if (name === 'get_active_perp_positions') {
            data = await sodexClient.getPositions();
          } else if (name === 'execute_trade') {
            const tradeArgs = args as any;
            if (tradeArgs.type === 'PERP') {
              data = await sodexClient.placePerpOrder(tradeArgs);
            } else {
              data = await sodexClient.placeSpotOrder(tradeArgs);
            }
          }
        } catch (err: any) {
          console.error(`Error executing tool ${name}:`, err);
          data = { error: err.message || 'Tool execution failed' };
        }

        functionResponseParts.push({
          functionResponse: {
            name,
            response: { result: data }
          }
        });
      }

      // Update the Gemini conversation history
      contents.push({
        role: 'model',
        parts: functionCalls.map((c: any) => ({
          functionCall: c
        }))
      });

      contents.push({
        role: 'function',
        parts: functionResponseParts
      });

      loopCount++;
    }

    if (loopCount >= maxLoops && !finalContent) {
      finalContent = "Tool execution loop limit exceeded. Here is the latest state of tool responses: " + JSON.stringify(contents[contents.length - 1]);
    }

    return NextResponse.json({
      role: 'model',
      content: finalContent,
    });
  } catch (error: any) {
    console.error('Gemini Route Error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
