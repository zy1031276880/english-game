# 上传步骤

## 方法一：网页直接上传（最简单）

1. 打开你创建的 GitHub 仓库页面
2. 点击 "Add file" → "Upload files"
3. 把 english-game 文件夹里所有文件拖进去
4. 点击 "Commit changes"

## 方法二：使用 Git 命令（需要安装 Git）

```bash
git clone https://github.com/你的用户名/english-game.git
cd english-game
# 把所有文件复制进来
git add .
git commit -m "Initial commit"
git push origin main
```

## 注意

不要上传以下文件夹（太大）：
- node_modules/
- .next/

这些会在部署时自动生成。
