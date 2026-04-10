# English Game 项目部署指南

## 📦 方案选择

### 方案一：使用压缩包（推荐）

#### 1. 下载项目压缩包

压缩包路径：`/workspace/projects/english-game-complete.tar.gz`

文件大小：133K
文件数量：89个文件/目录

#### 2. 将压缩包传输到帅比云电脑

**方法 A：使用 SCP（如果可以 SSH 到云电脑）**

```bash
# 在当前环境执行
scp /workspace/projects/english-game-complete.tar.gz root@帅比云电脑IP:/root/
```

**方法 B：使用 rsync**

```bash
# 在当前环境执行
rsync -avz /workspace/projects/english-game-complete.tar.gz root@帅比云电脑IP:/root/
```

**方法 C：手动上传**

1. 在当前环境中复制文件：
```bash
cp /workspace/projects/english-game-complete.tar.gz /tmp/
```

2. 通过文件传输工具（WinSCP、FileZilla等）上传到云电脑的 `/root/` 目录

**方法 D：使用中间服务器**

```bash
# 1. 下载压缩包到本地
cp /workspace/projects/english-game-complete.tar.gz /tmp/

# 2. 从当前环境通过 http 提供
python3 -m http.server 8000 --directory /tmp/

# 3. 在云电脑上下载
cd /root
wget http://当前环境IP:8000/english-game-complete.tar.gz
```

#### 3. 在帅比云电脑上解压和部署

```bash
# 进入工作目录
cd /root

# 解压压缩包
tar -xzf english-game-complete.tar.gz

# 移动到正确位置
mv english-game /workspace/projects/

# 进入项目目录
cd /workspace/projects/english-game

# 继续执行部署步骤...
```

---

### 方案二：手动创建项目（如果无法传输文件）

如果无法传输文件，可以使用以下步骤手动创建项目：

#### 在帅比云电脑上执行以下命令：

```bash
# 创建项目目录
mkdir -p /workspace/projects/english-game
cd /workspace/projects/english-game

# 初始化项目
npm init -y

# 安装依赖
npm install next@latest react@latest react-dom@latest typescript@latest @types/node@latest @types/react@latest @types/react-dom@latest
npm install next-auth bcryptjs prisma @prisma/client tailwindcss postcss autoprefixer
npm install -D typescript @types/bcryptjs @types/node

# 初始化 Tailwind
npx tailwindcss init -p

# 创建基本目录结构
mkdir -p src/app/api/game/auth/login
mkdir -p src/app/api/game/auth/register
mkdir -p src/lib
mkdir -p src/components/ui
mkdir -p prisma
mkdir -p docs
mkdir -p scripts
mkdir -p public
```

然后需要手动创建所有文件（详见下方完整代码）。

---

### 方案三：使用 Git（如果有远程仓库）

如果当前环境可以推送代码到 Git 仓库：

```bash
# 1. 在当前环境初始化 Git 仓库
cd /workspace/projects/english-game
git init
git add .
git commit -m "Initial commit"

# 2. 推送到远程仓库（需要先创建）
# git remote add origin https://github.com/你的用户名/english-game.git
# git push -u origin main

# 3. 在帅比云电脑上克隆
cd /workspace/projects
git clone https://github.com/你的用户名/english-game.git
```

---

## 🚀 部署步骤（压缩包方式）

### 在帅比云电脑上执行：

```bash
# 步骤1：解压项目
cd /root
tar -xzf english-game-complete.tar.gz
mv english-game /workspace/projects/

# 步骤2：进入项目目录
cd /workspace/projects/english-game

# 步骤3：安装依赖
npm install

# 步骤4：初始化数据库
npx prisma generate
npx prisma db push

# 步骤5：构建项目
npm run build

# 步骤6：配置环境变量（如果不存在）
if [ ! -f .env ]; then
    cat > .env << 'EOF'
DATABASE_URL="file:./dev.db"
NEXTAUTH_URL="https://english-game.你的域名.com"
NEXTAUTH_SECRET="english-game-secret-2024"
NEXTAUTH_TRUST_HOST="true"
PORT=3000
EOF
fi

# 步骤7：安装 PM2
npm install -g pm2
pm2 startup systemd -u root --hp /root

# 步骤8：启动应用
pm2 start npm --name "english-game" -- start
pm2 save

# 步骤9：验证
pm2 status
curl -I http://localhost:3000
```

