import { Box, Typography, Card, CardContent, Switch, FormControlLabel } from '@mui/material'
import { useState } from 'react'

export default function Settings() {
  const [darkMode, setDarkMode] = useState(false)

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        设置
      </Typography>
      <Card sx={{ mt: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            偏好设置
          </Typography>
          <FormControlLabel
            control={
              <Switch
                checked={darkMode}
                onChange={(e) => setDarkMode(e.target.checked)}
              />
            }
            label="深色模式"
          />
          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
            更多设置选项可以在这里添加...
          </Typography>
        </CardContent>
      </Card>
    </Box>
  )
}
