import { useState, useEffect, useRef } from 'react';
import { useLocation } from 'wouter';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, ArrowUpRight, ChevronDown, HeartPulse, MapPin, MessageCircle, Navigation, Phone, PhoneCall, Send, Siren, X } from 'lucide-react';
import { useUser } from '@/hooks/use-user';
import { useSpeechRecognition, useSpeechSynthesis } from '@/hooks/use-speech';
import { useTriageSymptoms, useGetFollowupResponse, useGetNearbyHospitals, getGetNearbyHospitalsQueryKey } from '@workspace/api-client-react';
import type { TriageResponse, ConversationMessage } from '@workspace/api-client-react';
import { AnimatedMic } from '@/components/animated-mic';
import { ChatBubble } from '@/components/chat-bubble';
import { SeverityBadge } from '@/components/severity-badge';
import { ECGAnimation } from '@/components/ecg-animation';

const LANG_CODES = {
  english: 'en-IN',
  hindi: 'hi-IN',
  telugu: 'te-IN'
};

const quickPrompts = ['Chest pain', 'Breathing trouble', 'High fever'];

export default function Dashboard() {
  const [, setLocation] = useLocation();
  const { user } = useUser();
  const [messages, setMessages] = useState<ConversationMessage[]>([]);
  const [textInput, setTextInput] = useState('');
  const [triageResult, setTriageResult] = useState<TriageResponse | null>(null);
  const [showHospitals, setShowHospitals] = useState(false);
  const [speechError, setSpeechError] = useState('');
  const [showTriagePanel, setShowTriagePanel] = useState(true);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user) setLocation('/');
  }, [user, setLocation]);
  const langCode = user ? LANG_CODES[user.language] : 'en-IN';
  const triageMutation = useTriageSymptoms();
  const followupMutation = useGetFollowupResponse();
  const { data: hospitalsData, isLoading: isLoadingHospitals, isError: hospitalsError, refetch: refetchHospitals } = useGetNearbyHospitals(
    { city: 'Hyderabad' },
    { query: { enabled: showHospitals, queryKey: getGetNearbyHospitalsQueryKey({ city: 'Hyderabad' }) } }
  );
  const { speak } = useSpeechSynthesis();
  const { isListening, startListening, stopListening } = useSpeechRecognition({
    languageCode: langCode,
    onResult: (text) => {
      setSpeechError('');
      setTextInput(prev => prev ? `${prev} ${text}` : text);
    },
    onError: (err) => {
      if (err === 'no-speech') setSpeechError('No speech detected. Try again.');
      else if (err === 'not-allowed') setSpeechError('Microphone access denied. Please allow mic access in your browser.');
      else if (err === 'language-not-supported') setSpeechError(`Voice recognition for ${user?.language ?? 'this language'} is limited in your browser. Please type your symptoms.`);
      else if (err === 'network') setSpeechError('Network error. Check your connection and try again.');
      else setSpeechError('Voice recognition failed. Please type your symptoms.');
      setTimeout(() => setSpeechError(''), 5000);
    }
  });

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (textOverride?: string) => {
    const textToSend = textOverride || textInput;
    if (!textToSend.trim() || !user) return;
    const newMessages = [...messages, { role: 'user', content: textToSend } as ConversationMessage];
    setMessages(newMessages);
    setTextInput('');
    stopListening();
    try {
      if (!triageResult) {
        const res = await triageMutation.mutateAsync({
          data: {
            symptoms: textToSend,
            language: user.language,
            userName: user.name,
            conversationHistory: newMessages
          }
        });
        setTriageResult(res);
        setShowTriagePanel(true);
        setMessages([...newMessages, { role: 'assistant', content: res.aiMessage }]);
        speak(res.aiMessage, langCode);
      } else {
        const res = await followupMutation.mutateAsync({
          data: {
            answer: textToSend,
            language: user.language,
            severity: triageResult.severity,
            userName: user.name,
            conversationHistory: newMessages
          }
        });
        setMessages([...newMessages, { role: 'assistant', content: res.message }]);
        if (res.updatedSeverity && res.updatedSeverity !== triageResult.severity) {
          setTriageResult({ ...triageResult, severity: res.updatedSeverity as any });
        }
        speak(res.message, langCode);
      }
    } catch (err) {
      console.error("API Error:", err);
      const fallbackMsg = "I'm having trouble connecting to the medical network. Please call 108 immediately if this is a severe emergency.";
      setMessages([...newMessages, { role: 'assistant', content: fallbackMsg }]);
      speak(fallbackMsg, langCode);
    }
  };

  const handleWhatsAppAlert = () => {
    if (!user || !triageResult) return;
    const msg = `🚨 EMERGENCY ALERT 🚨\nName: ${user.name}\nSymptoms: ${messages[0]?.content}\nSeverity: ${triageResult.severity}\nPlease check on them immediately and call 108 if needed.\nLocation: Live tracking enabled.`;
    const encoded = encodeURIComponent(msg);
    window.open(`https://wa.me/91${user.parent1Phone}?text=${encoded}`, '_blank');
  };

  if (!user) return null;
  const currentSeverity = triageResult?.severity || 'LOW';
  const isPending = triageMutation.isPending || followupMutation.isPending;

  return (
    <main className="flex min-h-[100dvh] w-full flex-col overflow-hidden bg-background text-foreground lg:h-[100dvh] lg:flex-row">
      <section className="relative flex min-h-[100dvh] min-w-0 flex-1 flex-col lg:min-h-0" aria-label="Symptom chat">
        <header className="z-20 flex min-h-[70px] shrink-0 items-center justify-between border-b border-border bg-card/95 px-4 sm:px-6 lg:px-8">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-accent/10 bg-accent/10 text-accent"><Activity size={22} /></div>
            <div className="min-w-0">
              <h1 className="font-display text-base font-bold tracking-[.035em] text-[#1b3540] sm:text-lg">SARATHI <span className="text-accent">AI</span></h1>
              <p className="flex items-center gap-1.5 truncate text-[11px] text-muted-foreground sm:text-xs"><span className="h-1.5 w-1.5 rounded-full bg-success" /> Ready to help · {user.name}</p>
            </div>
          </div>
          <a href="tel:108" aria-label="Call emergency services at 108" className="inline-flex min-h-11 shrink-0 items-center gap-2 rounded-xl border border-[#e9c7c4] bg-[#fff8f7] px-3.5 text-sm font-bold text-[#a3423e] transition hover:bg-[#fff0ee] sm:px-4" data-testid="link-emergency-108">
            <PhoneCall size={17} /><span>Emergency</span><span className="rounded-md bg-[#f9e7e4] px-1.5 py-0.5 text-xs">108</span>
          </a>
        </header>

        <div className="pointer-events-none absolute left-0 right-0 top-[70px] z-0 opacity-[.13]">
          <ECGAnimation severity={currentSeverity} />
        </div>

        {triageResult && !showTriagePanel && (
          <button type="button" onClick={() => setShowTriagePanel(true)} className="absolute right-3 top-[82px] z-20 inline-flex min-h-11 items-center gap-2 rounded-xl border border-border bg-card px-4 text-sm font-semibold text-foreground shadow-sm transition hover:border-accent/40 hover:text-accent sm:right-6" aria-label="Reopen triage assessment" data-testid="button-open-triage">
            <Activity size={17} className="text-accent" /> Assessment <ChevronDown size={15} />
          </button>
        )}

        <div className="relative z-10 flex min-h-0 flex-1 flex-col overflow-y-auto px-4 py-5 sm:px-6 sm:py-7 lg:px-8">
          {messages.length === 0 ? (
            <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col items-center justify-center py-4 text-center">
              <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-[18px] border border-accent/15 bg-accent/[.08] text-accent sm:mb-6 sm:h-[62px] sm:w-[62px]"><HeartPulse size={30} strokeWidth={1.8} /></div>
              <p className="mb-2 text-[10px] font-bold uppercase tracking-[.17em] text-accent sm:text-[11px]">A calm first step</p>
              <h2 className="font-display text-[29px] font-semibold leading-tight tracking-[-.035em] text-[#1b3540] sm:text-4xl">Tell us what’s happening.</h2>
              <p className="mt-3 max-w-lg text-[13px] leading-6 text-muted-foreground sm:text-sm sm:leading-7">Describe how you’re feeling in your own words. SARATHI can help you understand urgency and the next safest step.</p>
              <div className="mt-5 flex flex-wrap justify-center gap-2" aria-label="Suggested symptom prompts">
                {quickPrompts.map((prompt) => (
                  <button key={prompt} type="button" onClick={() => handleSend(prompt)} disabled={isPending} className="inline-flex min-h-10 items-center rounded-xl border border-border bg-card px-3.5 text-xs font-semibold text-[#48646b] transition hover:border-accent/40 hover:bg-[#f4faf9] hover:text-accent disabled:opacity-60 sm:px-4 sm:text-[13px]" data-testid={`button-prompt-${prompt.toLowerCase().replaceAll(' ', '-')}`}>{prompt}</button>
                ))}
              </div>
              <p className="mt-5 flex items-center gap-2 text-[11px] leading-5 text-[#826d55] sm:text-xs"><Siren size={14} className="shrink-0 text-[#a7752d]" /> If someone is in immediate danger, call 108 first.</p>
            </div>
          ) : (
            <div className="mx-auto w-full max-w-3xl py-3 sm:py-6">
              {messages.map((message, i) => <ChatBubble key={i} role={message.role} content={message.content} />)}
              {isPending && (
                <div className="mb-5 flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-3 text-xs text-muted-foreground" role="status" aria-live="polite">
                  <span className="flex gap-1"><i className="h-1.5 w-1.5 animate-pulse rounded-full bg-accent" /><i className="h-1.5 w-1.5 animate-pulse rounded-full bg-accent [animation-delay:180ms]" /><i className="h-1.5 w-1.5 animate-pulse rounded-full bg-accent [animation-delay:360ms]" /></span>
                  SARATHI is preparing a response…
                </div>
              )}
              <div ref={chatEndRef} />
            </div>
          )}
        </div>

        <div className="z-20 shrink-0 border-t border-border bg-card px-3 pb-[max(12px,env(safe-area-inset-bottom))] pt-3 sm:px-6 sm:pt-4 lg:px-8">
          <div className="mx-auto flex w-full max-w-3xl flex-col items-center">
            <div className="flex min-h-10 items-center gap-2">
              <AnimatedMic isListening={isListening} onClick={isListening ? stopListening : startListening} disabled={isPending} />
              {isListening && <p className="text-xs font-medium text-accent" role="status">Listening in {user.language}… speak clearly</p>}
              {speechError && <p className="max-w-[260px] rounded-lg border border-warning/30 bg-warning/10 px-3 py-2 text-xs text-[#76521f]" role="alert">{speechError}</p>}
            </div>
            <div className="flex w-full items-center gap-2 rounded-2xl border border-border bg-background p-1.5 shadow-[0_5px_18px_rgba(30,67,72,.045)] transition focus-within:border-accent/50 focus-within:ring-2 focus-within:ring-accent/10 sm:gap-3 sm:p-2">
              <label htmlFor="symptom-input" className="sr-only">Describe your symptoms</label>
              <input id="symptom-input" value={textInput} onChange={(e) => setTextInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSend()} placeholder={isListening ? `Listening in ${user.language}…` : 'Describe your symptoms'} className="h-11 min-w-0 flex-1 bg-transparent px-2 text-sm text-foreground outline-none placeholder:text-muted-foreground/75 sm:px-3" data-testid="input-symptoms" />
              <button type="button" onClick={() => handleSend()} disabled={!textInput.trim() || isPending} aria-label="Send symptoms" className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-accent text-white transition hover:bg-[#105c5a] disabled:cursor-not-allowed disabled:opacity-45" data-testid="button-send-symptoms">
                <Send size={18} />
              </button>
            </div>
            <p className="mt-2 w-full px-1 text-[10px] leading-4 text-muted-foreground sm:text-[11px]">Share only what feels relevant. This does not replace emergency services.</p>
          </div>
        </div>
      </section>

      <AnimatePresence>
        {triageResult && showTriagePanel && (
          <motion.aside
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 24 }}
            transition={{ duration: .22 }}
            className="triage-panel flex h-full shrink-0 flex-col overflow-hidden border-l border-border bg-[#fbfdfd] lg:relative lg:w-[370px] xl:w-[400px]"
            aria-label="Triage assessment"
          >
            <header className="flex min-h-[70px] shrink-0 items-center justify-between border-b border-border bg-card px-5 sm:px-6">
              <div className="flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent/10 text-accent"><Activity size={19} /></span>
                <div><h2 className="font-display text-base font-bold text-foreground">Triage assessment</h2><p className="text-[11px] text-muted-foreground">Guidance based on your symptoms</p></div>
              </div>
              <button type="button" onClick={() => setShowTriagePanel(false)} aria-label="Close triage assessment" className="flex h-10 w-10 items-center justify-center rounded-xl text-muted-foreground transition hover:bg-secondary hover:text-foreground" data-testid="button-close-triage"><X size={19} /></button>
            </header>
            <div className="min-h-0 flex-1 overflow-y-auto px-4 py-5 sm:px-6">
              <section className={`rounded-2xl border p-5 ${currentSeverity === 'CRITICAL' ? 'border-destructive/35 bg-[#fff5f4]' : 'border-border bg-white'}`}>
                <div className="flex items-start justify-between gap-3">
                  <div><p className="mb-2 text-[10px] font-bold uppercase tracking-[.13em] text-muted-foreground">Severity</p><SeverityBadge severity={currentSeverity} /></div>
                  <div className="text-right"><p className="mb-2 text-[10px] font-bold uppercase tracking-[.13em] text-muted-foreground">Confidence</p><p className="font-display text-2xl font-semibold text-foreground">{triageResult.confidence}%</p></div>
                </div>
                {currentSeverity === 'CRITICAL' && <a href="tel:108" className="mt-5 flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 text-sm font-bold text-white transition hover:bg-primary/90" data-testid="link-call-108-critical"><Phone size={17} /> Emergency · Call 108 now</a>}
              </section>

              <section className="mt-5">
                <h3 className="mb-2 text-[11px] font-bold uppercase tracking-[.12em] text-muted-foreground">Immediate action</h3>
                <p className="rounded-xl border border-accent/15 border-l-[3px] border-l-accent bg-[#edf6f4] p-4 text-sm leading-6 text-[#29474e]">{triageResult.immediateAction}</p>
                <h3 className="mb-3 mt-5 text-[11px] font-bold uppercase tracking-[.12em] text-muted-foreground">First-aid steps</h3>
                <ol className="space-y-2.5">
                  {triageResult.firstAid.map((step, idx) => (
                    <motion.li initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * .06 }} key={idx} className="flex gap-3 rounded-xl border border-border bg-white p-3.5">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-accent/10 text-xs font-bold text-accent">{idx + 1}</span>
                      <span className="pt-0.5 text-[13px] leading-5 text-[#38535a]">{step}</span>
                    </motion.li>
                  ))}
                </ol>
              </section>

              <button type="button" onClick={handleWhatsAppAlert} className="mt-5 flex min-h-[60px] w-full items-center justify-between rounded-xl border border-[#c9e3d2] bg-[#f3faf5] px-4 text-left transition hover:bg-[#eaf6ed]" data-testid="button-alert-guardian">
                <span className="flex items-center gap-3"><span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#e3f2e8] text-[#36836d]"><MessageCircle size={19} /></span><span><span className="block text-sm font-bold text-foreground">Alert parent / guardian</span><span className="mt-0.5 block text-[11px] text-muted-foreground">Send a WhatsApp message</span></span></span><ArrowUpRight size={17} className="text-[#36836d]" />
              </button>

              <button type="button" onClick={() => setShowHospitals(!showHospitals)} aria-expanded={showHospitals} className="mt-3 flex min-h-[50px] w-full items-center justify-center gap-2 rounded-xl border border-border bg-white text-sm font-semibold text-[#38535a] transition hover:border-accent/35 hover:bg-[#f6fbfa]" data-testid="button-nearby-hospitals">
                <MapPin size={17} className="text-accent" />{showHospitals ? 'Hide nearby hospitals' : 'Find nearby hospitals'}
              </button>

              <AnimatePresence>
                {showHospitals && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="mt-3 space-y-3 overflow-hidden">
                    {isLoadingHospitals ? (
                      <div className="space-y-2 rounded-xl border border-border bg-white p-4" role="status" aria-label="Loading nearby hospitals">
                        <div className="h-3 w-2/3 animate-pulse rounded bg-secondary" /><div className="h-3 w-1/2 animate-pulse rounded bg-secondary" /><div className="h-9 w-full animate-pulse rounded-lg bg-secondary" />
                      </div>
                    ) : hospitalsError ? (
                      <div className="rounded-xl border border-border bg-white p-4 text-center">
                        <p className="text-sm font-semibold text-foreground">Hospitals couldn’t be loaded</p><p className="mt-1 text-xs text-muted-foreground">Check your connection and try again.</p>
                        <button type="button" onClick={() => void refetchHospitals()} className="mt-3 min-h-10 rounded-lg bg-accent px-4 text-xs font-bold text-white hover:bg-[#105c5a]" data-testid="button-retry-hospitals">Try again</button>
                      </div>
                    ) : hospitalsData?.hospitals.length ? hospitalsData.hospitals.map((hospital) => (
                      <article key={hospital.id} className="rounded-xl border border-border bg-white p-4 transition hover:border-accent/25" data-testid={`card-hospital-${hospital.id}`}>
                        <div className="flex items-start justify-between gap-2"><h4 className="text-sm font-bold leading-5 text-foreground">{hospital.name}</h4><span className="shrink-0 rounded-full bg-accent/10 px-2 py-1 text-[10px] font-bold text-accent">{hospital.distance}</span></div>
                        <p className="mt-1 text-xs text-muted-foreground">{hospital.speciality}</p>
                        <div className="mt-3 flex gap-2">
                          <a href={`tel:${hospital.phone}`} className="inline-flex min-h-10 flex-1 items-center justify-center gap-1.5 rounded-lg bg-secondary text-xs font-bold text-foreground transition hover:bg-secondary/80"><Phone size={14} /> Call</a>
                          <a href={hospital.mapsUrl} target="_blank" rel="noreferrer" className="inline-flex min-h-10 flex-1 items-center justify-center gap-1.5 rounded-lg border border-accent/15 bg-accent/[.06] text-xs font-bold text-accent transition hover:bg-accent/10"><Navigation size={14} /> Directions</a>
                        </div>
                      </article>
                    )) : (
                      <div className="rounded-xl border border-dashed border-border bg-white p-5 text-center"><MapPin size={20} className="mx-auto text-muted-foreground" /><p className="mt-2 text-sm font-semibold text-foreground">No facilities found</p><p className="mt-1 text-xs text-muted-foreground">No nearby hospitals were returned for Hyderabad.</p></div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <footer className="shrink-0 border-t border-border bg-card px-5 py-3 text-center text-[10px] leading-4 text-muted-foreground sm:px-6">
              This guidance does not replace professional medical care.
            </footer>
          </motion.aside>
        )}
      </AnimatePresence>
    </main>
  );
}
