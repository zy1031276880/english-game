#!/bin/bash
# English Game 快速部署脚本 - 适用于帅比的云电脑
# 使用方法：在云电脑上执行此脚本

set -e

echo "========================================"
echo "English Game 快速部署脚本"
echo "========================================"
echo ""

# 颜色定义
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# 步骤1：检查环境
echo -e "${YELLOW}[1/8] 检查系统环境...${NC}"
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    echo -e "${GREEN}✓ Node.js 已安装: $NODE_VERSION${NC}"
else
    echo -e "${RED}✗ Node.js 未安装，正在安装...${NC}"
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
    apt install -y nodejs
fi

if command -v npm &> /dev/null; then
    echo -e "${GREEN}✓ npm 已安装${NC}"
else
    echo -e "${RED}✗ npm 未安装${NC}"
    exit 1
fi

# 步骤2：安装 PM2
echo ""
echo -e "${YELLOW}[2/8] 安装 PM2 进程管理器...${NC}"
if command -v pm2 &> /dev/null; then
    echo -e "${GREEN}✓ PM2 已安装${NC}"
else
    npm install -g pm2
    echo -e "${GREEN}✓ PM2 安装成功${NC}"
fi

# 设置 PM2 开机自启
pm2 startup systemd -u root --hp /root

# 步骤3：安装 cloudflared
echo ""
echo -e "${YELLOW}[3/8] 安装 Cloudflare Tunnel...${NC}"
if command -v cloudflared &> /dev/null; then
    echo -e "${GREEN}✓ cloudflared 已安装${NC}"
    CLOUDFLARED_VERSION=$(cloudflared --version)
    echo "  版本: $CLOUDFLARED_VERSION"
else
    echo "正在下载 cloudflared..."
    curl -L https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64 -o /usr/local/bin/cloudflared
    chmod +x /usr/local/bin/cloudflared
    echo -e "${GREEN}✓ cloudflared 安装成功${NC}"
fi

# 步骤4：配置 English Game
echo ""
echo -e "${YELLOW}[4/8] 配置 English Game...${NC}"

PROJECT_DIR="/workspace/projects/english-game"
if [ -d "$PROJECT_DIR" ]; then
    echo -e "${GREEN}✓ 项目目录存在: $PROJECT_DIR${NC}"
    cd "$PROJECT_DIR"
else
    echo -e "${RED}✗ 项目目录不存在: $PROJECT_DIR${NC}"
    exit 1
fi

# 检查是否已安装依赖
if [ ! -d "node_modules" ]; then
    echo "正在安装依赖..."
    npm install
    echo -e "${GREEN}✓ 依赖安装成功${NC}"
else
    echo -e "${GREEN}✓ 依赖已安装${NC}"
fi

# 生成 Prisma Client
echo "正在生成 Prisma Client..."
npx prisma generate
npx prisma db push

# 构建项目
echo "正在构建项目..."
npm run build

echo -e "${GREEN}✓ 项目构建成功${NC}"

# 步骤5：配置环境变量
echo ""
echo -e "${YELLOW}[5/8] 配置环境变量...${NC}"

# 生成随机密钥
SECRET=$(openssl rand -base64 32)

cat > .env << EOF
DATABASE_URL="file:./dev.db"
NEXTAUTH_URL="https://english-game.你的域名.com"
NEXTAUTH_SECRET="$SECRET"
NEXTAUTH_TRUST_HOST="true"
PORT=3000
EOF

echo -e "${GREEN}✓ 环境变量已配置${NC}"

# 步骤6：启动 English Game
echo ""
echo -e "${YELLOW}[6/8] 启动 English Game...${NC}"

# 停止旧进程
pm2 delete english-game 2>/dev/null || true

# 启动新进程
pm2 start npm --name "english-game" -- start
pm2 save

echo -e "${GREEN}✓ English Game 已启动${NC}"

# 步骤7：配置 Cloudflare Tunnel
echo ""
echo -e "${YELLOW}[7/8] 配置 Cloudflare Tunnel...${NC}"

echo ""
echo "请按照以下步骤操作："
echo "1. 访问 https://dash.cloudflare.com/"
echo "2. 登录你的 Cloudflare 账户"
echo "3. 选择一个域名"
echo "4. 进入 Zero Trust > Networks > Tunnels"
echo "5. 点击 'Create a tunnel'"
echo "6. 选择 'Cloudflared' 并复制命令"
echo ""

read -p "是否需要创建新的 Tunnel？(y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo ""
    echo "请在你的电脑上执行以下命令进行登录："
    echo "  cloudflared tunnel login"
    echo ""
    echo "然后在云电脑上执行以下命令创建 Tunnel："
    echo "  cloudflared tunnel create english-game"
    echo ""
    read -p "输入你的 Tunnel ID: " TUNNEL_ID

    if [ -n "$TUNNEL_ID" ]; then
        # 配置 Tunnel
        mkdir -p ~/.cloudflared
        cat > ~/.cloudflared/config.yml << EOF
tunnel: $TUNNEL_ID
credentials-file: /root/.cloudflared/${TUNNEL_ID}.json

ingress:
  - hostname: english-game.你的域名.com
    service: http://localhost:3000
  - service: http_status:404
EOF

        echo -e "${GREEN}✓ Tunnel 配置文件已创建${NC}"

        # 启动 Tunnel 服务
        echo "安装并启动 Tunnel 服务..."
        cloudflared tunnel service install
        systemctl enable cloudflared
        systemctl start cloudflared

        echo -e "${GREEN}✓ Cloudflare Tunnel 已启动${NC}"
    fi
else
    echo "跳过 Tunnel 配置"
fi

# 步骤8：完成
echo ""
echo -e "${YELLOW}[8/8] 部署完成！${NC}"
echo ""
echo "========================================"
echo -e "${GREEN}English Game 已成功部署！${NC}"
echo "========================================"
echo ""
echo "服务状态："
echo ""
echo "English Game:"
pm2 status english-game
echo ""
echo "Cloudflare Tunnel:"
systemctl status cloudflared --no-pager | head -10
echo ""
echo "访问地址："
echo "  本地: http://localhost:3000"
echo "  公网: https://english-game.你的域名.com"
echo ""
echo "测试账号："
echo "  用户名: test"
echo "  密码: 123456"
echo ""
echo "管理命令："
echo "  查看日志: pm2 logs english-game"
echo "  重启服务: pm2 restart english-game"
echo "  停止服务: pm2 stop english-game"
echo ""
echo "========================================"

# 显示日志
echo ""
echo -e "${YELLOW}English Game 启动日志（最近20行）:${NC}"
pm2 logs english-game --lines 20 --nostream
