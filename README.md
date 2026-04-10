# 英语冒险世界 🎮

一个通过旅游场景学习英语对话的闯关游戏。

## 功能特点

- ✈️ **多场景对话**：机场、酒店、餐厅、购物、地铁等真实场景
- 🗺️ **多城市解锁**：纽约、洛杉矶、旧金山、伦敦、东京、巴黎、悉尼
- 🃏 **卡牌收集**：完成对话收集词汇卡牌
- 🏆 **排行榜**：与其他玩家竞争
- 📅 **每日任务**：每日挑战获取奖励
- 📝 **错题本**：复习错误答案
- 🎯 **成就系统**：解锁各种成就

## 快速开始

### 本地开发

```bash
# 1. 安装依赖
npm install

# 2. 初始化数据库
npx prisma generate
npx prisma db push

# 3. 启动开发服务器
npm run dev
```

访问 http://localhost:3000

### 生产部署

```bash
npm run build
npm start
```

## 部署到 Vercel（推荐）

1. **创建 GitHub 仓库**
   - 将 `english-game` 文件夹上传到新的 GitHub 仓库

2. **在 Vercel 导入**
   - 访问 [vercel.com](https://vercel.com)
   - 点击 "New Project"
   - 导入你的 GitHub 仓库

3. **配置环境变量**
   在 Vercel 项目设置中添加：
   ```
   DATABASE_URL="file:./prisma/game.db"
   NEXTAUTH_SECRET="随机生成的密钥"
   NEXTAUTH_URL="你的vercel域名"
   NEXTAUTH_TRUST_HOST="true"
   ```

4. **部署**
   - Vercel 会自动构建和部署

## 部署到扣子小程序

### 方式一：作为独立网页嵌入

1. 将项目部署到 Vercel 或其他平台
2. 在扣子小程序中使用 WebView 组件嵌入网址

### 方式二：扣子 Bot 集成

可以创建一个扣子 Bot，将游戏功能作为技能集成：

1. 创建新的扣子 Bot
2. 添加"英语学习"相关技能
3. 使用 API 连接到游戏后端

## 环境变量说明

| 变量名 | 说明 | 示例 |
|--------|------|------|
| DATABASE_URL | SQLite 数据库路径 | `file:./prisma/game.db` |
| NEXTAUTH_URL | 应用访问地址 | `http://localhost:3000` |
| NEXTAUTH_SECRET | 加密密钥 | 随机字符串 |
| NEXTAUTH_TRUST_HOST | 信任主机 | `true` |

## 技术栈

- **前端**: Next.js 15 + React 19 + TypeScript
- **样式**: Tailwind CSS
- **数据库**: Prisma + SQLite
- **认证**: NextAuth.js

## 目录结构

```
english-game/
├── src/
│   ├── app/
│   │   ├── page.tsx          # 主游戏页面
│   │   ├── login/            # 登录页
│   │   ├── register/         # 注册页
│   │   └── api/              # API 路由
│   │       ├── game/         # 游戏 API
│   │       │   ├── auth/     # 认证
│   │       │   ├── save/     # 存档
│   │       │   └── rankings/ # 排行榜
│   │       └── voice/        # 语音 API
│   ├── components/           # UI 组件
│   └── lib/                  # 工具函数
├── prisma/
│   └── schema.prisma         # 数据库模型
├── public/                   # 静态资源
└── package.json
```

## 默认测试账号

- 用户名: `test`
- 密码: `123456`

## 常见问题

### Q: 数据库初始化失败？
```bash
# 删除旧数据库重新初始化
rm prisma/game.db
npx prisma db push
```

### Q: 端口被占用？
修改 `.env` 文件中的 `PORT=3000` 为其他端口

### Q: 语音功能不工作？
语音功能依赖浏览器的 Web Speech API，请使用 Chrome 浏览器

## License

MIT

---


**Last Vercel Redeploy Trigger:** 2026-04-10 18:40:02 UTC
