// 考核管理相关类型定义

export type AssessmentStatus = 'notStarted' | 'passed' | 'failed' | 'expired'

export interface Assessment {
  id: string
  name: string
  examTime: string
  examTimeDisplay?: string
  duration: number // 分钟
  questionCount: number
  fullScore: number
  passingScore: number
  status: AssessmentStatus
  isOpen: boolean
  trainingCompleted: boolean
  score?: number
  actualDuration?: string
  actualScore?: number
  certificateId?: string
}

export type QuestionType = 'single' | 'multiple' | 'judge'

export interface QuestionOption {
  key: string
  text: string
}

export interface Question {
  id: string
  questionId: string
  content: string
  options: QuestionOption[]
  score: number
  type: QuestionType
  questionOrder: number
  correctAnswer?: string | string[] // 单选题为字符串，多选题为字符串数组
  analysis?: string
  userAnswer?: string | string[]
  answerStatus?: 'CORRECT' | 'WRONG' | 'UNANSWERED'
}

export interface AnswerSheetItem {
  questionId: string
  status: 'correct' | 'wrong' | 'unanswered'
}

export interface AssessmentResult {
  examPlanId: string
  name: string
  score: number
  scoreText: string
  status: string
  isPassed: boolean
  correctCount: number
  totalCount: number
  correctCountDisplay: string
  wrongCount: number
  unansweredCount: number
  accuracy: number
  duration: string
  timeUsed: string
  questions: Question[]
  answerSheet: AnswerSheetItem[]
  certificateId?: string
}

export interface AssessmentDetail {
  id: string
  name: string
  duration: number
  questionCount: number
  fullScore: number
  passingScore: number
  examTimeDisplay?: string
  status: AssessmentStatus
}
