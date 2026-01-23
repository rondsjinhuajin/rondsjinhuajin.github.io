import type { QualityOption } from '../components/video-player/types'

export interface MockLesson {
  id: string
  lessonId: string
  lessonName: string
  videoUrl: string
  videoVariants?: Array<{
    resolution: string
    url: string
  }>
  status: 'completed' | 'uncompleted' | 'UNFINISHED'
  videoProgress?: number
}

export interface MockCourse {
  courseId: string
  courseName: string
  lessons: MockLesson[]
}

// Mock视频URL - 使用国内可访问的公开测试视频
// 使用多个国内可访问的MP4视频资源，支持跨域播放
// 这些视频源都是公开可用的测试视频，国内访问稳定
const TENCENT_VIDEOS = {
  // 视频1 - W3C官方测试视频（Sintel高清预告片，国内可访问，稳定可靠）
  video1: 'https://media.w3.org/2010/05/sintel/trailer_hd.mp4',
  // 视频2 - W3C官方测试视频（Sintel标准预告片）
  video2: 'https://media.w3.org/2010/05/sintel/trailer.mp4',
  // 视频3 - W3C官方测试视频（Bunny电影）
  video3: 'https://media.w3.org/2010/05/bunny/movie.mp4',
  // 视频4 - W3C官方测试视频（Sintel完整电影）
  video4: 'https://media.w3.org/2010/05/sintel/movie.mp4',
  // 视频5 - 备用视频（W3C官方测试视频）
  video5: 'https://media.w3.org/2010/05/video/movie_300.mp4',
}

export const mockCourses: MockCourse[] = [
  {
    courseId: '1',
    courseName: 'React开发实战课程',
    lessons: [
      {
        id: '1',
        lessonId: '1',
        lessonName: 'React基础入门',
        videoUrl: TENCENT_VIDEOS.video1,
        videoVariants: [
          {
            resolution: '480p',
            url: TENCENT_VIDEOS.video2, // 使用标准清晰度作为480p
          },
          {
            resolution: '720p',
            url: TENCENT_VIDEOS.video1, // 使用高清作为720p
          },
          {
            resolution: '1080p',
            url: TENCENT_VIDEOS.video1, // 使用高清作为1080p
          },
        ],
        status: 'uncompleted',
        videoProgress: 0,
      },
      {
        id: '2',
        lessonId: '2',
        lessonName: 'React Hooks深入理解',
        videoUrl: TENCENT_VIDEOS.video2,
        videoVariants: [
          {
            resolution: '480p',
            url: TENCENT_VIDEOS.video2,
          },
          {
            resolution: '720p',
            url: TENCENT_VIDEOS.video1,
          },
        ],
        status: 'uncompleted',
        videoProgress: 0,
      },
      {
        id: '3',
        lessonId: '3',
        lessonName: 'React性能优化',
        videoUrl: TENCENT_VIDEOS.video3,
        videoVariants: [
          {
            resolution: '720p',
            url: TENCENT_VIDEOS.video3,
          },
          {
            resolution: '1080p',
            url: TENCENT_VIDEOS.video1,
          },
        ],
        status: 'completed',
        videoProgress: 0,
      },
    ],
  },
]

export const mockUserInfo = {
  userName: '张三',
  companyName: '示例科技有限公司',
}

// 将videoVariants转换为QualityOption格式
export const convertToQualityList = (variants?: Array<{ resolution: string; url: string }>): QualityOption[] => {
  if (!variants || variants.length === 0) {
    return []
  }

  const resolutionOrder: Record<string, number> = { '480p': 1, '720p': 2, '1080p': 3, 'source': 4 }

  return variants
    .map((variant) => {
      const resolution = variant.resolution || 'source'
      let label = ''

      if (resolution === '480p') {
        label = '480P'
      } else if (resolution === '720p') {
        label = '720P'
      } else if (resolution === '1080p') {
        label = '1080P'
      } else if (resolution === 'source') {
        label = '原版（高清）'
      } else {
        label = resolution.charAt(0).toUpperCase() + resolution.slice(1)
      }

      return {
        label,
        value: resolution,
        url: variant.url,
      }
    })
    .sort((a, b) => {
      const orderA = resolutionOrder[a.value] || 99
      const orderB = resolutionOrder[b.value] || 99
      return orderA - orderB
    })
}
