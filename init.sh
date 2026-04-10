#!/bin/bash

echo "=== 英语冒险世界 - 初始化 ==="

# 检查 Node.js
if ! command -v node &> /dev/null; then
    echo "❌ 请先安装 Node.js 18+"
    exit 1
fi

echo "✅ Node.js 版本: $(node -v)"

# 安装依赖
echo "📦 安装依赖..."
npm install

# 复制环境变量
if [ ! -f .env ]; then
    echo "📝 创建环境变量文件..."
    cp .env.example .env
fi

# 初始化数据库
echo "🗄️ 初始化数据库..."
npx prisma generate
npx prisma db push

# 构建
echo "🔨 构建项目..."
npm run build

echo ""
echo "✅ 初始化完成！"
echo ""
echo "启动命令："
echo "  开发模式: npm run dev"
echo "  生产模式: npm start"
echo ""
echo "访问地址: http://localhost:3000"
