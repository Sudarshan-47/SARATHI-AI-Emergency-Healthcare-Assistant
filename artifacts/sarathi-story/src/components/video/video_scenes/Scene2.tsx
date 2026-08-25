import { motion } from 'framer-motion';
import { Activity, BrainCircuit, Check, ShieldAlert } from 'lucide-react';

export function Scene2() {
  return (
    <section className="scene-shell" aria-label="AI triage and severity guidance">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_28%_40%,rgba(240,74,82,.18),transparent_32%),linear-gradient(135deg,#160f1a,#0b1b29_64%,#07131e)]" />
      <motion.div className="absolute -right-[14vw] top-[10vh] h-[70vh] w-[70vh] rounded-full border border-[#f04a52]/20" animate={{ rotate: 360 }} transition={{ duration: 18, repeat: Infinity, ease: 'linear' }} />
      <div className="absolute left-[10vw] top-[17vh] w-[35vw]">
        <motion.div className="mono-label mb-[2.5vh] text-[#f04a52]" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: .4 }}>SARATHI TRIAGE ENGINE</motion.div>
        <motion.h2 className="display text-[clamp(42px,6vw,114px)] font-semibold leading-[.9] tracking-[-.06em]" initial={{ opacity: 0, y: 42 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .8, delay: .12 }}>
          Calm in.
          <span className="block text-[#f04a52]">Clarity out.</span>
        </motion.h2>
        <motion.p className="mt-[3vh] max-w-[28vw] text-[clamp(14px,1.3vw,24px)] leading-[1.35] text-[#b9cbd0]" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: .65, duration: .6 }}>
          It listens for patterns, asks what matters, and shows urgency without alarm.
        </motion.p>
      </div>
      <motion.div
        className="glass-card absolute right-[10vw] top-[14vh] h-[66vh] w-[36vw] rounded-[2vw] p-[1.7vw]"
        initial={{ opacity: 0, scale: .88, rotateY: 16 }}
        animate={{ opacity: 1, scale: 1, rotateY: 0 }}
        transition={{ duration: 1, delay: .25, ease: [0.16, 1, .3, 1] }}
      >
        <div className="flex items-center justify-between border-b border-white/10 pb-[2vh]">
          <div className="flex items-center gap-[.7vw]"><div className="flex h-[2.3vw] w-[2.3vw] items-center justify-center rounded-[.75vw] bg-[#f04a52]/15 text-[#f04a52]"><BrainCircuit size="1.2vw" /></div><span className="text-[clamp(12px,1vw,19px)] font-semibold">Live assessment</span></div>
          <span className="flex items-center gap-[.45vw] text-[clamp(10px,.75vw,14px)] text-[#a3dfb5]"><i className="h-[.42vw] w-[.42vw] rounded-full bg-[#a3dfb5]" /> ANALYZING</span>
        </div>
        <div className="pt-[4vh]">
          <div className="flex items-end justify-between">
            <div><div className="mono-label text-[#8fa8b4]">SEVERITY SIGNAL</div><motion.div className="display mt-[.7vh] text-[clamp(38px,4.7vw,90px)] font-semibold leading-none text-[#f04a52]" initial={{ opacity: 0, scale: .6 }} animate={{ opacity: 1, scale: 1 }} transition={{ type: 'spring', stiffness: 300, damping: 22, delay: .8 }}>2 / 3</motion.div></div>
            <ShieldAlert className="mb-[1vh] text-[#f04a52]" size="3.2vw" strokeWidth={1.3} />
          </div>
          <div className="mt-[2.8vh] grid grid-cols-3 gap-[.45vw]">
            <div className="h-[.65vh] rounded-full bg-[#a3dfb5]" /><div className="h-[.65vh] rounded-full bg-[#f0bb73]" /><div className="h-[.65vh] rounded-full bg-[#f04a52]" />
          </div>
          <motion.div className="mt-[4vh] rounded-[1.25vw] border border-[#f04a52]/40 bg-[#f04a52]/10 p-[1.2vw]" initial={{ x: 22, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 1.05, duration: .55 }}>
            <div className="flex items-start gap-[.8vw]"><Activity className="mt-[.2vh] text-[#f04a52]" size="1.3vw" /><div><div className="text-[clamp(14px,1.25vw,24px)] font-semibold">Possible cardiac emergency</div><div className="mt-[.7vh] text-[clamp(11px,.9vw,17px)] leading-[1.35] text-[#c4d2d5]">Chest tightness + breathlessness needs immediate attention.</div></div></div>
          </motion.div>
          <div className="mt-[3vh] space-y-[1.4vh]">
            {['Symptoms understood', 'Risk level explained', 'Next step prepared'].map((label, index) => (
              <motion.div key={label} className="flex items-center gap-[.7vw] text-[clamp(11px,.9vw,17px)] text-[#b7c8cc]" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 1.3 + index * .18 }}>
                <span className="flex h-[1.35vw] w-[1.35vw] items-center justify-center rounded-full bg-[#62e2e6]/15 text-[#62e2e6]"><Check size=".78vw" strokeWidth={3} /></span>{label}
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>
    </section>
  );
}