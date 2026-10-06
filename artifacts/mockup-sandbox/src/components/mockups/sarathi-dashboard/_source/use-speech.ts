import { useState, useEffect, useCallback, useRef } from 'react';

declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

type SpeechHookProps = {
  languageCode: string;
  onResult: (text: string) => void;
  onError?: (err: string) => void;
};

// Detect iOS/Safari — needs special handling (abort() crashes, stop() needed instead)
function isIOSSafari(): boolean {
  if (typeof navigator === 'undefined') return false;
  const ua = navigator.userAgent;
  return /iPad|iPhone|iPod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
}

// Priority voice lists - Google Neural voices sound like real humans in Chrome
const VOICE_PRIORITY: Record<string, string[]> = {
  'en-IN': [
    'Google UK English Female',
    'Google UK English Male',
    'Microsoft Aria Online (Natural) - English (United States)',
    'Microsoft Zira - English (United States)',
    'Google US English',
    'Samantha',
  ],
  'hi-IN': [
    'Google हिन्दी',
    'Microsoft Swara Online (Natural) - Hindi (India)',
    'Microsoft Hemant - Hindi (India)',
    'Google Hindi',
  ],
  'te-IN': [
    'Google తెలుగు',
    'Microsoft Chitra Online (Natural) - Tamil (India)',
    'Google Telugu',
  ],
  'en-US': [
    'Microsoft Aria Online (Natural) - English (United States)',
    'Google UK English Female',
    'Samantha',
    'Google US English',
  ],
};

// Wait for voices to load then find the best one
function getBestVoice(langCode: string): Promise<SpeechSynthesisVoice | null> {
  return new Promise((resolve) => {
    const tryFind = () => {
      const voices = window.speechSynthesis.getVoices();
      if (!voices.length) return null;

      const priorities = VOICE_PRIORITY[langCode] || [];

      for (const name of priorities) {
        const v = voices.find(v => v.name === name);
        if (v) return v;
      }

      for (const name of priorities) {
        const v = voices.find(v => v.name.toLowerCase().includes(name.toLowerCase().split(' ')[1] || ''));
        if (v) return v;
      }

      const baseLang = langCode.split('-')[0];
      const online = voices.find(v => v.lang === langCode && v.name.toLowerCase().includes('online'));
      if (online) return online;

      const google = voices.find(v => v.lang === langCode && v.name.toLowerCase().includes('google'));
      if (google) return google;

      const any = voices.find(v => v.lang === langCode);
      if (any) return any;

      const base = voices.find(v => v.lang.startsWith(baseLang));
      if (base) return base;

      return voices.find(v => v.name.toLowerCase().includes('google')) || voices[0] || null;
    };

    const voices = window.speechSynthesis.getVoices();
    if (voices.length > 0) {
      resolve(tryFind());
    } else {
      const handler = () => {
        window.speechSynthesis.removeEventListener('voiceschanged', handler);
        resolve(tryFind());
      };
      window.speechSynthesis.addEventListener('voiceschanged', handler);
      setTimeout(() => {
        window.speechSynthesis.removeEventListener('voiceschanged', handler);
        resolve(tryFind());
      }, 2000);
    }
  });
}

// Language code fallback chains
const LANG_FALLBACKS: Record<string, string[]> = {
  'te-IN': ['te-IN', 'te'],
  'hi-IN': ['hi-IN', 'hi'],
  'en-IN': ['en-IN', 'en-GB', 'en-US'],
};

export function useSpeechRecognition({ languageCode, onResult, onError }: SpeechHookProps) {
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(true);
  const recognitionRef = useRef<any>(null);
  const langRef = useRef(languageCode);
  const ios = useRef(false);

  useEffect(() => {
    langRef.current = languageCode;
  }, [languageCode]);

  useEffect(() => {
    ios.current = isIOSSafari();
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    setIsSupported(!!SR);
  }, []);

  const buildRecognition = useCallback((langCode: string, onResultCb: (text: string) => void, onErrCb: (e: any) => void) => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    const r = new SR();
    r.lang = langCode;
    r.continuous = false;
    // CRITICAL: interimResults: false prevents Chrome/Safari firing onend
    // before delivering the final result for non-Latin scripts (Telugu, Hindi)
    r.interimResults = false;
    r.maxAlternatives = 3;
    r.onstart = () => setIsListening(true);
    r.onresult = onResultCb;
    r.onerror = onErrCb;
    r.onend = () => setIsListening(false);
    return r;
  }, []);

  const startListening = useCallback(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) {
      setIsSupported(false);
      return;
    }

    // iOS Safari: use stop() not abort() — abort() crashes the recognition engine
    if (recognitionRef.current) {
      try {
        if (ios.current) {
          recognitionRef.current.stop();
        } else {
          recognitionRef.current.abort();
        }
      } catch {}
      recognitionRef.current = null;
    }

    const doStart = () => {
      const fallbacks = LANG_FALLBACKS[langRef.current] || [langRef.current];

      const handleResult = (event: any) => {
        let bestTranscript = '';
        let bestConfidence = 0;
        for (let i = 0; i < event.results.length; i++) {
          const result = event.results[i];
          for (let j = 0; j < result.length; j++) {
            if (result[j].confidence > bestConfidence) {
              bestConfidence = result[j].confidence;
              bestTranscript = result[j].transcript;
            }
          }
        }
        if (bestTranscript) onResult(bestTranscript);
      };

      const tryLang = (idx: number) => {
        const handleError = (event: any) => {
          setIsListening(false);
          const err = event.error;

          if (err === 'no-speech') {
            if (onError) onError('no-speech');
            return;
          }
          if (err === 'not-allowed') {
            if (onError) onError('not-allowed');
            return;
          }
          // network / language-not-supported — try next fallback (skip on iOS, causes double crash)
          if (!ios.current && (err === 'network' || err === 'language-not-supported') && idx + 1 < fallbacks.length) {
            setTimeout(() => tryLang(idx + 1), 100);
            return;
          }
          if (onError) onError(err);
        };

        const r = buildRecognition(fallbacks[idx], handleResult, handleError);
        recognitionRef.current = r;
        try { r.start(); } catch { setIsListening(false); }
      };

      tryLang(0);
    };

    // iOS Safari needs a small gap between stop() and start() to avoid AbortError
    if (ios.current) {
      setTimeout(doStart, 200);
    } else {
      doStart();
    }
  }, [onResult, onError, buildRecognition]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch {}
      setIsListening(false);
    }
  }, []);

  return { isListening, isSupported, startListening, stopListening };
}

export function useSpeechSynthesis() {
  const [isSpeaking, setIsSpeaking] = useState(false);

  const speak = useCallback(async (text: string, langCode: string = 'en-IN') => {
    if (!window.speechSynthesis) return;

    window.speechSynthesis.cancel();

    const bestVoice = await getBestVoice(langCode);

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = langCode;

    if (bestVoice) {
      utterance.voice = bestVoice;
      utterance.rate = bestVoice.name.toLowerCase().includes('online') ? 0.92 : 0.88;
      utterance.pitch = 1.05;
      utterance.volume = 1.0;
    } else {
      utterance.rate = 0.88;
      utterance.pitch = 1.05;
      utterance.volume = 1.0;
    }

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    // Small delay prevents Chrome from cutting off the first syllable
    setTimeout(() => {
      window.speechSynthesis.speak(utterance);
    }, 120);
  }, []);

  const stopSpeaking = useCallback(() => {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  }, []);

  return { speak, stopSpeaking, isSpeaking };
}
