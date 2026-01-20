// Mock 数据服务 - 支持随机生成试卷

import type { Assessment, Question, AssessmentDetail, AssessmentResult, QuestionType } from './types'

// 模拟延迟
const delay = (ms = 500) => new Promise((resolve) => setTimeout(resolve, ms))

// 题目库 - 用于随机生成试卷
const questionBank: Omit<Question, 'id' | 'questionId' | 'questionOrder'>[] = [
  // 单选题
  {
    content: '安全生产管理的方针是什么？',
    options: [
      { key: 'A', text: '安全第一，预防为主，综合治理' },
      { key: 'B', text: '安全第一，生产第二' },
      { key: 'C', text: '预防为主，综合治理' },
      { key: 'D', text: '安全第一，质量第一' },
    ],
    score: 2,
    type: 'single',
    correctAnswer: 'A',
    analysis: '安全生产管理的方针是"安全第一，预防为主，综合治理"。',
  },
  {
    content: '下列哪项不属于安全生产"三同时"原则？',
    options: [
      { key: 'A', text: '同时设计' },
      { key: 'B', text: '同时施工' },
      { key: 'C', text: '同时投入生产和使用' },
      { key: 'D', text: '同时验收' },
    ],
    score: 2,
    type: 'single',
    correctAnswer: 'D',
    analysis: '安全生产"三同时"原则是指建设项目安全设施必须与主体工程同时设计、同时施工、同时投入生产和使用。',
  },
  {
    content: '危险化学品储存的基本要求是什么？',
    options: [
      { key: 'A', text: '分类储存，标识清楚' },
      { key: 'B', text: '随意堆放' },
      { key: 'C', text: '混合储存' },
      { key: 'D', text: '露天储存' },
    ],
    score: 2,
    type: 'single',
    correctAnswer: 'A',
    analysis: '危险化学品必须分类储存，标识清楚，严禁混合储存和随意堆放。',
  },
  {
    content: '发生火灾时，正确的逃生方法是？',
    options: [
      { key: 'A', text: '乘坐电梯' },
      { key: 'B', text: '用湿毛巾捂住口鼻，低姿逃生' },
      { key: 'C', text: '跳楼逃生' },
      { key: 'D', text: '躲在床下' },
    ],
    score: 2,
    type: 'single',
    correctAnswer: 'B',
    analysis: '发生火灾时，应使用湿毛巾捂住口鼻，低姿逃生，切勿乘坐电梯或跳楼。',
  },
  {
    content: '个人防护用品（PPE）的作用是什么？',
    options: [
      { key: 'A', text: '装饰作用' },
      { key: 'B', text: '保护劳动者免受职业危害' },
      { key: 'C', text: '提高工作效率' },
      { key: 'D', text: '降低生产成本' },
    ],
    score: 2,
    type: 'single',
    correctAnswer: 'B',
    analysis: '个人防护用品的主要作用是保护劳动者免受职业危害，是最后一道防线。',
  },
  // 多选题
  {
    content: '下列哪些属于安全生产责任制的内容？',
    options: [
      { key: 'A', text: '企业主要负责人对本单位安全生产工作全面负责' },
      { key: 'B', text: '分管负责人对分管范围内的安全生产工作负责' },
      { key: 'C', text: '从业人员对本岗位安全生产工作负责' },
      { key: 'D', text: '安全生产责任制与工资无关' },
    ],
    score: 3,
    type: 'multiple',
    correctAnswer: ['A', 'B', 'C'],
    analysis: '安全生产责任制要求企业主要负责人、分管负责人和从业人员都要承担相应的安全生产责任。',
  },
  {
    content: '危险作业包括哪些？',
    options: [
      { key: 'A', text: '高处作业' },
      { key: 'B', text: '动火作业' },
      { key: 'C', text: '有限空间作业' },
      { key: 'D', text: '办公室作业' },
    ],
    score: 3,
    type: 'multiple',
    correctAnswer: ['A', 'B', 'C'],
    analysis: '危险作业包括高处作业、动火作业、有限空间作业等，需要特殊的安全措施和审批。',
  },
  {
    content: '事故应急救援的基本原则包括？',
    options: [
      { key: 'A', text: '统一指挥' },
      { key: 'B', text: '分级负责' },
      { key: 'C', text: '属地为主' },
      { key: 'D', text: '各自为政' },
    ],
    score: 3,
    type: 'multiple',
    correctAnswer: ['A', 'B', 'C'],
    analysis: '事故应急救援应遵循统一指挥、分级负责、属地为主的原则。',
  },
  {
    content: '安全生产教育培训的对象包括？',
    options: [
      { key: 'A', text: '新入职员工' },
      { key: 'B', text: '转岗员工' },
      { key: 'C', text: '在岗员工' },
      { key: 'D', text: '管理人员' },
    ],
    score: 3,
    type: 'multiple',
    correctAnswer: ['A', 'B', 'C', 'D'],
    analysis: '安全生产教育培训应覆盖所有从业人员，包括新入职、转岗、在岗员工和管理人员。',
  },
  {
    content: '职业健康监护包括哪些内容？',
    options: [
      { key: 'A', text: '上岗前健康检查' },
      { key: 'B', text: '在岗期间定期健康检查' },
      { key: 'C', text: '离岗时健康检查' },
      { key: 'D', text: '应急健康检查' },
    ],
    score: 3,
    type: 'multiple',
    correctAnswer: ['A', 'B', 'C', 'D'],
    analysis: '职业健康监护包括上岗前、在岗期间、离岗时和应急健康检查。',
  },
  // 判断题
  {
    content: '安全生产事故是可以完全避免的。',
    options: [
      { key: 'A', text: '正确' },
      { key: 'B', text: '错误' },
    ],
    score: 1,
    type: 'judge',
    correctAnswer: 'B',
    analysis: '虽然可以通过预防措施大幅降低事故发生率，但完全避免所有事故是不现实的。',
  },
  {
    content: '安全帽只要没有破损就可以一直使用。',
    options: [
      { key: 'A', text: '正确' },
      { key: 'B', text: '错误' },
    ],
    score: 1,
    type: 'judge',
    correctAnswer: 'B',
    analysis: '安全帽有使用期限，即使没有破损，超过使用期限也应更换。',
  },
  {
    content: '危险化学品可以与其他物品混放。',
    options: [
      { key: 'A', text: '正确' },
      { key: 'B', text: '错误' },
    ],
    score: 1,
    type: 'judge',
    correctAnswer: 'B',
    analysis: '危险化学品必须分类储存，严禁与其他物品混放，以免发生化学反应。',
  },
  {
    content: '从业人员有权拒绝违章指挥和强令冒险作业。',
    options: [
      { key: 'A', text: '正确' },
      { key: 'B', text: '错误' },
    ],
    score: 1,
    type: 'judge',
    correctAnswer: 'A',
    analysis: '从业人员有权拒绝违章指挥和强令冒险作业，这是法律赋予的权利。',
  },
  {
    content: '安全生产标准化是自愿性的。',
    options: [
      { key: 'A', text: '正确' },
      { key: 'B', text: '错误' },
    ],
    score: 1,
    type: 'judge',
    correctAnswer: 'B',
    analysis: '安全生产标准化是强制性的，企业必须按照标准要求进行安全生产管理。',
  },
  // 更多题目...
  {
    content: '应急预案应当定期进行演练。',
    options: [
      { key: 'A', text: '正确' },
      { key: 'B', text: '错误' },
    ],
    score: 1,
    type: 'judge',
    correctAnswer: 'A',
    analysis: '应急预案应当定期进行演练，以检验预案的有效性和可操作性。',
  },
  {
    content: '安全设施"三同时"是指什么？',
    options: [
      { key: 'A', text: '同时设计、同时施工、同时验收' },
      { key: 'B', text: '同时设计、同时施工、同时投入生产和使用' },
      { key: 'C', text: '同时规划、同时建设、同时使用' },
      { key: 'D', text: '同时设计、同时建设、同时验收' },
    ],
    score: 2,
    type: 'single',
    correctAnswer: 'B',
    analysis: '安全设施"三同时"是指同时设计、同时施工、同时投入生产和使用。',
  },
]

