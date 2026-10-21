import { motion } from 'framer-motion'
import { ABOUT, PARTNERS, TALENT } from '../content/tour'
import { BottomBar, Button, Character, Hero, Rich, Sheet } from '../components/ui'
import { Icon } from '../components/Icons'
import kus from '../assets/img/logo-kus.png'
import ku from '../assets/img/logo-ku.png'
import konkuk from '../assets/img/logo-konkuk.png'
import yu from '../assets/img/logo-yu.png'
import jvision from '../assets/img/logo-jvision.png'
import sejong from '../assets/img/logo-sejong.png'

/*
  사업단 소개 3장 — 모두 '스크롤 없이 한 화면'.
  글자·간격은 화면 높이(vh)에 맞춰 줄고 늘어납니다(320×568 ~ 430×932).
*/

const LOGOS: Record<string, string> = { kus, ku, konkuk, yu, jvision, sejong }
const BTN = 'h-[clamp(50px,7vh,58px)] text-[clamp(18.5px,5.13vw,21px)]'
const fade = (i: number) => ({ initial: { opacity: 0, y: 10 }, animate: { opacity: 1, y: 0 }, transition: { delay: 0.1 + i * 0.07 } })

/** 1/3 에코업이 뭐예요? */
export function AboutScreen({ onNext }: { onNext: () => void }) {
  return (
    <>
      <Hero eyebrow={ABOUT.eyebrow} title={ABOUT.title} />
      <Sheet>
        <div className="flex flex-col pb-2 justify-evenly gap-[min(12px,1.5vh)]">
          <motion.div {...fade(0)} className="rounded-3xl bg-white p-[min(18px,2.2vh)] shadow-[0_6px_20px_-12px_rgba(8,60,100,0.35)]">
            <p className="flex items-center gap-1.5 text-[clamp(16.5px,4.62vw,19px)] font-bold text-sea">
              <Icon name="water" size={18} className="text-cyan" /> {ABOUT.whatQ}
            </p>
            <p className="b-accent mt-[min(8px,1vh)] text-[clamp(16px,4.49vw,18.5px)] leading-[1.55] text-ink">
              <Rich text={ABOUT.whatA} />
            </p>
          </motion.div>

          <motion.div {...fade(1)} className="relative overflow-hidden rounded-3xl px-[min(18px,2.2vh)] py-[min(16px,2vh)] text-white" style={{ background: 'linear-gradient(120deg,#0b4a75,#0e6aa0 55%,#00add0)' }}>
            <p className="text-[clamp(13px,3.72vw,15.5px)] font-bold text-white/80">{ABOUT.lead}</p>
            <p className="mt-1 text-[clamp(13px,3.72vw,15.5px)] font-bold tracking-[0.12em] text-lime">VISION</p>
            <p className="mt-1 text-[clamp(18.5px,5.13vw,21px)] font-bold leading-snug">{ABOUT.vision}</p>
            <svg className="absolute -right-3 -bottom-4 opacity-20" width="90" height="108" viewBox="0 0 50 60" aria-hidden>
              <path d="M25 2C25 2 4 27 4 39a21 21 0 0 0 42 0C46 27 25 2 25 2z" fill="#fff" />
            </svg>
          </motion.div>

          <motion.div {...fade(2)}>
            <p className="mb-[min(8px,1vh)] text-[clamp(16.5px,4.62vw,19px)] font-bold text-sea">{ABOUT.fieldsTitle}</p>
            <div className="grid grid-cols-3 gap-[min(8px,1vh)]">
              {ABOUT.fields.map((f) => {
                const today = f.id === 'water'
                return (
                  <div
                    key={f.id}
                    className={`relative flex flex-col items-center rounded-2xl px-1 py-[min(12px,1.5vh)] text-center ${today ? 'bg-cyan text-white shadow-[0_6px_14px_-6px_rgba(0,173,208,0.8)]' : 'bg-white text-ink'}`}
                  >
                    {today && <span className="absolute -top-2 rounded-full bg-lime px-2 py-0.5 text-[clamp(11px,3.21vw,13.5px)] font-bold text-sea">{ABOUT.todayTag}</span>}
                    <span className={`grid h-[clamp(30px,4.6vh,40px)] w-[clamp(30px,4.6vh,40px)] place-items-center rounded-xl ${today ? 'bg-white/25' : 'bg-[#e6f7ee] text-eco'}`}>
                      <Icon name={f.id} size={20} />
                    </span>
                    <span className="mt-[min(6px,0.8vh)] text-[clamp(14px,3.97vw,16.5px)] font-bold leading-tight">{f.name}</span>
                  </div>
                )
              })}
            </div>
          </motion.div>
        </div>
        <BottomBar>
          <Button onClick={onNext} className={BTN}>
            {ABOUT.cta}
          </Button>
        </BottomBar>
      </Sheet>
    </>
  )
}

