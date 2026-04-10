const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: 'file:/workspace/projects/english-game/prisma/dev.db'
    }
  }
});

async function init() {
  try {
    console.log('检查测试用户...');
    
    // 检查用户是否存在
    const existingUser = await prisma.gameUser.findUnique({
      where: { username: 'test' }
    });
    
    if (existingUser) {
      console.log('测试用户已存在，更新密码...');
      const hashedPassword = await bcrypt.hash('123456', 10);
      await prisma.gameUser.update({
        where: { username: 'test' },
        data: { password: hashedPassword }
      });
      console.log('✓ 密码已更新');
    } else {
      console.log('创建测试用户...');
      const hashedPassword = await bcrypt.hash('123456', 10);
      
      await prisma.gameUser.create({
        data: {
          username: 'test',
          password: hashedPassword,
          nickname: '测试用户',
          avatar: '🎮',
          gameState: {
            create: {
              level: 1,
              exp: 0,
              coins: 100,
              currentCity: "newyork",
              unlockedCities: JSON.stringify(["newyork"]),
              completedScenes: "[]",
              cards: "[]",
              buildings: JSON.stringify(["airport"]),
              achievements: "[]",
              stats: JSON.stringify({
                scenesCompleted: 0,
                correctAnswers: 0,
                totalAnswers: 0,
                cardsCollected: 0
              }),
              currentStreak: 0,
              maxStreak: 0,
              lastLoginDate: "",
              consecutiveLoginDays: 0,
              dailyTasks: "{}",
              lastTaskResetDate: "",
            }
          }
        }
      });
      console.log('✓ 测试用户已创建');
    }
    
    // 查询所有用户
    const users = await prisma.gameUser.findMany();
    console.log('当前用户列表:');
    users.forEach(user => {
      console.log(`  - ${user.username} (${user.nickname})`);
    });
    
  } catch (error) {
    console.error('错误:', error);
  } finally {
    await prisma.$disconnect();
  }
}

init();
