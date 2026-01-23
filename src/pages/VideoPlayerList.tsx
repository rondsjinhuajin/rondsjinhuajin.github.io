import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Box, Typography, Card, CardContent, Chip } from '@mui/material'
import { mockCourses, type MockCourse } from '../lib/mockData'

export default function VideoPlayerList() {
  const navigate = useNavigate()
  const [courses, setCourses] = useState<MockCourse[]>([])

  useEffect(() => {
    setCourses(mockCourses)
  }, [])

  const handleLessonClick = (courseId: string, lessonId: string) => {
    navigate(`/video-player/play?courseId=${courseId}&lessonId=${lessonId}`)
  }

  const calculateCourseProgress = (course: MockCourse) => {
    const total = course.lessons.length
    const learned = course.lessons.filter(l => l.status === 'completed').length
    const progress = total > 0 ? Math.round((learned / total) * 100) : 0
    return { total, learned, progress }
  }

  // 将秒数转换为时分秒格式
  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = Math.floor(seconds % 60)
    
    if (hours > 0) {
      return `${hours}小时${minutes}分${secs}秒`
    } else if (minutes > 0) {
      return `${minutes}分${secs}秒`
    } else {
      return `${secs}秒`
    }
  }

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        视频中心
      </Typography>
      <Typography variant="body1" color="text.secondary" paragraph>
        选择课程和视频开始学习
      </Typography>

      {courses.map((course) => {
        const { total, learned, progress } = calculateCourseProgress(course)
        
        return (
          <Card key={course.courseId} sx={{ mb: 3 }}>
            <CardContent>
              {/* 课程信息 */}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h5" component="h2">
                  {course.courseName}
                </Typography>
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                  <Typography variant="body2" color="text.secondary">
                    进度: <Typography component="span" color="primary" fontWeight="bold">{progress}%</Typography>
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {learned}/{total} 视频
                  </Typography>
                </Box>
              </Box>

              {/* 进度条 */}
              <Box
                sx={{
                  width: '100%',
                  height: 8,
                  bgcolor: 'grey.200',
                  borderRadius: 1,
                  mb: 3,
                }}
              >
                <Box
                  sx={{
                    width: `${progress}%`,
                    height: '100%',
                    bgcolor: 'primary.main',
                    borderRadius: 1,
                    transition: 'width 0.3s',
                  }}
                />
              </Box>

              {/* 课时列表 */}
              <Typography variant="h6" gutterBottom>
                视频列表
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {course.lessons.map((lesson) => (
                  <Card
                    key={lesson.id}
                    sx={{
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      '&:hover': {
                        borderColor: 'primary.main',
                        bgcolor: 'action.hover',
                        boxShadow: 2,
                      },
                    }}
                    variant="outlined"
                    onClick={() => handleLessonClick(course.courseId, lesson.lessonId)}
                  >
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="body1" fontWeight="medium">
                          {lesson.lessonName}
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                          {lesson.videoProgress && lesson.videoProgress > 0 && (
                            <Typography variant="caption" color="text.secondary">
                              已观看 {formatTime(lesson.videoProgress)}
                            </Typography>
                          )}
                          <Chip
                            label={lesson.status === 'completed' ? '已完成' : '未完成'}
                            color={lesson.status === 'completed' ? 'success' : 'default'}
                            size="small"
                          />
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                ))}
              </Box>
            </CardContent>
          </Card>
        )
      })}
    </Box>
  )
}
