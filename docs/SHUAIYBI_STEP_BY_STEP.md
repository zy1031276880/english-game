# 帅比云电脑 English Game 永久外网部署详细指南

## 📋 环境信息

帅比云电脑当前环境：

| 组件 | 版本/状态 |
|------|----------|
| 操作系统 | Ubuntu 24.04 LTS |
| Node.js | v24.13.1 |
| npm | v11.8.0 |
| PM2 | ❌ 需要安装 |
| cloudflared | ✅ 2026.3.0 |
| English Game | ✅ 已存在 |

---

## 📦 需要安装的软件

### 1. PM2（进程管理器）

**作用**：管理 Node.js 应用进程，实现开机自启动、自动重启、日志管理等。

**安装命令**：
```bash
npm install -g pm2
```

**验证安装**：
```bash
pm2 --version
```

### 2. 其他软件（已安装）

- ✅ Node.js v24.13.1
- ✅ npm v11.8.0
- ✅ cloudflared 2026.3.0

---

## 🚀 具体部署步骤

### 方式一：使用自动化脚本（推荐）

```bash
# 1. 赋予脚本执行权限
chmod +x /workspace/projects/english-game/scripts/deploy-shuaibi.sh

# 2. 执行部署脚本
bash /workspace/projects/english-game/scripts/deploy-shuaibi.sh

# 3. 按照提示完成配置
```

### 方式二：手动部署（适合了解原理）

#### 步骤1：安装 PM2

```bash
# 全局安装 PM2
npm install -g pm2

# 验证安装
pm2 --version

# 设置 PM2 开机自启
pm2 startup systemd -u root --hp /root

# 复制并执行输出的命令（例如）：
# env PATH=$PATH:/usr/bin pm2 startup systemd -u root --hp /root
```

#### 步骤2：配置 English Game

```bash
# 进入项目目录
cd /workspace/projects/english-game

# 确保依赖已安装
npm install

# 生成 Prisma Client
npx prisma generate

# 确保数据库文件存在
cp prisma/dev.db dev.db 2>/dev/null || touch dev.db

# 构建项目
npm run build
```

#### 步骤3：配置环境变量

```bash
# 创建 .env 文件
cat > /workspace/projects/english-game/.env << 'EOF'
DATABASE_URL="file:./dev.db"
NEXTAUTH_URL="https://english-game.你的域名.com"
NEXTAUTH_SECRET="english-game-secret-2024"
NEXTAUTH_TRUST_HOST="true"
PORT=3000
EOF
```

**环境变量说明**：

| 变量 | 值 | 说明 |
|------|-----|------|
| `DATABASE_URL` | `file:./dev.db` | SQLite 数据库路径 |
| `NEXTAUTH_URL` | `https://english-game.你的域名.com` | 你的域名 |
| `NEXTAUTH_SECRET` | 随机字符串 | NextAuth 密钥 |
| `NEXTAUTH_TRUST_HOST` | `true` | 信任代理头 |
| `PORT` | `3000` | 应用端口 |

#### 步骤4：使用 PM2 启动 English Game

```bash
# 进入项目目录
cd /workspace/projects/english-game

# 停止现有进程（如果有）
pm2 delete english-game 2>/dev/null || true

# 启动应用
pm2 start npm --name "english-game" -- start

# 保存进程列表
pm2 save

# 查看状态
pm2 status

# 查看日志
pm2 logs english-game
```

**PM2 命令说明**：

| 命令 | 说明 |
|------|------|
| `pm2 start <command>` | 启动应用 |
| `pm2 stop <name>` | 停止应用 |
| `pm2 restart <name>` | 重启应用 |
| `pm2 delete <name>` | 删除应用 |
| `pm2 logs <name>` | 查看日志 |
| `pm2 status` | 查看所有应用状态 |
| `pm2 save` | 保存当前进程列表 |
| `pm2 startup` | 配置开机自启 |

#### 步骤5：配置 Cloudflare Tunnel

