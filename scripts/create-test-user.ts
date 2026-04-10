import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('创建测试账号...')

  // 创建客户账号
  const clientPassword = await bcrypt.hash('client123', 10)
  const client = await prisma.user.upsert({
    where: { email: 'test@client.com' },
    update: {},
    create: {
      name: '测试客户',
      email: 'test@client.com',
      password: clientPassword,
      role: 'CLIENT'
    }
  })
  console.log('✅ 客户账号创建成功:', client.email, '密码: client123')

  // 创建工程师账号
  const engineerPassword = await bcrypt.hash('engineer123', 10)
  const engineer = await prisma.user.upsert({
    where: { email: 'test@engineer.com' },
    update: {},
    create: {
      name: '测试工程师',
      email: 'test@engineer.com',
      password: engineerPassword,
      role: 'ENGINEER'
    }
  })
  console.log('✅ 工程师账号创建成功:', engineer.email, '密码: engineer123')

  console.log('\n--- 测试账号信息 ---')
  console.log('客户账号:')
  console.log('  邮箱: test@client.com')
  console.log('  密码: client123')
  console.log('  角色: CLIENT')
  console.log('\n工程师账号:')
  console.log('  邮箱: test@engineer.com')
  console.log('  密码: engineer123')
  console.log('  角色: ENGINEER')
}

main()
  .catch((e) => {
    console.error('错误:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
