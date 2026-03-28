import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import * as Speech from 'expo-speech';
import { router } from 'expo-router';
import React, { useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Linking,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { KeyboardAvoidingView } from 'react-native-keyboard-controller';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AnimatedMicButton } from '@/components/AnimatedMicButton';
import { ChatBubble, TypingIndicator } from '@/components/ChatBubble';
import { SeverityCard } from '@/components/SeverityCard';
import C, { SEVERITY_COLORS } from '@/constants/colors';
import { useUser } from '@/context/UserContext';

type Language = 'english' | 'hindi' | 'telugu';
type Severity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

interface TriageResult {
  severity: Severity;
  severityScore: number;
  confidence: number;
  immediateAction: string;
  firstAid: string[];
  followUpQuestion: string;
  aiMessage: string;
  possibleConditions: string[];
  callEmergency: boolean;
  triageDetails: { symptoms: string[]; redFlags: string[] };
}

interface Hospital {
  id: string;
  name: string;
  distance: string;
  phone: string;
  address: string;
  speciality: string;
  emergencyAvailable: boolean;
  mapsUrl: string;
}

const LANG_TTS: Record<Language, string> = {
  english: 'en-IN',
  hindi: 'hi-IN',
  telugu: 'te-IN',
};

const BASE_URL = process.env.EXPO_PUBLIC_DOMAIN
  ? `https://${process.env.EXPO_PUBLIC_DOMAIN}`
  : '';

async function callTriage(symptoms: string, language: Language, userName: string, history: Message[]): Promise<TriageResult> {
  const res = await fetch(`${BASE_URL}/api/sarathi/triage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      symptoms,
      language,
      userName,
      conversationHistory: history.map(m => ({ role: m.role, content: m.content })),
    }),
  });
  if (!res.ok) throw new Error('Triage failed');
  return res.json();
}

async function callFollowup(answer: string, language: Language, severity: string, userName: string, history: Message[]) {
  const res = await fetch(`${BASE_URL}/api/sarathi/followup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      answer,
      language,
      severity,
      userName,
      conversationHistory: history.map(m => ({ role: m.role, content: m.content })),
    }),
  });
  if (!res.ok) throw new Error('Followup failed');
  return res.json();
}

async function loadHospitals(): Promise<Hospital[]> {
  const res = await fetch(`${BASE_URL}/api/sarathi/hospitals`);
  if (!res.ok) return [];
  const data = await res.json();
  return data.hospitals || [];
}

function speakText(text: string, language: Language) {
  const lang = LANG_TTS[language];
  Speech.speak(text, {
    language: lang,
    rate: 0.92,
    pitch: 1.05,
    onError: () => {},
  });
}

// Simple web-based speech recognition hook
function useSpeechInput(language: Language, onResult: (text: string) => void) {
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);

  const LANG_CODE: Record<Language, string> = {
    english: 'en-IN',
    hindi: 'hi-IN',
    telugu: 'te-IN',
  };

  const start = () => {
    if (Platform.OS !== 'web') {
      setIsListening(false);
      return;
    }
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) return;
    const r = new SR();
    r.lang = LANG_CODE[language];
    r.continuous = false;
    r.interimResults = false;
    r.onresult = (e: any) => {
      const t = e.results[0][0].transcript;
      if (t) onResult(t);
    };
    r.onend = () => setIsListening(false);
    r.onerror = () => setIsListening(false);
    recognitionRef.current = r;
    r.start();
    setIsListening(true);
  };

  const stop = () => {
    recognitionRef.current?.stop?.();
    setIsListening(false);
  };

  return { isListening, start, stop };
}