// 随机打乱数组
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

// 从题库中随机选择题目
function generateRandomQuestions(count: number): Question[] {
  const shuffled = shuffleArray(questionBank)
  const selected = shuffled.slice(0, Math.min(count, shuffled.length))
  
  return selected.map((q, index) => ({
    ...q,
    id: `q_${Date.now()}_${index}`,
    questionId: `q_${Date.now()}_${index}`,
    questionOrder: index + 1,
  }))
}

// Mock 考核列表数据
const mockAssessments: Assessment[] = [
  {
    id: '1',
    name: '安全生产基础知识考核',
    examTime: '2025-01-15 09:00:00',
    duration: 90,
    questionCount: 50,
    fullScore: 100,
    passingScore: 80,
    status: 'notStarted',
    isOpen: true,
    trainingCompleted: true,
  },
  {
    id: '2',
    name: '危险化学品安全管理考核',
    examTime: '2025-01-20 14:00:00',
    duration: 120,
    questionCount: 60,
    fullScore: 100,
    passingScore: 85,
    status: 'notStarted',
    isOpen: true,
    trainingCompleted: true,
  },
  {
    id: '3',
    name: '职业健康与防护考核',
    examTime: '2025-01-10 10:00:00',
    duration: 60,
    questionCount: 40,
    fullScore: 100,
    passingScore: 75,
    status: 'passed',
    isOpen: true,
    trainingCompleted: true,
    score: 92,
    actualDuration: '45分30秒',
  },
  {
    id: '4',
    name: '应急管理与救援考核',
    examTime: '2025-01-05 09:00:00',
    duration: 90,
    questionCount: 50,
    fullScore: 100,
    passingScore: 80,
    status: 'failed',
    isOpen: true,
    trainingCompleted: true,
    score: 65,
    actualDuration: '88分15秒',
  },
  {
    id: '5',
    name: '消防安全知识考核',
    examTime: '2024-12-20 09:00:00',
    duration: 60,
    questionCount: 40,
    fullScore: 100,
    passingScore: 75,
    status: 'expired',
    isOpen: false,
    trainingCompleted: false,
  },
]

