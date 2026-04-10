import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(request: Request) {
  try {
    // 从 cookie 获取用户 ID
    const { cookies } = await import("next/headers")
    const cookieStore = await cookies()
    let userId = cookieStore.get("game_user_id")?.value

    // 如果 cookie 中没有，尝试从 header 获取（localStorage 方案）
    if (!userId) {
      userId = request.headers.get("x-user-id") || undefined
    }

    if (!userId) {
      return NextResponse.json(
        { error: "未登录", loggedIn: false },
        { status: 401 }
      )
    }

    // 查找用户
    const user = await prisma.gameUser.findUnique({
      where: { id: userId },
      include: {
        gameState: true
      }
    })

    if (!user) {
      return NextResponse.json(
        { error: "用户不存在", loggedIn: false },
        { status: 401 }
      )
    }

    return NextResponse.json({
      loggedIn: true,
      user: {
        id: user.id,
        username: user.username,
        nickname: user.nickname,
        avatar: user.avatar
      },
      gameState: user.gameState
    })
  } catch (error) {
    console.error("Get user error:", error)
    return NextResponse.json(
      { error: "获取用户信息失败", loggedIn: false },
      { status: 500 }
    )
  }
}
