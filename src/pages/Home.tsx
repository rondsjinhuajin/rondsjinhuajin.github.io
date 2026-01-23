import { Box, Typography, Card, CardContent } from '@mui/material'

export default function Home() {
  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        欢迎
      </Typography>
      <Typography variant="body1" color="text.secondary" paragraph>
        这是一个使用 React + Tailwind CSS + MUI 构建的响应式网站。
      </Typography>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            sm: 'repeat(2, 1fr)',
            md: 'repeat(3, 1fr)',
          },
          gap: 3,
          mt: 2,
        }}
      >
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              响应式设计
            </Typography>
            <Typography variant="body2" color="text.secondary">
              完美支持 PC 端和移动端（H5）
            </Typography>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              多页面支持
            </Typography>
            <Typography variant="body2" color="text.secondary">
              支持多个部署的页面，通过左侧菜单导航
            </Typography>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              现代化技术栈
            </Typography>
            <Typography variant="body2" color="text.secondary">
              React + Vite + Tailwind CSS + MUI
            </Typography>
          </CardContent>
        </Card>
      </Box>
    </Box>
  )
}