**5.1 在你的电脑上登录 Cloudflare**

```bash
# 在你的电脑上执行（会打开浏览器）
cloudflared tunnel login

# 登录你的 Cloudflare 账户并授权
```

**5.2 创建 Tunnel**

```bash
# 在你的电脑或云电脑上执行
cloudflared tunnel create english-game

# 会输出 Tunnel ID，记下来
# 例如：你的TunnelID
```

**5.3 在云电脑上配置 Tunnel**

```bash
# 创建配置目录
mkdir -p ~/.cloudflared

# 创建配置文件
cat > ~/.cloudflared/config.yml << 'EOF'
tunnel: 你的TunnelID
credentials-file: /root/.cloudflared/你的TunnelID.json

ingress:
  - hostname: english-game.你的域名.com
    service: http://localhost:3000
  - service: http_status:404
EOF

# 替换 "你的TunnelID" 为实际的 Tunnel ID
```

**配置文件说明**：

```yaml
tunnel: 你的TunnelID                    # Tunnel ID
credentials-file: /root/.cloudflared/你的TunnelID.json  # 证书文件路径

ingress:                                # 入口规则
  - hostname: english-game.你的域名.com  # 你的域名
    service: http://localhost:3000     # 转发到本地 3000 端口
  - service: http_status:404           # 其他请求返回 404
```

**5.4 安装并启动 Tunnel 服务**

```bash
# 安装为系统服务
cloudflared tunnel service install

# 启动服务
systemctl enable cloudflared
systemctl start cloudflared

# 检查状态
systemctl status cloudflared

# 查看日志
journalctl -u cloudflared -f
```

#### 步骤6：配置域名 DNS

1. 登录 Cloudflare 控制台：https://dash.cloudflare.com/
2. 选择你的域名
3. 进入 "DNS" > "Records"
4. Cloudflare 会自动添加 CNAME 记录：
   - 名称：`english-game`
   - 类型：`CNAME`
   - 目标：自动生成
5. 等待 DNS 生效（5-10 分钟）

---

## 🔧 配置开机自启动

### PM2 开机自启动

```bash
# 配置 PM2 开机自启（只需执行一次）
pm2 startup systemd -u root --hp /root

# 会输出类似以下内容：
# [PM2] Init System found: systemd
# [PM2] To setup the Startup Script, copy/paste the following command:
# sudo env PATH=$PATH:/usr/bin pm2 startup systemd -u root --hp /root

# 复制输出的命令并执行
# 例如：
# sudo env PATH=$PATH:/usr/bin pm2 startup systemd -u root --hp /root
```

**验证 PM2 开机自启**：

```bash
# 检查 systemd 服务
systemctl status pm2-root

# 查看服务文件
cat /etc/systemd/system/pm2-root.service
```

### Cloudflare Tunnel 开机自启

```bash
# 启用服务（已在步骤5配置）
systemctl enable cloudflared

# 启动服务
systemctl start cloudflared

# 检查状态
systemctl status cloudflared
```

**验证 Cloudflare Tunnel 开机自启**：

```bash
# 查看服务状态
systemctl is-enabled cloudflared
# 输出：enabled

# 查看服务是否运行
systemctl is-active cloudflared
# 输出：active
```

---

## 📊 验证部署

### 检查服务状态

```bash
# 检查 English Game
pm2 status english-game
pm2 logs english-game

# 检查 Cloudflare Tunnel
systemctl status cloudflared
journalctl -u cloudflared -n 20

# 检查端口监听
ss -tlnp | grep :3000

# 测试本地访问
curl -I http://localhost:3000
```

### 测试外网访问

```bash
# 方法1：使用临时 URL
cloudflared tunnel --url http://localhost:3000
# 会输出临时 URL，例如：https://abc-def-ghi.trycloudflare.com

# 方法2：使用配置的域名
curl -I https://english-game.你的域名.com
```

---

## 📝 管理命令

