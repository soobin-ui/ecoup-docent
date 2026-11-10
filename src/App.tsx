import { useEffect, useState } from 'react'
import { STEPS, clarityOf, useProgress } from './lib/progress'
import type { Step } from './lib/progress'
import { kindOf } from './lib/stampCodes'
import { RIDDLES } from './content/tour'
import { Header, Page } from './components/ui'
import { RiddleScreen } from './components/Mission'
import { IntroScreen } from './screens/Intro'
import { AboutScreen, HowToScreen, PartnersScreen } from './screens/Info'
import { A1Screen, B1Screen, B2Screen, C1Screen, C2Screen } from './screens/Sections'
import { ContestScreen, HandsScreen, RegisterScreen, StampGetScreen, SurveyScreen, TicketScreen, WaterScreen, WorksScreen } from './screens/Finale'
import { StaffScreen } from './screens/Staff'

function useHash() {
  const [h, setH] = useState(location.hash)
  useEffect(() => {
    const on = () => setH(location.hash)
    window.addEventListener('hashchange', on)
    return () => window.removeEventListener('hashchange', on)
  }, [])
  return h
}

/** 투어 중간에 끝난 화면(스탬프 획득)에서 '이전'으로 다시 문제를 못 풀게 막을 곳 */
const NO_BACK = new Set<Step>(['stamp1', 'stamp2', 'complete', 'ticket'])

export default function App() {
  const hash = useHash()
  const { p, update, go, restart } = useProgress()
  const clarity = clarityOf(p)

  // 맑음 단계를 body 에 달아 물방울·관 색이 함께 바뀌게
  useEffect(() => {
    document.body.dataset.clarity = String(clarity)
  }, [clarity])

  // 휴대폰 기본 카메라로 작품·체험 QR 을 찍어 들어온 경우(?s=코드) — 같은 브라우저면 바로 스탬프
  useEffect(() => {
    const k = kindOf(location.href)
    if (!k) return
    history.replaceState(null, '', location.pathname + location.hash)
    if (k === 'contest' && p.stamps[0]) stampContest()
    if (k === 'hands' && p.stamps[0] && p.stamps[1]) stampHands()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  if (hash === '#staff') return <StaffScreen />

  const step = p.step
  const idx = STEPS.indexOf(step)
  const back = idx > 0 && !NO_BACK.has(step) ? () => go(STEPS[idx - 1]) : undefined
  const solve = (i: 0 | 1 | 2) => () =>
    update((prev) => {
      const s = [...prev.solved] as [boolean, boolean, boolean]
      s[i] = true
      return { solved: s }
    })
  const setStamp = (i: 0 | 1 | 2) =>
    update((prev) => {
      const s = [...prev.stamps] as [boolean, boolean, boolean]
      s[i] = true
      return { stamps: s }
    })
  function stampContest() {
    setStamp(1)
    go('stamp2')
  }
  function stampHands() {
    setStamp(2)
    go('complete')
  }

  if (step === 'intro') return <IntroScreen p={p} go={go} restart={restart} />

  let body
  switch (step) {
    case 'howto':
      body = <HowToScreen p={p} onNext={() => go('about')} />
      break
    case 'about':
      body = <AboutScreen onNext={() => go('partners')} />
      break
    case 'partners':
      body = <PartnersScreen onNext={() => go('a1')} />
      break
    case 'a1':
      body = <A1Screen onNext={() => go('q1')} />
      break
    case 'q1':
      body = <RiddleScreen key="q1" r={RIDDLES[0]} solved={p.solved[0]} onSolve={solve(0)} onNext={() => go('b1')} />
      break
    case 'b1':
      body = <B1Screen onNext={() => go('b2')} />
      break
    case 'b2':
      body = <B2Screen onNext={() => go('q2')} />
      break
    case 'q2':
      body = <RiddleScreen key="q2" r={RIDDLES[1]} solved={p.solved[1]} onSolve={solve(1)} onNext={() => go('c1')} />
      break
    case 'c1':
      body = <C1Screen onNext={() => go('c2')} />
      break
    case 'c2':
      body = <C2Screen onNext={() => go('q3')} />
      break
    case 'q3':
      body = (
        <RiddleScreen
          key="q3"
          r={RIDDLES[2]}
          solved={p.solved[2]}
          onSolve={solve(2)}
          onNext={() => {
            setStamp(0)
            go('stamp1')
          }}
        />
      )
      break
    case 'stamp1':
      body = <StampGetScreen p={p} which={0} onNext={() => go('water')} />
      break
    case 'water':
      body = <WaterScreen onNext={() => go('contest')} />
      break
    case 'contest':
      body = <ContestScreen onNext={() => go('works')} />
      break
    case 'works':
      body = <WorksScreen onStamp={stampContest} />
      break
    case 'stamp2':
      body = <StampGetScreen p={p} which={1} onNext={() => go('hands')} />
      break
    case 'hands':
      body = <HandsScreen onStamp={stampHands} />
      break
    case 'complete':
      body = <StampGetScreen p={p} which={2} onNext={() => go(p.ticket ? 'ticket' : 'register')} />
      break
    case 'register':
      body = <RegisterScreen p={p} update={update} onNext={() => go('survey')} />
      break
    case 'survey':
      body = <SurveyScreen p={p} update={update} onDone={() => go('ticket')} />
      break
    case 'ticket':
      body = <TicketScreen p={p} update={update} onHome={() => go('intro')} />
      break
  }

  return (
    <Page key={step}>
      <Header stamps={p.stamps} onBack={back} />
      {body}
    </Page>
  )
}
