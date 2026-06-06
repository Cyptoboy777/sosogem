import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  let auth = req.headers.get('Authorization') || '';
  let apiKey = '';
  if (auth.startsWith('Bearer ')) {
    apiKey = auth.substring(7).trim();
  }
  if (!apiKey) {
    apiKey = process.env.SOSOVALUE_API_KEY || '';
  }
  
  try {
    const res = await fetch('https://openapi.sosovalue.com/api/v1/openapi/pub/news/list', {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
    });
    
    if (!res.ok) {
      throw new Error(`SoSoValue API responded with status ${res.status}`);
    }
    
    const data = await res.json();
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to fetch news' }, { status: 500 });
  }
}
