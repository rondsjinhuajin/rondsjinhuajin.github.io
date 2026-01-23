import { execSync } from 'child_process'
import { existsSync, copyFileSync, mkdirSync } from 'fs'
import { join } from 'path'

const distDir = join(process.cwd(), 'dist')
const deployDir = process.cwd()

console.log('🚀 开始部署到 GitHub Pages...')

// 检查 dist 目录是否存在
if (!existsSync(distDir)) {
  console.error('❌ dist 目录不存在，请先运行 npm run build')
  process.exit(1)
}

// 复制 dist 目录中的所有文件到根目录
console.log('📋 复制构建文件...')
execSync(`cp -r ${distDir}/* ${deployDir}/`, { stdio: 'inherit' })

// 确保 .nojekyll 文件存在
console.log('📝 创建 .nojekyll 文件...')
const nojekyllPath = join(deployDir, '.nojekyll')
if (!existsSync(nojekyllPath)) {
  copyFileSync(join(__dirname, '../.nojekyll'), nojekyllPath)
}

console.log('✅ 文件准备完成！')
console.log('📝 请执行以下命令提交并推送：')
console.log('   git add .')
console.log('   git commit -m "Deploy to GitHub Pages"')
console.log('   git push origin master')
