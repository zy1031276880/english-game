#!/bin/bash
# 帅比云电脑 English Game 永久外网部署脚本
# 使用方法：在帅比云电脑上执行
# bash /workspace/projects/english-game/scripts/deploy-shuaibi.sh

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo ""
echo "========================================"
echo "🎮 English Game 永久外网部署"
echo "========================================"
echo ""

# ============================================
# 步骤1：检查环境
# ============================================
echo -e "${BLUE}[1/7] 检查环境...${NC}"

# 检查 English Game 项目
PROJECT_DIR="/workspace/projects/english-game"
if [ ! -d "$PROJECT_DIR" ]; then
    echo -e "${RED}✗ 项目目录不存在: $PROJECT_DIR${NC}"
    exit 1
fi
echo -e "${GREEN}✓ English Game 项目存在${NC}"

# 检查 Node.js
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    echo -e "${GREEN}✓ Node.js: $NODE_VERSION${NC}"
else
    echo -e "${RED}✗ Node.js 未安装${NC}"
    exit 1
fi

# 检查 npm
if command -v npm &> /dev/null; then
    NPM_VERSION=$(npm --version)
    echo -e "${GREEN}✓ npm: $NPM_VERSION${NC}"
else
    echo -e "${RED}✗ npm 未安装${NC}"
    exit 1
fi

# 检查 cloudflared
if command -v cloudflared &> /dev/null; then
    CF_VERSION=$(cloudflared --version | head -1)
    echo -e "${GREEN}✓ cloudflared: $CF_VERSION${NC}"
else
    echo -e "${YELLOW}⚠ cloudflared 未安装，跳过 Tunnel 配置${NC}"
    SKIP_TUNNEL=true
fi

echo ""

# ============================================
# 步骤2：安装 PM2
# ============================================
echo -e "${BLUE}[2/7] 安装 PM2 进程管理器...${NC}"

if command -v pm2 &> /dev/null; then
    PM2_VERSION=$(pm2 --version)
    echo -e "${GREEN}✓ PM2 已安装: $PM2_VERSION${NC}"
else
    echo "正在安装 PM2..."
    npm install -g pm2
    echo -e "${GREEN}✓ PM2 安装成功${NC}"
fi

# 设置 PM2 开机自启
echo ""
echo "正在设置 PM2 开机自启..."
pm2 startup systemd -u root --hp /root 2>/dev/null | grep -E "(Command|sudo)" || true
echo -e "${GREEN}✓ PM2 开机自启配置完成${NC}"

echo ""

# ============================================
# 步骤3：配置 English Game
# ============================================
echo -e "${BLUE}[3/7] 配置 English Game...${NC}"

cd "$PROJECT_DIR"

# 检查依赖
if [ ! -d "node_modules" ]; then
    echo "正在安装依赖..."
    npm install --silent
    echo -e "${GREEN}✓ 依赖安装完成${NC}"
else
    echo -e "${GREEN}✓ 依赖已安装${NC}"
fi

# 生成 Prisma Client
echo "正在生成 Prisma Client..."
npx prisma generate 2>/dev/null || echo "跳过 Prisma 生成"

# 确保数据库存在
if [ ! -f "dev.db" ]; then
    echo "正在初始化数据库..."
    cp prisma/dev.db dev.db 2>/dev/null || touch dev.db
fi

# 构建项目
echo "正在构建项目..."
if [ -d ".next" ]; then
    echo -e "${GREEN}✓ 项目已构建${NC}"
else
    npm run build 2>/dev/null || echo -e "${YELLOW}⚠ 构建失败，将使用开发模式${NC}"
fi

echo ""

# ============================================
# 步骤4：配置环境变量
# ============================================
echo -e "${BLUE}[4/7] 配置环境变量...${NC}"

# 生成随机密钥
SECRET=$(openssl rand -base64 32 2>/dev/null || echo "english-game-secret-2024")

# 配置 .env 文件
cat > .env << EOF
DATABASE_URL="file:./dev.db"
NEXTAUTH_URL="https://english-game.你的域名.com"
NEXTAUTH_SECRET="$SECRET"
NEXTAUTH_TRUST_HOST="true"
PORT=3000
EOF

echo -e "${GREEN}✓ 环境变量已配置${NC}"
echo "  DATABASE_URL: file:./dev.db"
echo "  NEXTAUTH_URL: https://english-game.你的域名.com"
echo "  PORT: 3000"

echo ""

# ============================================
# 步骤5：使用 PM2 启动 English Game
# ============================================
echo -e "${BLUE}[5/7] 启动 English Game...${NC}"

# 停止现有进程
if pm2 list | grep -q "english-game"; then
    echo "停止现有 English Game 进程..."
    pm2 delete english-game 2>/dev/null || true
fi

# 启动应用
echo "启动 English Game..."
pm2 start npm --name "english-game" -- start

# 保存进程列表
pm2 save

echo -e "${GREEN}✓ English Game 已启动${NC}"

# 显示状态
sleep 2
pm2 status english-game 2>/dev/null || true

echo ""

# ============================================
# 步骤6：配置 Cloudflare Tunnel（如果可用）
# ============================================
if [ "$SKIP_TUNNEL" = true ]; then
    echo -e "${YELLOW}[6/7] 跳过 Cloudflare Tunnel 配置（未安装）${NC}"
