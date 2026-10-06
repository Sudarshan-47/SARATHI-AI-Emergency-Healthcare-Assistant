import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import * as Speech from 'expo-speech';
import { router } from 'expo-router';
import React, { useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
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

// Language BCP-47 codes with fallbacks for browser speech recognition
const LANG_CODES: Record<Language, string[]> = {
  english: ['en-IN', 'en-GB', 'en-US'],
  hindi: ['hi-IN', 'hi'],
  telugu: ['te-IN', 'te'],
};

// Speech recognition hook — works on web preview; shows guidance on native
function useSpeechInput(
  language: Language,
  onResult: (text: string) => void,
  onError: (msg: string) => void,
) {
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);
  const langRef = useRef(language);

  // Always keep langRef in sync so start() uses the latest language
  langRef.current = language;

  const isSpeechSupported = Platform.OS === 'web' &&
    typeof window !== 'undefined' &&
    !!(
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition
    );

  const start = () => {
    if (Platform.OS !== 'web') {
      onError('Voice input is available in the web preview. On your phone, please type your symptoms below.');
      return;
    }

    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) {
      onError('Your browser does not support voice input. Please use Chrome and type your symptoms.');
      return;
    }

    // Abort any previous session cleanly
    if (recognitionRef.current) {
      try { recognitionRef.current.abort(); } catch {}
    }

    const fallbacks = LANG_CODES[langRef.current];

    const tryRecognition = (langIndex: number) => {
      const r = new SR();
      r.lang = fallbacks[langIndex];
      r.continuous = false;
      // CRITICAL: interimResults: false prevents Chrome firing onend before
      // delivering the final result for non-Latin scripts (Telugu, Hindi)
      r.interimResults = false;
      r.maxAlternatives = 3;

      r.onstart = () => setIsListening(true);

      r.onresult = (e: any) => {
        // Pick highest-confidence alternative
        let best = '';
        let bestConf = 0;
        for (let i = 0; i < e.results.length; i++) {
          for (let j = 0; j < e.results[i].length; j++) {
            if (e.results[i][j].confidence > bestConf) {
              bestConf = e.results[i][j].confidence;
              best = e.results[i][j].transcript;
            }
          }
        }
        if (best) onResult(best);
      };

      r.onerror = (e: any) => {
        setIsListening(false);
        if (e.error === 'no-speech') {
          onError('No speech detected — please speak clearly and try again.');
          return;
        }
        if (e.error === 'not-allowed') {
          onError('Microphone access denied. Allow mic permission in your browser settings.');
          return;
        }
        // network error often means the lang code isn't supported — try fallback
        if ((e.error === 'network' || e.error === 'language-not-supported') && langIndex + 1 < fallbacks.length) {
          tryRecognition(langIndex + 1);
          return;
        }
        onError('Voice recognition failed. Please type your symptoms.');
      };

      r.onend = () => setIsListening(false);

      recognitionRef.current = r;
      try { r.start(); } catch { setIsListening(false); }
    };

    tryRecognition(0);
  };

  const stop = () => {
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch {}
    }
    setIsListening(false);
  };

  return { isListening, isSpeechSupported, start, stop };
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
  const [speechError, setSpeechError] = useState('');
  const [showKeyboardHint, setShowKeyboardHint] = useState(false);
  const firstSymptomsRef = useRef('');
  const inputRef = useRef<TextInput>(null);
  const hintBounce = useRef(new Animated.Value(0)).current;

  const { isListening, isSpeechSupported, start: startListening, stop: stopListening } = useSpeechInput(
    user?.language ?? 'english',
    (text) => {
      setSpeechError('');
      setInput(prev => prev ? `${prev} ${text}` : text);
    },
    (msg) => {
      setSpeechError(msg);
      setTimeout(() => setSpeechError(''), 6000);
    },
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

  const startKeyboardHint = () => {
    setShowKeyboardHint(true);
    Animated.loop(
      Animated.sequence([
        Animated.timing(hintBounce, { toValue: -10, duration: 400, useNativeDriver: true }),
        Animated.timing(hintBounce, { toValue: 0, duration: 400, useNativeDriver: true }),
      ])
    ).start();
    setTimeout(() => setShowKeyboardHint(false), 6000);
  };

  const toggleMic = () => {
    if (Platform.OS !== 'web') {
      // Native: Web Speech API unavailable — focus keyboard so user can use native mic
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      inputRef.current?.focus();
      startKeyboardHint();
      return;
    }
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
            <Text style={styles.headerTitle}>SARATHI <Text style={{ color: C.cyan }}>AI</Text></Text>
            <Text style={styles.headerSub}>{user.name} • {user.language}</Text>
          </View>
        </View>
        <View style={styles.headerActions}>
          {triage && (
            <Pressable
              style={[styles.panelToggle, showPanel === 'result' && { backgroundColor: severityColor + '22' }]}
              onPress={() => setShowPanel(s => s === 'chat' ? 'result' : 'chat')}
              accessibilityRole="button"
              accessibilityLabel={showPanel === 'chat' ? 'Show triage results' : 'Return to symptom chat'}
            >
              <Ionicons
                name={showPanel === 'chat' ? 'shield-half' : 'chatbubbles'}
                size={18}
                color={showPanel === 'chat' ? severityColor : C.gray}
              />
            </Pressable>
          )}
          <Pressable
            style={styles.emergencyFab}
            onPress={() => Linking.openURL('tel:108')}
            accessibilityRole="link"
            accessibilityLabel="Call emergency services at 108"
          >
            <Ionicons name="call" size={16} color={C.white} />
            <Text style={styles.emergencyFabText}>108</Text>
          </Pressable>
          <Pressable onPress={logout} style={styles.logoutButton} accessibilityRole="button" accessibilityLabel="Sign out">
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
                    isNative={Platform.OS !== 'web'}
                  />
                  <Text style={styles.emptyTitle}>
                    {isListening ? `Listening in ${user.language}…` : `Tell us what’s happening`}
                  </Text>
                  {speechError ? (
                    <View style={styles.speechErrorBox}>
                      <Ionicons name="warning-outline" size={14} color={C.red} />
                      <Text style={styles.speechErrorText}>{speechError}</Text>
                    </View>
                  ) : showKeyboardHint && Platform.OS !== 'web' ? (
                    <View style={styles.keyboardHintBox}>
                      <Ionicons name="information-circle-outline" size={15} color={C.cyan} />
                      <Text style={styles.keyboardHintText}>
                        Your keyboard just opened — tap the{' '}
                        <Text style={{ color: C.cyan }}>microphone icon</Text> on the keyboard to speak in {user.language}
                      </Text>
                      <Animated.View style={{ transform: [{ translateY: hintBounce }] }}>
                        <Ionicons name="arrow-down" size={16} color={C.cyan} />
                      </Animated.View>
                    </View>
                  ) : (
                    <Text style={styles.emptySub}>
                      {Platform.OS !== 'web'
                        ? `Tap the microphone button above, then use your keyboard’s microphone to speak in ${user.language}.`
                        : `Describe symptoms in ${user.language}. SARATHI can help you understand urgency and the next safest step.`}
                    </Text>
                  )}
                  <View style={styles.quickPrompts}>
                    {[
                      ['Chest pain', 'heart-outline'],
                      ['Breathing trouble', 'cloud-outline'],
                      ['High fever', 'thermometer-outline'],
                    ].map(([label, icon]) => (
                      <Pressable
                        key={label}
                        style={styles.quickPrompt}
                        onPress={() => send(label)}
                        disabled={isLoading}
                      >
                        <Ionicons name={icon as any} size={14} color={C.cyan} />
                        <Text style={styles.quickPromptText}>{label}</Text>
                      </Pressable>
                    ))}
                  </View>
                  <View style={styles.safetyNote}>
                    <Ionicons name="alert-circle-outline" size={14} color={C.red} />
                    <Text style={styles.safetyNoteText}>For immediate danger, call 108 first.</Text>
                  </View>
                </View>
              }
              ListFooterComponent={isLoading ? <TypingIndicator /> : null}
            />

            {/* Input */}
            {!!speechError && messages.length > 0 && (
              <View style={styles.speechErrorBanner}>
                <Ionicons name="warning-outline" size={13} color={C.red} />
                <Text style={styles.speechErrorBannerText} numberOfLines={2}>{speechError}</Text>
              </View>
            )}
            <View style={[styles.inputBar, { paddingBottom: insets.bottom + 12 }]}>
              <Pressable
                style={styles.micInline}
                onPress={toggleMic}
                disabled={isLoading}
              >
                <Ionicons
                  name={
                    Platform.OS !== 'web'
                      ? 'mic-outline'
                      : isListening ? 'mic' : 'mic-outline'
                  }
                  size={22}
                  color={isListening ? C.red : C.cyan}
                />
              </Pressable>
              <TextInput
                ref={inputRef}
                style={styles.input}
                value={input}
                onChangeText={setInput}
                placeholder={isListening ? `Listening in ${user.language}…` : 'Describe your symptoms'}
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
    paddingHorizontal: 16, paddingVertical: 10,
    backgroundColor: C.navyCard,
    borderBottomWidth: 1, borderBottomColor: C.navyBorder,
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  logoMini: {
    width: 36, height: 36, borderRadius: 10,
    backgroundColor: C.cyanDim, borderWidth: 1,
    alignItems: 'center', justifyContent: 'center',
  },
  headerTitle: { fontSize: 16, fontFamily: 'Inter_700Bold', color: C.ink, letterSpacing: 0.3 },
  headerSub: { fontSize: 11, color: C.gray, fontFamily: 'Inter_400Regular', marginTop: 2 },
  headerActions: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  panelToggle: {
    width: 44, height: 44, borderRadius: 11,
    backgroundColor: C.navyCard, borderWidth: 1, borderColor: C.navyBorder,
    alignItems: 'center', justifyContent: 'center',
  },
  emergencyFab: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    minHeight: 44, backgroundColor: C.red, borderRadius: 11, paddingHorizontal: 11, paddingVertical: 8,
  },
  emergencyFabText: { color: C.white, fontFamily: 'Inter_700Bold', fontSize: 13 },
  logoutButton: {
    width: 44, height: 44, borderRadius: 11, alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: C.navyBorder, backgroundColor: C.navyCard,
  },
  severityStrip: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 16, paddingVertical: 7, borderBottomWidth: 1,
  },
  severityStripText: { flex: 1, fontSize: 12, fontFamily: 'Inter_600SemiBold' },
  chatContent: { paddingTop: 16, paddingBottom: 16, flexGrow: 1 },
  emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 28, paddingHorizontal: 24 },
  emptyTitle: { fontSize: 24, lineHeight: 30, fontFamily: 'Inter_700Bold', color: C.ink, marginTop: 18, textAlign: 'center' },
  emptySub: { maxWidth: 360, fontSize: 14, color: C.gray, fontFamily: 'Inter_400Regular', textAlign: 'center', marginTop: 10, lineHeight: 21 },
  quickPrompts: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 8, marginTop: 18, maxWidth: 360 },
  quickPrompt: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    minHeight: 40, borderWidth: 1, borderColor: C.navyBorder, backgroundColor: C.navyCard,
    borderRadius: 10, paddingHorizontal: 11, paddingVertical: 8,
  },
  quickPromptText: { color: C.ink, fontFamily: 'Inter_500Medium', fontSize: 12 },
  safetyNote: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 16 },
  safetyNoteText: { color: C.gray, fontFamily: 'Inter_500Medium', fontSize: 11 },
  speechErrorBox: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 6,
    backgroundColor: C.redDim, borderRadius: 10, padding: 10,
    borderWidth: 1, borderColor: C.red + '30', marginTop: 12, maxWidth: 320,
  },
  speechErrorText: { flex: 1, color: C.red, fontFamily: 'Inter_400Regular', fontSize: 12, lineHeight: 17 },
  keyboardHintBox: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 8,
    backgroundColor: C.cyanDim, borderRadius: 12, padding: 12,
    borderWidth: 1, borderColor: C.cyan + '30', marginTop: 14, maxWidth: 320,
  },
  keyboardHintText: { flex: 1, color: C.ink, fontFamily: 'Inter_400Regular', fontSize: 13, lineHeight: 19 },
  speechErrorBanner: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: C.redDim, borderTopWidth: 1, borderTopColor: C.red + '30',
    paddingHorizontal: 14, paddingVertical: 8,
  },
  speechErrorBannerText: { flex: 1, color: C.red, fontFamily: 'Inter_400Regular', fontSize: 12 },
  inputBar: {
    flexDirection: 'row', alignItems: 'flex-end', gap: 8,
    paddingHorizontal: 12, paddingTop: 10,
    borderTopWidth: 1, borderTopColor: C.navyBorder,
    backgroundColor: C.navyCard,
  },
  micInline: {
    width: 44, height: 44, borderRadius: 11,
    backgroundColor: C.cyanDim, borderWidth: 1, borderColor: C.navyBorder,
    alignItems: 'center', justifyContent: 'center',
  },
  input: {
    flex: 1,
    backgroundColor: C.navyCard, borderWidth: 1, borderColor: C.navyBorder,
    borderRadius: 11, paddingHorizontal: 14, paddingVertical: 12,
    color: C.ink, fontFamily: 'Inter_400Regular', fontSize: 15,
    maxHeight: 100,
  },
  sendBtn: {
    width: 44, height: 44, borderRadius: 11,
    backgroundColor: C.cyan, alignItems: 'center', justifyContent: 'center',
  },
  resultPanel: { flex: 1, paddingHorizontal: 16, paddingTop: 16 },
});
