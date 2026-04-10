# English Game 永久外网部署方案

## 方案概述

将 English Game 部署到云电脑/VPS上，实现永久可用的外网访问。

---

## 方案一：云服务器部署（推荐）

### 1. 服务器选择

| 服务器 | 价格 | 配置 | 推荐度 |
|--------|------|------|--------|
| 阿里云轻量应用服务器 | ¥99/年起 | 1核2G | ⭐⭐⭐⭐⭐ |
| 腾讯云轻量应用服务器 | ¥95/年起 | 1核2G | ⭐⭐⭐⭐⭐ |
| 华为云HECS | ¥99/月起 | 1核2G | ⭐⭐⭐⭐ |
| Vultr | $5/月 | 1核1G | ⭐⭐⭐⭐ |
| DigitalOcean | $5/月 | 1核1G | ⭐⭐⭐⭐ |

### 2. 操作步骤

#### 步骤1：购买并配置云服务器

```bash
# 1. 购买云服务器（选择 Ubuntu 20.04 或 22.04）
# 2. 获取服务器IP地址和密码
# 3. 使用SSH连接服务器
ssh root@你的服务器IP

# 4. 更新系统
apt update && apt upgrade -y

# 5. 安装必要工具
apt install -y curl git nginx certbot python3-certbot-nginx
```

#### 步骤2：安装 Node.js

```bash
# 安装 Node.js 20+
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs

# 验证安装
node --version  # 应显示 v20.x.x
npm --version   # 应显示 10.x.x
```

#### 步骤3：安装 PM2（进程管理器）

```bash
npm install -g pm2

# 设置 PM2 开机自启
pm2 startup
# 复制输出中的命令并执行
```

#### 步骤4：上传项目代码

```bash
# 方法1：使用 Git（推荐）
cd /var/www
git clone https://github.com/你的用户名/english-game.git

# 方法2：使用 SCP上传
# 在本地执行：
scp -r english-game root@服务器IP:/var/www/
```

#### 步骤5：安装依赖和初始化数据库

```bash
cd /var/www/english-game

# 安装依赖
npm install

# 初始化数据库
npx prisma generate
npx prisma db push

# 构建项目
npm run build
```

#### 步骤6：配置环境变量

```bash
# 创建 .env 文件
cat > .env << 'EOF'
DATABASE_URL="file:./prisma/dev.db"
NEXTAUTH_URL="https://你的域名.com"
NEXTAUTH_SECRET="随机生成的长字符串（32位以上）"
NEXTAUTH_TRUST_HOST="true"
PORT=3000
EOF
```

#### 步骤7：使用 PM2 启动服务

```bash
# 启动应用
pm2 start npm --name "english-game" -- start

# 设置开机自启
pm2 save
pm2 startup

# 查看日志
pm2 logs english-game

# 查看状态
pm2 status
```

#### 步骤8：配置 Nginx 反向代理

```bash
# 创建 Nginx 配置文件
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

# 测试配置
nginx -t

# 重启 Nginx
systemctl restart nginx
```

#### 步骤9：配置 HTTPS（SSL证书）

```bash
# 使用 Let's Encrypt 免费证书
certbot --nginx -d 你的域名.com

# 证书会自动配置到 Nginx
# 访问 https://你的域名.com 即可

# 设置证书自动续期
certbot renew --dry-run
```

---

## 方案二：Cloudflare Tunnel（免公网IP）

### 优势
- ✅ 不需要购买云服务器
- ✅ 不需要配置域名解析
- ✅ 免费
- ✅ 自动HTTPS

### 操作步骤

#### 步骤1：在帅比的云电脑上安装 cloudflared

```bash
# 下载并安装
curl -L https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64 -o /usr/local/bin/cloudflared
chmod +x /usr/local/bin/cloudflared

# 验证安装
cloudflared --version
```

#### 步骤2：登录 Cloudflare 账户

```bash
# 在云电脑上执行（需要浏览器）
cloudflared tunnel login

# 会打开浏览器登录 Cloudflare 并授权
```

#### 步骤3：创建 Tunnel

```bash
# 创建命名隧道
cloudflared tunnel create english-game

# 会输出 Tunnel ID，记下来
```

#### 步骤4：配置 Tunnel

```bash
# 创建配置文件
mkdir -p ~/.cloudflared
cat > ~/.cloudflared/config.yml << 'EOF'
tunnel: 你的TunnelID
credentials-file: /root/.cloudflared/你的TunnelID.json

ingress:
  - hostname: 你的域名.com
    service: http://localhost:3000
  - service: http_status:404
EOF
```

#### 步骤5：安装 Tunnel 服务

```bash
# 安装为系统服务
cloudflared tunnel service install

# 启动服务
systemctl start cloudflared
systemctl enable cloudflared
```

#### 步骤6：配置域名 DNS

在 Cloudflare 控制台：
1. 进入你的域名
2. 找到 english-game tunnel
3. Cloudflare 会自动添加 CNAME 记录

#### 步骤7：启动 English Game

```bash
cd /workspace/projects/english-game
npm run build
pm2 start npm --name "english-game" -- start
```

