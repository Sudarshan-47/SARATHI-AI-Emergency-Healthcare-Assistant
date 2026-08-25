import { motion } from 'framer-motion';
import { ArrowUpRight, HeartHandshake, ShieldCheck } from 'lucide-react';

export function Scene6() {
  return (
    <section className="scene-shell" aria-label="SARATHI response summary">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(98,226,230,.17),transparent_31%),linear-gradient(120deg,#07131e,#0b2832,#111b2a)]" />
      <motion.div className="absolute left-[50%] top-[50%] h-[42vw] w-[42vw] -translate-x-1/2 -translate-y-1/2 rounded-full border border-[#62e2e6]/15" animate={{ scale: [1, 1.12, 1], opacity: [.4, .8, .4] }} transition={{ duration: 5, repeat: Infinity }} />
      <div className="absolute left-[11vw] top-[17vh]">
        <motion.div className="mono-label text-[#62e2e6]" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .4 }}>FROM SIGNAL TO SUPPORT</motion.div>
        <motion.h2 className="display mt-[2.3vh] max-w-[55vw] text-[clamp(39px,5.6vw,106px)] font-semibold leading-[.9] tracking-[-.06em]" initial={{ opacity: 0, scale: .92 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 1, delay: .2, ease: [0.16,1,.3,1] }}>A clearer path<br /><span className="text-[#62e2e6]">through the unknown.</span></motion.h2>
      </div>
      <div className="absolute bottom-[13vh] left-[11vw] right-[11vw] flex items-end justify-between">
        <div className="flex gap-[.8vw]">
          {[
            { label: 'Describe', icon: HeartHandshake },
            { label: 'Decide', icon: ShieldCheck },
            { label: 'Act', icon: ArrowUpRight },
          ].map(({ label, icon: Icon }, index) => (
            <motion.div key={label} className="glass-card flex items-center gap-[.7vw] rounded-full px-[1.15vw] py-[1.15vh]" initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .9 + index * .16, duration: .5 }}><Icon size="1vw" className={index === 2 ? 'text-[#f04a52]' : 'text-[#62e2e6]'} /><span className="text-[clamp(11px,.9vw,17px)] font-semibold">{label}</span></motion.div>
          ))}
        </div>
        <motion.p className="max-w-[25vw] text-right text-[clamp(12px,1.05vw,20px)] leading-[1.35] text-[#b7c9ce]" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.25, duration: .7 }}>Trusted guidance for the moments<br />that matter most.</motion.p>
      </div>
    </section>
  );
}