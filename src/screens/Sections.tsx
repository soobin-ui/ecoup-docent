import { motion } from 'framer-motion'
import { A1, C1, C2 } from '../content/tour'
import { BottomBar, Button, Card, Hero, Sheet } from '../components/ui'
import { Icon } from '../components/Icons'
import { PollutantFinder, useFound } from './A1Finder'

const fade = (i: number) => ({ initial: { opacity: 0, y: 10 }, animate: { opacity: 1, y: 0 }, transition: { delay: 0.08 + i * 0.07 } })
const groupHead = 'text-[clamp(16.5px,4.62vw,19px)] font-bold text-sea'

/* 물병 그림 — 물 종류별 색과 탁한 알갱이 */
function Jar({ color, specks }: { color: string; specks: number }) {
  const dots = [
    [30, 70, 3.2],
    [52, 84, 2.6],
    [44, 62, 2],
    [62, 72, 2.4],
    [36, 90, 2],
    [58, 96, 3],
  ].slice(0, specks)
  return (
    <svg width="46" height="62" viewBox="0 0 90 120" aria-hidden className="shrink-0">
      <rect x="8" y="8" width="74" height="104" rx="16" fill="#fff" stroke="#10303e" strokeWidth="6" />
      <path fill={color} d="M11 44 Q28 38 45 44 T79 44 V100 a9 9 0 0 1-9 9 H20 a9 9 0 0 1-9-9z" />
      {dots.map(([x, y, r], i) => (
        <circle key={i} cx={x} cy={y} r={r} fill="#10303e" opacity="0.45" />
      ))}
    </svg>
  )
}

/** A · 물의 이해 — 물 3종 + 오염물질 5가지 */
export function A1Screen({ onNext }: { onNext: () => void }) {
  const [found, setFound] = useFound()
  const all = found.every(Boolean)
  return (
    <>
      <Hero eyebrow={A1.eyebrow} title={A1.title} />
      <Sheet>
        <div className="flex flex-col gap-2.5">
          {A1.waters.map((w, i) => (
            <motion.div key={w.id} {...fade(i)} className="flex items-center gap-3 rounded-3xl tile px-4 py-3">
              <Jar color={w.color} specks={3 + i * 1.5} />
              <div className="min-w-0">
                <p className="text-[clamp(17px,4.75vw,19.5px)] font-bold text-ink">
                  {w.name} <span className="text-[clamp(13px,3.72vw,15.5px)] font-medium text-mute">{w.from}</span>
                </p>
                <div className="mt-1.5 flex flex-wrap gap-1.5">
                  {w.has.map((h) => (
                    <span key={h} className="rounded-full bg-[#e8f4f7] px-2.5 py-1 text-[clamp(13px,3.72vw,15.5px)] text-ink">
                      {h}
                    </span>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
        {/* 물속 오염물질 5가지 — 돋보기로 찾기(A1Finder.tsx) */}
        <motion.div {...fade(3)}>
          <PollutantFinder found={found} setFound={setFound} />
        </motion.div>
        <BottomBar>
          {/* 5개를 다 찾아야 다음 */}
          {!all && (
            <p className="mx-auto mb-2 flex w-fit items-center justify-center gap-1.5 rounded-full bg-white px-3.5 py-1.5 text-center text-[clamp(12.5px,3.6vw,14.5px)] font-bold text-sea shadow-[0_4px_12px_-6px_rgba(8,60,100,0.45)] ring-1 ring-[#c3dde8]">
              <Icon name="lock" size={15} />
              5가지를 모두 찾으면 넘어갈 수 있어요 ({found.filter(Boolean).length}/5)
            </p>
          )}
          <Button onClick={onNext} disabled={!all}>
            {A1.cta}
          </Button>
        </BottomBar>
      </Sheet>
    </>
  )
}

/** B · 물의 변화 ① — 물리적·화학적 처리 */
// B1 은 카드 + 단계별 그림 화면(B1Process.tsx)
export { B1Screen } from './B1Process'

// B2 는 미생물 도감·밀어서 비교·처리 순서 탭 화면(B2Lab.tsx)
export { B2Screen } from './B2Lab'

/** C · 물의 미래 ① — 정화된 물의 활용 */
export function C1Screen({ onNext }: { onNext: () => void }) {
  return (
    <>
      <Hero eyebrow={C1.eyebrow} title={C1.title} lead={C1.lead} />
      <Sheet>
        <p className={`${groupHead} text-center`}>{C1.useTitle}</p>
        <p className="mt-0.5 text-center text-[clamp(14px,3.97vw,16.5px)] text-mute">{C1.useSub}</p>
        {C1.uses.map((u, i) => (
          <motion.div key={u.from} {...fade(i)}>
            <Card className="mt-2.5 p-4">
              <p className="flex items-center gap-1.5 text-[clamp(16.5px,4.62vw,19px)] font-bold text-ink">
                {u.from}
                <span className="text-mute">→</span>
                <span className="rounded-full bg-[#e6f7ee] px-2 py-0.5 text-[clamp(12.5px,3.59vw,15px)] text-eco">정화</span>
                <span className="text-mute">→</span>
                <span className="text-[clamp(14px,3.97vw,16.5px)] text-cyan">활용</span>
              </p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {u.to.map((t) => (
                  <span key={t} className="rounded-full border border-line bg-white px-3 py-1 text-[clamp(14px,3.97vw,16.5px)] text-ink">
                    {t}
                  </span>
                ))}
              </div>
            </Card>
          </motion.div>
        ))}
        <BottomBar>
          <Button onClick={onNext}>{C1.cta}</Button>
        </BottomBar>
      </Sheet>
    </>
  )
}

/** C · 물의 미래 ② — 첨단산업 5가지 */
export function C2Screen({ onNext }: { onNext: () => void }) {
  return (
    <>
      <Hero eyebrow={C2.eyebrow} title={C2.title} />
      <Sheet>
        <div className="flex flex-col gap-2.5">
          {C2.items.map((x, i) => (
            <motion.div key={x.k} {...fade(i)} className="rounded-3xl tile px-4 py-3 text-left">
              <div className="flex items-center gap-3">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl text-white" style={{ background: x.color }}>
                  <Icon name={x.icon} size={20} />
                </span>
                <p className="flex-1 text-[clamp(17px,4.75vw,19.5px)] font-bold text-ink">
                  {x.k}{' '}
                  <span className="text-[clamp(13.5px,3.85vw,16px)]" style={{ color: x.color }}>
                    {x.tag}
                  </span>
                </p>
                <span className="text-[clamp(13px,3.72vw,15.5px)] font-bold text-sea/60">{i + 1}</span>
              </div>
              <p className="pt-1.5 pl-[52px] text-[clamp(14.5px,4.1vw,17px)] leading-snug text-mute">{x.v}</p>
            </motion.div>
          ))}
        </div>
        <BottomBar>
          <Button onClick={onNext}>{C2.cta}</Button>
        </BottomBar>
      </Sheet>
    </>
  )
}
