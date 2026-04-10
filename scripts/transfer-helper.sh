#!/bin/bash
# English Game 项目传输助手
# 帮助用户将项目传输到帅比云电脑

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo ""
echo "========================================"
echo "📦 English Game 项目传输助手"
echo "========================================"
echo ""

# 检查压缩包
if [ ! -f "/tmp/english-game-complete.tar.gz" ]; then
    echo -e "${RED}✗ 压缩包不存在，正在创建...${NC}"
    cd /workspace/projects
    tar --exclude='node_modules' --exclude='.next' \
        --exclude='.git' --exclude='*.log' \
        --exclude='prisma/dev.db' --exclude='dev.db' \
        -czf /tmp/english-game-complete.tar.gz english-game/
    echo -e "${GREEN}✓ 压缩包创建成功${NC}"
fi

# 显示压缩包信息
echo -e "${BLUE}📦 压缩包信息${NC}"
echo "  文件路径: /tmp/english-game-complete.tar.gz"
echo "  文件大小: $(ls -lh /tmp/english-game-complete.tar.gz | awk '{print $5}')"
echo "  MD5校验和: $(md5sum /tmp/english-game-complete.tar.gz | awk '{print $1}')"
echo ""

# 获取本机IP
echo -e "${BLUE}🌐 本机信息${NC}"
LOCAL_IP=$(hostname -I | awk '{print $1}')
echo "  IP地址: $LOCAL_IP"
echo ""

# 菜单选择
echo "========================================"
echo "请选择传输方式："
echo "========================================"
echo ""
echo "1) SCP 传输（推荐）"
echo "2) HTTP 下载"
echo "3) 查看压缩包内容"
echo "4) 验证压缩包完整性"
echo "5) 显示部署脚本"
echo "6) 退出"
echo ""

read -p "请输入选项 [1-6]: " choice

