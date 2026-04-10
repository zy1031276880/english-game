FROM node:20-alpine

WORKDIR /app

# 复制 package 文件
COPY package.json ./

# 安装依赖
RUN npm install

# 复制源代码
COPY . .

# 生成 Prisma 客户端
RUN npx prisma generate

# 构建应用
RUN npm run build

# 初始化数据库
RUN npx prisma db push

# 暴露端口
EXPOSE 3000

# 启动命令
CMD ["npm", "start"]
