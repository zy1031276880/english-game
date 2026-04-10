import { NextRequest, NextResponse } from 'next/server'

// 语音合成 API - 使用浏览器端实现
export async function GET() {
  return NextResponse.json({
    message: '请使用浏览器端 Web Speech API',
    hint: 'window.speechSynthesis'
  })
}

export async function POST(request: NextRequest) {
  try {
    const { text } = await request.json()
    
    // 简化版：返回文本，让浏览器端播放
    // 实际语音合成应在浏览器端使用 speechSynthesis API
    return NextResponse.json({
      success: true,
      text: text,
      message: '请在浏览器端使用 speechSynthesis 播放'
    })
  } catch {
    return NextResponse.json({
      success: false,
      message: '语音合成需要浏览器支持'
    })
  }
}
