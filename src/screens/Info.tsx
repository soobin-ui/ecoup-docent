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

export const LOGOS: Record<string, string> = { kus, ku, konkuk, yu, jvision, sejong }
const GIFTS: Record<string, string> = { speaker: gSpeaker, battery: gBattery, bag: gBag, keyring: gKeyring }
const fade = (i: number) => ({ initial: { opacity: 0, y: 10 }, animate: { opacity: 1, y: 0 }, transition: { delay: 0.1 + i * 0.07 } })
const label = 'text-[clamp(15px,4.23vw,17.5px)] font-bold text-sea'

/** 02 HOW TO — 스탬프 3칸 + 선물뽑기 경품 */
export function HowToScreen({ p, onNext }: { p: Progress; onNext: () => void }) {
  return (
    <>
      <Hero eyebrow={HOWTO.eyebrow} title={HOWTO.title} />
      <Sheet>
        <motion.div {...fade(0)} className="rounded-3xl bg-white p-4 shadow-[0_6px_20px_-12px_rgba(8,60,100,0.35)]">
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
                <p className="mt-1 text-[clamp(12px,3.4vw,14px)] font-bold leading-tight text-ink">{g.name}</p>
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
              <div key={f.id} className={`flex items-center gap-2.5 rounded-2xl px-3 py-3 ${today ? 'bg-cyan text-white shadow-[0_6px_14px_-6px_rgba(0,173,208,0.8)]' : 'bg-white text-ink'}`}>
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

        <motion.div {...fade(1)} className="relative mt-4 overflow-hidden rounded-3xl px-4 py-4 text-white" style={{ background: 'linear-gradient(120deg,#0b4a75,#0e6aa0 55%,#00add0)' }}>
          <p className="text-[clamp(13px,3.72vw,15.5px)] font-bold text-white/85">{ABOUT.todayLabel}</p>
          <p className="mt-1 text-[clamp(21px,5.9vw,25px)] font-bold">{ABOUT.todayQ}</p>
          <div className="mt-3 flex items-center gap-1.5">
            {ABOUT.todaySteps.map((s, i) => (
              <span key={s} className="flex flex-1 items-center gap-1.5">
                <span className="flex-1 rounded-xl bg-white/20 py-2 text-center text-[clamp(13.5px,3.85vw,16px)] font-bold">{s}</span>
                {i < 2 && <span className="text-white/70">›</span>}
              </span>
            ))}
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
  const tag = (t: string) => <p className="mt-4 mb-2 text-[clamp(14px,3.97vw,16.5px)] font-bold text-mute">{t}</p>
  const row = (name: string, logo: string, strong = false) => (
    <div className={`flex items-center gap-3 rounded-2xl bg-white px-4 py-3 ${strong ? 'border-2 border-sea' : 'shadow-[0_4px_14px_-10px_rgba(8,60,100,0.35)]'}`}>
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
              <div key={m.name} className="flex min-w-0 items-center gap-2 rounded-2xl bg-white px-2.5 py-3 shadow-[0_4px_14px_-10px_rgba(8,60,100,0.35)]">
                <img src={LOGOS[m.logo]} alt="" className="h-8 w-[clamp(32px,11vw,44px)] shrink-0 object-contain" />
                <p className="min-w-0 text-[clamp(14px,4.1vw,17px)] font-bold leading-tight text-ink">{m.name}</p>
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
