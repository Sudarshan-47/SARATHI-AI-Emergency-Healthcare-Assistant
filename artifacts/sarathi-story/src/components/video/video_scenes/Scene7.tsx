import { motion } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';

export function Scene7() {
  return (
    <section className="scene-shell" aria-label="SARATHI AI end card">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_35%,rgba(240,74,82,.15),transparent_26%),linear-gradient(135deg,#07111c,#0d1f2c_52%,#09141f)]" />
      <motion.div className="absolute left-[50%] top-[39%] h-[32vw] w-[32vw] -translate-x-1/2 -translate-y-1/2 rounded-full border border-[#f04a52]/20" animate={{ rotate: -360 }} transition={{ duration: 24, repeat: Infinity, ease: 'linear' }} />
      <motion.div className="absolute left-[50%] top-[39%] h-[22vw] w-[22vw] -translate-x-1/2 -translate-y-1/2 rounded-full border border-[#62e2e6]/20" animate={{ rotate: 360 }} transition={{ duration: 15, repeat: Infinity, ease: 'linear' }} />
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <motion.div className="mb-[3vh] flex items-center gap-[.8vw]" initial={{ opacity: 0, scale: .7 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: .9, type: 'spring', stiffness: 190, damping: 20 }}>
          <img src={`${import.meta.env.BASE_URL}images/sarathi-logo.png`} alt="SARATHI" className="h-[4.8vw] w-[4.8vw] rounded-[1.2vw] object-cover mix-blend-screen shadow-[0_12px_40px_rgba(240,74,82,.28)]" />
          <span className="display text-[clamp(28px,3.2vw,60px)] font-semibold tracking-[-.05em]">SARATHI</span>
        </motion.div>
        <motion.h2 className="display max-w-[68vw] text-[clamp(38px,5.7vw,108px)] font-semibold leading-[.9] tracking-[-.065em]" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .8, delay: .35 }}>When seconds matter,<br /><span className="text-[#62e2e6]">start with clarity.</span></motion.h2>
        <motion.div className="mt-[4vh] flex items-center gap-[1.2vw] text-[clamp(11px,.9vw,17px)] font-semibold tracking-[.13em] text-[#a9bec9]" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.1, duration: .7 }}>
          <span>DESCRIBE</span><span className="h-[1px] w-[2.4vw] bg-[#f04a52]" /><span>DECIDE</span><span className="h-[1px] w-[2.4vw] bg-[#f04a52]" /><span>ACT</span>
        </motion.div>
        <motion.div className="absolute bottom-[8vh] flex items-center gap-[.5vw] text-[clamp(10px,.75vw,14px)] text-[#708896]" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.4 }}><ArrowUpRight size=".9vw" className="text-[#62e2e6]" /> Emergency guidance, made human.</motion.div>
      </div>
    </section>
  );
}