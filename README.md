# rondsjinhuajin.github.io

这是预览部署目录，**不保存源代码**，只用于保存构建产物和预览。

## ⚠️ 重要说明

**此目录的源代码已迁移到 `react-preview-page` 项目。**

- 源代码位置：`../react-preview-page/`
- 构建产物位置：`./dist/`（由 `react-preview-page` 构建生成）

## 部署流程

### 1. 在 react-preview-page 中构建

```bash
cd ../react-preview-page
npm run build:integrate  # 构建并集成子模块
# 或者
npm run build:deploy     # 构建并自动部署到此目录
```

### 2. 手动部署（如果需要）

如果使用 `npm run build`，构建产物会输出到 `rondsjinhuajin.github.io/dist/`。

然后可以：

```bash
# 复制 dist 内容到根目录（用于 GitHub Pages）
cp -r dist/* .

# 确保 .nojekyll 存在
touch .nojekyll

# 提交并推送
git add .
git commit -m "Deploy from react-preview-page"
git push origin master
```

## 项目结构

```
rondsjinhuajin.github.io/
├── dist/              # 构建产物（由 react-preview-page 生成）
├── .nojekyll          # GitHub Pages 配置文件
├── README.md          # 本文件
└── DEPLOY.md          # 部署说明
```

## 开发说明

**不要在此目录中编写代码！**

所有源代码开发都在 `react-preview-page` 目录中进行：
- 修改页面：编辑 `../react-preview-page/src/pages/`
- 修改组件：编辑 `../react-preview-page/src/components/`
- 添加路由：编辑 `../react-preview-page/src/App.tsx`

## GitHub Actions

如果配置了 GitHub Actions，它会自动从 `react-preview-page` 构建并部署到此目录。
