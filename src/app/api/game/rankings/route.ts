import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// 安全解析 JSON 字符串
function safeParseJson<T>(jsonStr: string | null, defaultValue: T): T {
  if (!jsonStr) return defaultValue
  try {
    return JSON.parse(jsonStr) as T
  } catch {
    return defaultValue
  }
}

export async function GET(request: NextRequest) {
  try {
    // 获取所有用户的游戏状态
    const allGameStates = await prisma.gameState.findMany({
      include: {
        user: {
          select: {
            id: true,
            nickname: true,
            avatar: true,
          }
        }
      },
      orderBy: [
        { level: 'desc' },
        { exp: 'desc' },
      ]
    })

    // 处理排名数据
    const rankings = allGameStates.map((gs, index) => {
      const stats = safeParseJson(gs.stats, { scenesCompleted: 0, correctAnswers: 0, totalAnswers: 0, cardsCollected: 0 })
      const accuracy = stats.totalAnswers > 0 
        ? Math.round((stats.correctAnswers / stats.totalAnswers) * 100) 
        : 0
      
      return {
        rank: index + 1,
        userId: gs.userId,
        nickname: gs.user.nickname || '旅行者',
        avatar: gs.user.avatar || '🎮',
        level: gs.level,
        exp: gs.exp,
        coins: gs.coins,
        scenesCompleted: stats.scenesCompleted,
        accuracy,
        cardsCollected: stats.cardsCollected,
        currentStreak: gs.currentStreak,
      }
    })

    return NextResponse.json({ 
      success: true, 
      rankings,
      total: rankings.length 
    })
  } catch (error) {
    console.error('Get rankings error:', error)
    return NextResponse.json(
      { success: false, message: '获取排行榜失败' },
      { status: 500 }
    )
  }
}
