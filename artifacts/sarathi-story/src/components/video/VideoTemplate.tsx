import type { ReactNode } from 'react';

import { useVideoPlayer } from '@/lib/video';
import { AnimatePresence, motion } from 'framer-motion';
import { Activity } from 'lucide-react';

import { Scene1 } from './video_scenes/Scene1';
import { Scene2 } from './video_scenes/Scene2';
import { Scene3 } from './video_scenes/Scene3';
import { Scene4 } from './video_scenes/Scene4';
import { Scene5 } from './video_scenes/Scene5';
import { Scene6 } from './video_scenes/Scene6';
import { Scene7 } from './video_scenes/Scene7';

const SCENE_DURATIONS = {
  opening: 5000,
  triage: 5200,
  firstAid: 4700,
  nearbyCare: 5100,
  familyAlert: 4800,
  clearerPath: 4600,
  endCard: 5400,
};

const sceneColors = ['#08121e', '#160f1a', '#07131e', '#0a1822', '#08141f', '#07131e', '#07111c'];

function SceneFrame({ children }: { children: ReactNode }) {
  return (
    <motion.div
      className="absolute inset-0 z-[2]"
      initial={{ clipPath: 'polygon(0 0, 0 0, 0 100%, 0 100%)', scale: 1.04, opacity: .5 }}
      animate={{ clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0 100%)', scale: 1, opacity: 1 }}
      exit={{ clipPath: 'polygon(100% 0, 100% 0, 100% 100%, 100% 100%)', scale: 1.04, opacity: .7 }}
      transition={{ duration: .82, ease: [0.16, 1, .3, 1] }}
    >
      {children}
    </motion.div>
  );
}

export default function VideoTemplate() {
  const { currentScene } = useVideoPlayer({ durations: SCENE_DURATIONS, loop: true });
  return (
    <main className="video-root" style={{ backgroundColor: sceneColors[currentScene] }}>
      <motion.img
        src={`${import.meta.env.BASE_URL}images/hero-bg.png`}
        alt=""
        className="pointer-events-none absolute inset-0 z-0 h-full w-full object-cover opacity-[.13] mix-blend-screen"
        animate={{ scale: [1.08, 1.16, 1.08], x: [`${-currentScene * 1.6}vw`, `${-currentScene * 1.6 - 2}vw`, `${-currentScene * 1.6}vw`] }}
        transition={{ scale: { duration: 12, repeat: Infinity, ease: 'easeInOut' }, x: { duration: 1.2, ease: [0.16,1,.3,1] } }}
      />
      <motion.div
        className="pointer-events-none absolute -left-[8vw] top-[15vh] z-[1] h-[43vw] w-[43vw] rounded-full bg-[#62e2e6]/[.055] blur-[5vw]"
        animate={{ x: [`${currentScene * 4}vw`, `${currentScene * 4 + 2}vw`], y: [`${currentScene * 1.8}vh`, `${currentScene * 1.8 - 1}vh`] }}
        transition={{ duration: 1.1, ease: [0.16,1,.3,1] }}
      />
      <motion.div
        className="pointer-events-none absolute -right-[12vw] bottom-[-23vh] z-[1] h-[48vw] w-[48vw] rounded-full bg-[#f04a52]/[.045] blur-[6vw]"
        animate={{ x: [`${-currentScene * 2}vw`, `${-currentScene * 2 - 1}vw`], y: [`${-currentScene * .8}vh`, `${-currentScene * .8 + 1}vh`] }}
        transition={{ duration: 1.25, ease: [0.16,1,.3,1] }}
      />
      <motion.div className="absolute left-[3.5vw] top-[4.5vh] z-30 flex items-center gap-[.6vw]">
        <div className="flex h-[2.2vw] w-[2.2vw] items-center justify-center rounded-[.65vw] bg-[#f04a52] text-white"><Activity size="1.15vw" /></div>
        <div><div className="display text-[clamp(13px,1.2vw,23px)] font-semibold tracking-[-.03em]">SARATHI AI</div><div className="mono-label mt-[.2vh] text-[#708896]">EMERGENCY CARE ASSISTANT</div></div>
      </motion.div>
      <div className="absolute right-[3.5vw] top-[5.2vh] z-30 flex items-center gap-[.65vw] text-[clamp(10px,.72vw,14px)] font-medium text-[#8fa8b4]"><span className="h-[.45vw] w-[.45vw] rounded-full bg-[#a3dfb5]" /> AVAILABLE WHEN YOU NEED IT</div>
      <div className="absolute bottom-[4.4vh] left-[3.5vw] right-[3.5vw] z-30 flex items-center gap-[1vw]">
        <span className="mono-label text-[#708896]">0{currentScene + 1}</span>
        <div className="h-[1px] flex-1 bg-white/10"><motion.div className="h-full bg-[#f04a52]" animate={{ width: `${((currentScene + 1) / 7) * 100}%` }} transition={{ duration: .6, ease: [0.16,1,.3,1] }} /></div>
        <span className="mono-label text-[#708896]">07</span>
      </div>
      <AnimatePresence mode="sync" initial={false}>
        {currentScene === 0 && <SceneFrame key="opening"><Scene1 /></SceneFrame>}
        {currentScene === 1 && <SceneFrame key="triage"><Scene2 /></SceneFrame>}
        {currentScene === 2 && <SceneFrame key="first-aid"><Scene3 /></SceneFrame>}
        {currentScene === 3 && <SceneFrame key="nearby-care"><Scene4 /></SceneFrame>}
        {currentScene === 4 && <SceneFrame key="family-alert"><Scene5 /></SceneFrame>}
        {currentScene === 5 && <SceneFrame key="clearer-path"><Scene6 /></SceneFrame>}
        {currentScene === 6 && <SceneFrame key="end-card"><Scene7 /></SceneFrame>}
      </AnimatePresence>
    </main>
  );
}
