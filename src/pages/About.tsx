import { Box, Typography, Card, CardContent } from '@mui/material'

export default function About() {
  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        关于
      </Typography>
      <Card sx={{ mt: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            项目信息
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            这是一个基于 React + Tailwind CSS + MUI 构建的现代化网站。
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            <strong>技术栈：</strong>
          </Typography>
          <Typography variant="body2" color="text.secondary" component="ul" sx={{ pl: 3 }}>
            <li>React 19</li>
            <li>TypeScript</li>
            <li>Vite</li>
            <li>Tailwind CSS</li>
            <li>Material-UI (MUI)</li>
            <li>React Router</li>
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
            <strong>特性：</strong>
          </Typography>
          <Typography variant="body2" color="text.secondary" component="ul" sx={{ pl: 3 }}>
            <li>响应式设计（支持 PC 和移动端）</li>
            <li>左侧导航菜单</li>
            <li>多页面路由支持</li>
            <li>GitHub Pages 部署</li>
          </Typography>
        </CardContent>
      </Card>
    </Box>
  )
}
