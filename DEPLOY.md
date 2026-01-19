# 部署指南

## ⚠️ 重要提示

**此目录只用于预览部署，源代码已迁移到 `react-preview-page`。**

## 自动部署（推荐）

### 使用 react-preview-page 的构建脚本

```bash
cd ../react-preview-page
npm run build:deploy
```

这个命令会：
1. 构建 `react-preview-page` 项目
2. 集成子模块（如 `useful-video-player`）
3. 将构建产物复制到 `rondsjinhuajin.github.io/dist/`
4. 准备部署文件

### 使用 GitHub Actions

如果配置了 GitHub Actions，推送代码到 `master` 分支会自动触发构建和部署。

## 手动部署

### 步骤 1：构建主项目

```bash
cd ../react-preview-page
npm run build:integrate
```

### 步骤 2：复制构建产物

构建产物会自动输出到 `rondsjinhuajin.github.io/dist/`。

如果需要部署到 GitHub Pages 根目录：

```bash
cd ../rondsjinhuajin.github.io
cp -r dist/* .
```

### 步骤 3：确保配置文件存在

```bash
touch .nojekyll
```

### 步骤 4：提交并推送

```bash
git add .
git commit -m "Deploy from react-preview-page"
git push origin master
```

## 项目架构

```
react-preview-page/          # 主入口（源代码）
├── src/                     # 源代码
├── public/                  # 静态资源（包括子模块构建产物）
└── dist/ → rondsjinhuajin.github.io/dist/  # 构建输出

rondsjinhuajin.github.io/    # 预览目录（构建产物）
└── dist/                    # 构建产物
```

## 注意事项

- ✅ 保留 `.nojekyll` 文件（GitHub Pages 需要）
- ✅ 保留 `dist/` 目录（构建产物）
- ❌ 不要在此目录编写源代码
- ❌ 源代码修改请在 `react-preview-page` 中进行
