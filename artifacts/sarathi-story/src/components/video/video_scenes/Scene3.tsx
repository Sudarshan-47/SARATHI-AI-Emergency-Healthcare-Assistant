import { motion } from 'framer-motion';
import { DoorOpen, HeartPulse, LockKeyhole, PersonStanding } from 'lucide-react';

export function Scene3() {
  const actions = [
    { n: '01', title: 'Sit upright', detail: 'Stay still. Breathe slowly.', icon: PersonStanding },
    { n: '02', title: 'Unlock the door', detail: 'Make it easy for help to enter.', icon: LockKeyhole },
    { n: '03', title: 'Do not drive alone', detail: 'SARATHI is finding care nearby.', icon: DoorOpen },
  ];
  return (
    <section className="scene-shell" aria-label="First aid guidance">
      <div className="absolute inset-0 bg-[linear-gradient(116deg,#07131e,#0d2830_48%,#10202c)]" />
      <motion.div className="absolute left-[5vw] top-[11vh] h-[74vh] w-[1px] bg-gradient-to-b from-transparent via-[#62e2e6]/70 to-transparent" initial={{ scaleY: 0 }} animate={{ scaleY: 1 }} transition={{ duration: 1 }} />
      <motion.div className="absolute right-[8vw] top-[18vh] h-[48vh] w-[48vh] rounded-full border border-[#62e2e6]/10" animate={{ scale: [1, 1.06, 1] }} transition={{ duration: 4, repeat: Infinity }} />
      <div className="absolute left-[10vw] top-[14vh]">
        <motion.div className="mono-label text-[#62e2e6]" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: .2 }}>BEFORE HELP ARRIVES</motion.div>
        <motion.h2 className="display mt-[2.3vh] max-w-[46vw] text-[clamp(38px,5.4vw,102px)] font-semibold leading-[.92] tracking-[-.06em]" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .8, delay: .35 }}>The next minute<br /><span className="text-[#62e2e6]">has a plan.</span></motion.h2>
      </div>
      <motion.div className="absolute right-[12vw] top-[15vh] flex h-[17vw] w-[17vw] items-center justify-center rounded-full border border-[#62e2e6]/35" initial={{ opacity: 0, scale: .5 }} animate={{ opacity: 1, scale: 1 }} transition={{ type: 'spring', stiffness: 180, damping: 22, delay: .4 }}>
        <div className="absolute inset-[1vw] rounded-full border border-[#62e2e6]/20" />
        <div className="text-center"><HeartPulse className="mx-auto mb-[1vh] text-[#62e2e6]" size="3vw" strokeWidth={1.3} /><div className="display text-[clamp(26px,3vw,56px)] font-semibold">01:42</div><div className="mono-label mt-[.6vh] text-[#8fa8b4]">UNTIL ARRIVAL</div></div>
      </motion.div>
      <div className="absolute bottom-[10vh] left-[10vw] right-[10vw] grid grid-cols-3 gap-[1.2vw]">
        {actions.map(({ n, title, detail, icon: Icon }, index) => (
          <motion.div key={n} className="glass-card rounded-[1.3vw] p-[1.2vw]" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .6, delay: .75 + index * .18 }}>
            <div className="flex items-center justify-between"><span className="mono-label text-[#f04a52]">{n}</span><Icon className="text-[#62e2e6]" size="1.5vw" strokeWidth={1.4} /></div>
            <div className="mt-[3.5vh] text-[clamp(15px,1.45vw,27px)] font-semibold">{title}</div>
            <div className="mt-[.7vh] text-[clamp(11px,.88vw,17px)] text-[#9db2bb]">{detail}</div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}