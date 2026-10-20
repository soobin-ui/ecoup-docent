import { useEffect, useState } from 'react'
import { STEPS, clarityOf, useProgress } from './lib/progress'
import type { Step } from './lib/progress'
import { Header, Page } from './components/ui'
import { IntroScreen } from './screens/Intro'
import { AboutScreen, PartnersScreen, TalentScreen } from './screens/Info'
import { Section1MissionScreen, Section1Screen, Section2Screen, Section3Screen } from './screens/Sections'
import { CompleteScreen, ExchangeScreen, HandsOnScreen, SurveyScreen } from './screens/Finale'
import { StaffScreen } from './screens/Staff'

/** 상단 진행 관 칸: 소개 · 섹션1 · 섹션2 · 섹션3 · 체험·기념품 */
const SEG: Record<Step, number> = {
  intro: 0,
  about: 0,
  talent: 0,
  partners: 0,
  s1: 1,
  s1b: 1,
  s2: 2,
  s3: 3,
  complete: 4,
  handson: 4,
  survey: 4,
  exchange: 4,
}

/** 스크롤 없이 한 화면에 고정하는 단계 */
const FIT = new Set<Step>(['about', 'talent', 'partners'])

function useHash() {
  const [h, setH] = useState(location.hash)
  useEffect(() => {
    const on = () => setH(location.hash)
    window.addEventListener('hashchange', on)
    return () => window.removeEventListener('hashchange', on)
  }, [])
  return h
}

export default function App() {
  const hash = useHash()
  const { p, update, go, restart } = useProgress()
  const clarity = clarityOf(p)

  // 맑음 단계를 body 에 달아 배경·물방울·관 색이 함께 바뀌게
  useEffect(() => {
    document.body.dataset.clarity = String(clarity)
  }, [clarity])

  if (hash === '#staff') return <StaffScreen />

  const step = p.step
  const idx = STEPS.indexOf(step)
  // 설문을 냈으면 뒤로 가도 설문 대신 교환 화면 앞(체험)까지만
  const back = idx > 0 ? () => go(STEPS[idx - 1]) : undefined
  const solve = (i: 0 | 1 | 2) => () =>
    update((prev) => {
      const s = [...prev.solved] as [boolean, boolean, boolean]
      s[i] = true
      return { solved: s }
    })

  if (step === 'intro') return <IntroScreen p={p} go={go} restart={restart} />

  let body
  switch (step) {
    case 'about':
      body = <AboutScreen onNext={() => go('talent')} />
      break
    case 'talent':
      body = <TalentScreen onNext={() => go('partners')} />
      break
    case 'partners':
      body = <PartnersScreen onNext={() => go('s1')} />
      break
    case 's1':
      body = <Section1Screen onNext={() => go('s1b')} />
      break
    case 's1b':
      body = <Section1MissionScreen solved={p.solved[0]} onSolve={solve(0)} onNext={() => go('s2')} />
      break
    case 's2':
      body = <Section2Screen solved={p.solved[1]} onSolve={solve(1)} onNext={() => go('s3')} />
      break
    case 's3':
      body = <Section3Screen solved={p.solved[2]} onSolve={solve(2)} onNext={() => go('complete')} />
      break
    case 'complete':
      body = <CompleteScreen onNext={() => go('handson')} />
      break
    case 'handson':
      body = <HandsOnScreen p={p} update={update} onNext={() => go(p.code ? 'exchange' : 'survey')} />
      break
    case 'survey':
      body = <SurveyScreen p={p} update={update} onDone={() => go('exchange')} />
      break
    case 'exchange':
      body = <ExchangeScreen p={p} update={update} />
      break
  }

  return (
    <Page key={step} fit={FIT.has(step)}>
      <Header seg={SEG[step]} onBack={step === 'exchange' ? () => go('handson') : back} />
      {body}
    </Page>
  )
}
