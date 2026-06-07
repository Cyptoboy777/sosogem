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

    // Initialize real Google Generative AI
    const genAI = new GoogleGenerativeAI(geminiKey);
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
      systemInstruction: GEMINI_SYSTEM_INSTRUCTION,
      tools: GEMINI_TOOLS as any
    });

    // Prepare history format for Gemini
    let contents = messages.map((m: any) => ({
      role: m.role === 'user' ? 'user' : 'model',
      parts: [{ text: m.content }],
    }));

    let result = await model.generateContent({
      contents,
    });

    let response = await result.response;
    let functionCalls = response.functionCalls() || [];

    if (functionCalls.length > 0) {
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

      // Append model parts containing functionCalls
      const modelParts = functionCalls.map((c: any) => ({
        functionCall: c
      }));

      contents.push({
        role: 'model',
        parts: modelParts
      });

      // Append function response parts
      contents.push({
        role: 'function',
        parts: functionResponseParts
      });

      // Generate content again with function results
      const finalResult = await model.generateContent({
        contents
      });

      const finalResponse = await finalResult.response;
      return NextResponse.json({
        role: 'model',
        content: finalResponse.text(),
      });
    }

    return NextResponse.json({
      role: 'model',
      content: response.text(),
    });
  } catch (error: any) {
    console.error('Gemini Route Error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
