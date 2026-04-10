import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function POST(request: Request) {
  try {
    const { cookies } = await import("next/headers")
    const cookieStore = await cookies()
    let userId = cookieStore.get("game_user_id")?.value

    // 如果 cookie 中没有，尝试从 header 获取（localStorage 方案）
    if (!userId) {
      userId = request.headers.get("x-user-id") || undefined
    }

    if (!userId) {
      return NextResponse.json(
        { error: "未登录" },
        { status: 401 }
      )
    }

    const gameState = await request.json()

    // 更新游戏状态
    const updated = await prisma.gameState.update({
      where: { userId },
      data: {
        level: gameState.level,
        exp: gameState.exp,
        coins: gameState.coins,
        currentCity: gameState.currentCity,
        unlockedCities: JSON.stringify(gameState.unlockedCities),
        completedScenes: JSON.stringify(gameState.completedScenes),
        cards: JSON.stringify(gameState.cards),
        buildings: JSON.stringify(gameState.buildings),
        achievements: JSON.stringify(gameState.achievements),
        stats: JSON.stringify(gameState.stats),
        // 新增字段
        currentStreak: gameState.currentStreak || 0,
        maxStreak: gameState.maxStreak || 0,
        lastLoginDate: gameState.lastLoginDate || '',
        consecutiveLoginDays: gameState.consecutiveLoginDays || 0,
        dailyTasks: JSON.stringify(gameState.dailyTasks || {}),
        lastTaskResetDate: gameState.lastTaskResetDate || '',
        // 引导步骤
        tutorialStep: gameState.tutorialStep ?? 0,
      }
    })

    return NextResponse.json({ 
      message: "保存成功",
      gameState: updated
    })
  } catch (error) {
    console.error("Save game error:", error)
    return NextResponse.json(
      { error: "保存失败" },
      { status: 500 }
    )
  }
}

export async function GET(request: Request) {
  try {
    const { cookies } = await import("next/headers")
    const cookieStore = await cookies()
    let userId = cookieStore.get("game_user_id")?.value

    // 如果 cookie 中没有，尝试从 header 获取（localStorage 方案）
    if (!userId) {
      userId = request.headers.get("x-user-id") || undefined
    }

    if (!userId) {
      return NextResponse.json(
        { error: "未登录" },
        { status: 401 }
      )
    }

    const gameState = await prisma.gameState.findUnique({
      where: { userId }
    })

    if (!gameState) {
      return NextResponse.json(
        { error: "游戏数据不存在" },
        { status: 404 }
      )
    }

    // 解析 JSON 字段
    return NextResponse.json({
      gameState: {
        level: gameState.level,
        exp: gameState.exp,
        coins: gameState.coins,
        currentCity: gameState.currentCity,
        unlockedCities: JSON.parse(gameState.unlockedCities),
        completedScenes: JSON.parse(gameState.completedScenes),
        cards: JSON.parse(gameState.cards),
        buildings: JSON.parse(gameState.buildings),
        achievements: JSON.parse(gameState.achievements),
        stats: JSON.parse(gameState.stats),
      }
    })
  } catch (error) {
    console.error("Get game state error:", error)
    return NextResponse.json(
      { error: "获取游戏数据失败" },
      { status: 500 }
    )
  }
}
