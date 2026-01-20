import { useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { Box, Card, CardContent, Typography, Chip, IconButton } from '@mui/material'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import type { Question } from './types'

function useQuery() {
  const { search } = useLocation()
  return useMemo(() => new URLSearchParams(search), [search])
}

function isQuestionAnswered(
  answers: Record<string, unknown>,
  questionId: string,
  questionType: string
): boolean {
  const raw = answers?.[String(questionId)]
  if (raw === undefined || raw === null || raw === '') return false

  if (questionType === 'multiple') {
    if (Array.isArray(raw)) return raw.length > 0
    if (typeof raw === 'string') {
      const trimmed = raw.trim()
      return trimmed !== '' && trimmed !== 'null' && trimmed !== 'undefined'
    }
    return false
  }

  if (typeof raw === 'string') {
    const trimmed = raw.trim()
    return trimmed !== '' && trimmed !== 'null' && trimmed !== 'undefined'
  }

  return true
}

export default function AnswerSheet() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const query = useQuery()
  const currentIndex = Math.max(0, parseInt(query.get('currentIndex') || '0', 10) || 0)

  const [questions, setQuestions] = useState<Question[]>([])
  const [answers, setAnswers] = useState<Record<string, unknown>>({})

  useEffect(() => {
    if (!id) return

    const q = JSON.parse(localStorage.getItem(`questions_${id}`) || '[]') as Question[]
    const a = JSON.parse(localStorage.getItem(`answers_${id}`) || '{}') as Record<string, unknown>

    setQuestions(
      (Array.isArray(q) ? q : []).map((item) => ({
        ...item,
        // 兼容：确保 id 为字符串
        id: String(item.id),
      }))
    )
    setAnswers(a && typeof a === 'object' ? a : {})
  }, [id])

  const answeredCount = useMemo(() => {
    return questions.reduce((acc, q) => {
      const ok = isQuestionAnswered(answers, q.id, q.type)
      return acc + (ok ? 1 : 0)
    }, 0)
  }, [answers, questions])

  const handleGoToQuestion = (index: number) => {
    if (!id) return
    // 保存要跳转的题目索引，并添加时间戳标记，确保考试页面能检测到变化
    localStorage.setItem(`currentQuestionIndex_${id}`, String(index))
    localStorage.setItem(`answerSheetReturn_${id}`, Date.now().toString())
    // 直接跳转到考试页面
    navigate(`/assessment/exam/${id}`)
  }

  return (
    <Box sx={{ maxWidth: 900, mx: 'auto' }}>
      <Card sx={{ mb: 2 }}>
        <CardContent
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 2,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <IconButton onClick={() => navigate(-1)} size="small" aria-label="back">
              <ArrowBackIcon />
            </IconButton>
            <Typography variant="h6">答题卡</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
            <Chip size="small" label={`已完成 ${answeredCount}/${questions.length}`} color="primary" />
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: 'grey.300' }} />
              <Typography variant="body2" color="text.secondary">
                未完成
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: 'primary.main' }} />
              <Typography variant="body2" color="text.secondary">
                已完成
              </Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(56px, 1fr))',
              gap: 1.5,
            }}
          >
            {questions.map((q, index) => {
              const answered = isQuestionAnswered(answers, q.id, q.type)
              return (
                <Box
                  key={q.id}
                  onClick={() => handleGoToQuestion(index)}
                  sx={{
                    width: 56,
                    height: 56,
                    borderRadius: '50%',
                    mx: 'auto',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    bgcolor: answered ? 'primary.main' : 'grey.200',
                    color: answered ? 'primary.contrastText' : 'text.primary',
                    border: index === currentIndex ? '2px solid' : '2px solid transparent',
                    borderColor: index === currentIndex ? 'error.main' : 'transparent',
                    boxSizing: 'border-box',
                    '&:hover': { opacity: 0.9 },
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
    </Box>
  )
}

