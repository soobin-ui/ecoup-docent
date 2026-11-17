import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { startInvert } from './lib/samsungInvert'
import App from './App.tsx'
import { PhoneFrame, shouldFrame } from './components/PhoneFrame.tsx'

startInvert() // 삼성 인터넷 강제 다크 대응(lib/samsungInvert.ts)
createRoot(document.getElementById('root')!).render(<StrictMode>{shouldFrame() ? <PhoneFrame /> : <App />}</StrictMode>)