case $choice in
    1)
        echo ""
        echo -e "${BLUE}📋 SCP 传输步骤${NC}"
        echo ""
        echo "步骤1：在帅比云电脑上确保 SSH 服务运行"
        echo "  systemctl status ssh"
        echo ""
        echo "步骤2：在当前环境执行以下命令"
        echo "  scp /tmp/english-game-complete.tar.gz root@帅比云电脑IP:/root/"
        echo ""
        read -p "请输入帅比云电脑IP地址: " CLOUD_IP
        if [ -n "$CLOUD_IP" ]; then
            echo ""
            echo -e "${YELLOW}正在执行...${NC}"
            scp /tmp/english-game-complete.tar.gz "root@${CLOUD_IP}:/root/"
            if [ $? -eq 0 ]; then
                echo -e "${GREEN}✓ 传输成功！${NC}"
                echo ""
                echo "现在在云电脑上执行部署命令："
                echo "  ssh root@${CLOUD_IP}"
                echo "  cd /root && tar -xzf english-game-complete.tar.gz"
                echo "  mv english-game /workspace/projects/"
                echo "  cd /workspace/projects/english-game && npm install"
                echo "  npx prisma db push"
                echo "  pm2 start npm --name \"english-game\" -- start"
            else
                echo -e "${RED}✗ 传输失败，请检查：${NC}"
                echo "  1. 云电脑IP地址是否正确"
                echo "  2. SSH服务是否运行"
                echo "  3. 网络连接是否正常"
            fi
        fi
        ;;

    2)
        echo ""
        echo -e "${BLUE}📋 HTTP 下载步骤${NC}"
        echo ""
        echo "步骤1：在当前环境启动 HTTP 服务"
        echo "  cd /tmp && python3 -m http.server 8000"
        echo ""

        read -p "是否现在启动HTTP服务？(y/n) " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            echo ""
            echo -e "${YELLOW}正在启动 HTTP 服务...${NC}"
            echo ""
            echo "HTTP 服务已启动在: http://$LOCAL_IP:8000"
            echo ""
            echo "在帅比云电脑上执行以下命令下载："
            echo "  cd /root"
            echo "  wget http://$LOCAL_IP:8000/english-game-complete.tar.gz"
            echo ""
            echo "下载完成后，继续执行："
            echo "  tar -xzf english-game-complete.tar.gz"
            echo "  mv english-game /workspace/projects/"
            echo ""
            echo "按 Ctrl+C 停止 HTTP 服务"
            echo ""

            cd /tmp
            python3 -m http.server 8000
        else
            echo -e "${YELLOW}已取消启动 HTTP 服务${NC}"
            echo ""
            echo "手动启动命令："
            echo "  cd /tmp && python3 -m http.server 8000"
            echo ""
            echo "然后在云电脑上下载："
            echo "  wget http://$LOCAL_IP:8000/english-game-complete.tar.gz"
        fi
        ;;

    3)
        echo ""
        echo -e "${BLUE}📋 压缩包内容${NC}"
        echo ""
        tar -tzf /tmp/english-game-complete.tar.gz | head -40
        echo "... (共 $(tar -tzf /tmp/english-game-complete.tar.gz | wc -l) 个文件/目录)"
        ;;

    4)
        echo ""
        echo -e "${BLUE}📋 验证压缩包${NC}"
        echo ""

        # 计算MD5
        CURRENT_MD5=$(md5sum /tmp/english-game-complete.tar.gz | awk '{print $1}')
        EXPECTED_MD5="ec8049df41f82ae3412bbba382442376"

        echo "MD5校验和："
        echo "  当前值: $CURRENT_MD5"
        echo "  期望值: $EXPECTED_MD5"
        echo ""

        if [ "$CURRENT_MD5" = "$EXPECTED_MD5" ]; then
            echo -e "${GREEN}✓ 压缩包完整${NC}"
        else
            echo -e "${RED}✗ 压缩包可能已损坏${NC}"
            echo ""
            read -p "是否重新创建压缩包？(y/n) " -n 1 -r
            echo
            if [[ $REPLY =~ ^[Yy]$ ]]; then
                cd /workspace/projects
                rm -f /tmp/english-game-complete.tar.gz
                tar --exclude='node_modules' --exclude='.next' \
                    --exclude='.git' --exclude='*.log' \
                    --exclude='prisma/dev.db' --exclude='dev.db' \
                    -czf /tmp/english-game-complete.tar.gz english-game/
                NEW_MD5=$(md5sum /tmp/english-game-complete.tar.gz | awk '{print $1}')
                echo "新MD5: $NEW_MD5"
            fi
        fi
        ;;

    5)
        echo ""
        echo -e "${BLUE}📋 部署脚本（在云电脑上执行）${NC}"
        echo ""
        cat << 'SCRIPT'
#!/bin/bash
# 在帅比云电脑上执行此脚本

cd /root

# 解压项目
tar -xzf english-game-complete.tar.gz
mv english-game /workspace/projects/

# 进入项目目录
cd /workspace/projects/english-game

# 安装依赖
npm install

# 初始化数据库
npx prisma generate
npx prisma db push

# 配置环境变量
cat > .env << 'EOF'
DATABASE_URL="file:./dev.db"
NEXTAUTH_URL="https://english-game.你的域名.com"
NEXTAUTH_SECRET="english-game-secret-2024"
NEXTAUTH_TRUST_HOST="true"
PORT=3000
EOF

# 安装并配置 PM2
npm install -g pm2
pm2 startup systemd -u root --hp /root

# 启动应用
pm2 start npm --name "english-game" -- start
pm2 save

# 验证
pm2 status
curl -I http://localhost:3000

echo ""
echo "✓ 部署完成！"
echo "访问地址: http://localhost:3000"
SCRIPT
        ;;

    6)
        echo ""
        echo -e "${GREEN}再见！${NC}"
        exit 0
        ;;

    *)
        echo ""
        echo -e "${RED}无效选项${NC}"
        exit 1
        ;;
esac

echo ""
echo -e "${BLUE}📖 查看详细文档${NC}"
echo "  传输指南: cat /workspace/projects/english-game/TRANSFER_GUIDE.md"
echo "  部署指南: cat /workspace/projects/english-game/docs/SHUAIYBI_STEP_BY_STEP.md"
echo "  快速参考: cat /workspace/projects/english-game/QUICK_REFERENCE.md"
echo ""
