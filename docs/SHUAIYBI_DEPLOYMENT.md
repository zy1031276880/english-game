# English Game 帅比云电脑部署指南

## 📋 前提条件

1. 拥有一台帅比的云电脑（已配置 SSH 访问）
2. 已购买一个域名（可选，使用 Cloudflare 免费域名）
3. 已注册 Cloudflare 账户（免费）

---

## 🚀 方案选择

### 方案A：Cloudflare Tunnel（推荐新手）
- ✅ 免费使用
- ✅ 不需要配置 DNS
- ✅ 自动 HTTPS
- ✅ 配置简单

### 方案B：云服务器 + 域名
- ✅ 性能更好
- ✅ 更灵活
- ⚠️ 需要购买服务器（¥99/年起）

---

## 📝 方案A：Cloudflare Tunnel 部署步骤

### 步骤1：登录帅比云电脑

```bash
# SSH 连接到云电脑
ssh root@你的云电脑IP

# 或者使用帅比的云电脑终端
```

### 步骤2：上传 English Game 项目

```bash
# 方法1：使用 Git（如果有 Git 仓库）
cd /workspace/projects
git clone https://github.com/你的用户名/english-game.git

# 方法2：使用 SCP（从本地上传）
scp -r /path/to/english-game root@云电脑IP:/workspace/projects/

# 方法3：直接在云电脑上已有
# 跳过此步骤
```

### 步骤3：运行快速部署脚本

```bash
# 进入项目目录
cd /workspace/projects/english-game

# 赋予脚本执行权限
chmod +x scripts/deploy.sh

# 执行部署脚本
./scripts/deploy.sh
```

### 步骤4：配置 Cloudflare Tunnel

#### 在你的电脑上：

1. 访问 https://dash.cloudflare.com/
2. 登录你的 Cloudflare 账户
3. 点击左侧菜单 "Zero Trust" > "Networks" > "Tunnels"
4. 点击 "Create a tunnel"
5. 命名为 "english-game"
6. 选择 "Cloudflared"
7. 复制登录命令：
   ```bash
   cloudflared tunnel login
   ```
8. 在你的电脑上执行此命令（会打开浏览器授权）
9. 授权后，复制创建 tunnel 的命令：
   ```bash
   cloudflared tunnel create english-game
   ```
10. 在云电脑上执行此命令，获得 Tunnel ID

#### 在云电脑上：

```bash
# 设置 Tunnel ID（替换为你的实际 ID）
export TUNNEL_ID="你的TunnelID"

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

# 安装并启动 Tunnel 服务
cloudflared tunnel service install

# 启动服务
systemctl enable cloudflared
systemctl start cloudflared

# 检查状态
systemctl status cloudflared
```

### 步骤5：配置域名 DNS

1. 在 Cloudflare 控制台，选择你的域名
2. 点击 "DNS" > "Records"
3. 查找 "english-game" tunnel
4. Cloudflare 会自动添加 CNAME 记录
5. 等待 DNS 生效（通常需要 5-10 分钟）

### 步骤6：访问测试

```bash
# 等待 5-10 分钟后，访问以下地址：
https://english-game.你的域名.com
```

---

## 📝 方案B：云服务器部署步骤

### 步骤1：购买云服务器

推荐服务商：
- 阿里云轻量应用服务器：¥99/年起（1核2G）
- 腾讯云轻量应用服务器：¥95/年起（1核2G）
- 华为云 HECS：¥99/年起（1核2G）

选择系统：Ubuntu 20.04 或 22.04

### 步骤2：配置服务器

```bash
# SSH 连接到服务器
ssh root@服务器IP

# 更新系统
apt update && apt upgrade -y

# 安装 Node.js
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs

# 安装 PM2
npm install -g pm2
pm2 startup

# 安装 Nginx
apt install -y nginx
```

### 步骤3：上传项目

```bash
# 创建项目目录
mkdir -p /var/www
cd /var/www

# 使用 Git 克隆或上传项目
git clone https://github.com/你的用户名/english-game.git
cd english-game
```

### 步骤4：配置和启动

```bash
# 安装依赖
npm install

# 初始化数据库
npx prisma generate
npx prisma db push

# 构建项目
npm run build

# 配置环境变量
cat > .env << EOF
DATABASE_URL="file:./prisma/dev.db"
NEXTAUTH_URL="https://你的域名.com"
NEXTAUTH_SECRET="$(openssl rand -base64 32)"
NEXTAUTH_TRUST_HOST="true"
PORT=3000
EOF

# 启动应用
pm2 start npm --name "english-game" -- start
pm2 save
```

