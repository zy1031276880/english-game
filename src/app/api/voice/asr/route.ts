import { NextRequest, NextResponse } from 'next/server'

// 语音识别 API - 使用浏览器端实现，此接口返回配置信息
export async function GET() {
  return NextResponse.json({
    message: '请使用浏览器端 Web Speech API',
    hint: 'window.SpeechRecognition || window.webkitSpeechRecognition'
  })
}

export async function POST(request: NextRequest) {
  // 简化版：返回模拟响应
  // 实际语音识别应在浏览器端使用 Web Speech API
  return NextResponse.json({
    success: true,
    text: '语音功能需要浏览器支持',
    score: 80,
    message: '请在浏览器端实现语音识别'
  })
}
