import { motion } from 'framer-motion';
import { Activity, Mic, MessageSquare } from 'lucide-react';

export function Scene1() {
  const bars = [22, 38, 54, 29, 68, 42, 76, 33, 58, 44, 70, 28, 52, 36, 63];
  return (
    <section className="scene-shell" aria-label="Describe what is happening">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_72%_48%,rgba(98,226,230,.13),transparent_34%),linear-gradient(120deg,#08121e_0%,#0b1c2b_55%,#07101a_100%)]" />
      <motion.div
        className="absolute left-[7vw] top-[18vh] h-[48vh] w-[48vh] rounded-full border border-[#62e2e6]/20"
        initial={{ scale: .72, opacity: 0 }}
        animate={{ scale: 1.08, opacity: [.15, .4, .15] }}
        transition={{ duration: 4.8, repeat: Infinity, ease: 'easeInOut' }}
      />
      <div className="absolute left-[8vw] top-[18vh] w-[42vw]">
        <motion.div
          className="mono-label mb-[2.5vh] text-[#62e2e6]"
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: .45 }}
        >
          THE FIRST MOMENT
        </motion.div>
        <motion.h1
          className="display max-w-[43vw] text-[clamp(38px,5.8vw,110px)] font-semibold leading-[.92] tracking-[-.055em] text-[#f2f7f8]"
          initial={{ opacity: 0, y: 34, rotateX: -18 }}
          animate={{ opacity: 1, y: 0, rotateX: 0 }}
          transition={{ duration: .9, delay: .18, ease: [0.16, 1, .3, 1] }}
        >
          When seconds
          <span className="block text-[#f04a52]">feel heavy.</span>
        </motion.h1>
        <motion.p
          className="mt-[3vh] max-w-[31vw] text-[clamp(15px,1.45vw,27px)] leading-[1.3] text-[#a9bec9]"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: .7, delay: .62 }}
        >
          Start with a calm description. SARATHI turns uncertainty into the next right step.
        </motion.p>
      </div>
      <motion.div
        className="phone-shell absolute right-[12vw] top-[12vh] h-[70vh] w-[25vw] rounded-[2.3vw] p-[.7vw]"
        initial={{ opacity: 0, y: 70, rotate: 4, scale: .9 }}
        animate={{ opacity: 1, y: 0, rotate: -4, scale: 1 }}
        transition={{ duration: 1.1, delay: .35, ease: [0.16, 1, .3, 1] }}
      >
        <div className="relative h-full overflow-hidden rounded-[1.8vw] bg-[#091522]">
          <div className="flex items-center justify-between px-[1.4vw] pt-[1.8vh] text-[clamp(10px,.8vw,15px)] text-[#8fa8b4]">
            <span>9:41</span><span className="h-[.5vh] w-[2.4vw] rounded-full bg-[#d9edf0]/40" />
          </div>
          <div className="px-[1.5vw] pt-[5vh]">
            <div className="flex items-center gap-[.65vw]">
              <div className="flex h-[2.2vw] w-[2.2vw] items-center justify-center rounded-[.7vw] bg-[#f04a52] text-white"><Activity size="1.05vw" /></div>
              <span className="display text-[clamp(14px,1.35vw,25px)] font-semibold">SARATHI</span>
            </div>
            <div className="mt-[6vh] text-[clamp(11px,.95vw,18px)] text-[#8fa8b4]">How can I help right now?</div>
            <div className="mt-[1.8vh] rounded-[1.15vw] border border-[#62e2e6]/25 bg-[#102837] p-[1vw] text-[clamp(13px,1.1vw,21px)] leading-[1.25] text-[#e9f5f5]">
              Describe what you’re feeling. Voice or text is okay.
            </div>
            <div className="mt-[3vh] flex items-center gap-[.7vw] rounded-[1.15vw] border border-[#f04a52]/35 bg-[#391d2a] p-[.85vw]">
              <div className="flex h-[2.3vw] w-[2.3vw] items-center justify-center rounded-full bg-[#f04a52] text-white"><Mic size="1.1vw" /></div>
              <div className="flex flex-1 items-end justify-center gap-[.2vw]">
                {bars.map((height, index) => (
                  <motion.i
                    key={index}
                    className="w-[.18vw] rounded-full bg-[#f6a1a6]"
                    animate={{ height: [`${height * .22}px`, `${(height + 18) * .22}px`, `${height * .22}px`] }}
                    transition={{ duration: .7 + (index % 4) * .12, repeat: Infinity, delay: index * .035 }}
                  />
                ))}
              </div>
            </div>
            <div className="mt-[2vh] flex justify-end"><span className="rounded-[.8vw] bg-[#62e2e6] px-[1vw] py-[.7vw] text-[clamp(11px,.85vw,16px)] font-semibold text-[#07111c]">I feel tightness in my chest...</span></div>
          </div>
          <div className="absolute bottom-[2vh] left-[1.4vw] right-[1.4vw] flex items-center justify-between border-t border-white/10 pt-[1.8vh] text-[#8fa8b4]">
            <span className="flex items-center gap-[.4vw] text-[clamp(10px,.75vw,14px)]"><MessageSquare size="1vw" /> Voice or text</span>
            <span className="h-[.45vw] w-[.45vw] rounded-full bg-[#a3dfb5]" />
          </div>
        </div>
      </motion.div>
    </section>
  );
}