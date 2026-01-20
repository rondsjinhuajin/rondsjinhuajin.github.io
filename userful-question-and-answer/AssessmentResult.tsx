import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  CircularProgress,
  Alert,
  Chip,
  Grid,
  Paper,
} from '@mui/material'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import CancelIcon from '@mui/icons-material/Cancel'
import { getAssessmentResult } from './mockData'
import { AssessmentResult as AssessmentResultType } from './types'

export default function AssessmentResult() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [result, setResult] = useState<AssessmentResultType | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (id) {
      loadResult()
    }
  }, [id])

  const loadResult = async () => {
    if (!id) return

    try {
      setLoading(true)
      setError(null)
      const res = await getAssessmentResult(id)
      if (res.code === 200) {
        setResult(res.data)
      } else {
        setError('加载考核结果失败')
      }
    } catch (err) {
      setError('加载考核结果失败')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleViewWrongQuestions = () => {
    if (!result || result.wrongCount === 0) {
      alert('暂无错题')
      return
    }
    navigate(`/assessment/wrong-questions/${id}`)
  }

  const handleViewQuestionAnalysis = (index: number) => {
    navigate(`/assessment/analysis/${id}?index=${index}`)
  }

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <CircularProgress />
      </Box>
    )
  }

  if (error) {
    return (
      <Box sx={{ maxWidth: 800, mx: 'auto', mt: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    )
  }

  if (!result) {
    return (
      <Box sx={{ maxWidth: 800, mx: 'auto', mt: 4 }}>
        <Alert severity="warning">考核结果不存在</Alert>
      </Box>
    )
  }

  return (
    <Box sx={{ maxWidth: 1000, mx: 'auto' }}>
      <Typography variant="h4" gutterBottom sx={{ mb: 3 }}>
        考核结果
      </Typography>

      {/* 结果摘要 */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ textAlign: 'center', mb: 3 }}>
            {/* 正确率圆圈 */}
            <Box
              sx={{
                width: 120,
                height: 120,
                borderRadius: '50%',
                border: '4px solid',
                borderColor: result.isPassed ? 'success.main' : 'error.main',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mx: 'auto',
                mb: 2,
              }}
            >
              <Typography variant="h4" color={result.isPassed ? 'success.main' : 'error.main'}>
                {result.accuracy}%
              </Typography>
            </Box>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              正确率
            </Typography>
          </Box>

          {/* 统计信息 */}
          <Grid container spacing={2} sx={{ mb: 2 }}>
            <Grid item xs={4}>
              <Paper sx={{ p: 2, textAlign: 'center' }}>
                <Typography variant="h6" color="primary">
                  ⭐
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  答对数
                </Typography>
                <Typography variant="h6">{result.correctCountDisplay}</Typography>
              </Paper>
            </Grid>
            <Grid item xs={4}>
              <Paper sx={{ p: 2, textAlign: 'center' }}>
                <Typography variant="h6" color="primary">
                  ⏰
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  用时
                </Typography>
                <Typography variant="h6">{result.timeUsed}</Typography>
              </Paper>
            </Grid>
            <Grid item xs={4}>
              <Paper sx={{ p: 2, textAlign: 'center' }}>
                <Typography variant="h6" color="primary">
                  🏆
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  得分
                </Typography>
                <Typography variant="h6">{result.scoreText}</Typography>
              </Paper>
            </Grid>
          </Grid>

          {/* 通过/未通过标签 */}
          {result.isPassed ? (
            <Chip
              icon={<CheckCircleIcon />}
              label="已通过"
              color="success"
              sx={{ fontSize: '1rem', py: 2.5 }}
            />
          ) : (
            <Chip
              icon={<CancelIcon />}
              label="未通过"
              color="error"
              sx={{ fontSize: '1rem', py: 2.5 }}
            />
          )}
        </CardContent>
      </Card>

      {/* 错题提示 */}
      {result.wrongCount > 0 && (
        <Card
          sx={{
            mb: 3,
            cursor: 'pointer',
            '&:hover': {
              boxShadow: 4,
            },
            transition: 'box-shadow 0.3s',
          }}
          onClick={handleViewWrongQuestions}
        >
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Typography variant="h6" color="error">
                  ❌
                </Typography>
                <Box>
                  <Typography variant="h6">本次错题</Typography>
                  <Typography variant="body2" color="text.secondary">
                    共有 {result.wrongCount} 道错题，点击查看
                  </Typography>
                </Box>
              </Box>
              <Typography sx={{ fontSize: '1.5rem', color: 'text.secondary' }}>&gt;</Typography>
            </Box>
          </CardContent>
        </Card>
      )}

      {/* 答题卡 */}
      {result.answerSheet && result.answerSheet.length > 0 && (
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              答题卡
            </Typography>

            {/* 图例 */}
            <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box
                  sx={{
                    width: 20,
                    height: 20,
                    borderRadius: '50%',
                    bgcolor: 'success.main',
                  }}
                />
                <Typography variant="body2">答对</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box
                  sx={{
                    width: 20,
                    height: 20,
                    borderRadius: '50%',
                    bgcolor: 'error.main',
                  }}
                />
                <Typography variant="body2">答错</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box
                  sx={{
                    width: 20,
                    height: 20,
                    borderRadius: '50%',
                    bgcolor: 'grey.400',
                  }}
                />
                <Typography variant="body2">未答</Typography>
              </Box>
            </Box>

            {/* 答题卡网格 */}
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(50px, 1fr))',
                gap: 1,
              }}
            >
              {result.answerSheet.map((item, index) => {
                const bgColor =
                  item.status === 'correct'
                    ? 'success.main'
                    : item.status === 'wrong'
                    ? 'error.main'
                    : 'grey.400'
                const color = item.status === 'unanswered' ? 'text.primary' : 'white'

                return (
                  <Box
                    key={item.questionId}
                    onClick={() => handleViewQuestionAnalysis(index)}
                    sx={{
                      width: 50,
                      height: 50,
                      borderRadius: 1,
                      bgcolor,
                      color,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      '&:hover': {
                        opacity: 0.8,
                      },
                    }}
                  >
                    <Typography variant="body2" fontWeight="bold">
                      {index + 1}
                    </Typography>
                  </Box>
                )
              })}
            </Box>
          </CardContent>
        </Card>
      )}

      {/* 返回按钮 */}
      <Box sx={{ mt: 3, textAlign: 'center' }}>
        <Button variant="contained" onClick={() => navigate('/assessment')}>
          返回考核列表
        </Button>
      </Box>
    </Box>
  )
}
