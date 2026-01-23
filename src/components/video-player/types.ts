export interface QualityOption {
  label: string
  value: string
  url: string
}

export interface VideoPlayerProps {
  videoUrl: string
  lessonId?: string
  lessonName?: string
  courseId?: string
  courseName?: string
  qualityList?: QualityOption[]
  defaultQuality?: QualityOption
  playbackRates?: number[]
  defaultPlaybackRate?: number
  userName?: string
  companyName?: string
  onProgressSave?: (currentTime: number) => void
  onVideoEnd?: () => void
  showWatermark?: boolean
  checkInterval?: number
  progressSaveInterval?: number
  autoPlay?: boolean
}

export interface VideoProgress {
  lessonId: string
  currentTime: number
  videoDuration: number
  lastSavedTime: number
}
