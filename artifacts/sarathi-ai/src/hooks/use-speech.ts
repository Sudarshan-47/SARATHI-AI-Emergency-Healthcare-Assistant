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

      // Try base language code (e.g., 'te' for 'te-IN', 'hi' for 'hi-IN')
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

// Language code fallback chains — Chrome sometimes needs the base code for regional languages
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

  // Keep lang ref up to date so startListening always uses latest value
  useEffect(() => {
    langRef.current = languageCode;
  }, [languageCode]);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setIsSupported(false);
      return;
    }
    setIsSupported(true);
  }, []);

  const startListening = useCallback(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setIsSupported(false);
      return;
    }

    // Stop any existing session first
    if (recognitionRef.current) {
      try { recognitionRef.current.abort(); } catch {}
    }

    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;

    // CRITICAL FIX: interimResults: false prevents Chrome from firing onend
    // before delivering the final result for non-Latin scripts (Telugu, Hindi)
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.maxAlternatives = 3;

    // Use fallback chain for better language support
    const fallbacks = LANG_FALLBACKS[langRef.current] || [langRef.current];
    recognition.lang = fallbacks[0];

    recognition.onstart = () => setIsListening(true);

    recognition.onresult = (event: any) => {
      // Pick the best alternative (highest confidence)
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

      if (bestTranscript) {
        onResult(bestTranscript);
      }
    };

    recognition.onerror = (event: any) => {
      setIsListening(false);

      const err = event.error;

      // 'no-speech' is not really an error — just silence
      if (err === 'no-speech') {
        if (onError) onError('no-speech');
        return;
      }

      // 'network' means the language may not be supported — try base lang code
      if (err === 'network' && fallbacks.length > 1) {
        const fallbackRecognition = new SpeechRecognition();
        recognitionRef.current = fallbackRecognition;
        fallbackRecognition.continuous = false;
        fallbackRecognition.interimResults = false;
        fallbackRecognition.maxAlternatives = 3;
        fallbackRecognition.lang = fallbacks[1]; // e.g., 'te' instead of 'te-IN'

        fallbackRecognition.onstart = () => setIsListening(true);
        fallbackRecognition.onresult = recognition.onresult;
        fallbackRecognition.onerror = () => {
          setIsListening(false);
          if (onError) onError('language-not-supported');
        };
        fallbackRecognition.onend = () => setIsListening(false);

        try { fallbackRecognition.start(); } catch {}
        return;
      }

      if (onError) onError(err);
    };

    recognition.onend = () => setIsListening(false);

    try {
      recognition.start();
    } catch (e) {
      setIsListening(false);
    }
  }, [onResult, onError]);

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
