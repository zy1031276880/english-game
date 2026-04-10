# 帅比云电脑 English Game 部署快速参考

## 🎯 一键部署

```bash
bash /workspace/projects/english-game/scripts/deploy-shuaibi.sh
```

---

## 📦 环境信息

| 组件 | 状态 |
|------|------|
| 系统 | Ubuntu 24.04 LTS |
| Node.js | ✅ v24.13.1 |
| npm | ✅ v11.8.0 |
| PM2 | ❌ 需安装 |
| cloudflared | ✅ 2026.3.0 |

---

## 🚀 手动部署命令

### 1. 安装 PM2

```bash
npm install -g pm2
pm2 startup systemd -u root --hp /root
# 复制并执行输出的命令
pm2 save
```

### 2. 配置项目

```bash
cd /workspace/projects/english-game
npm install
npx prisma generate
npm run build
```

### 3. 配置环境变量

```bash
cat > .env << 'EOF'
DATABASE_URL="file:./dev.db"
NEXTAUTH_URL="https://english-game.你的域名.com"
NEXTAUTH_SECRET="english-game-secret-2024"
NEXTAUTH_TRUST_HOST="true"
PORT=3000
EOF
```

### 4. 启动 English Game

```bash
pm2 start npm --name "english-game" -- start
pm2 save
pm2 status
```

### 5. 配置 Cloudflare Tunnel

```bash
# 5.1 在你的电脑上登录
cloudflared tunnel login

# 5.2 创建 Tunnel（记下 ID）
cloudflared tunnel create english-game

# 5.3 在云电脑上配置
mkdir -p ~/.cloudflared
cat > ~/.cloudflared/config.yml << 'EOF'
tunnel: 你的TunnelID
credentials-file: /root/.cloudflared/你的TunnelID.json

ingress:
  - hostname: english-game.你的域名.com
    service: http://localhost:3000
  - service: http_status:404
EOF

# 5.4 启动服务
cloudflared tunnel service install
systemctl enable cloudflared
systemctl start cloudflared
```

---

## 🔧 常用管理命令

### PM2 管理

| 命令 | 说明 |
|------|------|
| `pm2 status` | 查看所有应用 |
| `pm2 logs english-game` | 查看日志 |
| `pm2 restart english-game` | 重启应用 |
| `pm2 stop english-game` | 停止应用 |
| `pm2 delete english-game` | 删除应用 |
| `pm2 save` | 保存进程列表 |

### Cloudflare Tunnel 管理

| 命令 | 说明 |
|------|------|
| `systemctl status cloudflared` | 查看状态 |
| `journalctl -u cloudflared -f` | 查看日志 |
| `systemctl restart cloudflared` | 重启服务 |
| `systemctl stop cloudflared` | 停止服务 |
| `systemctl start cloudflared` | 启动服务 |

---

## 🔍 验证部署

```bash
# 检查服务状态
pm2 status english-game
systemctl status cloudflared

# 检查端口
ss -tlnp | grep :3000

# 测试访问
curl -I http://localhost:3000
curl -I https://english-game.你的域名.com
```

---

## 📱 访问地址

| 类型 | 地址 |
|------|------|
| 本地 | http://localhost:3000 |
| 公网 | https://english-game.你的域名.com |
| 临时 | `cloudflared tunnel --url http://localhost:3000` |

---

## 👤 测试账号

```
用户名：test
密码：123456
```

---

## ❓ 快速诊断

### English Game 无法访问

```bash
# 检查 PM2
pm2 status
pm2 logs english-game

# 检查端口
ss -tlnp | grep :3000

# 重启应用
pm2 restart english-game
```

### Tunnel 无法访问

```bash
# 检查配置
cat ~/.cloudflared/config.yml

# 检查状态
systemctl status cloudflared
journalctl -u cloudflared -n 20

# 重启服务
systemctl restart cloudflared
```

### PM2 开机不启动

```bash
# 重新配置
pm2 delete all
pm2 save
pm2 startup systemd -u root --hp /root
# 复制并执行输出的命令

# 重新启动应用
cd /workspace/projects/english-game
pm2 start npm --name "english-game" -- start
pm2 save
```

---

## 📊 开机自启动验证

```bash
# PM2
systemctl is-enabled pm2-root
systemctl is-active pm2-root

# Cloudflare Tunnel
systemctl is-enabled cloudflared
systemctl is-active cloudflared
```

---

## 🎯 完整检查清单

- [ ] PM2 已安装
- [ ] PM2 开机自启已配置
- [ ] English Game 使用 PM2 启动
- [ ] 环境变量已配置
- [ ] Cloudflare Tunnel 已配置
- [ ] 域名 DNS 已添加
- [ ] 服务可本地访问
- [ ] 服务可外网访问
- [ ] PM2 开机自启生效
- [ ] Tunnel 开机自启生效

---

**详细文档**: [SHUAIYBI_STEP_BY_STEP.md](SHUAIYBI_STEP_BY_STEP.md)
