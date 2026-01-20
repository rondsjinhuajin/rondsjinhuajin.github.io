import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Radio,
  RadioGroup,
  FormControlLabel,
  Checkbox,
  FormGroup,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Alert,
  Chip,
  IconButton,
} from '@mui/material'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import ArrowForwardIcon from '@mui/icons-material/ArrowForward'
import MenuIcon from '@mui/icons-material/Menu'
import { getAssessmentDetail, getQuestions, submitAnswer, submitAssessment } from './mockData'
import type { Question, AssessmentDetail } from './types'

export default function AssessmentExam() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const location = useLocation()
  const [assessment, setAssessment] = useState<AssessmentDetail | null>(null)
  const [questions, setQuestions] = useState<Question[]>([])
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({})
  const [timeRemaining, setTimeRemaining] = useState(0) // 秒
  const [showSubmitModal, setShowSubmitModal] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    if (id) {
      loadAssessmentData()
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }, [id])

  const loadAssessmentData = async () => {
    if (!id) return

    try {
      setLoading(true)
      setError(null)

      // 开始新考试：清除之前的答案/题目缓存，确保本次试卷随机生成且稳定
      localStorage.removeItem(`answers_${id}`)
      localStorage.removeItem(`questions_${id}`)
      localStorage.removeItem(`currentQuestionIndex_${id}`)

      const [assessmentRes, questionsRes] = await Promise.all([
        getAssessmentDetail(id),
        getQuestions(id),
      ])

      if (assessmentRes.code === 200 && questionsRes.code === 200) {
        setAssessment(assessmentRes.data)
        setQuestions(questionsRes.data)
        // 保存题目到缓存，供答题卡/提交复用
        localStorage.setItem(`questions_${id}`, JSON.stringify(questionsRes.data))

        // 初始化时间
        const duration = assessmentRes.data.duration * 60 // 转换为秒
        setTimeRemaining(duration)

        // 从缓存恢复答案
        const savedAnswers = localStorage.getItem(`answers_${id}`)
        if (savedAnswers) {
          setAnswers(JSON.parse(savedAnswers))
        }

        // 开始计时
        startTimer(duration)
      } else {
        setError('加载考核数据失败')
      }
    } catch (err) {
      setError('加载考核数据失败')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const startTimer = (initialTime: number) => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
    }

    timerRef.current = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 0) {
          if (timerRef.current) {
            clearInterval(timerRef.current)
          }
          handleSubmitExam()
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }

  // 从答题卡返回时恢复题目索引
  useEffect(() => {
    if (!id || questions.length === 0) return
    
    const checkAndJumpToQuestion = () => {
      // 检查是否有答题卡返回标记
      const returnFlag = localStorage.getItem(`answerSheetReturn_${id}`)
      if (!returnFlag) return
      
      const saved = localStorage.getItem(`currentQuestionIndex_${id}`)
      if (saved !== null && saved !== undefined) {
        const idx = Math.max(0, Math.min(parseInt(saved, 10) || 0, questions.length - 1))
        if (Number.isFinite(idx) && idx >= 0 && idx < questions.length) {
          setCurrentQuestionIndex(idx)
          // 清除标记和索引
          localStorage.removeItem(`currentQuestionIndex_${id}`)
          localStorage.removeItem(`answerSheetReturn_${id}`)
        }
      }
    }
    
    // 检查并跳转
    checkAndJumpToQuestion()
    
    // 监听路由变化和页面可见性变化
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        checkAndJumpToQuestion()
      }
    }
    
    document.addEventListener('visibilitychange', handleVisibilityChange)
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [id, questions.length, location.pathname])

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const handleAnswerChange = (questionId: string, answer: string | string[], questionType: string) => {
    const newAnswers = { ...answers, [questionId]: answer }
    setAnswers(newAnswers)

    // 保存到 localStorage
    localStorage.setItem(`answers_${id}`, JSON.stringify(newAnswers))

    // 保存到服务器（模拟）
    if (questionType === 'multiple') {
      submitAnswer(id!, questionId, Array.isArray(answer) ? answer.join(',') : answer)
    } else {
      submitAnswer(id!, questionId, String(answer))
    }
  }

  const handleSingleAnswerChange = (questionId: string, optionKey: string) => {
    handleAnswerChange(questionId, optionKey, 'single')
  }

  const handleMultipleAnswerChange = (questionId: string, optionKey: string, checked: boolean) => {
    const currentAnswer = answers[questionId] || []
    const answerArray = Array.isArray(currentAnswer) ? [...currentAnswer] : []
    
    if (checked) {
      if (!answerArray.includes(optionKey)) {
        answerArray.push(optionKey)
      }
    } else {
      const index = answerArray.indexOf(optionKey)
      if (index > -1) {
        answerArray.splice(index, 1)
      }
    }
    
    handleAnswerChange(questionId, answerArray, 'multiple')
  }

  const handlePrevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1)
    }
  }

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1)
    }
  }

  const getUnansweredCount = (): number => {
    let count = 0
    questions.forEach((q) => {
      const answer = answers[q.id]
      if (!answer || answer === '' || (Array.isArray(answer) && answer.length === 0)) {
        count++
      }
    })
    return count
  }

  const handleSubmitClick = () => {
    setShowSubmitModal(true)
  }

  const handleCloseModal = () => {
    setShowSubmitModal(false)
  }

  const handleSubmitExam = async () => {
    if (!id) return

    try {
      setSubmitting(true)
      setShowSubmitModal(false)

      // 清除定时器
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }

      // 组装答案
      const answerList = questions
        .map((q) => {
          const answer = answers[q.id]
          if (!answer || answer === '' || (Array.isArray(answer) && answer.length === 0)) {
            return null
          }

          return {
            questionId: q.id,
            option: Array.isArray(answer) ? answer.join(',') : String(answer),
          }
        })
        .filter((item) => item !== null) as Array<{ questionId: string; option: string }>

      // 计算已用时长
      const totalDuration = assessment?.duration || 0
      const durationUsed = Math.max(0, totalDuration * 60 - timeRemaining)

      // 提交考核
      const submitRes = await submitAssessment({
        examPlanId: id,
        answers: answerList,
        duration: durationUsed,
      })

      if (submitRes.code === 200) {
        // 清除答案缓存
        localStorage.removeItem(`answers_${id}`)
        // 跳转到结果页面
        navigate(`/assessment/result/${id}`)
      } else {
        alert('提交失败，请重试')
        setSubmitting(false)
      }
    } catch (err) {
      console.error('提交考试失败', err)
      alert('提交失败')
      setSubmitting(false)
    }
  }

  const currentQuestion = questions[currentQuestionIndex]
  const unansweredCount = getUnansweredCount()

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

  if (!assessment || questions.length === 0) {
    return (
      <Box sx={{ maxWidth: 800, mx: 'auto', mt: 4 }}>
        <Alert severity="warning">考核数据不存在</Alert>
      </Box>
    )
  }

  return (
    <Box sx={{ maxWidth: 1000, mx: 'auto' }}>
      {/* 头部 */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 3,
          p: 2,
          bgcolor: 'background.paper',
          borderRadius: 1,
          boxShadow: 1,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography variant="h6">{assessment.name}</Typography>
          <Chip
            label={currentQuestion?.type === 'multiple' ? '多选题' : '单选题'}
            color="primary"
            size="small"
          />
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography variant="body1" color="error">
            ⏰ {formatTime(timeRemaining)}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {currentQuestionIndex + 1}/{questions.length} (共{questions.length}题)
          </Typography>
          <IconButton
            onClick={() => navigate(`/assessment/answer-sheet/${id}?currentIndex=${currentQuestionIndex}`)}
            size="small"
            aria-label="answer-sheet"
          >
            <MenuIcon />
          </IconButton>
        </Box>
      </Box>

      {/* 题目内容 */}
      {currentQuestion && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
              <Typography variant="h6" sx={{ flex: 1 }}>
                {currentQuestionIndex + 1}. {currentQuestion.content}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                ({currentQuestion.score}分)
              </Typography>
            </Box>

            {/* 单选题或判断题 */}
            {(currentQuestion.type === 'single' || currentQuestion.type === 'judge') && (
              <RadioGroup
                value={answers[currentQuestion.id] || ''}
                onChange={(e) => handleSingleAnswerChange(currentQuestion.id, e.target.value)}
              >
                {currentQuestion.options.map((option) => (
                  <FormControlLabel
                    key={option.key}
                    value={option.key}
                    control={<Radio />}
                    label={`${option.key}. ${option.text}`}
                    sx={{
                      mb: 1,
                      p: 1,
                      borderRadius: 1,
                      '&:hover': {
                        bgcolor: 'action.hover',
                      },
                    }}
                  />
                ))}
              </RadioGroup>
            )}

            {/* 多选题 */}
            {currentQuestion.type === 'multiple' && (
              <FormGroup>
                {currentQuestion.options.map((option) => {
                  const currentAnswer = answers[currentQuestion.id] || []
                  const isChecked = Array.isArray(currentAnswer) ? currentAnswer.includes(option.key) : false

                  return (
                    <FormControlLabel
                      key={option.key}
                      control={
                        <Checkbox
                          checked={isChecked}
                          onChange={(e) =>
                            handleMultipleAnswerChange(currentQuestion.id, option.key, e.target.checked)
                          }
                        />
                      }
                      label={`${option.key}. ${option.text}`}
                      sx={{
                        mb: 1,
                        p: 1,
                        borderRadius: 1,
                        '&:hover': {
                          bgcolor: 'action.hover',
                        },
                      }}
                    />
                  )
                })}
              </FormGroup>
            )}
          </CardContent>
        </Card>
      )}

      {/* 底部按钮 */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2 }}>
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={handlePrevQuestion}
          disabled={currentQuestionIndex === 0}
        >
          上一题
        </Button>
        <Button
          variant="contained"
          endIcon={currentQuestionIndex === questions.length - 1 ? null : <ArrowForwardIcon />}
          onClick={currentQuestionIndex === questions.length - 1 ? handleSubmitClick : handleNextQuestion}
          disabled={submitting}
        >
          {currentQuestionIndex === questions.length - 1 ? '提交' : '下一题'}
        </Button>
      </Box>

      {/* 提交确认弹窗 */}
      <Dialog open={showSubmitModal} onClose={handleCloseModal} maxWidth="sm" fullWidth>
        <DialogTitle>操作提示</DialogTitle>
        <DialogContent>
          <Box sx={{ textAlign: 'center', py: 2 }}>
            <Typography variant="h4" sx={{ mb: 2 }}>
              ✓
            </Typography>
            <Typography variant="body1">
              {unansweredCount === 0
                ? '试题已做完,确认提交吗?'
                : `您有${unansweredCount}题未作答,确认提交吗?`}
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseModal} disabled={submitting}>
            再看看
          </Button>
          <Button onClick={handleSubmitExam} variant="contained" disabled={submitting}>
            {submitting ? <CircularProgress size={20} /> : '确认提交'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
