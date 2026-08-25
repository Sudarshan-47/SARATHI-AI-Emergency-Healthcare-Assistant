import { motion } from 'framer-motion';
import { Clock3, MapPin, Navigation, Route } from 'lucide-react';

export function Scene4() {
  return (
    <section className="scene-shell" aria-label="Nearby hospitals and route">
      <div className="absolute inset-0 bg-[#0a1822]" />
      <div className="map-grid absolute inset-0 opacity-70" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_55%_48%,transparent_0%,rgba(7,17,28,.15)_35%,rgba(7,17,28,.85)_100%)]" />
      <motion.svg className="absolute left-[26vw] top-[16vh] h-[62vh] w-[56vw] overflow-visible" viewBox="0 0 900 600" fill="none" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: .6 }}>
        <path d="M78 510 C170 420 180 360 290 388 S392 500 465 400 S550 195 634 272 S720 400 830 126" stroke="#1d5260" strokeWidth="30" strokeLinecap="round" />
        <path d="M78 510 C170 420 180 360 290 388 S392 500 465 400 S550 195 634 272 S720 400 830 126" stroke="#62e2e6" strokeWidth="4" strokeDasharray="14 14" strokeLinecap="round" />
        <motion.path d="M78 510 C170 420 180 360 290 388 S392 500 465 400 S550 195 634 272 S720 400 830 126" stroke="#f04a52" strokeWidth="7" strokeLinecap="round" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 2.2, delay: .5, ease: [0.16,1,.3,1] }} />
        <circle cx="78" cy="510" r="13" fill="#62e2e6" /><circle cx="830" cy="126" r="13" fill="#f04a52" />
      </motion.svg>
      <motion.div className="absolute left-[9vw] top-[15vh] w-[31vw]" initial={{ opacity: 0, x: -25 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: .65 }}>
        <div className="mono-label text-[#62e2e6]">CARE, CLOSER</div>
        <h2 className="display mt-[2vh] text-[clamp(40px,5.3vw,100px)] font-semibold leading-[.9] tracking-[-.06em]">The right<br /><span className="text-[#f04a52]">door.</span></h2>
        <p className="mt-[2.8vh] max-w-[25vw] text-[clamp(13px,1.15vw,22px)] leading-[1.35] text-[#a9bec9]">Live routes, open facilities, no guesswork.</p>
      </motion.div>
      <motion.div className="glass-card absolute bottom-[10vh] left-[9vw] w-[31vw] rounded-[1.4vw] p-[1.3vw]" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .9, duration: .6 }}>
        <div className="flex items-center justify-between border-b border-white/10 pb-[1.2vh]"><span className="flex items-center gap-[.55vw] text-[clamp(12px,1vw,19px)] font-semibold"><Route size="1.1vw" className="text-[#62e2e6]" /> Nearby emergency care</span><span className="mono-label text-[#a3dfb5]">LIVE</span></div>
        {[['KEM Hospital', '4 min', 'Open now'], ['Apollo FirstMed', '11 min', 'Open now']].map(([name, time, status], index) => (
          <motion.div key={name} className="flex items-center justify-between pt-[1.5vh]" initial={{ opacity: 0, x: -15 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 1.15 + index * .2 }}>
            <div className="flex items-center gap-[.7vw]"><span className="flex h-[1.8vw] w-[1.8vw] items-center justify-center rounded-full bg-[#f04a52]/15 text-[#f04a52]"><MapPin size=".9vw" /></span><div><div className="text-[clamp(12px,1vw,19px)] font-medium">{name}</div><div className="text-[clamp(10px,.75vw,14px)] text-[#8fa8b4]">{status}</div></div></div>
            <div className="flex items-center gap-[.4vw] text-[clamp(12px,1vw,19px)] font-semibold text-[#62e2e6]"><Clock3 size=".9vw" />{time}</div>
          </motion.div>
        ))}
      </motion.div>
      <motion.div className="absolute right-[20vw] top-[39vh] flex h-[4vw] w-[4vw] items-center justify-center rounded-full bg-[#f04a52] text-white shadow-[0_0_0_1vw_rgba(240,74,82,.15),0_0_0_2vw_rgba(240,74,82,.06)]" animate={{ scale: [1, 1.1, 1] }} transition={{ repeat: Infinity, duration: 1.7 }}><Navigation size="1.6vw" fill="currentColor" /></motion.div>
    </section>
  );
}