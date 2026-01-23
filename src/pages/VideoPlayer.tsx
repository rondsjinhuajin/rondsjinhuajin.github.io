import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Box, Typography, Button, Card, CardContent } from '@mui/material'
import VideoPlayer from '../components/video-player/VideoPlayer'
import type { QualityOption } from '../components/video-player/types'
import { mockCourses, mockUserInfo, convertToQualityList, type MockLesson } from '../lib/mockData'

export default function VideoPlayerPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const lessonId = searchParams.get('lessonId') || ''
  const courseId = searchParams.get('courseId') || ''

  const [currentLesson, setCurrentLesson] = useState<MockLesson | null>(null)
  const [qualityList, setQualityList] = useState<QualityOption[]>([])
  const [defaultQuality, setDefaultQuality] = useState<QualityOption | undefined>(undefined)
  const [totalLessons, setTotalLessons] = useState(0)
  const [learnedLessons, setLearnedLessons] = useState(0)
  const [progress, setProgress] = useState(0)
  const [currentCourse, setCurrentCourse] = useState(mockCourses[0] || null)

  // 初始化：根据传入的 lessonId 加载对应的课时
  useEffect(() => {
    // 如果传入了 courseId，优先使用该课程
    let course = currentCourse
    if (courseId) {
      const foundCourse = mockCourses.find(c => c.courseId === courseId)
      if (foundCourse) {
        course = foundCourse
        setCurrentCourse(foundCourse)
      }
    }

    if (!course) {
      course = mockCourses[0]
      setCurrentCourse(course)
    }

    if (course && course.lessons.length > 0) {
      let lesson: MockLesson | undefined

      // 如果传入了 lessonId，查找对应的课时
      if (lessonId) {
        lesson = course.lessons.find(l => l.lessonId === lessonId)
      }

      // 如果没有找到或没有传入 lessonId，使用第一个课时
      if (!lesson) {
        lesson = course.lessons[0]
      }

      if (lesson) {
        setCurrentLesson(lesson)
        
        // 转换画质列表
        const qualities = convertToQualityList(lesson.videoVariants)
        setQualityList(qualities)
        
        // 设置默认画质（优先720p）
        const defaultQ = qualities.find(q => q.value === '720p') || qualities[0]
        setDefaultQuality(defaultQ)

        // 计算进度
        const total = course.lessons.length
        const learned = course.lessons.filter(l => l.status === 'completed').length
        const progressValue = Math.round((learned / total) * 100)
        setTotalLessons(total)
        setLearnedLessons(learned)
        setProgress(progressValue)
      }
    }
  }, [lessonId, courseId])

  // 保存播放进度
  const handleProgressSave = (currentTime: number) => {
    if (!currentLesson || !currentCourse) return

    // 保存到localStorage
    localStorage.setItem(
      `video_progress_${currentLesson.lessonId}`,
      JSON.stringify({
        lessonId: currentLesson.lessonId,
        currentTime,
        lastSavedTime: Date.now(),
      })
    )

    // 更新mock数据中的进度
    const lesson = currentCourse.lessons.find(l => l.lessonId === currentLesson.lessonId)
    if (lesson) {
      lesson.videoProgress = currentTime
    }
  }

  // 视频播放完成
  const handleVideoEnd = () => {
    if (!currentLesson || !currentCourse) return

    // 更新课程状态为已完成
    const lesson = currentCourse.lessons.find(l => l.lessonId === currentLesson.lessonId)
    if (lesson) {
      lesson.status = 'completed'
      lesson.videoProgress = 0

      // 重新计算进度
      const total = currentCourse.lessons.length
      const learned = currentCourse.lessons.filter(l => l.status === 'completed').length
      const progressValue = Math.round((learned / total) * 100)
      setTotalLessons(total)
      setLearnedLessons(learned)
      setProgress(progressValue)
      setCurrentLesson({ ...lesson })
    }

    // 清除保存的进度
    localStorage.removeItem(`video_progress_${currentLesson.lessonId}`)
  }

  // 返回课程列表
  const handleBackToList = () => {
    navigate('/video-player')
  }

  if (!currentLesson) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <Typography color="text.secondary">加载中...</Typography>
      </Box>
    )
  }

  return (
    <Box>
      {/* 返回按钮 */}
      <Box sx={{ mb: 2 }}>
        <Button
          variant="outlined"
          onClick={handleBackToList}
          sx={{ mb: 2 }}
        >
          返回课程列表
        </Button>
      </Box>

      <VideoPlayer
        videoUrl={defaultQuality?.url || currentLesson.videoUrl}
        lessonId={currentLesson.lessonId}
        lessonName={currentLesson.lessonName}
        courseId={currentCourse?.courseId || ''}
        courseName={currentCourse?.courseName || ''}
        qualityList={qualityList}
        defaultQuality={defaultQuality}
        playbackRates={[1.0, 1.5, 2.0]}
        defaultPlaybackRate={1.0}
        userName={mockUserInfo.userName}
        companyName={mockUserInfo.companyName}
        onProgressSave={handleProgressSave}
        onVideoEnd={handleVideoEnd}
        showWatermark={true}
        autoPlay={true}
      />

      {/* 课程进度信息 */}
      {currentCourse && (
        <Card sx={{ mt: 3 }}>
          <CardContent>
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-around',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: 2,
              }}
            >
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  学习进度
                </Typography>
                <Typography variant="h4" color="primary" fontWeight="bold">
                  {progress}%
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  总课时
                </Typography>
                <Typography variant="h4" color="primary" fontWeight="bold">
                  {totalLessons}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  已学课时
                </Typography>
                <Typography variant="h4" color="primary" fontWeight="bold">
                  {learnedLessons}
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      )}
    </Box>
  )
}
