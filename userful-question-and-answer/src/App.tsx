import { Routes, Route } from 'react-router-dom'
import AssessmentList from './assessment/AssessmentList'
import AssessmentExam from './assessment/AssessmentExam'
import AssessmentResult from './assessment/AssessmentResult'
import AnswerSheet from './assessment/AnswerSheet'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<AssessmentList />} />
      <Route path="/exam/:id" element={<AssessmentExam />} />
      <Route path="/result/:id" element={<AssessmentResult />} />
      <Route path="/answer-sheet/:id" element={<AnswerSheet />} />
    </Routes>
  )
}