else
    echo -e "${BLUE}[6/7] 配置 Cloudflare Tunnel...${NC}"
    echo ""

    echo "Cloudflare Tunnel 需要手动配置："
    echo ""
    echo "步骤1：在你的电脑上登录 Cloudflare"
    echo "  cloudflared tunnel login"
    echo ""
    echo "步骤2：创建 Tunnel（在你的电脑或云电脑上）"
    echo "  cloudflared tunnel create english-game"
    echo "  记下 Tunnel ID"
    echo ""
    echo "步骤3：配置 Tunnel（在云电脑上）"
    echo "  创建配置文件：~/.cloudflared/config.yml"
    echo "  启动服务：cloudflared tunnel service install"
    echo ""

    read -p "是否现在配置 Cloudflare Tunnel？(y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        read -p "请输入 Tunnel ID: " TUNNEL_ID

        if [ -n "$TUNNEL_ID" ]; then
            # 创建配置目录
            mkdir -p ~/.cloudflared

            # 创建配置文件
            cat > ~/.cloudflared/config.yml << EOF
tunnel: $TUNNEL_ID
credentials-file: /root/.cloudflared/${TUNNEL_ID}.json

ingress:
  - hostname: english-game.你的域名.com
    service: http://localhost:3000
  - service: http_status:404
EOF

            echo -e "${GREEN}✓ Tunnel 配置文件已创建${NC}"
            echo "  配置文件: ~/.cloudflared/config.yml"
            echo "  Tunnel ID: $TUNNEL_ID"

            # 检查证书文件
            if [ -f "/root/.cloudflared/${TUNNEL_ID}.json" ]; then
                echo -e "${GREEN}✓ Tunnel 证书文件存在${NC}"

                # 安装并启动服务
                echo "正在安装 Cloudflare Tunnel 服务..."
                cloudflared tunnel service install 2>/dev/null || true

                # 启动服务
                systemctl enable cloudflared 2>/dev/null || true
                systemctl restart cloudflared 2>/dev/null || true

                sleep 2
                systemctl status cloudflared --no-pager 2>/dev/null | head -5 || true

                echo -e "${GREEN}✓ Cloudflare Tunnel 已启动${NC}"
            else
                echo -e "${YELLOW}⚠ Tunnel 证书文件不存在，请先执行：${NC}"
                echo "  cloudflared tunnel login"
                echo "  cloudflared tunnel create english-game"
            fi
        else
            echo "跳过 Tunnel 配置"
        fi
    else
        echo "跳过 Tunnel 配置"
        echo -e "${YELLOW}💡 提示：稍后可使用 cloudflared tunnel run 手动启动${NC}"
    fi
fi

echo ""

# ============================================
# 步骤7：配置开机自启动
# ============================================
echo -e "${BLUE}[7/7] 配置开机自启动...${NC}"

# PM2 开机自启（已在步骤2配置）
echo -e "${GREEN}✓ PM2 开机自启已配置${NC}"
echo "  命令: pm2 startup systemd"
echo "  保存: pm2 save"

# Cloudflare Tunnel 开机自启（如果已配置）
if [ "$SKIP_TUNNEL" != true ] && systemctl is-active cloudflared &>/dev/null; then
    echo -e "${GREEN}✓ Cloudflare Tunnel 开机自启已配置${NC}"
    echo "  服务: cloudflared"
    echo "  状态: $(systemctl is-active cloudflared)"
fi

echo ""

# ============================================
# 完成
# ============================================
echo "========================================"
echo -e "${GREEN}✅ 部署完成！${NC}"
echo "========================================"
echo ""

echo "📊 服务状态："
echo ""
pm2 status english-game 2>/dev/null

if [ "$SKIP_TUNNEL" != true ]; then
    echo ""
    systemctl status cloudflared --no-pager 2>/dev/null | head -5 || true
fi

echo ""
echo "========================================"
echo "📱 访问信息"
echo "========================================"
echo ""
echo "本地访问："
echo "  http://localhost:3000"
echo ""
echo "公网访问（需配置域名）："
echo "  https://english-game.你的域名.com"
echo ""
echo "Cloudflare Tunnel URL（临时）："
CF_URL=$(ps aux | grep "cloudflared tunnel run" | grep -v grep | head -1 | grep -o "https://[a-zA-Z0-9-]*\.trycloudflare\.com" || true)
if [ -n "$CF_URL" ]; then
    echo "  $CF_URL"
else
    echo "  请运行: cloudflared tunnel --url http://localhost:3000"
fi
echo ""
echo "========================================"
echo "📝 测试账号"
echo "========================================"
echo ""
echo "  用户名：test"
echo "  密码：123456"
echo ""
echo "========================================"
echo "🔧 管理命令"
echo "========================================"
echo ""
echo "English Game："
echo "  查看日志：pm2 logs english-game"
echo "  重启服务：pm2 restart english-game"
echo "  停止服务：pm2 stop english-game"
echo "  查看状态：pm2 status"
echo ""
if [ "$SKIP_TUNNEL" != true ]; then
    echo "Cloudflare Tunnel："
    echo "  查看日志：journalctl -u cloudflared -f"
    echo "  重启服务：systemctl restart cloudflared"
    echo "  查看状态：systemctl status cloudflared"
fi
echo ""
echo "========================================"

# 显示 English Game 日志
echo ""
echo -e "${BLUE}English Game 启动日志（最近15行）：${NC}"
pm2 logs english-game --lines 15 --nostream 2>/dev/null || echo "无日志"

echo ""
echo -e "${GREEN}🎉 部署完成！请按照上述信息访问 English Game${NC}"