### English Game 管理

```bash
# 查看状态
pm2 status english-game

# 查看日志
pm2 logs english-game

# 重启服务
pm2 restart english-game

# 停止服务
pm2 stop english-game

# 删除服务
pm2 delete english-game

# 查看详细信息
pm2 describe english-game
```

### Cloudflare Tunnel 管理

```bash
# 查看状态
systemctl status cloudflared

# 查看日志
journalctl -u cloudflared -f

# 重启服务
systemctl restart cloudflared

# 停止服务
systemctl stop cloudflared

# 启动服务
systemctl start cloudflared

# 手动运行（调试用）
cloudflared tunnel run
```

---

## 🔍 常见问题

### Q1: PM2 开机自启不生效

**解决方法**：

```bash
# 重新配置 PM2 开机自启
pm2 delete all  # 清空所有进程
pm2 save       # 保存空列表

# 重新配置
pm2 startup systemd -u root --hp /root
# 复制并执行输出中的命令

# 重新启动应用
cd /workspace/projects/english-game
pm2 start npm --name "english-game" -- start
pm2 save
```

### Q2: Cloudflare Tunnel 无法启动

**解决方法**：

```bash
# 检查配置文件
cat ~/.cloudflared/config.yml

# 检查证书文件
ls -la ~/.cloudflared/

# 查看详细日志
journalctl -u cloudflared -n 50 --no-pager

# 手动运行测试
cloudflared tunnel run
```

### Q3: 域名无法访问

**解决方法**：

```bash
# 检查 English Game 是否运行
pm2 status english-game

# 检查 Cloudflare Tunnel 是否运行
systemctl status cloudflared

# 检查 DNS 解析
dig english-game.你的域名.com

# 查看端口监听
ss -tlnp | grep :3000

# 测试本地访问
curl -v http://localhost:3000
```

### Q4: 如何更新代码

```bash
# 进入项目目录
cd /workspace/projects/english-game

# 拉取最新代码（如果是 Git）
git pull

# 重新安装依赖
npm install

# 重新构建
npm run build

# 重启服务
pm2 restart english-game
```

---

## 🎯 快速开始总结

### 一键部署命令

```bash
# 使用自动化脚本
chmod +x /workspace/projects/english-game/scripts/deploy-shuaibi.sh
bash /workspace/projects/english-game/scripts/deploy-shuaibi.sh
```

### 手动部署命令

```bash
# 1. 安装 PM2
npm install -g pm2
pm2 startup systemd -u root --hp /root

# 2. 配置 English Game
cd /workspace/projects/english-game
npm install
npx prisma generate
npm run build

# 3. 配置环境变量
cat > .env << 'EOF'
DATABASE_URL="file:./dev.db"
NEXTAUTH_URL="https://english-game.你的域名.com"
NEXTAUTH_SECRET="english-game-secret-2024"
NEXTAUTH_TRUST_HOST="true"
PORT=3000
EOF

# 4. 启动应用
pm2 start npm --name "english-game" -- start
pm2 save

# 5. 配置 Cloudflare Tunnel（参考上文）
```

---

## ✅ 部署检查清单

- [ ] PM2 已安装并配置开机自启
- [ ] English Game 已使用 PM2 启动
- [ ] 环境变量已正确配置
- [ ] Cloudflare Tunnel 已配置
- [ ] 域名 DNS 已添加
- [ ] 服务可以本地访问
- [ ] 服务可以外网访问
- [ ] PM2 和 Cloudflare Tunnel 开机自启已启用

---

## 📞 访问信息

部署完成后，可以通过以下地址访问：

**本地访问**：
```
http://localhost:3000
```

**公网访问**：
```
https://english-game.你的域名.com
```

**临时 URL**（未配置域名时）：
```bash
cloudflared tunnel --url http://localhost:3000
```

---

## 🎉 测试账号

- 用户名：`test`
- 密码：`123456`

祝你部署成功！🎊
