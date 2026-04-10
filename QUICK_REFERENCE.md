# English Game 项目快速参考

## 📦 压缩包信息

| 项目 | 值 |
|------|-----|
| 文件路径 | `/tmp/english-game-complete.tar.gz` |
| 文件大小 | 133 KB |
| 文件数量 | 89个文件/目录 |
| MD5校验和 | `ec8049df41f82ae3412bbba382442376` |

---

## 🚀 快速传输（3选1）

### 方式1：SCP（推荐）

```bash
# 在当前环境执行
scp /tmp/english-game-complete.tar.gz root@帅比云电脑IP:/root/
```

### 方式2：HTTP下载

```bash
# 步骤1：在当前环境启动HTTP服务
cd /tmp && python3 -m http.server 8000

# 步骤2：在云电脑上下载
cd /root
wget http://当前环境IP:8000/english-game-complete.tar.gz
```

### 方式3：手动上传

1. 使用 WinSCP/FileZilla 等工具
2. 下载：`/tmp/english-game-complete.tar.gz`
3. 上传到云电脑：`/root/`

---

## 🔧 在云电脑上部署

```bash
# 1. 解压
cd /root
tar -xzf english-game-complete.tar.gz
mv english-game /workspace/projects/

# 2. 安装依赖
cd /workspace/projects/english-game
npm install

# 3. 初始化数据库
npx prisma generate
npx prisma db push

# 4. 启动服务
npm install -g pm2
pm2 start npm --name "english-game" -- start
pm2 save

# 5. 验证
pm2 status
curl -I http://localhost:3000
```

---

## ✅ 完整一键部署脚本

```bash
# 在云电脑上执行此脚本
cd /root

# 下载项目（如果未传输）
# wget http://当前环境IP:8000/english-game-complete.tar.gz

# 解压
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

# 安装并启动 PM2
npm install -g pm2
pm2 startup systemd -u root --hp /root
pm2 start npm --name "english-game" -- start
pm2 save

# 验证
pm2 status
echo "✓ 部署完成！访问 http://localhost:3000"
```

---

## 📝 测试账号

```
用户名：test
密码：123456
```

---

## 📖 详细文档

- 完整传输指南：`cat /workspace/projects/english-game/TRANSFER_GUIDE.md`
- 部署步骤指南：`cat /workspace/projects/english-game/docs/SHUAIYBI_STEP_BY_STEP.md`
- 快速参考手册：`cat /workspace/projects/english-game/docs/SHUAIYBI_QUICK_REF.md`

---

## 🔍 验证压缩包

```bash
# 查看文件信息
ls -lh /tmp/english-game-complete.tar.gz

# 计算MD5校验和
md5sum /tmp/english-game-complete.tar.gz

# 查看文件列表
tar -tzf /tmp/english-game-complete.tar.gz | head -20
```

---

## ❓ 常见问题

### Q: 压缩包损坏？

```bash
# 重新创建压缩包
cd /workspace/projects
tar --exclude='node_modules' --exclude='.next' \
    --exclude='.git' --exclude='*.log' \
    --exclude='prisma/dev.db' --exclude='dev.db' \
    -czf /tmp/english-game-complete.tar.gz english-game/

# 验证校验和
md5sum /tmp/english-game-complete.tar.gz
```

### Q: 云电脑无法连接？

```bash
# 测试连接
ping 帅比云电脑IP
ssh root@帅比云电脑IP

# 检查防火墙
sudo ufw status
```

---

## 🎯 推荐流程

1. **复制压缩包到 /tmp**：已完成
2. **传输到云电脑**：使用 SCP 或 HTTP
3. **解压项目**：`tar -xzf english-game-complete.tar.gz`
4. **移动项目**：`mv english-game /workspace/projects/`
5. **安装依赖**：`npm install`
6. **启动服务**：`pm2 start npm --name "english-game" -- start`

---

**准备好部署了吗？开始传输吧！🚀**
