import { motion } from 'framer-motion';
import { Check, CheckCheck, ShieldCheck, Smartphone } from 'lucide-react';

export function Scene5() {
  return (
    <section className="scene-shell" aria-label="Family WhatsApp alert">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_38%,rgba(163,223,181,.12),transparent_30%),linear-gradient(125deg,#08141f,#102a2a_58%,#0b1b25)]" />
      <motion.div className="absolute -left-[12vw] bottom-[-25vh] h-[75vh] w-[75vh] rounded-full border border-[#a3dfb5]/15" animate={{ scale: [1, 1.08, 1], rotate: [0, 8, 0] }} transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }} />
      <div className="absolute left-[10vw] top-[18vh] w-[34vw]">
        <motion.div className="mono-label text-[#a3dfb5]" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: .15 }}>CARE IS SHARED</motion.div>
        <motion.h2 className="display mt-[2.2vh] text-[clamp(40px,5.4vw,103px)] font-semibold leading-[.9] tracking-[-.06em]" initial={{ opacity: 0, y: 32 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .8, delay: .3 }}>No one has<br /><span className="text-[#a3dfb5]">to carry it</span><br />alone.</motion.h2>
        <motion.p className="mt-[3vh] max-w-[27vw] text-[clamp(13px,1.2vw,22px)] leading-[1.35] text-[#a9bec9]" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: .8, duration: .6 }}>With one tap, your trusted person gets the context they need.</motion.p>
      </div>
      <motion.div className="phone-shell absolute right-[14vw] top-[11vh] h-[74vh] w-[27vw] rounded-[2.4vw] p-[.7vw]" initial={{ opacity: 0, y: 50, rotate: -5 }} animate={{ opacity: 1, y: 0, rotate: 3 }} transition={{ duration: 1, delay: .25, ease: [0.16,1,.3,1] }}>
        <div className="relative h-full overflow-hidden rounded-[1.9vw] bg-[#091a1c]">
          <div className="flex items-center gap-[.7vw] border-b border-white/10 px-[1.4vw] py-[2vh]"><div className="flex h-[2.4vw] w-[2.4vw] items-center justify-center rounded-full bg-[#a3dfb5] text-[#0c2922]"><Smartphone size="1.1vw" /></div><div><div className="text-[clamp(13px,1vw,19px)] font-semibold">Family circle</div><div className="text-[clamp(10px,.72vw,14px)] text-[#8fa8b4]">WhatsApp alert</div></div></div>
          <div className="px-[1.3vw] pt-[5vh]">
            <motion.div className="rounded-[1.1vw] rounded-tl-[.3vw] bg-[#153b35] p-[1vw]" initial={{ scale: .8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: .9, type: 'spring', stiffness: 240, damping: 21 }}>
              <div className="mono-label text-[#a3dfb5]">SARATHI ALERT</div>
              <div className="mt-[1.2vh] text-[clamp(13px,1.1vw,21px)] leading-[1.3] text-[#eaf5ed]">Priya may need urgent medical attention.</div>
              <div className="mt-[1.2vh] border-t border-white/10 pt-[1.1vh] text-[clamp(10px,.8vw,15px)] leading-[1.35] text-[#b4cbc2]">KEM Hospital is 4 min away.<br />Route shared with you.</div>
              <div className="mt-[1.4vh] flex justify-end items-center gap-[.35vw] text-[clamp(10px,.72vw,14px)] text-[#a3dfb5]">Sent just now <CheckCheck size=".85vw" /></div>
            </motion.div>
            <motion.div className="mt-[2.5vh] flex items-center gap-[.7vw] text-[clamp(11px,.85vw,16px)] text-[#a3dfb5]" initial={{ opacity: 0, x: 18 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 1.4, duration: .5 }}><span className="flex h-[1.8vw] w-[1.8vw] items-center justify-center rounded-full bg-[#a3dfb5]/15"><Check size="1vw" /></span> Message delivered to Arun</motion.div>
          </div>
          <div className="absolute bottom-[3vh] left-[1.3vw] right-[1.3vw] flex items-center gap-[.6vw] rounded-[.9vw] border border-[#a3dfb5]/20 bg-[#102b2a] px-[.9vw] py-[1.3vh] text-[clamp(10px,.8vw,15px)] text-[#b4cbc2]"><ShieldCheck size="1vw" className="text-[#a3dfb5]" /> Your health context stays private.</div>
        </div>
      </motion.div>
    </section>
  );
}