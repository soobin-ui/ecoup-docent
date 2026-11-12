import { motion } from 'framer-motion'
import { ABOUT, HOWTO, PARTNERS } from '../content/tour'
import type { Progress } from '../lib/progress'
import { BottomBar, Button, Hero, Sheet } from '../components/ui'
import { StampBoard } from '../components/Mission'
import { Icon } from '../components/Icons'
import kus from '../assets/img/logo-kus.png'
import ku from '../assets/img/logo-ku.png'
import konkuk from '../assets/img/logo-konkuk.png'
import yu from '../assets/img/logo-yu.png'
import jvision from '../assets/img/logo-jvision.png'
import sejong from '../assets/img/logo-sejong.png'
import gSpeaker from '../assets/img/gift-speaker.webp'
import gBattery from '../assets/img/gift-battery.webp'
import gBag from '../assets/img/gift-bag.webp'
import gKeyring from '../assets/img/gift-keyring.webp'
import picA from '../assets/img/a1/pollutants.webp'
import picB from '../assets/img/b1/step6.webp'
import picC from '../assets/img/c1/town.webp'

export const LOGOS: Record<string, string> = { kus, ku, konkuk, yu, jvision, sejong }
const GIFTS: Record<string, string> = { speaker: gSpeaker, battery: gBattery, bag: gBag, keyring: gKeyring }
const fade = (i: number) => ({ initial: { opacity: 0, y: 10 }, animate: { opacity: 1, y: 0 }, transition: { delay: 0.1 + i * 0.07 } })
/* 오늘의 전시 물길 — A 흙탕물 속 오염물질, B 뭉쳐 가라앉히는 처리, C 다시 쓰는 마을 */
const ROUTE_PIC = [picA, picB, picC]
const ROUTE_POS = ['50% 45%', '72% 60%', '50% 45%']
const ROUTE_RING = ['#9a6b2f', '#3f9a8a', '#0e9fc8']
const label = 'text-center text-[clamp(15px,4.23vw,17.5px)] font-bold text-sea'

/** 02 HOW TO — 스탬프 3칸 + 선물뽑기 경품 */
export function HowToScreen({ p, onNext }: { p: Progress; onNext: () => void }) {
  return (
    <>
      <Hero eyebrow={HOWTO.eyebrow} title={HOWTO.title} />
      <Sheet>
        <motion.div {...fade(0)} className="rounded-3xl tile p-4">
          <StampBoard got={p.stamps} showHow />
        </motion.div>
        <div className="my-2 text-center text-[22px] leading-none text-sea/60">↓</div>
        <motion.div {...fade(1)} className="rounded-3xl border-2 border-[#f3cf6a] bg-[#fff6d6] p-4 text-center">
          <p className="flex items-center justify-center gap-1.5 text-[clamp(18px,5vw,21px)] font-bold text-sea">
            <Icon name="gift" size={22} className="text-[#e08a00]" /> {HOWTO.giftTitle}
          </p>
          <div className="mt-3 grid grid-cols-4 gap-2">
            {HOWTO.gifts.map((g) => (
              <div key={g.id}>
                <img src={GIFTS[g.id]} alt={g.name} className="aspect-square w-full rounded-xl object-cover" />
                <p className="mt-1 text-[clamp(11px,3.3vw,14px)] font-bold leading-tight tracking-tight text-ink">
                  {g.name.split(' ').map((w) => (
                    <span key={w} className="inline-block whitespace-nowrap">
                      {w}&nbsp;
                    </span>
                  ))}
                </p>
              </div>
            ))}
          </div>
          <p className="mt-3 text-[clamp(15px,4.23vw,17.5px)] font-bold text-[#b45309]">{HOWTO.giftNote}</p>
          <p className="mt-1 text-[clamp(13px,3.72vw,15.5px)] text-mute">{HOWTO.giftWhen}</p>
        </motion.div>
        <BottomBar>
          <Button onClick={onNext} breathe>
            {HOWTO.cta}
          </Button>
        </BottomBar>
      </Sheet>
    </>
  )
}