### 步骤5：配置 Nginx

```bash
# 创建 Nginx 配置
cat > /etc/nginx/sites-available/english-game << 'EOF'
server {
    listen 80;
    server_name 你的域名.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
EOF

# 启用配置
ln -s /etc/nginx/sites-available/english-game /etc/nginx/sites-enabled/
nginx -t
systemctl restart nginx
```

### 步骤6：配置 HTTPS

```bash
# 安装 Let's Encrypt 证书
certbot --nginx -d 你的域名.com

# 按照提示操作，证书会自动配置
```

### 步骤7：配置域名 DNS

1. 在域名服务商后台（阿里云、腾讯云等）
2. 找到域名管理 > DNS 解析
3. 添加 A 记录：
   - 主机记录：`@` 或 `www`
   - 记录类型：A
   - 记录值：你的服务器 IP
   - TTL：10 分钟
4. 保存并等待 DNS 生效（5-10 分钟）

---

## 🔍 验证部署

### 检查服务状态

```bash
# English Game 服务
pm2 status english-game
pm2 logs english-game

# Cloudflare Tunnel（方案A）
systemctl status cloudflared

# Nginx（方案B）
systemctl status nginx

# 端口监听
netstat -tlnp | grep :3000
```

### 测试访问

```bash
# 本地测试
curl -I http://localhost:3000

# 公网测试
curl -I https://你的域名.com
```

---

## 📊 常见问题

### Q1: cloudflared 无法启动

```bash
# 检查配置文件
cat ~/.cloudflared/config.yml

# 查看日志
journalctl -u cloudflared -f

# 手动启动测试
cloudflared tunnel run
```

### Q2: PM2 服务无法启动

```bash
# 查看错误日志
pm2 logs english-game --err

# 重新启动
pm2 delete english-game
pm2 start npm --name "english-game" -- start
```

### Q3: 域名无法访问

```bash
# 检查 DNS 解析
dig 你的域名.com

# 检查防火墙
ufw status
ufw allow 80/tcp
ufw allow 443/tcp

# 检查 Nginx 配置
nginx -t
systemctl restart nginx
```

### Q4: 更新代码

```bash
# 拉取最新代码
git pull

# 重新安装依赖
npm install

# 更新数据库
npx prisma db push

# 重新构建
npm run build

# 重启服务
pm2 restart english-game
```

---

## 💡 优化建议

### 1. 自动备份

```bash
# 添加到 crontab，每天凌晨 3 点备份
0 3 * * * cp /workspace/projects/english-game/prisma/dev.db /backup/dev.db.$(date +\%Y\%m\%d)
```

### 2. 监控告警

使用 Uptime Robot（免费）监控网站可用性：https://uptimerobot.com/

### 3. 性能优化

```bash
# PM2 集群模式（多核利用）
pm2 start npm --name "english-game" -- start -i max

# Nginx 启用 gzip
# 在 /etc/nginx/nginx.conf 中添加：
gzip on;
gzip_types text/plain text/css application/json application/javascript text/xml application/xml;
```

---

## 📞 技术支持

如遇到问题，检查以下日志：

```bash
# English Game 日志
pm2 logs english-game

# Cloudflare Tunnel 日志
journalctl -u cloudflared -f

# Nginx 日志
tail -f /var/log/nginx/error.log
tail -f /var/log/nginx/access.log
```

---

## ✅ 部署检查清单

- [ ] 已上传 English Game 项目代码
- [ ] 已安装 Node.js 和 PM2
- [ ] 已安装依赖并构建项目
- [ ] 已配置环境变量
- [ ] PM2 服务已启动
- [ ] 已配置 Cloudflare Tunnel 或 Nginx
- [ ] 已配置域名 DNS
- [ ] 已测试 HTTPS 访问
- [ ] 已设置自动备份
- [ ] 已配置监控告警（可选）

---

部署完成后，English Game 将可以通过以下地址永久访问：

**方案A（Cloudflare Tunnel）**：
```
https://english-game.你的域名.com
```

**方案B（云服务器）**：
```
https://你的域名.com
```

测试账号：
- 用户名：test
- 密码：123456

祝你部署成功！🎉
