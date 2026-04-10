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
    const { username, password } = await request.json()

    if (!username || !password) {
      return NextResponse.json(
        { error: "用户名和密码不能为空" },
        { status: 400 }
      )
    }

    // 查找用户
    const user = await prisma.gameUser.findUnique({
      where: { username },
      include: {
        gameState: true
      }
    })

    if (!user) {
      return NextResponse.json(
        { error: "用户名或密码错误" },
        { status: 401 }
      )
    }

    // 验证密码
    const isValidPassword = await bcrypt.compare(password, user.password)

    if (!isValidPassword) {
      return NextResponse.json(
        { error: "用户名或密码错误" },
        { status: 401 }
      )
    }

    // 创建响应
    const response = NextResponse.json({
      message: "登录成功",
      user: {
        id: user.id,
        username: user.username,
        nickname: user.nickname,
        avatar: user.avatar
      }
    })

    // 检查是否是 HTTPS 请求（通过代理头判断）
    const forwardedProto = request.headers.get('x-forwarded-proto')
    const isSecure = forwardedProto === 'https' || request.url.startsWith('https://')
    const host = request.headers.get('host') || 'localhost'

    // 设置 session cookie - 在代理环境中需要特殊处理
    response.cookies.set("game_user_id", user.id, {
      httpOnly: true,
      secure: isSecure,
      sameSite: isSecure ? "none" : "lax",  // HTTPS 环境下需要 sameSite: none
      path: "/",
      maxAge: 60 * 60 * 24 * 30, // 30 天
      domain: host.includes('.') ? undefined : undefined  // 不设置 domain
    })

    return response
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json(
      { error: "登录失败，请稍后重试" },
      { status: 500 }
    )
  }
}
