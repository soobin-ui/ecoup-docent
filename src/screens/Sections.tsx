import { motion } from 'framer-motion'
import { A1, B1, B2, C1, C2 } from '../content/tour'
import type { TermGroup } from '../content/tour'
import { BottomBar, Button, Card, Hero, Sheet } from '../components/ui'
import { Icon } from '../components/Icons'

const fade = (i: number) => ({ initial: { opacity: 0, y: 10 }, animate: { opacity: 1, y: 0 }, transition: { delay: 0.08 + i * 0.07 } })
const groupHead = 'text-[clamp(16.5px,4.62vw,19px)] font-bold text-sea'
const groupSub = 'text-[clamp(13.5px,3.85vw,16px)] font-bold text-cyan'

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
  return (
    <>
      <Hero eyebrow={A1.eyebrow} title={A1.title} />
      <Sheet>
        <div className="flex flex-col gap-2.5">
          {A1.waters.map((w, i) => (
            <motion.div key={w.id} {...fade(i)} className="flex items-center gap-3 rounded-3xl bg-white px-4 py-3 shadow-[0_6px_18px_-12px_rgba(8,60,100,0.35)]">
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
        <motion.div {...fade(3)}>
          <Card className="mt-4 p-4">
            <p className={groupHead}>{A1.pollutantsTitle}</p>
            <div className="mt-2 flex flex-col">
              {A1.pollutants.map((x, i) => (
                <div key={x.name} className={`flex items-center gap-3 py-2 ${i ? 'border-t border-line' : ''}`}>
                  <span className="w-[6.4em] shrink-0 rounded-lg bg-[#e6f6fb] py-1 text-center text-[clamp(13.5px,3.85vw,16px)] font-bold text-sea">{x.name}</span>
                  <span className="text-[clamp(14.5px,4.1vw,17px)] text-ink">{x.desc}</span>
                </div>
              ))}
            </div>
          </Card>
        </motion.div>
        <BottomBar>
          <Button onClick={onNext}>{A1.cta}</Button>
        </BottomBar>
      </Sheet>
    </>
  )
}

/* 용어 묶음 카드(물리적 처리·화학적 처리 등) */
function Terms({ g, i }: { g: TermGroup; i: number }) {
  return (
    <motion.div {...fade(i)}>
      <Card className="mt-3 p-4 first:mt-0">
        <p className={groupHead}>
          {g.title} <span className={groupSub}>· {g.sub}</span>
        </p>
        <div className="mt-2 flex flex-col">
          {g.items.map((x, k) => (
            <div key={x.k} className={`flex items-center gap-3 py-2 ${k ? 'border-t border-line' : ''}`}>
              <span className="w-[6.2em] shrink-0 rounded-lg bg-[#e6f6fb] py-1 text-center text-[clamp(13.5px,3.85vw,16px)] font-bold text-sea">{x.k}</span>
              <span className="text-[clamp(14.5px,4.1vw,17px)] leading-snug text-ink">{x.v}</span>
            </div>
          ))}
        </div>
      </Card>
    </motion.div>
  )
}

/** B · 물의 변화 ① — 물리적·화학적 처리 */
export function B1Screen({ onNext }: { onNext: () => void }) {
  return (
    <>
      <Hero eyebrow={B1.eyebrow} title={B1.title} />
      <Sheet>
        {B1.groups.map((g, i) => (
          <Terms key={g.title} g={g} i={i} />
        ))}
        <BottomBar>
          <Button onClick={onNext}>{B1.cta}</Button>
        </BottomBar>
      </Sheet>
    </>
  )
}

/** B · 물의 변화 ② — 미생물 처리·미래 기술·물 3종 처리 흐름 */
export function B2Screen({ onNext }: { onNext: () => void }) {
  return (
    <>
      <Hero eyebrow={B2.eyebrow} title={B2.title} />
      <Sheet>
        {B2.groups.map((g, i) => (
          <Terms key={g.title} g={g} i={i} />
        ))}
        <motion.div {...fade(2)}>
          <Card className="mt-3 p-4">
            <p className={groupHead}>{B2.flowTitle}</p>
            {B2.flows.map((f) => (
              <div key={f.from} className="mt-3">
                <p className="text-[clamp(14.5px,4.1vw,17px)] font-bold text-ink">
                  {f.from} → {f.to}
                </p>
                <div className="mt-1.5 flex items-center gap-1">
                  {f.steps.map((s, k) => (
                    <span key={s} className="flex flex-1 items-center gap-1">
                      <span className="flex-1 rounded-lg bg-[#e8f4f7] px-1 py-1.5 text-center text-[clamp(12px,3.4vw,14px)] font-bold leading-tight text-sea">{s}</span>
                      {k < f.steps.length - 1 && <span className="text-[12px] text-mute">›</span>}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </Card>
        </motion.div>
        <BottomBar>
          <Button onClick={onNext}>{B2.cta}</Button>
        </BottomBar>
      </Sheet>
    </>
  )
}

/** C · 물의 미래 ① — 정화된 물의 활용 */
export function C1Screen({ onNext }: { onNext: () => void }) {
  return (
    <>
      <Hero eyebrow={C1.eyebrow} title={C1.title} lead={C1.lead} />
      <Sheet>
        <p className={groupHead}>{C1.useTitle}</p>
        <p className="mt-0.5 text-[clamp(14px,3.97vw,16.5px)] text-mute">{C1.useSub}</p>
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
            <motion.div key={x.k} {...fade(i)} className="rounded-3xl bg-white px-4 py-3 text-left shadow-[0_6px_18px_-12px_rgba(8,60,100,0.35)]">
              <div className="flex items-center gap-3">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-sea text-white">
                  <Icon name={x.icon} size={20} />
                </span>
                <p className="flex-1 text-[clamp(17px,4.75vw,19.5px)] font-bold text-ink">
                  {x.k} <span className="text-[clamp(13.5px,3.85vw,16px)] text-cyan">{x.tag}</span>
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
