import { useState, useEffect, useRef } from 'react';
import { useLocation } from 'wouter';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Phone, MapPin, Activity, Navigation, HeartPulse, ChevronRight, MessageCircle } from 'lucide-react';
import { useUser } from '@/hooks/use-user';
import { useSpeechRecognition, useSpeechSynthesis } from '@/hooks/use-speech';
import { useTriageSymptoms, useGetFollowupResponse, useGetNearbyHospitals } from '@workspace/api-client-react';
import type { TriageResponse, ConversationMessage } from '@workspace/api-client-react/src/generated/api.schemas';
import { AnimatedMic } from '@/components/animated-mic';
import { ChatBubble } from '@/components/chat-bubble';
import { SeverityBadge } from '@/components/severity-badge';
import { ECGAnimation } from '@/components/ecg-animation';

const LANG_CODES = {
  english: 'en-IN',
  hindi: 'hi-IN',
  telugu: 'te-IN'
};

export default function Dashboard() {
  const [, setLocation] = useLocation();
  const { user } = useUser();
  const [messages, setMessages] = useState<ConversationMessage[]>([]);
  const [textInput, setTextInput] = useState('');
  const [triageResult, setTriageResult] = useState<TriageResponse | null>(null);
  const [showHospitals, setShowHospitals] = useState(false);
  
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Redirect if no user
  useEffect(() => {
    if (!user) setLocation('/');
  }, [user, setLocation]);

  const langCode = user ? LANG_CODES[user.language] : 'en-IN';

  // API Hooks
  const triageMutation = useTriageSymptoms();
  const followupMutation = useGetFollowupResponse();
  const { data: hospitalsData, isLoading: isLoadingHospitals } = useGetNearbyHospitals(
    { city: 'Hyderabad' }, 
    { query: { enabled: showHospitals } }
  );

  // Speech Hooks
  const { speak } = useSpeechSynthesis();
  const { isListening, startListening, stopListening } = useSpeechRecognition({
    languageCode: langCode,
    onResult: (text) => {
      setTextInput(prev => prev ? `${prev} ${text}` : text);
    }
  });

  // Auto-scroll chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (textOverride?: string) => {
    const textToSend = textOverride || textInput;
    if (!textToSend.trim() || !user) return;

    // Add user message
    const newMessages = [...messages, { role: 'user', content: textToSend } as ConversationMessage];
    setMessages(newMessages);
    setTextInput('');
    stopListening();

    try {
      if (!triageResult) {
        // First message -> Triage
        const res = await triageMutation.mutateAsync({
          data: {
            symptoms: textToSend,
            language: user.language,
            userName: user.name,
            conversationHistory: newMessages
          }
        });
        setTriageResult(res);
        setMessages([...newMessages, { role: 'assistant', content: res.aiMessage }]);
        speak(res.aiMessage, langCode);
      } else {
        // Follow up
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
        
        // Update triage severity if it changed
        if (res.updatedSeverity && res.updatedSeverity !== triageResult.severity) {
          setTriageResult({ ...triageResult, severity: res.updatedSeverity as any });
        }
        
        speak(res.message, langCode);
      }
    } catch (err) {
      console.error("API Error:", err);
      // Fallback for UI demonstration if API fails
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

  return (
    <div className="flex h-screen w-full bg-background overflow-hidden font-sans">
      
      {/* LEFT MAIN CHAT AREA */}
      <div className="flex-1 flex flex-col relative z-10 border-r border-white/5">
        
        {/* Header */}
        <header className="h-20 glass-panel border-x-0 border-t-0 flex items-center justify-between px-6 z-20 shrink-0">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-card border border-white/10 flex items-center justify-center shadow-lg relative overflow-hidden">
               {currentSeverity === 'CRITICAL' && <div className="absolute inset-0 bg-primary/20 animate-pulse" />}
               <img src={`${import.meta.env.BASE_URL}images/sarathi-logo.png`} alt="Logo" className="w-8 h-8 z-10" />
            </div>
            <div>
              <h1 className="font-display font-bold text-xl text-white tracking-wide">SARATHI <span className="text-primary">AI</span></h1>
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-success animate-pulse"></span> Online • {user.name}
              </p>
            </div>
          </div>
          
          <button className="bg-primary hover:bg-primary/90 text-white font-bold py-2.5 px-6 rounded-full shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all flex items-center gap-2 animate-pulse">
            <Phone className="w-5 h-5" /> 108
          </button>
        </header>

        {/* Dynamic ECG Line based on severity */}
        <div className="absolute top-20 left-0 right-0 pointer-events-none opacity-40 z-0">
          <ECGAnimation severity={currentSeverity} />
        </div>

        {/* Chat History */}
        <div className="flex-1 overflow-y-auto p-6 scrollbar-hide z-10">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center opacity-60">
              <Activity className="w-16 h-16 text-accent mb-4" />
              <h2 className="text-2xl font-display text-white mb-2">How can I help you?</h2>
              <p className="text-muted-foreground max-w-md">Describe your symptoms clearly. You can type or use the microphone to speak in {user.language}.</p>
            </div>
          ) : (
            <div className="max-w-4xl mx-auto">
              {messages.map((m, i) => (
                <ChatBubble key={i} role={m.role} content={m.content} />
              ))}
              {(triageMutation.isPending || followupMutation.isPending) && (
                <div className="flex gap-2 p-4 text-muted-foreground">
                  <span className="animate-bounce">●</span>
                  <span className="animate-bounce" style={{ animationDelay: '0.2s' }}>●</span>
                  <span className="animate-bounce" style={{ animationDelay: '0.4s' }}>●</span>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="p-6 glass-panel border-x-0 border-b-0 shrink-0 z-20">
          <div className="max-w-4xl mx-auto flex flex-col items-center">
            
            <AnimatedMic 
              isListening={isListening} 
              onClick={isListening ? stopListening : startListening}
              disabled={triageMutation.isPending || followupMutation.isPending}
            />
            
            <div className="w-full relative flex items-center">
              <input
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder={isListening ? "Listening..." : "Type your symptoms here..."}
                className="w-full bg-card/50 border border-white/10 rounded-2xl pl-6 pr-14 py-4 text-white placeholder:text-muted-foreground focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all shadow-inner"
              />
              <button 
                onClick={() => handleSend()}
                disabled={!textInput.trim() || triageMutation.isPending || followupMutation.isPending}
                className="absolute right-2 p-3 bg-accent text-accent-foreground rounded-xl hover:bg-accent/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
            
          </div>
        </div>
      </div>

      {/* RIGHT PANEL: Triage & Hospitals */}
      <AnimatePresence>
        {triageResult && (
          <motion.div 
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 450, opacity: 1 }}
            className="h-full bg-card border-l border-white/5 flex flex-col shrink-0 overflow-hidden"
          >
            <div className="p-6 flex-1 overflow-y-auto scrollbar-hide">
              
              <h2 className="text-lg font-display font-bold text-white mb-6 flex items-center gap-2">
                <HeartPulse className="w-5 h-5 text-primary" /> Triage Assessment
              </h2>

              {/* Severity Card */}
              <div className={`
                p-6 rounded-2xl border mb-6 relative overflow-hidden
                ${currentSeverity === 'CRITICAL' ? 'bg-destructive/10 border-destructive box-glow-primary' : 'bg-background/50 border-white/10'}
              `}>
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1 uppercase tracking-wider font-semibold">Severity</p>
                    <SeverityBadge severity={currentSeverity} />
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground mb-1 uppercase tracking-wider font-semibold">Confidence</p>
                    <p className="text-xl font-bold text-white">{triageResult.confidence}%</p>
                  </div>
                </div>
                
                {currentSeverity === 'CRITICAL' && (
                  <button className="w-full py-3 mt-4 bg-primary text-white rounded-xl font-bold uppercase tracking-wider shadow-lg hover:bg-primary/90 animate-pulse">
                    EMERGENCY: CALL 108 NOW
                  </button>
                )}
              </div>

              {/* First Aid */}
              <div className="mb-6">
                <h3 className="text-sm text-muted-foreground uppercase tracking-wider font-semibold mb-3">Immediate Action</h3>
                <p className="text-white bg-secondary/50 p-4 rounded-xl border border-white/5 mb-4 border-l-4 border-l-accent">
                  {triageResult.immediateAction}
                </p>
                
                <h3 className="text-sm text-muted-foreground uppercase tracking-wider font-semibold mb-3">First Aid Steps</h3>
                <ul className="space-y-3">
                  {triageResult.firstAid.map((step, idx) => (
                    <motion.li 
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      key={idx} 
                      className="flex gap-3 bg-background/50 p-3 rounded-xl border border-white/5"
                    >
                      <span className="flex-shrink-0 w-6 h-6 rounded-full bg-accent/20 text-accent flex items-center justify-center text-sm font-bold">
                        {idx + 1}
                      </span>
                      <span className="text-sm text-foreground/90">{step}</span>
                    </motion.li>
                  ))}
                </ul>
              </div>

              {/* WhatsApp Alert */}
              <div className="mb-8">
                <button 
                  onClick={handleWhatsAppAlert}
                  className="w-full py-4 px-6 bg-[#25D366]/10 hover:bg-[#25D366]/20 border border-[#25D366]/30 rounded-2xl flex items-center justify-between transition-colors group"
                >
                  <div className="flex items-center gap-3 text-left">
                    <MessageCircle className="w-6 h-6 text-[#25D366]" />
                    <div>
                      <p className="text-white font-semibold">Alert Parents</p>
                      <p className="text-xs text-muted-foreground">Send auto-generated WhatsApp</p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-[#25D366] transition-transform group-hover:translate-x-1" />
                </button>
              </div>

              {/* Hospitals Toggle */}
              <button 
                onClick={() => setShowHospitals(!showHospitals)}
                className="w-full py-4 glass-panel rounded-2xl flex items-center justify-center gap-2 hover:bg-card/80 transition-colors border-white/10 text-white font-semibold"
              >
                <MapPin className="w-5 h-5 text-accent" /> 
                {showHospitals ? 'Hide Nearby Hospitals' : 'Find Nearby Hospitals'}
              </button>

              {/* Hospitals List */}
              <AnimatePresence>
                {showHospitals && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="mt-4 space-y-4 overflow-hidden"
                  >
                    {isLoadingHospitals ? (
                      <div className="p-8 text-center text-muted-foreground">Scanning nearby facilities...</div>
                    ) : (
                      hospitalsData?.hospitals.map((hospital) => (
                        <div key={hospital.id} className="bg-background/80 p-4 rounded-2xl border border-white/5 hover:border-accent/30 transition-colors">
                          <div className="flex justify-between items-start mb-2">
                            <h4 className="font-bold text-white text-sm">{hospital.name}</h4>
                            <span className="text-xs font-semibold px-2 py-1 rounded-full bg-secondary text-accent">{hospital.distance}</span>
                          </div>
                          <p className="text-xs text-muted-foreground mb-3">{hospital.speciality}</p>
                          
                          <div className="flex gap-2 mt-4">
                            <a href={`tel:${hospital.phone}`} className="flex-1 bg-secondary hover:bg-secondary/80 text-white text-xs font-bold py-2 rounded-lg flex items-center justify-center gap-1 transition-colors">
                              <Phone className="w-3 h-3" /> Call
                            </a>
                            <a href={hospital.mapsUrl} target="_blank" rel="noreferrer" className="flex-1 bg-accent/10 hover:bg-accent/20 text-accent border border-accent/20 text-xs font-bold py-2 rounded-lg flex items-center justify-center gap-1 transition-colors">
                              <Navigation className="w-3 h-3" /> Directions
                            </a>
                          </div>
                        </div>
                      ))
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