export default function Dashboard() {
  const insets = useSafeAreaInsets();
  const { user, clearUser } = useUser();

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [triage, setTriage] = useState<TriageResult | null>(null);
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [showPanel, setShowPanel] = useState<'chat' | 'result'>('chat');
  const firstSymptomsRef = useRef('');

  const { isListening, start: startListening, stop: stopListening } = useSpeechInput(
    user?.language ?? 'english',
    (text) => setInput(prev => prev ? `${prev} ${text}` : text)
  );

  const makeId = () => Date.now().toString() + Math.random().toString(36).substr(2, 5);

  const addMessage = (role: 'user' | 'assistant', content: string): Message => {
    const msg: Message = { id: makeId(), role, content };
    setMessages(prev => [...prev, msg]);
    return msg;
  };

  const send = async (textOverride?: string) => {
    const text = (textOverride || input).trim();
    if (!text || !user || isLoading) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    stopListening();
    Speech.stop();
    setInput('');

    const currentMessages = [...messages];
    const userMsg: Message = { id: makeId(), role: 'user', content: text };
    setMessages(prev => [...prev, userMsg]);
    setIsLoading(true);

    try {
      if (!triage) {
        // First message → triage
        firstSymptomsRef.current = text;
        const result = await callTriage(text, user.language, user.name, [...currentMessages, userMsg]);
        const aiMsg: Message = { id: makeId(), role: 'assistant', content: result.aiMessage };
        setMessages(prev => [...prev, aiMsg]);
        setTriage(result);
        speakText(result.aiMessage, user.language);
        if (result.callEmergency) {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        }
        // Load hospitals in background
        loadHospitals().then(h => setHospitals(h));
      } else {
        // Follow-up
        const allMessages = [...currentMessages, userMsg];
        const result = await callFollowup(text, user.language, triage.severity, user.name, allMessages);
        const aiMsg: Message = { id: makeId(), role: 'assistant', content: result.message };
        setMessages(prev => [...prev, aiMsg]);
        speakText(result.message, user.language);
        if (result.updatedSeverity && result.updatedSeverity !== triage.severity) {
          setTriage(prev => prev ? { ...prev, severity: result.updatedSeverity as Severity } : prev);
        }
      }
    } catch {
      const fallback = 'Unable to connect to SARATHI server. If this is an emergency, please call 108 immediately.';
      setMessages(prev => [...prev, { id: makeId(), role: 'assistant', content: fallback }]);
      speakText(fallback, user.language);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleMic = () => {
    if (isListening) stopListening();
    else startListening();
  };

  const logout = async () => {
    Speech.stop();
    await clearUser();
    router.replace('/');
  };

  const severity = triage?.severity ?? 'LOW';
  const severityColor = SEVERITY_COLORS[severity] ?? C.cyan;
  const webTop = Platform.OS === 'web' ? 67 : 0;

  const renderMessage = ({ item }: { item: Message }) => (
    <ChatBubble role={item.role} content={item.content} />
  );

  if (!user) return null;

  return (
    <View style={[styles.root, { paddingTop: insets.top + webTop }]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={[styles.logoMini, { borderColor: severityColor + '60' }]}>
            <Ionicons name="pulse" size={16} color={severityColor} />
          </View>
          <View>
            <Text style={styles.headerTitle}>SARATHI <Text style={{ color: C.red }}>AI</Text></Text>
            <Text style={styles.headerSub}>
              <Text style={[styles.dot, { color: C.green }]}>● </Text>
              {user.name} • {user.language}
            </Text>
          </View>
        </View>
        <View style={styles.headerActions}>
          {triage && (
            <Pressable
              style={[styles.panelToggle, showPanel === 'result' && { backgroundColor: severityColor + '22' }]}
              onPress={() => setShowPanel(s => s === 'chat' ? 'result' : 'chat')}
            >
              <Ionicons
                name={showPanel === 'chat' ? 'shield-half' : 'chatbubbles'}
                size={18}
                color={showPanel === 'chat' ? severityColor : C.gray}
              />
            </Pressable>
          )}
          <Pressable style={styles.emergencyFab} onPress={() => Linking.openURL('tel:108')}>
            <Ionicons name="call" size={16} color={C.white} />
            <Text style={styles.emergencyFabText}>108</Text>
          </Pressable>
          <Pressable onPress={logout} style={{ padding: 4 }}>
            <Ionicons name="log-out-outline" size={20} color={C.gray} />
          </Pressable>
        </View>
      </View>

      {/* Severity strip */}
      {triage && (
        <View style={[styles.severityStrip, { backgroundColor: severityColor + '18', borderColor: severityColor + '40' }]}>
          <Ionicons name="fitness" size={14} color={severityColor} />
          <Text style={[styles.severityStripText, { color: severityColor }]}>
            {severity} severity • Score {triage.severityScore}/100 • {triage.confidence}% confidence
          </Text>
        </View>
      )}

      {showPanel === 'chat' ? (
        <>
          {/* Chat area */}
          <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior="padding"
            keyboardVerticalOffset={0}
          >
            <FlatList
              data={messages}
              keyExtractor={m => m.id}
              renderItem={renderMessage}
              contentContainerStyle={styles.chatContent}
              showsVerticalScrollIndicator={false}
              scrollEnabled={!!messages.length}
              ListEmptyComponent={
                <View style={styles.emptyState}>
                  <AnimatedMicButton
                    isListening={isListening}
                    onPress={toggleMic}
                    disabled={isLoading}
                  />
                  <Text style={styles.emptyTitle}>
                    {isListening ? 'Listening...' : `Speak in ${user.language}`}
                  </Text>
                  <Text style={styles.emptySub}>
                    Describe your symptoms clearly.{'\n'}SARATHI will assess severity and guide you.
                  </Text>
                </View>
              }
              ListFooterComponent={isLoading ? <TypingIndicator /> : null}
            />

            {/* Input */}
            <View style={[styles.inputBar, { paddingBottom: insets.bottom + 12 }]}>
              {messages.length > 0 && (
                <Pressable style={styles.micInline} onPress={toggleMic} disabled={isLoading}>
                  <Ionicons
                    name={isListening ? 'mic' : 'mic-outline'}
                    size={22}
                    color={isListening ? C.red : C.cyan}
                  />
                </Pressable>
              )}
              <TextInput
                style={styles.input}
                value={input}
                onChangeText={setInput}
                placeholder={isListening ? 'Listening...' : 'Type or speak symptoms...'}
                placeholderTextColor={C.grayDark}
                onSubmitEditing={() => send()}
                returnKeyType="send"
                multiline
              />
              <Pressable
                style={[styles.sendBtn, (!input.trim() || isLoading) && { opacity: 0.4 }]}
                onPress={() => send()}
                disabled={!input.trim() || isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator size="small" color={C.white} />
                ) : (
                  <Ionicons name="send" size={18} color={C.white} />
                )}
              </Pressable>
            </View>
          </KeyboardAvoidingView>
        </>
      ) : (
        <View style={styles.resultPanel}>
          <SeverityCard
            triage={triage!}
            hospitals={hospitals}
            userName={user.name}
            symptoms={firstSymptomsRef.current}
            parentPhone={user.parent1Phone}
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.navy },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 12,
    borderBottomWidth: 1, borderBottomColor: C.navyBorder,
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  logoMini: {
    width: 36, height: 36, borderRadius: 10,
    backgroundColor: C.navyCard, borderWidth: 1.5,
    alignItems: 'center', justifyContent: 'center',
  },
  headerTitle: { fontSize: 16, fontFamily: 'Inter_700Bold', color: C.white, letterSpacing: 0.5 },
  headerSub: { fontSize: 11, color: C.gray, fontFamily: 'Inter_400Regular', marginTop: 1 },
  dot: { fontSize: 8 },
  headerActions: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  panelToggle: {
    width: 34, height: 34, borderRadius: 10,
    backgroundColor: C.navyCard, alignItems: 'center', justifyContent: 'center',
  },
  emergencyFab: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: C.red, borderRadius: 10, paddingHorizontal: 10, paddingVertical: 7,
  },
  emergencyFabText: { color: C.white, fontFamily: 'Inter_700Bold', fontSize: 13 },
  severityStrip: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 16, paddingVertical: 7, borderBottomWidth: 1,
  },
  severityStripText: { fontSize: 12, fontFamily: 'Inter_600SemiBold' },
  chatContent: { paddingTop: 16, paddingBottom: 16, flexGrow: 1 },
  emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 60, paddingHorizontal: 40 },
  emptyTitle: { fontSize: 18, fontFamily: 'Inter_600SemiBold', color: C.white, marginTop: 20, textAlign: 'center' },
  emptySub: { fontSize: 14, color: C.gray, fontFamily: 'Inter_400Regular', textAlign: 'center', marginTop: 10, lineHeight: 20 },
  inputBar: {
    flexDirection: 'row', alignItems: 'flex-end', gap: 8,
    paddingHorizontal: 12, paddingTop: 10,
    borderTopWidth: 1, borderTopColor: C.navyBorder,
    backgroundColor: C.navy,
  },
  micInline: {
    width: 42, height: 44, borderRadius: 12,
    backgroundColor: C.navyCard, borderWidth: 1, borderColor: C.navyBorder,
    alignItems: 'center', justifyContent: 'center',
  },
  input: {
    flex: 1,
    backgroundColor: C.navyCard, borderWidth: 1, borderColor: C.navyBorder,
    borderRadius: 14, paddingHorizontal: 14, paddingVertical: 12,
    color: C.white, fontFamily: 'Inter_400Regular', fontSize: 15,
    maxHeight: 100,
  },
  sendBtn: {
    width: 44, height: 44, borderRadius: 12,
    backgroundColor: C.red, alignItems: 'center', justifyContent: 'center',
  },
  resultPanel: { flex: 1, paddingHorizontal: 16, paddingTop: 16 },
});
