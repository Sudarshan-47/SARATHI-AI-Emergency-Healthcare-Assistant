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

      // 1. Try exact priority names
      for (const name of priorities) {
        const v = voices.find(v => v.name === name);
        if (v) return v;
      }

      // 2. Try partial name match from priority list
      for (const name of priorities) {
        const v = voices.find(v => v.name.toLowerCase().includes(name.toLowerCase().split(' ')[1] || ''));
        if (v) return v;
      }

      // 3. Try exact lang match (prefer online/neural voices — they have "Online" in the name)
      const baseLang = langCode.split('-')[0];
      const online = voices.find(v => v.lang === langCode && v.name.toLowerCase().includes('online'));
      if (online) return online;

      // 4. Google voices for the lang
      const google = voices.find(v => v.lang === langCode && v.name.toLowerCase().includes('google'));
      if (google) return google;

      // 5. Any voice for the lang
      const any = voices.find(v => v.lang === langCode);
      if (any) return any;

      // 6. Base language match (e.g. 'hi' for 'hi-IN')
      const base = voices.find(v => v.lang.startsWith(baseLang));
      if (base) return base;

      // 7. Fall back to any English google voice
      return voices.find(v => v.name.toLowerCase().includes('google')) || voices[0] || null;
    };

    const voices = window.speechSynthesis.getVoices();
    if (voices.length > 0) {
      resolve(tryFind());
    } else {
      // Voices not loaded yet - listen for the event
      const handler = () => {
        window.speechSynthesis.removeEventListener('voiceschanged', handler);
        resolve(tryFind());
      };
      window.speechSynthesis.addEventListener('voiceschanged', handler);
      // Safety timeout
      setTimeout(() => {
        window.speechSynthesis.removeEventListener('voiceschanged', handler);
        resolve(tryFind());
      }, 2000);
    }
  });
}

export function useSpeechRecognition({ languageCode, onResult, onError }: SpeechHookProps) {
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(true);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setIsSupported(false);
      return;
    }

    recognitionRef.current = new SpeechRecognition();
    const recognition = recognitionRef.current;

    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = languageCode;

    recognition.onstart = () => setIsListening(true);

    recognition.onresult = (event: any) => {
      let finalTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        }
      }
      if (finalTranscript) onResult(finalTranscript);
    };

    recognition.onerror = (event: any) => {
      setIsListening(false);
      if (onError) onError(event.error);
    };

    recognition.onend = () => setIsListening(false);

    return () => { try { recognition.stop(); } catch {} };
  }, [languageCode, onResult, onError]);

  const startListening = useCallback(() => {
    if (recognitionRef.current && !isListening) {
      try {
        recognitionRef.current.lang = languageCode;
        recognitionRef.current.start();
      } catch (e) {}
    }
  }, [languageCode, isListening]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current && isListening) {
      try { recognitionRef.current.stop(); } catch {}
    }
  }, [isListening]);

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
      // Neural/online voices sound best at default settings
      // Slightly slower for medical instructions so they are clear
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
