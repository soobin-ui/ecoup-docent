import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { startInvert } from './lib/samsungInvert'
import { startAutoUpdate } from './lib/autoUpdate'
import App from './App.tsx'
import { PhoneFrame, shouldFrame } from './components/PhoneFrame.tsx'

startInvert() // 삼성 인터넷 강제 다크 대응(lib/samsungInvert.ts)
startAutoUpdate() // 휴대폰에 저장된 옛 버전이면 새 버전으로 한 번 새로고침(lib/autoUpdate.ts)
createRoot(document.getElementById('root')!).render(<StrictMode>{shouldFrame() ? <PhoneFrame /> : <App />}</StrictMode>)
