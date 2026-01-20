import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Box,
  TextField,
  Tabs,
  Tab,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  CircularProgress,
  Alert,
} from '@mui/material'
import SearchIcon from '@mui/icons-material/Search'
import { getAssessmentList } from './mockData'
import { Assessment, AssessmentStatus } from './types'

export default function AssessmentList() {
  const [activeTab, setActiveTab] = useState<AssessmentStatus>('notStarted')
  const [searchKeyword, setSearchKeyword] = useState('')
  const [assessments, setAssessments] = useState<Assessment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const navigate = useNavigate()

  useEffect(() => {
    loadAssessments()
  }, [activeTab])

  const loadAssessments = async () => {
    try {
      setLoading(true)
      setError(null)
      const res = await getAssessmentList(activeTab)
      if (res.code === 200) {
        setAssessments(res.data)
      } else {
        setError('加载考核列表失败')
      }
    } catch (err) {
      setError('加载考核列表失败')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleTabChange = (_event: React.SyntheticEvent, newValue: AssessmentStatus) => {
    setActiveTab(newValue)
    setSearchKeyword('')
  }

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchKeyword(event.target.value)
  }

  const handleAssessmentClick = (assessment: Assessment) => {
    if (assessment.status === 'expired') {
      alert('考核已过期')
      return
    }

    if (assessment.status === 'notStarted') {
      if (!assessment.trainingCompleted) {
        alert('请先完成培训学习，再来参加考试。')
        return
      }
      if (!assessment.isOpen) {
        alert('考核未开放')
        return
      }
      navigate(`/assessment/exam/${assessment.id}`)
    } else {
      navigate(`/assessment/result/${assessment.id}`)
    }
  }

  const filteredAssessments = assessments.filter((item) =>
    item.name.includes(searchKeyword)
  )

  const formatDuration = (seconds?: number | string): string => {
    if (!seconds && seconds !== 0) return ''
    const totalSeconds = typeof seconds === 'string' ? parseInt(seconds) : seconds || 0
    if (totalSeconds === 0) return '0秒'
    const minutes = Math.floor(totalSeconds / 60)
    const secs = totalSeconds % 60
    if (minutes === 0) {
      return `${secs}秒`
    } else if (secs === 0) {
      return `${minutes}分钟`
    } else {
      return `${minutes}分${secs}秒`
    }
  }

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto' }}>
      <Typography variant="h4" gutterBottom sx={{ mb: 3 }}>
        用户考核管理
      </Typography>

      {/* 搜索栏 */}
      <Box sx={{ mb: 3 }}>
        <TextField
          fullWidth
          placeholder="请输入考核计划名称"
          value={searchKeyword}
          onChange={handleSearchChange}
          InputProps={{
            startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
          }}
        />
      </Box>

      {/* 标签页 */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={activeTab} onChange={handleTabChange}>
          <Tab label="未开始" value="notStarted" />
          <Tab label="通过" value="passed" />
          <Tab label="未通过" value="failed" />
          <Tab label="已过期" value="expired" />
        </Tabs>
      </Box>

      {/* 加载状态 */}
      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      )}

      {/* 错误状态 */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* 考核列表 */}
      {!loading && !error && (
        <>
          {filteredAssessments.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography color="text.secondary">暂无数据</Typography>
            </Box>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {filteredAssessments.map((assessment) => (
                <Card
                  key={assessment.id}
                  sx={{
                    cursor: 'pointer',
                    '&:hover': {
                      boxShadow: 4,
                    },
                    transition: 'box-shadow 0.3s',
                  }}
                  onClick={() => handleAssessmentClick(assessment)}
                >
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <Box sx={{ flex: 1 }}>
                        {/* 状态标签 */}
                        {(activeTab === 'failed' && assessment.status === 'failed') ||
                        (activeTab === 'expired' && assessment.status === 'expired') ? (
                          <Chip
                            label={assessment.status === 'failed' ? '未通过' : '已过期'}
                            color={assessment.status === 'failed' ? 'error' : 'default'}
                            size="small"
                            sx={{ mb: 1 }}
                          />
                        ) : null}

                        <Typography variant="h6" gutterBottom>
                          {assessment.name}
                        </Typography>

                        {/* 未通过状态显示 */}
                        {activeTab === 'failed' && (
                          <Box sx={{ mt: 1 }}>
                            <Typography variant="body2" color="text.secondary">
                              考试时间: {assessment.examTime}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              实际用时: {assessment.actualDuration || ''}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              满分: {assessment.fullScore}分
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              及格分: {assessment.passingScore}分
                            </Typography>
                            <Typography variant="body2" color="error" sx={{ mt: 0.5, fontWeight: 'bold' }}>
                              实际得分: {assessment.score || assessment.actualScore || '0'}分
                            </Typography>
                          </Box>
                        )}

                        {/* 已过期状态显示 */}
                        {activeTab === 'expired' && (
                          <Box sx={{ mt: 1 }}>
                            <Typography variant="body2" color="text.secondary">
                              考试时间: {assessment.examTime}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              考试时长: {assessment.duration}分钟
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              题目数: {assessment.questionCount}题
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              满分: {assessment.fullScore}分
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              及格分: {assessment.passingScore}分
                            </Typography>
                          </Box>
                        )}

                        {/* 通过状态显示 */}
                        {activeTab === 'passed' && (
                          <Box sx={{ mt: 1 }}>
                            <Typography variant="body2" color="text.secondary">
                              考试时间: {assessment.examTime}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              实际用时: {assessment.actualDuration || '-'}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              满分: {assessment.fullScore}分
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              及格分: {assessment.passingScore}分
                            </Typography>
                            {assessment.score !== undefined && (
                              <Typography variant="body2" color="primary" sx={{ mt: 0.5, fontWeight: 'bold' }}>
                                得分: {assessment.score}分
                              </Typography>
                            )}
                          </Box>
                        )}

                        {/* 未开始状态显示 */}
                        {activeTab === 'notStarted' && (
                          <Box sx={{ mt: 1 }}>
                            <Typography variant="body2" color="text.secondary">
                              考试时间: {assessment.examTime}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              考试时长: {assessment.duration}分钟
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              题目数: {assessment.questionCount}题
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              满分: {assessment.fullScore}分
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              及格分: {assessment.passingScore}分
                            </Typography>
                          </Box>
                        )}
                      </Box>

                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {/* 查看证书按钮 */}
                        {activeTab === 'passed' && assessment.status === 'passed' && assessment.certificateId && (
                          <Button
                            variant="outlined"
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation()
                              // 可以跳转到证书详情页
                              alert('查看证书功能待实现')
                            }}
                          >
                            查看证书
                          </Button>
                        )}
                        {/* 未开始状态显示箭头或未开放按钮 */}
                        {assessment.status === 'notStarted' && assessment.trainingCompleted && assessment.isOpen && (
                          <Typography sx={{ fontSize: '1.5rem', color: 'text.secondary' }}>&gt;</Typography>
                        )}
                        {activeTab === 'notStarted' &&
                          assessment.status === 'notStarted' &&
                          (!assessment.trainingCompleted || !assessment.isOpen) && (
                            <Chip label="未开放" size="small" color="default" />
                          )}
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              ))}
            </Box>
          )}
        </>
      )}
    </Box>
  )
}
