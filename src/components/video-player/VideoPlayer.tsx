import React, { useRef, useState, useEffect, useCallback } from 'react'
import type { VideoPlayerProps, QualityOption } from './types'

const CHECK_INTERVAL = 300 // 5分钟检查间隔（秒）= 5 * 60
const TIME_JUMP_TOLERANCE = 2 // 允许的时间跳跃误差（秒）
const PROGRESS_SAVE_INTERVAL = 5 // 进度保存间隔（秒）

const VideoPlayer: React.FC<VideoPlayerProps> = ({
  videoUrl: initialVideoUrl,
  lessonId = '',
  lessonName = '',
  courseId: _courseId = '',
  courseName: _courseName = '',
  qualityList = [],
  defaultQuality,
  playbackRates = [1.0, 1.5, 2.0],
  defaultPlaybackRate = 1.0,
  userName = '',
  companyName = '',
  onProgressSave,
  onVideoEnd,
  showWatermark = true,
  checkInterval = CHECK_INTERVAL,
  progressSaveInterval = PROGRESS_SAVE_INTERVAL,
  autoPlay = false,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [videoDuration, setVideoDuration] = useState(0)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [showQualityPanel, setShowQualityPanel] = useState(false)
  const [showPlaybackRatePanel, setShowPlaybackRatePanel] = useState(false)
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [showFastForwardTip, setShowFastForwardTip] = useState(false)
  const [videoUrl, setVideoUrl] = useState(initialVideoUrl)
  const [currentQuality, setCurrentQuality] = useState<QualityOption>(
    defaultQuality || qualityList[0] || { label: '720P', value: '720p', url: initialVideoUrl }
  )
  const [currentPlaybackRate, setCurrentPlaybackRate] = useState(defaultPlaybackRate)
  const [videoReady, setVideoReady] = useState(false)
  const [hasRestoredProgress, setHasRestoredProgress] = useState(false)
  const [qualitySwitchTime, setQualitySwitchTime] = useState(0)
  const [showControls, setShowControls] = useState(true)

  const lastValidTimeRef = useRef(0)
  const lastUpdateTimeRef = useRef(0)
  const lastCheckTimeRef = useRef(0)
  const lastSavedProgressRef = useRef(0)
  const pausedTimeRef = useRef(0)
  const controlsTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // 生成水印位置
  const generateWatermarks = useCallback((rows: number, cols: number) => {
    const watermarks: Array<{ top: number; left: number; rotate: number }> = []
    const startTop = -10
    const startLeft = -15
    const endTop = 110
    const endLeft = 115

    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < cols; j++) {
        const top = startTop + (i * (endTop - startTop) / (rows - 1))
        const left = startLeft + (j * (endLeft - startLeft) / (cols - 1))
        watermarks.push({ top, left, rotate: -45 })
      }
    }
    return watermarks
  }, [])

  const watermarkList = generateWatermarks(3, 3)
  const watermarkAllList = generateWatermarks(5, 6)

  // 检测时间异常跳跃（防快进）
  const checkTimeJump = useCallback((currentTime: number, now: number): boolean => {
    if (!isPlaying || lastValidTimeRef.current <= 0 || lastUpdateTimeRef.current <= 0) {
      return false
    }

    const realTimePassed = (now - lastUpdateTimeRef.current) / 1000
    const videoTimeIncrement = currentTime - lastValidTimeRef.current

    // 检测到快进行为
    if (videoTimeIncrement > realTimePassed + TIME_JUMP_TOLERANCE && realTimePassed > 0) {
      if (videoRef.current) {
        // 恢复到上一个有效时间点
        videoRef.current.currentTime = lastValidTimeRef.current
      }
      // 显示快进提示
      setShowFastForwardTip(true)
      // 3秒后自动隐藏提示
      setTimeout(() => {
        setShowFastForwardTip(false)
      }, 3000)
      return true
    }
    return false
  }, [isPlaying])

  // 检查是否需要弹出确认框
  const checkConfirmDialog = useCallback((currentTime: number) => {
    if (!isPlaying || currentTime <= 0 || showConfirmModal) {
      return
    }

    if (currentTime - lastCheckTimeRef.current >= checkInterval) {
      const currentInterval = Math.floor(currentTime / checkInterval)
      lastCheckTimeRef.current = currentInterval * checkInterval
      setShowConfirmModal(true)
      if (videoRef.current) {
        videoRef.current.pause()
      }
      setIsPlaying(false)
    }
  }, [isPlaying, showConfirmModal, checkInterval])

  // 保存进度（带间隔检查）
  const saveProgress = useCallback((time: number) => {
    if (onProgressSave && Math.abs(time - lastSavedProgressRef.current) >= progressSaveInterval) {
      lastSavedProgressRef.current = time
      onProgressSave(time)
    }
  }, [onProgressSave, progressSaveInterval])

  // 立即保存进度（不检查间隔，用于页面离开时）
  const saveProgressImmediately = useCallback((time: number) => {
    if (onProgressSave && time > 0) {
      lastSavedProgressRef.current = time
      onProgressSave(time)
    }
  }, [onProgressSave])

  // 恢复进度
  const restoreProgress = useCallback(async () => {
    if (!lessonId || hasRestoredProgress || !videoReady || !videoRef.current) return

    try {
      const savedProgress = localStorage.getItem(`video_progress_${lessonId}`)
      if (savedProgress) {
        const progress = JSON.parse(savedProgress)
        const savedTime = progress.currentTime || 0
        
        if (savedTime > 0 && videoRef.current) {
          const duration = videoRef.current.duration || videoDuration
          const restoreTime = duration > 0 ? Math.min(savedTime, duration - 0.5) : savedTime
          
          console.log('Restoring progress:', { savedTime, restoreTime, duration })
          
          // 确保视频准备好后再设置 currentTime
          if (videoRef.current.readyState >= 2) { // HAVE_CURRENT_DATA
            videoRef.current.currentTime = restoreTime
            setCurrentTime(restoreTime)
            lastValidTimeRef.current = restoreTime
            lastSavedProgressRef.current = restoreTime
            console.log('Progress restored to:', restoreTime)
          } else {
            // 如果视频还没准备好，等待 canplay 事件
            const handleCanPlay = () => {
              if (videoRef.current && restoreTime > 0) {
                videoRef.current.currentTime = restoreTime
                setCurrentTime(restoreTime)
                lastValidTimeRef.current = restoreTime
                lastSavedProgressRef.current = restoreTime
                console.log('Progress restored on canplay:', restoreTime)
              }
              videoRef.current?.removeEventListener('canplay', handleCanPlay)
            }
            videoRef.current.addEventListener('canplay', handleCanPlay)
          }
        }
      }
      // 无论是否有保存的进度，都标记为已恢复，以便触发自动播放
      setHasRestoredProgress(true)
    } catch (error) {
      console.error('Failed to restore progress:', error)
      // 即使出错也标记为已恢复
      setHasRestoredProgress(true)
    }
  }, [lessonId, hasRestoredProgress, videoReady, videoDuration])

  // 视频事件处理
  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      const duration = videoRef.current.duration
      setVideoDuration(duration)
      setVideoReady(true)

      // 切换画质后恢复进度
      if (qualitySwitchTime > 0) {
        const targetTime = Math.min(qualitySwitchTime, duration - 0.5)
        if (videoRef.current) {
          videoRef.current.currentTime = targetTime
          setCurrentTime(targetTime)
          lastValidTimeRef.current = targetTime
          setQualitySwitchTime(0)
          if (isPlaying) {
            videoRef.current.play()
          }
        }
        return
      }

      // 首次加载时恢复进度（延迟一下确保 duration 已设置）
      if (!hasRestoredProgress) {
        // 使用 setTimeout 确保 videoDuration state 已更新
        setTimeout(() => {
          restoreProgress()
        }, 100)
      }
    }
  }

  // 处理 canplay 事件，确保视频准备好后再恢复进度
  const handleCanPlay = useCallback(() => {
    if (!hasRestoredProgress && videoReady && lessonId && videoRef.current) {
      // 如果之前恢复进度时视频还没准备好，现在可以恢复了
      const savedProgress = localStorage.getItem(`video_progress_${lessonId}`)
      if (savedProgress) {
        try {
          const progress = JSON.parse(savedProgress)
          const savedTime = progress.currentTime || 0
          const currentTime = videoRef.current.currentTime
          
          // 如果当前时间还是接近0，说明进度还没恢复
          if (savedTime > 0 && currentTime < 1) {
            const duration = videoRef.current.duration
            const restoreTime = duration > 0 ? Math.min(savedTime, duration - 0.5) : savedTime
            videoRef.current.currentTime = restoreTime
            setCurrentTime(restoreTime)
            lastValidTimeRef.current = restoreTime
            lastSavedProgressRef.current = restoreTime
            console.log('Progress restored on canplay event:', restoreTime)
            setHasRestoredProgress(true)
          } else if (currentTime >= 1) {
            // 如果已经有进度了，说明已经恢复过了
            setHasRestoredProgress(true)
          }
        } catch (error) {
          console.error('Failed to restore progress on canplay:', error)
          setHasRestoredProgress(true)
        }
      } else {
        setHasRestoredProgress(true)
      }
    }
  }, [hasRestoredProgress, videoReady, lessonId])

  // 自动播放处理
  useEffect(() => {
    if (autoPlay && videoReady && hasRestoredProgress && videoRef.current && !isPlaying) {
      // 等待进度恢复完成后再自动播放
      // 增加延迟时间，确保 currentTime 已设置完成
      const timer = setTimeout(() => {
        if (videoRef.current && !isPlaying) {
          // 再次确认进度已恢复
          const savedProgress = lessonId ? localStorage.getItem(`video_progress_${lessonId}`) : null
          if (savedProgress) {
            try {
              const progress = JSON.parse(savedProgress)
              const savedTime = progress.currentTime || 0
              // 如果当前时间与保存的时间差距较大，说明进度还没恢复，再设置一次
              if (savedTime > 0 && Math.abs(videoRef.current.currentTime - savedTime) > 1) {
                videoRef.current.currentTime = savedTime
                setCurrentTime(savedTime)
                lastValidTimeRef.current = savedTime
                console.log('Re-restoring progress before autoplay:', savedTime)
              }
            } catch (error) {
              console.error('Failed to re-restore progress:', error)
            }
          }
          
          // 延迟一下再播放，确保 currentTime 已生效
          setTimeout(() => {
            if (videoRef.current && !isPlaying) {
              videoRef.current.play().catch((error) => {
                console.warn('Auto-play was prevented:', error)
              })
            }
          }, 200)
        }
      }, 300)
      return () => clearTimeout(timer)
    }
  }, [autoPlay, videoReady, hasRestoredProgress, isPlaying, lessonId])

  const handleTimeUpdate = () => {
    if (!videoRef.current) return

    const { currentTime: time, duration } = videoRef.current
    const now = Date.now()

    // 在暂停状态下检测进度条拖动（禁止快进）
    if (!isPlaying && pausedTimeRef.current > 0) {
      if (Math.abs(time - pausedTimeRef.current) > 0.5) {
        if (videoRef.current) {
          videoRef.current.currentTime = pausedTimeRef.current
        }
        setCurrentTime(pausedTimeRef.current)
        lastValidTimeRef.current = pausedTimeRef.current
        // 显示快进提示
        setShowFastForwardTip(true)
        setTimeout(() => {
          setShowFastForwardTip(false)
        }, 3000)
        return
      }
    }

    // 检测异常跳跃
    if (checkTimeJump(time, now)) {
      setCurrentTime(lastValidTimeRef.current)
      return
    }

    // 更新时间和时间戳
    setCurrentTime(time)
    setVideoDuration(duration)
    lastValidTimeRef.current = time
    lastUpdateTimeRef.current = now

    // 定期保存播放进度
    saveProgress(time)

    // 检查确认框
    checkConfirmDialog(time)
  }

  const handlePlay = () => {
    setIsPlaying(true)
    lastUpdateTimeRef.current = Date.now()
    pausedTimeRef.current = 0
  }

  const handlePause = () => {
    setIsPlaying(false)
    lastUpdateTimeRef.current = Date.now()
    if (videoRef.current) {
      pausedTimeRef.current = videoRef.current.currentTime
    }
  }

  const handleEnded = () => {
    setIsPlaying(false)
    if (lessonId) {
      localStorage.removeItem(`video_progress_${lessonId}`)
    }
    if (onVideoEnd) {
      onVideoEnd()
    }
  }

  const handleFullscreenChange = () => {
    setIsFullscreen(!!document.fullscreenElement)
  }

  // 全屏控制
  useEffect(() => {
    document.addEventListener('fullscreenchange', handleFullscreenChange)
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange)
    }
  }, [])

  // 画质切换
  const handleQualityChange = (quality: QualityOption) => {
    if (quality.value === currentQuality.value) {
      setShowQualityPanel(false)
      return
    }

    resetControlsTimer()
    const wasPlaying = isPlaying
    const currentTime = videoRef.current?.currentTime || 0

    if (videoRef.current) {
      videoRef.current.pause()
    }
    setIsPlaying(false)

    setVideoUrl(quality.url)
    setCurrentQuality(quality)
    setShowQualityPanel(false)
    setQualitySwitchTime(currentTime)
    setIsPlaying(wasPlaying)
  }

  // 倍速切换
  const handlePlaybackRateChange = (rate: number) => {
    if (rate === currentPlaybackRate) {
      setShowPlaybackRatePanel(false)
      return
    }

    resetControlsTimer()
    setCurrentPlaybackRate(rate)
    setShowPlaybackRatePanel(false)

    if (videoRef.current) {
      videoRef.current.playbackRate = rate
    }
  }

  // 进入/退出全屏
  const toggleFullscreen = async () => {
    if (!videoRef.current) return

    if (!isFullscreen) {
      try {
        await videoRef.current.requestFullscreen()
      } catch (error) {
        console.error('Failed to enter fullscreen:', error)
      }
    } else {
      try {
        await document.exitFullscreen()
      } catch (error) {
        console.error('Failed to exit fullscreen:', error)
      }
    }
  }

  // 确认继续学习
  const handleConfirmContinue = () => {
    setShowConfirmModal(false)
    setTimeout(() => {
      if (videoRef.current) {
        videoRef.current.play()
      }
      setIsPlaying(true)
    }, 300)
  }

  // 格式化时间
  const formatTime = (seconds: number): string => {
    const h = Math.floor(seconds / 3600)
    const m = Math.floor((seconds % 3600) / 60)
    const s = Math.floor(seconds % 60)
    if (h > 0) {
      return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
    }
    return `${m}:${s.toString().padStart(2, '0')}`
  }

  // 重置控制条隐藏定时器
  const resetControlsTimer = useCallback(() => {
    if (controlsTimerRef.current) {
      clearTimeout(controlsTimerRef.current)
    }
    setShowControls(true)
    controlsTimerRef.current = setTimeout(() => {
      setShowControls(false)
    }, 3000)
  }, [])

  // 鼠标移入时显示控制条
  const handleMouseEnter = useCallback(() => {
    resetControlsTimer()
  }, [resetControlsTimer])

  // 鼠标移出时开始计时隐藏
  const handleMouseLeave = useCallback(() => {
    if (controlsTimerRef.current) {
      clearTimeout(controlsTimerRef.current)
    }
    controlsTimerRef.current = setTimeout(() => {
      setShowControls(false)
    }, 3000)
  }, [])

  // 初始化控制条定时器
  useEffect(() => {
    resetControlsTimer()
    return () => {
      if (controlsTimerRef.current) {
        clearTimeout(controlsTimerRef.current)
      }
    }
  }, [resetControlsTimer])

  // 当用户交互时重置定时器
  useEffect(() => {
    const handleUserInteraction = () => {
      resetControlsTimer()
    }

    const videoElement = videoRef.current
    if (videoElement) {
      videoElement.addEventListener('click', handleUserInteraction)
      videoElement.addEventListener('mousemove', handleUserInteraction)
      return () => {
        videoElement.removeEventListener('click', handleUserInteraction)
        videoElement.removeEventListener('mousemove', handleUserInteraction)
      }
    }
  }, [resetControlsTimer])

  // 点击外部关闭面板
  useEffect(() => {
    const handleClickOutside = () => {
      setShowQualityPanel(false)
      setShowPlaybackRatePanel(false)
    }
    if (showQualityPanel || showPlaybackRatePanel) {
      document.addEventListener('click', handleClickOutside)
      return () => {
        document.removeEventListener('click', handleClickOutside)
      }
    }
  }, [showQualityPanel, showPlaybackRatePanel])

  // 页面离开时立即保存进度
  useEffect(() => {
    // 组件卸载时保存进度
    const handleUnload = () => {
      if (lessonId) {
        // 优先使用 lastValidTimeRef，因为它总是最新的有效时间
        const timeToSave = lastValidTimeRef.current > 0 
          ? lastValidTimeRef.current 
          : (videoRef.current?.currentTime || 0)
        
        if (timeToSave > 0) {
          saveProgressImmediately(timeToSave)
        }
      }
    }

    // 页面关闭/刷新时保存进度
    const handleBeforeUnload = (_e: BeforeUnloadEvent) => {
      if (lessonId) {
        // 使用同步方式保存，确保在页面关闭前保存
        try {
          // 优先使用 lastValidTimeRef，因为它总是最新的有效时间
          const timeToSave = lastValidTimeRef.current > 0 
            ? lastValidTimeRef.current 
            : (videoRef.current?.currentTime || 0)
          
          if (timeToSave > 0) {
            const progressData = {
              lessonId,
              currentTime: timeToSave,
              lastSavedTime: Date.now(),
            }
            // 直接保存到 localStorage，确保在页面关闭前保存
            localStorage.setItem(
              `video_progress_${lessonId}`,
              JSON.stringify(progressData)
            )
            // 尝试调用回调函数（可能无法执行，但不影响 localStorage 保存）
            try {
              if (onProgressSave) {
                onProgressSave(timeToSave)
              }
            } catch (error) {
              // 忽略回调错误，localStorage 已保存
            }
          }
        } catch (error) {
          console.error('Failed to save progress on unload:', error)
        }
      }
    }

    // 标签页切换时保存进度
    const handleVisibilityChange = () => {
      if (document.hidden && lessonId) {
        const timeToSave = lastValidTimeRef.current > 0 
          ? lastValidTimeRef.current 
          : (videoRef.current?.currentTime || 0)
        
        if (timeToSave > 0) {
          saveProgressImmediately(timeToSave)
        }
      }
    }

    // 添加事件监听器
    window.addEventListener('beforeunload', handleBeforeUnload)
    document.addEventListener('visibilitychange', handleVisibilityChange)

    // 组件卸载时保存进度
    return () => {
      handleUnload()
      window.removeEventListener('beforeunload', handleBeforeUnload)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [lessonId, saveProgressImmediately, onProgressSave])

  return (
    <div 
      className={`flex flex-col bg-black ${isFullscreen ? 'fixed inset-0 z-50' : ''}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className={`relative w-full bg-black ${isFullscreen ? 'h-full' : ''}`} style={!isFullscreen ? { aspectRatio: '16/9' } : {}}>
        <video
          ref={videoRef}
          src={videoUrl}
          className="w-full h-full object-contain"
          onLoadedMetadata={handleLoadedMetadata}
          onCanPlay={handleCanPlay}
          onTimeUpdate={handleTimeUpdate}
          onPlay={handlePlay}
          onPause={handlePause}
          onEnded={handleEnded}
          onSeeking={(e) => {
            // 禁止拖动进度条（快进）
            const target = e.target as HTMLVideoElement
            const seekTime = target.currentTime
            const lastValidTime = lastValidTimeRef.current
            
            // 如果拖动的时间超过允许的范围，禁止快进
            if (seekTime > lastValidTime + TIME_JUMP_TOLERANCE && isPlaying) {
              e.preventDefault()
              if (videoRef.current) {
                videoRef.current.currentTime = lastValidTime
              }
              setShowFastForwardTip(true)
              setTimeout(() => {
                setShowFastForwardTip(false)
              }, 3000)
            }
          }}
          controls
          playsInline
          autoPlay={autoPlay}
        />

        {/* 水印 - 非全屏 */}
        {showWatermark && !isFullscreen && (userName || companyName) && (
          <div className="absolute inset-0 pointer-events-none z-10 overflow-hidden">
            {watermarkList.map((mark, index) => (
              <div
                key={index}
                className="absolute text-gray-400 opacity-40 text-sm whitespace-nowrap font-normal"
                style={{
                  top: `${mark.top}%`,
                  left: `${mark.left}%`,
                  transform: `rotate(${mark.rotate}deg)`,
                }}
              >
                <div>{userName}{userName && companyName ? ' | ' : ''}{companyName}</div>
                <div className="mt-1">严禁任何形式录拍 违规必追责</div>
              </div>
            ))}
          </div>
        )}

        {/* 水印 - 全屏 */}
        {showWatermark && isFullscreen && (userName || companyName) && (
          <div className="absolute inset-0 pointer-events-none z-10 overflow-visible">
            {watermarkAllList.map((mark, index) => (
              <div
                key={index}
                className="absolute text-gray-400 opacity-40 text-sm whitespace-nowrap font-normal"
                style={{
                  top: `${mark.top}%`,
                  left: `${mark.left}%`,
                  transform: `rotate(${mark.rotate}deg)`,
                }}
              >
                <div>{userName}{userName && companyName ? ' | ' : ''}{companyName}</div>
                <div className="mt-1">严禁任何形式录拍 违规必追责</div>
              </div>
            ))}
          </div>
        )}

        {/* 自定义控制条 - 非全屏 */}
        {!isFullscreen && (
          <div 
            className={`absolute bottom-20 left-0 right-0 flex justify-end pr-10 z-20 text-white text-sm transition-opacity duration-300 ${
              showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'
            }`}
          >
            {qualityList.length > 0 && (
              <div className="relative ml-10">
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    resetControlsTimer()
                    setShowPlaybackRatePanel(false)
                    setShowQualityPanel(!showQualityPanel)
                  }}
                  className="px-4 py-2 bg-black bg-opacity-50 rounded text-white"
                >
                  {currentQuality.label}
                </button>
                {showQualityPanel && (
                  <div 
                    className="absolute bottom-full right-0 mb-2 w-48 bg-black bg-opacity-70 rounded text-white py-2 z-30"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {qualityList.map((quality: QualityOption) => (
                      <button
                        key={quality.value}
                        onClick={(e) => {
                          e.stopPropagation()
                          handleQualityChange(quality)
                        }}
                        className="w-full px-4 py-2 text-left hover:bg-black hover:bg-opacity-50 flex justify-between items-center"
                      >
                        <span>{quality.label}</span>
                        {quality.value === currentQuality.value && <span>✔</span>}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
            <div className="relative ml-4">
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  resetControlsTimer()
                  setShowQualityPanel(false)
                  setShowPlaybackRatePanel(!showPlaybackRatePanel)
                }}
                className="px-4 py-2 bg-black bg-opacity-50 rounded text-white"
              >
                {currentPlaybackRate === 1.0 ? '正常' : `${currentPlaybackRate}倍`}
              </button>
              {showPlaybackRatePanel && (
                <div 
                  className="absolute bottom-full right-0 mb-2 w-48 bg-black bg-opacity-70 rounded text-white py-2 z-30"
                  onClick={(e) => e.stopPropagation()}
                >
                  {playbackRates.map((rate: number) => (
                    <button
                      key={rate}
                      onClick={(e) => {
                        e.stopPropagation()
                        handlePlaybackRateChange(rate)
                      }}
                      className="w-full px-4 py-2 text-left hover:bg-black hover:bg-opacity-50 flex justify-between items-center"
                    >
                      <span>{rate === 1.0 ? '正常' : `${rate}倍`}</span>
                      {rate === currentPlaybackRate && <span>✔</span>}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation()
                resetControlsTimer()
                toggleFullscreen()
              }}
              className="ml-4 px-4 py-2 bg-black bg-opacity-50 rounded text-white"
            >
              全屏
            </button>
          </div>
        )}

        {/* 自定义控制条 - 全屏 */}
        {isFullscreen && (
          <div 
            className={`absolute bottom-20 left-0 right-0 flex justify-end pr-10 z-20 text-white text-sm pointer-events-none transition-opacity duration-300 ${
              showControls ? 'opacity-100' : 'opacity-0'
            }`}
          >
            {qualityList.length > 0 && (
              <div className="relative ml-10 pointer-events-auto">
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    resetControlsTimer()
                    setShowPlaybackRatePanel(false)
                    setShowQualityPanel(!showQualityPanel)
                  }}
                  className="px-4 py-2 bg-black bg-opacity-50 rounded text-white"
                >
                  {currentQuality.label}
                </button>
                {showQualityPanel && (
                  <div 
                    className="absolute bottom-full right-0 mb-2 w-48 bg-black bg-opacity-70 rounded text-white py-2 z-30"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {qualityList.map((quality: QualityOption) => (
                      <button
                        key={quality.value}
                        onClick={(e) => {
                          e.stopPropagation()
                          handleQualityChange(quality)
                        }}
                        className="w-full px-4 py-2 text-left hover:bg-black hover:bg-opacity-50 flex justify-between items-center"
                      >
                        <span>{quality.label}</span>
                        {quality.value === currentQuality.value && <span>✔</span>}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
            <div className="relative ml-4 pointer-events-auto">
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  resetControlsTimer()
                  setShowQualityPanel(false)
                  setShowPlaybackRatePanel(!showPlaybackRatePanel)
                }}
                className="px-4 py-2 bg-black bg-opacity-50 rounded text-white"
              >
                {currentPlaybackRate === 1.0 ? '正常' : `${currentPlaybackRate}倍`}
              </button>
              {showPlaybackRatePanel && (
                <div 
                  className="absolute bottom-full right-0 mb-2 w-48 bg-black bg-opacity-70 rounded text-white py-2 z-30"
                  onClick={(e) => e.stopPropagation()}
                >
                  {playbackRates.map((rate: number) => (
                    <button
                      key={rate}
                      onClick={(e) => {
                        e.stopPropagation()
                        handlePlaybackRateChange(rate)
                      }}
                      className="w-full px-4 py-2 text-left hover:bg-black hover:bg-opacity-50 flex justify-between items-center"
                    >
                      <span>{rate === 1.0 ? '正常' : `${rate}倍`}</span>
                      {rate === currentPlaybackRate && <span>✔</span>}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation()
                resetControlsTimer()
                toggleFullscreen()
              }}
              className="ml-4 px-4 py-2 bg-black bg-opacity-50 rounded text-white pointer-events-auto"
            >
              退出全屏
            </button>
          </div>
        )}
      </div>

      {/* 课程信息 */}
      {!isFullscreen && lessonName && (
        <div className="p-6 bg-white border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-800">{lessonName}</h2>
        </div>
      )}

      {/* 快进提示 */}
      {showFastForwardTip && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 animate-fade-in">
          <div className="bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-2">
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
            <span className="font-medium">不允许快进，请按正常速度观看</span>
          </div>
        </div>
      )}

      {/* 5分钟确认弹窗 */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 w-80 shadow-xl">
            <h3 className="text-xl font-bold text-gray-800 text-center mb-4">提示</h3>
            <p className="text-gray-600 text-center mb-6">您已观看5分钟，是否继续学习？</p>
            <div className="flex gap-4">
              <button
                onClick={() => {
                  setShowConfirmModal(false)
                  if (videoRef.current) {
                    videoRef.current.pause()
                  }
                  setIsPlaying(false)
                }}
                className="flex-1 py-3 bg-gray-100 text-gray-600 rounded hover:bg-gray-200 transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleConfirmContinue}
                className="flex-1 py-3 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
              >
                确定
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default VideoPlayer