---

## 方案三：Docker 容器部署

### 优势
- ✅ 环境隔离
- ✅ 部署简单
- ✅ 易于迁移

### 操作步骤

#### 步骤1：创建 Dockerfile

```dockerfile
# /workspace/projects/english-game/Dockerfile
FROM node:20-alpine

# 设置工作目录
WORKDIR /app

# 复制依赖文件
COPY package*.json ./
COPY prisma ./prisma/

# 安装依赖
RUN npm ci

# 复制源代码
COPY . .

# 生成 Prisma Client
RUN npx prisma generate

# 构建应用
RUN npm run build

# 暴露端口
EXPOSE 3000

# 启动应用
CMD ["npm", "start"]
```

#### 步骤2：创建 docker-compose.yml

```yaml
version: '3.8'

services:
  english-game:
    build: .
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=file:./prisma/dev.db
      - NEXTAUTH_URL=https://你的域名.com
      - NEXTAUTH_SECRET=随机密钥
      - NEXTAUTH_TRUST_HOST=true
    restart: unless-stopped
```

#### 步骤3：构建并运行

```bash
# 构建镜像
docker-compose build

# 启动服务
docker-compose up -d

# 查看日志
docker-compose logs -f

# 停止服务
docker-compose down
```

---

## 常见问题

### Q1: 如何更新代码？

```bash
# 使用 Git
cd /var/www/english-game
git pull
npm install
npx prisma db push
npm run build
pm2 restart english-game
```

### Q2: 如何备份数据库？

```bash
# 备份数据库
cp /var/www/english-game/prisma/dev.db /backup/dev.db.$(date +%Y%m%d)

# 恢复数据库
cp /backup/dev.db.20240401 /var/www/english-game/prisma/dev.db
```

### Q3: 如何查看日志？

```bash
# PM2 日志
pm2 logs english-game

# Nginx 日志
tail -f /var/log/nginx/access.log
tail -f /var/log/nginx/error.log
```

### Q4: 域名如何配置？

1. 在阿里云/腾讯云购买域名（约50-80元/年）
2. 在域名服务商添加 DNS 解析
3. 使用 Cloudflare（免费）加速并配置 SSL

### Q5: 如何优化性能？

```bash
# 1. 启用 gzip 压缩
# 在 Nginx 配置中添加：
gzip on;
gzip_types text/plain text/css application/json application/javascript;

# 2. 启用缓存
# 在 Nginx 配置中添加：
location ~* \.(jpg|jpeg|png|gif|ico|css|js)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}

# 3. PM2 集群模式
pm2 start npm --name "english-game" -- start -i max
```

---

## 成本估算

| 方案 | 服务器/域名 | 证书 | 总成本/年 |
|------|------------|------|-----------|
| 云服务器 | ¥99-300 | 免费 | ¥99-300 |
| Cloudflare Tunnel | ¥50-80（域名） | 免费 | ¥50-80 |
| Docker | ¥99-300 | 免费 | ¥99-300 |

---

## 推荐方案

**新手推荐**：方案二（Cloudflare Tunnel）
- 成本低（仅域名费用）
- 配置简单
- 自动HTTPS

**专业推荐**：方案一（云服务器 + Nginx）
- 性能更好
- 更灵活的控制
- 可部署多个项目

---

## 快速部署脚本

一键部署脚本（适用于 Ubuntu 20.04+）：

```bash
#!/bin/bash
# 在云服务器上执行

# 安装 Node.js
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs nginx

# 安装 PM2
npm install -g pm2
pm2 startup

# 克隆项目
cd /var/www
git clone https://github.com/你的用户名/english-game.git
cd english-game

# 安装依赖
npm install
npx prisma generate
npx prisma db push
npm run build

# 配置环境变量
read -p "输入域名: " DOMAIN
read -p "输入NEXTAUTH_SECRET: " SECRET

cat > .env << EOF
DATABASE_URL="file:./prisma/dev.db"
NEXTAUTH_URL="https://$DOMAIN"
NEXTAUTH_SECRET="$SECRET"
NEXTAUTH_TRUST_HOST="true"
PORT=3000
EOF

# 启动服务
pm2 start npm --name "english-game" -- start
pm2 save

# 配置 Nginx
cat > /etc/nginx/sites-available/english-game << EOF
server {
    listen 80;
    server_name $DOMAIN;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
    }
}
EOF

ln -s /etc/nginx/sites-available/english-game /etc/nginx/sites-enabled/
nginx -t && systemctl restart nginx

# 安装 SSL
certbot --nginx -d $DOMAIN

echo "部署完成！访问 https://$DOMAIN"
```

---

## 完成检查清单

- [ ] 购买云服务器或域名
- [ ] 安装 Node.js 和 PM2
- [ ] 上传项目代码
- [ ] 安装依赖并构建
- [ ] 配置环境变量
- [ ] 使用 PM2 启动服务
- [ ] 配置 Nginx 反向代理
- [ ] 配置 SSL 证书
- [ ] 测试网站访问
- [ ] 设置数据库自动备份
- [ ] 配置监控告警（可选）