// API 函数

// 获取考核列表
export async function getAssessmentList(status?: string): Promise<{ code: number; data: Assessment[] }> {
  await delay(500)
  
  let filtered = [...mockAssessments]
  
  if (status && status !== 'all') {
    filtered = mockAssessments.filter((item) => item.status === status)
  }
  
  return {
    code: 200,
    data: filtered,
  }
}

// 获取考核详情
export async function getAssessmentDetail(id: string): Promise<{ code: number; data: AssessmentDetail }> {
  await delay(300)
  
  const assessment = mockAssessments.find((item) => item.id === id)
  
  if (!assessment) {
    return {
      code: 404,
      data: {
        id,
        name: '考核计划',
        duration: 90,
        questionCount: 50,
        fullScore: 100,
        passingScore: 80,
        status: 'notStarted',
      },
    }
  }
  
  return {
    code: 200,
    data: {
      id: assessment.id,
      name: assessment.name,
      duration: assessment.duration,
      questionCount: assessment.questionCount,
      fullScore: assessment.fullScore,
      passingScore: assessment.passingScore,
      examTimeDisplay: assessment.examTimeDisplay || assessment.examTime,
      status: assessment.status,
    },
  }
}

// 获取题目列表（每次随机生成）
export async function getQuestions(assessmentId: string): Promise<{ code: number; data: Question[] }> {
  await delay(500)
  
  // 一次考试过程中题目必须固定：优先读取缓存（由考试页在开始时清空）
  const cached = localStorage.getItem(`questions_${assessmentId}`)
  if (cached) {
    try {
      const parsed = JSON.parse(cached) as Question[]
      if (Array.isArray(parsed) && parsed.length > 0) {
        return { code: 200, data: parsed }
      }
    } catch {
      // ignore
    }
  }

  const assessment = mockAssessments.find((item) => item.id === assessmentId)
  const questionCount = assessment?.questionCount || 50
  
  // 首次进入考试：随机生成新的题目
  const questions = generateRandomQuestions(questionCount)

  // 写入缓存，供答题卡/提交/结果复用
  localStorage.setItem(`questions_${assessmentId}`, JSON.stringify(questions))
  
  return {
    code: 200,
    data: questions,
  }
}

// 提交答案（保存到 localStorage）
export async function submitAnswer(
  assessmentId: string,
  questionId: string,
  answer: string
): Promise<{ code: number; message: string }> {
  await delay(100)
  
  const key = `answers_${assessmentId}`
  const answers = JSON.parse(localStorage.getItem(key) || '{}')
  answers[questionId] = answer
  localStorage.setItem(key, JSON.stringify(answers))
  
  return {
    code: 200,
    message: '答案已保存',
  }
}