/** 03 에코업 — 6대 분야 + 오늘의 전시 */
export function AboutScreen({ onNext }: { onNext: () => void }) {
  return (
    <>
      <Hero eyebrow={ABOUT.eyebrow} title={ABOUT.title} lead={ABOUT.lead} />
      <Sheet>
        <p className={label}>{ABOUT.fieldsTitle}</p>
        <motion.div {...fade(0)} className="mt-2 grid grid-cols-2 gap-2">
          {ABOUT.fields.map((f) => {
            const today = f.id === 'water'
            return (
              <div key={f.id} className={`flex items-center gap-2.5 rounded-2xl px-3 py-3 ${today ? 'bg-cyan text-white shadow-[0_6px_14px_-6px_rgba(0,173,208,0.8)]' : 'tile text-ink'}`}>
                <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl ${today ? 'bg-white/25' : 'bg-[#e6f7ee] text-eco'}`}>
                  <Icon name={f.id} size={19} />
                </span>
                <span className="text-[clamp(14px,3.97vw,16.5px)] font-bold leading-tight">
                  {f.name}
                  {today && <span className="mt-1 block w-fit rounded-full bg-lime px-2 py-0.5 text-[11px] text-sea">{ABOUT.todayTag}</span>}
                </span>
              </div>
            )
          })}
        </motion.div>

        {/* 오늘의 전시 — 구역 3곳을 그림으로 잇는 물길(흙탕물 → 맑은 물) */}
        <motion.div {...fade(1)} className="tile mt-4 rounded-3xl px-3 pt-4 pb-4 text-center">
          <p className="flex items-center justify-center gap-1.5 text-[clamp(13px,3.72vw,15.5px)] font-bold text-mute">
            <span className="rounded-full bg-cyan px-2.5 py-0.5 text-white">{ABOUT.todayTag}</span>
            {ABOUT.todayTheme}
          </p>
          <p className="mt-2 text-[clamp(21px,5.9vw,25px)] font-bold text-sea">
            <span className="text-[#9a6b2f]">더러운 물</span>은 어디로 갔지?
          </p>
          <div className="relative mt-4">
            {/* 물길: 흙탕물 색 → 맑은 물 색 */}
            <span className="absolute top-[34px] right-[16%] left-[16%] h-[6px] rounded-full" style={{ background: 'linear-gradient(90deg,#b08850,#7fb9a8 50%,#1fb6dc)' }} aria-hidden />
            <div className="relative grid grid-cols-3">
              {ABOUT.todayRoute.map((r, i) => (
                <motion.div key={r.zone} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 + i * 0.15 }} className="flex flex-col items-center">
                  <span className="grid h-[74px] w-[74px] place-items-center overflow-hidden rounded-full bg-white ring-[3px] shadow-[0_6px_14px_-8px_rgba(8,60,100,0.6)]" style={{ ['--tw-ring-color' as string]: ROUTE_RING[i] }}>
                    <img src={ROUTE_PIC[i]} alt="" className="h-full w-full object-cover" style={{ objectPosition: ROUTE_POS[i] }} />
                  </span>
                  <span className="mt-2 rounded-full px-2 py-0.5 text-[12px] font-bold text-white" style={{ background: ROUTE_RING[i] }}>
                    {r.zone}구역
                  </span>
                  <span className="mt-1 text-[clamp(14.5px,4.1vw,17px)] font-bold text-ink">{r.name}</span>
                  <span className="text-[clamp(12px,3.45vw,14px)] leading-tight text-mute [word-break:keep-all]">{r.what}</span>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
        <BottomBar>
          <Button onClick={onNext}>{ABOUT.cta}</Button>
        </BottomBar>
      </Sheet>
    </>
  )
}

/** 04 사업단 — 세종시 + 5개 대학 */
export function PartnersScreen({ onNext }: { onNext: () => void }) {
  const tag = (t: string) => <p className="mt-4 mb-2 text-center text-[clamp(14px,3.97vw,16.5px)] font-bold text-mute">{t}</p>
  const row = (name: string, logo: string, strong = false) => (
    <div className={`flex items-center justify-center gap-3 rounded-2xl tile px-4 py-3 ${strong ? '!border-2 !border-sea' : ''}`}>
      <img src={LOGOS[logo]} alt="" className="h-9 w-[64px] shrink-0 object-contain" />
      <p className="text-[clamp(16.5px,4.62vw,19px)] font-bold text-ink">{name}</p>
    </div>
  )
  return (
    <>
      <Hero eyebrow={PARTNERS.eyebrow} title={PARTNERS.title} />
      <Sheet>
        <motion.div {...fade(0)}>
          {tag(PARTNERS.city.tag)}
          {row(PARTNERS.city.name, PARTNERS.city.logo, true)}
          {tag(PARTNERS.lead_.tag)}
          {row(PARTNERS.lead_.name, PARTNERS.lead_.logo)}
          {tag(PARTNERS.membersTag)}
          <div className="grid grid-cols-2 gap-2">
            {PARTNERS.members.map((m) => (
              <div key={m.name} className="flex min-w-0 flex-col items-center gap-1.5 rounded-2xl tile px-2 py-3 text-center">
                <img src={LOGOS[m.logo]} alt="" className="h-9 w-auto max-w-[90px] object-contain" />
                <p className="whitespace-nowrap text-[clamp(14px,4.1vw,17px)] font-bold leading-tight text-ink">{m.name}</p>
              </div>
            ))}
          </div>
        </motion.div>
        <BottomBar>
          <Button onClick={onNext} breathe>
            {PARTNERS.cta}
          </Button>
        </BottomBar>
      </Sheet>
    </>
  )
}
