import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { GEMINI_SYSTEM_INSTRUCTION, getMockResearchResponse } from '@/lib/gemini';
import { SoSoValueClient } from '@/lib/sosovalue';
import { SoDEXClient } from '@/lib/sodex';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { messages } = body;
    const query = messages[messages.length - 1]?.content || '';

    // Get keys from headers or environment variables
    const geminiKey = req.headers.get('x-gemini-key') || process.env.GEMINI_API_KEY || '';
    const sosoKey = req.headers.get('x-soso-key') || process.env.SOSOVALUE_API_KEY || '';
    const sodexKey = req.headers.get('x-sodex-key') || process.env.SODEX_API_KEY || '';
    const sodexSecret = req.headers.get('x-sodex-secret-key') || process.env.SODEX_SECRET_KEY || '';

    const sandbox = !geminiKey;

    const sosoClient = new SoSoValueClient(sosoKey);
    const sodexClient = new SoDEXClient(sodexKey, sodexSecret);

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
    });

    // Prepare history format for Gemini
    const contents = messages.map((m: any) => ({
      role: m.role === 'user' ? 'user' : 'model',
      parts: [{ text: m.content }],
    }));

    const result = await model.generateContent({
      contents,
    });

    const response = await result.response;
    const responseText = response.text();

    return NextResponse.json({
      role: 'model',
      content: responseText,
    });
  } catch (error: any) {
    console.error('Gemini Route Error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