---

## 📋 压缩包内容清单

```
english-game/
├── prisma/
│   ├── schema.prisma              # 数据库模型
│   ├── migrations/               # 数据库迁移
│   └── dev.db.backup            # 数据库备份
├── src/
│   ├── app/                     # Next.js 应用
│   │   ├── api/                # API 路由
│   │   │   └── game/
│   │   │       └── auth/       # 认证 API
│   │   ├── game/               # 游戏页面
│   │   ├── auth/               # 登录注册页面
│   │   └── page.tsx            # 首页
│   ├── lib/                    # 工具库
│   │   ├── prisma.ts          # 数据库客户端
│   │   ├── auth.ts            # 认证工具
│   │   ├── utils.ts           # 通用工具
│   │   └── translations.ts    # 多语言翻译
│   └── components/            # React 组件
│       └── ui/               # UI 组件
├── docs/                     # 文档
│   ├── SHUAIYBI_DEPLOYMENT.md
│   ├── SHUAIYBI_STEP_BY_STEP.md
│   └── SHUAIYBI_QUICK_REF.md
├── scripts/                  # 脚本
│   └── deploy-shuaibi.sh
├── public/                   # 静态资源
├── package.json              # 项目配置
├── next.config.ts           # Next.js 配置
├── tsconfig.json            # TypeScript 配置
├── tailwind.config.ts       # Tailwind 配置
├── postcss.config.mjs       # PostCSS 配置
└── README.md                # 项目说明
```

总计：89个文件/目录，133KB

---

## 🔧 常见问题

### Q1: 压缩包解压后找不到文件

```bash
# 检查压缩包内容
tar -tzf english-game-complete.tar.gz

# 使用 verbose 模式解压
tar -xvzf english-game-complete.tar.gz
```

### Q2: 安装依赖失败

```bash
# 清理缓存重新安装
rm -rf node_modules package-lock.json
npm cache clean --force
npm install
```

### Q3: 数据库初始化失败

```bash
# 手动创建数据库文件
touch dev.db

# 重新生成 Prisma Client
npx prisma generate

# 推送数据库 schema
npx prisma db push
```

### Q4: 启动失败

```bash
# 查看错误日志
pm2 logs english-game

# 检查端口占用
ss -tlnp | grep :3000

# 重启应用
pm2 restart english-game
```

---

## 📞 技术支持

如遇到问题，请检查：

1. Node.js 版本：`node --version`（需要 v20+）
2. npm 版本：`npm --version`（需要 v9+）
3. 端口是否被占用：`ss -tlnp | grep :3000`
4. PM2 日志：`pm2 logs english-game`

---

## ✅ 推荐流程

1. **下载压缩包**：`cp /workspace/projects/english-game-complete.tar.gz /tmp/`
2. **传输到云电脑**：使用 SCP 或文件传输工具
3. **在云电脑解压**：`tar -xzf english-game-complete.tar.gz`
4. **移动项目**：`mv english-game /workspace/projects/`
5. **安装依赖**：`npm install`
6. **初始化数据库**：`npx prisma db push`
7. **启动服务**：`pm2 start npm --name "english-game" -- start`

---

## 🎯 快速开始（如果已经在帅比云电脑上）

```bash
# 1. 解压（如果已有压缩包）
cd /root
tar -xzf english-game-complete.tar.gz
mv english-game /workspace/projects/

# 2. 一键部署
cd /workspace/projects/english-game
bash /workspace/projects/english-game/scripts/deploy-shuaibi.sh

# 3. 或者手动部署
npm install
npx prisma db push
npm run build
pm2 start npm --name "english-game" -- start
pm2 save
```

祝你部署成功！🎉
