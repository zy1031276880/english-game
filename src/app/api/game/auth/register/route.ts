import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { PrismaClient } from '@prisma/client'
import path from 'path'

// 直接使用绝对路径，不依赖全局单例
const prisma = new PrismaClient({
  log: ['error'],
  datasources: {
    db: {
      url: `file:${path.join(process.cwd(), 'dev.db')}`
    }
  }
})

export async function POST(request: Request) {
  try {
    const { username, password, nickname, avatar } = await request.json()

    if (!username || !password) {
      return NextResponse.json(
        { error: "用户名和密码不能为空" },
        { status: 400 }
      )
    }

    if (username.length < 3 || username.length > 20) {
      return NextResponse.json(
        { error: "用户名长度需在3-20个字符之间" },
        { status: 400 }
      )
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "密码长度至少6个字符" },
        { status: 400 }
      )
    }

    // 检查用户名是否已存在
    const existingUser = await prisma.gameUser.findUnique({
      where: { username }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: "用户名已被占用" },
        { status: 400 }
      )
    }

    // 加密密码
    const hashedPassword = await bcrypt.hash(password, 10)

    // 创建用户和初始游戏状态
    const user = await prisma.gameUser.create({
      data: {
        username,
        password: hashedPassword,
        nickname: nickname || username,
        avatar: avatar || "🎮",
        gameState: {
          create: {
            level: 1,
            exp: 0,
            coins: 100,
            currentCity: "newyork",
            unlockedCities: JSON.stringify(["newyork"]),
            completedScenes: "[]",
            cards: "[]",
            buildings: JSON.stringify(["airport"]),
            achievements: "[]",
            stats: JSON.stringify({
              scenesCompleted: 0,
              correctAnswers: 0,
              totalAnswers: 0,
              cardsCollected: 0
            }),
            // 新增字段初始值
            currentStreak: 0,
            maxStreak: 0,
            lastLoginDate: "",
            consecutiveLoginDays: 0,
            dailyTasks: "{}",
            lastTaskResetDate: "",
          }
        }
      },
      include: {
        gameState: true
      }
    })

    // 创建响应并设置 cookie
    const response = NextResponse.json({
      message: "注册成功",
      user: {
        id: user.id,
        username: user.username,
        nickname: user.nickname,
        avatar: user.avatar
      }
    }, { status: 201 })

    // 检查是否是 HTTPS 请求（通过代理头判断）
    const forwardedProto = request.headers.get('x-forwarded-proto')
    const isSecure = forwardedProto === 'https' || request.url.startsWith('https://')

    // 设置简单的 session cookie - 在代理环境中需要特殊处理
    response.cookies.set("game_user_id", user.id, {
      httpOnly: true,
      secure: isSecure,
      sameSite: isSecure ? "none" : "lax",  // HTTPS 环境下需要 sameSite: none
      path: "/",
      maxAge: 60 * 60 * 24 * 30 // 30 天
    })

    return response
  } catch (error) {
    console.error("Registration error:", error)
    return NextResponse.json(
      { error: "注册失败，请稍后重试" },
      { status: 500 }
    )
  }
}
