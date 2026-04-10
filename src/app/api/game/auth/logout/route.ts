import { NextResponse } from "next/server"

export async function POST() {
  const response = NextResponse.json({ message: "已退出登录" })
  
  // 清除 cookie
  response.cookies.set("game_user_id", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 0 // 立即过期
  })
  
  return response
}