/** 2/3 이런 인재를 키워요 */
const HOW_ICONS = ['bio', 'people', 'gift']
export function TalentScreen({ onNext }: { onNext: () => void }) {
  return (
    <>
      <Hero eyebrow={TALENT.eyebrow} title={TALENT.title} />
      <Sheet>
        <div className="flex flex-col pb-2 justify-evenly gap-[min(12px,1.5vh)]">
          <motion.div {...fade(0)} className="keep-light relative overflow-hidden rounded-3xl py-[min(18px,2.2vh)] pr-[min(110px,28vw)] pl-[min(18px,2.2vh)]" style={{ background: 'linear-gradient(120deg,#e9fbc9,#c8f169 45%,#7fe0d8)' }}>
            <p className="text-[clamp(14.5px,4.1vw,17px)] font-bold text-sea/80">{TALENT.badgeSub}</p>
            <p className="mt-1 text-[clamp(19px,3vh,25px)] font-bold leading-[1.15] text-sea">{TALENT.badge}</p>
            <div className="absolute -right-1 -bottom-2">
              <Character level={3} size={Math.round(Math.min(120, window.innerWidth * 0.29))} bob />
            </div>
          </motion.div>

          <motion.div {...fade(1)}>
            <p className="mb-[min(8px,1vh)] text-[clamp(16.5px,4.62vw,19px)] font-bold text-sea">{TALENT.skillsTitle}</p>
            <div className="flex flex-wrap gap-[min(8px,1vh)]">
              {TALENT.skills.map((k, i) => (
                <span key={k} className="flex items-center gap-1.5 rounded-full border-2 border-cyan/40 bg-white py-[min(7px,0.9vh)] pr-3 pl-1.5 text-[clamp(15px,4.23vw,17.5px)] font-bold text-ink">
                  <span className="grid h-5 w-5 place-items-center rounded-full bg-cyan text-[clamp(11.5px,3.33vw,14px)] text-white">{i + 1}</span>
                  {k}
                </span>
              ))}
            </div>
          </motion.div>

          <motion.div {...fade(2)}>
            <p className="mb-[min(8px,1vh)] text-[clamp(16.5px,4.62vw,19px)] font-bold text-sea">{TALENT.howTitle}</p>
            <div className="grid grid-cols-3 gap-[min(8px,1vh)]">
              {TALENT.how.map((h, i) => (
                <div key={h.t} className="flex flex-col items-center rounded-2xl bg-white px-1.5 py-[min(12px,1.5vh)] text-center">
                  <span className="grid h-[clamp(30px,4.4vh,38px)] w-[clamp(30px,4.4vh,38px)] place-items-center rounded-xl bg-[#e6f7ee] text-eco">
                    <Icon name={HOW_ICONS[i]} size={19} />
                  </span>
                  <p className="mt-[min(6px,0.8vh)] text-[clamp(14.5px,4.1vw,17px)] font-bold leading-tight text-ink">{h.t}</p>
                  <p className="mt-0.5 text-[clamp(13px,3.72vw,15.5px)] leading-snug text-mute">{h.d}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
        <BottomBar>
          <Button onClick={onNext} className={BTN}>
            {TALENT.cta}
          </Button>
        </BottomBar>
      </Sheet>
    </>
  )
}

/** 3/3 함께하는 곳 — 한 줄에 한 곳씩 */
export function PartnersScreen({ onNext }: { onNext: () => void }) {
  const rows = [
    { ...PARTNERS.lead_, tag: '주관', tagCls: 'bg-sea text-white' },
    ...PARTNERS.members.map((m) => ({ ...m, tag: '', tagCls: '' })),
    { ...PARTNERS.city, tag: '지자체', tagCls: 'bg-eco text-white' },
  ] as { name: string; note: string; logo: string; tag: string; tagCls: string }[]
  return (
    <>
      <Hero eyebrow={PARTNERS.eyebrow} title={PARTNERS.title} />
      <Sheet>
        <div className="flex flex-col pb-2 justify-center gap-[min(10px,1.3vh)]">
          <p className="text-[clamp(15.5px,4.36vw,18px)] leading-snug text-mute">{PARTNERS.lead}</p>
          <div className="overflow-hidden rounded-3xl bg-white shadow-[0_6px_20px_-12px_rgba(8,60,100,0.35)]">
            {rows.map((r, i) => (
              <motion.div
                key={r.name}
                {...fade(i)}
                className={`flex items-center gap-3 px-3.5 py-[min(11px,1.35vh)] ${i ? 'border-t border-line' : ''}`}
              >
                <span className="grid w-[clamp(52px,8vh,72px)] shrink-0 place-items-center">
                  <img src={LOGOS[r.logo]} alt="" className="h-[clamp(26px,4.2vh,38px)] max-w-full object-contain" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="flex items-center gap-1.5 text-[clamp(16.5px,4.62vw,19px)] font-bold text-ink">
                    {r.name}
                    {r.tag && <span className={`rounded-full px-1.5 py-0.5 text-[clamp(11px,3.21vw,13.5px)] ${r.tagCls}`}>{r.tag}</span>}
                  </p>
                  <p className="text-[clamp(13.5px,3.85vw,16px)] text-mute">{r.note}</p>
                </div>
              </motion.div>
            ))}
          </div>

        </div>
        <BottomBar>
          <Button onClick={onNext} className={BTN}>
            {PARTNERS.cta}
          </Button>
        </BottomBar>
      </Sheet>
    </>
  )
}