// 提交考核
export async function submitAssessment(params: {
  examPlanId: string
  answers: Array<{ questionId: string; option: string }>
  duration: number
}): Promise<{ code: number; data: any }> {
  await delay(1000)
  
  const { examPlanId, answers, duration } = params
  const assessment = mockAssessments.find((item) => item.id === examPlanId)
  
  if (!assessment) {
    return {
      code: 404,
      data: null,
    }
  }
  
  // 获取题目和正确答案（必须与考试过程保持一致）
  let questions: Question[] = []
  const cachedQuestions = localStorage.getItem(`questions_${examPlanId}`)
  if (cachedQuestions) {
    try {
      const parsed = JSON.parse(cachedQuestions) as Question[]
      if (Array.isArray(parsed)) questions = parsed
    } catch {
      // ignore
    }
  }
  if (questions.length === 0) {
    const questionsRes = await getQuestions(examPlanId)
    questions = questionsRes.data
  }
  
  // 计算得分
  let score = 0
  let correctCount = 0
  let wrongCount = 0
  
  const answerSheet: Array<{ questionId: string; status: 'correct' | 'wrong' | 'unanswered' }> = []
  
  questions.forEach((question) => {
    const userAnswer = answers.find((a) => a.questionId === question.id)?.option || ''
    const correctAnswer = question.correctAnswer
    
    let isCorrect = false
    
    if (question.type === 'multiple') {
      // 多选题：比较数组
      const userAnswers = userAnswer.split(',').filter(Boolean).sort()
      const correctAnswers = Array.isArray(correctAnswer)
        ? [...correctAnswer].sort()
        : [correctAnswer].filter(Boolean).sort()
      
      isCorrect =
        userAnswers.length === correctAnswers.length &&
        userAnswers.every((ans) => correctAnswers.includes(ans))
    } else {
      // 单选题或判断题
      isCorrect = String(userAnswer) === String(correctAnswer)
    }
    
    if (userAnswer) {
      if (isCorrect) {
        score += question.score
        correctCount++
        answerSheet.push({ questionId: question.id, status: 'correct' })
      } else {
        wrongCount++
        answerSheet.push({ questionId: question.id, status: 'wrong' })
      }
    } else {
      answerSheet.push({ questionId: question.id, status: 'unanswered' })
    }
  })
  
  const totalCount = questions.length
  const unansweredCount = totalCount - correctCount - wrongCount
  const accuracy = totalCount > 0 ? Math.round((correctCount / totalCount) * 100) : 0
  const isPassed = score >= assessment.passingScore
  
  // 格式化用时
  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    const pad = (num: number) => num.toString().padStart(2, '0')
    return `${pad(hours)}:${pad(minutes)}:${pad(secs)}`
  }
  
  const result: AssessmentResult = {
    examPlanId,
    name: assessment.name,
    score,
    scoreText: `${score}分`,
    status: isPassed ? 'PASSED' : 'FAILED',
    isPassed,
    correctCount,
    totalCount,
    correctCountDisplay: `${correctCount}/${totalCount}`,
    wrongCount,
    unansweredCount,
    accuracy,
    duration: formatDuration(duration),
    timeUsed: formatDuration(duration),
    questions: questions.map((q) => {
      const userAnswer = answers.find((a) => a.questionId === q.id)?.option || ''
      const correctAnswer = q.correctAnswer
      
      let answerStatus: 'CORRECT' | 'WRONG' | 'UNANSWERED' = 'UNANSWERED'
      
      if (userAnswer) {
        if (q.type === 'multiple') {
          const userAnswers = userAnswer.split(',').filter(Boolean).sort()
          const correctAnswers = Array.isArray(correctAnswer)
            ? [...correctAnswer].sort()
            : [correctAnswer].filter(Boolean).sort()
          
          answerStatus =
            userAnswers.length === correctAnswers.length &&
            userAnswers.every((ans) => correctAnswers.includes(ans))
              ? 'CORRECT'
              : 'WRONG'
        } else {
          answerStatus = String(userAnswer) === String(correctAnswer) ? 'CORRECT' : 'WRONG'
        }
      }
      
      return {
        ...q,
        userAnswer,
        answerStatus,
      }
    }),
    answerSheet,
  }
  
  // 保存结果到 localStorage
  localStorage.setItem(`result_${examPlanId}`, JSON.stringify(result))
  
  // 清除答案缓存
  localStorage.removeItem(`answers_${examPlanId}`)
  // 清除题目缓存：提交后结束本次考试
  localStorage.removeItem(`questions_${examPlanId}`)
  
  return {
    code: 200,
    data: result,
  }
}

// 获取考核结果
export async function getAssessmentResult(assessmentId: string): Promise<{ code: number; data: AssessmentResult }> {
  await delay(300)
  
  const cachedResult = localStorage.getItem(`result_${assessmentId}`)
  
  if (cachedResult) {
    return {
      code: 200,
      data: JSON.parse(cachedResult),
    }
  }
  
  // 如果没有缓存，返回默认结果
  const assessment = mockAssessments.find((item) => item.id === assessmentId)
  
  if (!assessment) {
    throw new Error('考核不存在')
  }
  
  // 返回一个默认的空结果
  return {
    code: 200,
    data: {
      examPlanId: assessmentId,
      name: assessment.name,
      score: 0,
      scoreText: '0分',
      status: 'FAILED',
      isPassed: false,
      correctCount: 0,
      totalCount: 0,
      correctCountDisplay: '0/0',
      wrongCount: 0,
      unansweredCount: 0,
      accuracy: 0,
      duration: '00:00:00',
      timeUsed: '00:00:00',
      questions: [],
      answerSheet: [],
    },
  }
}
