import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import C from '@/constants/colors';
import { Language, UserProfile, useUser } from '@/context/UserContext';

const LANGUAGES: { id: Language; native: string; sub: string }[] = [
  { id: 'english', native: 'English', sub: 'English' },
  { id: 'hindi', native: 'हिंदी', sub: 'Hindi' },
  { id: 'telugu', native: 'తెలుగు', sub: 'Telugu' },
];

export default function LoginScreen() {
  const insets = useSafeAreaInsets();
  const { saveUser, user, isLoading } = useUser();
  const [step, setStep] = useState<1 | 2>(1);
  const [language, setLanguage] = useState<Language>('english');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [parent1Name, setParent1Name] = useState('');
  const [parent1Phone, setParent1Phone] = useState('');
  const [parent2Name, setParent2Name] = useState('');
  const [parent2Phone, setParent2Phone] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isLoading && user) {
      router.replace('/dashboard');
    }
  }, [user, isLoading]);

  if (isLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: C.navy, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator color={C.cyan} size="large" />
      </View>
    );
  }

  const selectLanguage = (lang: Language) => {
    Haptics.selectionAsync();
    setLanguage(lang);
    setStep(2);
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!name.trim() || name.trim().length < 2) e.name = 'Enter your full name';
    if (!phone.trim() || phone.trim().length < 10) e.phone = 'Enter a valid 10-digit number';
    if (!parent1Name.trim() || parent1Name.trim().length < 2) e.parent1Name = 'Enter guardian name';
    if (!parent1Phone.trim() || parent1Phone.trim().length < 10) e.parent1Phone = 'Enter valid guardian number';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setSaving(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    const profile: UserProfile = {
      name: name.trim(),
      phone: phone.trim(),
      parent1Name: parent1Name.trim(),
      parent1Phone: parent1Phone.trim(),
      parent2Name: parent2Name.trim() || undefined,
      parent2Phone: parent2Phone.trim() || undefined,
      language,
    };
    await saveUser(profile);
    setSaving(false);
    router.replace('/dashboard');
  };

  const webTop = Platform.OS === 'web' ? 67 : 0;

  return (
    <View style={[styles.root, { paddingTop: insets.top + webTop }]}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Logo */}
          <View style={styles.logoRow}>
            <View style={styles.logoBox}>
              <Ionicons name="pulse" size={28} color={C.red} />
            </View>
            <View>
              <Text style={styles.logoText}>
                SARATHI <Text style={{ color: C.red }}>AI</Text>
              </Text>
              <Text style={styles.logoSub}>Emergency Healthcare Assistant</Text>
            </View>
          </View>

          {step === 1 ? (
            <View>
              <Text style={styles.stepTitle}>Select Language</Text>
              <Text style={styles.stepSub}>Choose the language you're most comfortable with</Text>
              {LANGUAGES.map(lang => (
                <Pressable
                  key={lang.id}
                  style={({ pressed }) => [styles.langCard, pressed && { opacity: 0.75 }]}
                  onPress={() => selectLanguage(lang.id)}
                >
                  <Text style={styles.langNative}>{lang.native}</Text>
                  <View style={styles.langRight}>
                    <Text style={styles.langSub}>{lang.sub}</Text>
                    <Ionicons name="chevron-forward" size={20} color={C.gray} />
                  </View>
                </Pressable>
              ))}
            </View>
          ) : (
            <View>
              <Pressable style={styles.backBtn} onPress={() => setStep(1)}>
                <Ionicons name="arrow-back" size={18} color={C.gray} />
                <Text style={styles.backText}>Back to Language</Text>
              </Pressable>

              <Text style={styles.stepTitle}>Emergency Profile</Text>
              <Text style={styles.stepSub}>Your details help SARATHI alert your family if needed</Text>

              <Text style={styles.fieldGroup}>YOUR DETAILS</Text>
              <Field label="Full Name" value={name} onChangeText={setName} placeholder="Your full name" error={errors.name} />
              <Field label="Phone Number" value={phone} onChangeText={setPhone} placeholder="10-digit mobile number" keyboardType="phone-pad" error={errors.phone} />

              <Text style={styles.fieldGroup}>EMERGENCY CONTACTS</Text>
              <Field label="Guardian 1 Name" value={parent1Name} onChangeText={setParent1Name} placeholder="Parent / Guardian name" error={errors.parent1Name} />
              <Field label="Guardian 1 Phone" value={parent1Phone} onChangeText={setParent1Phone} placeholder="10-digit mobile number" keyboardType="phone-pad" error={errors.parent1Phone} />
              <Field label="Guardian 2 Name (Optional)" value={parent2Name} onChangeText={setParent2Name} placeholder="Second guardian name" />
              <Field label="Guardian 2 Phone (Optional)" value={parent2Phone} onChangeText={setParent2Phone} placeholder="10-digit mobile number" keyboardType="phone-pad" />

              <Pressable
                style={({ pressed }) => [styles.submitBtn, pressed && { opacity: 0.85 }, saving && { opacity: 0.6 }]}
                onPress={handleSubmit}
                disabled={saving}
              >
                {saving ? (
                  <ActivityIndicator color={C.white} />
                ) : (
                  <>
                    <Text style={styles.submitText}>Enter SARATHI AI</Text>
                    <Ionicons name="arrow-forward" size={20} color={C.white} />
                  </>
                )}
              </Pressable>
            </View>
          )}

          <View style={{ height: insets.bottom + 34 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

function Field({
  label, value, onChangeText, placeholder, keyboardType, error
}: {
  label: string; value: string; onChangeText: (t: string) => void;
  placeholder?: string; keyboardType?: any; error?: string;
}) {
  return (
    <View style={{ marginBottom: 12 }}>
      <Text style={field.label}>{label}</Text>
      <TextInput
        style={[field.input, !!error && field.inputError]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={C.grayDark}
        keyboardType={keyboardType || 'default'}
        autoCapitalize={keyboardType === 'phone-pad' ? 'none' : 'words'}
      />
      {!!error && <Text style={field.error}>{error}</Text>}
    </View>
  );
}

const field = StyleSheet.create({
  label: { color: C.gray, fontFamily: 'Inter_500Medium', fontSize: 12, letterSpacing: 0.5, marginBottom: 5 },
  input: {
    backgroundColor: C.navyCard,
    borderWidth: 1,
    borderColor: C.navyBorder,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 13,
    color: C.white,
    fontFamily: 'Inter_400Regular',
    fontSize: 15,
  },
  inputError: { borderColor: C.red },
  error: { color: C.red, fontFamily: 'Inter_400Regular', fontSize: 12, marginTop: 4 },
});

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.navy },
  scroll: { paddingHorizontal: 24, paddingBottom: 20 },
  logoRow: { flexDirection: 'row', alignItems: 'center', gap: 14, marginTop: 20, marginBottom: 36 },
  logoBox: {
    width: 52, height: 52, borderRadius: 14,
    backgroundColor: C.navyCard, borderWidth: 1.5, borderColor: C.red + '60',
    alignItems: 'center', justifyContent: 'center',
    shadowColor: C.red, shadowOpacity: 0.4, shadowRadius: 10, shadowOffset: { width: 0, height: 0 },
  },
  logoText: { fontSize: 22, fontFamily: 'Inter_700Bold', color: C.white, letterSpacing: 1 },
  logoSub: { fontSize: 12, color: C.gray, fontFamily: 'Inter_400Regular', marginTop: 2 },
  stepTitle: { fontSize: 22, fontFamily: 'Inter_700Bold', color: C.white, marginBottom: 6 },
  stepSub: { fontSize: 14, color: C.gray, fontFamily: 'Inter_400Regular', marginBottom: 24 },
  langCard: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: C.navyCard, borderRadius: 16, padding: 20, marginBottom: 12,
    borderWidth: 1, borderColor: C.navyBorder,
  },
  langNative: { fontSize: 22, fontFamily: 'Inter_700Bold', color: C.white },
  langRight: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  langSub: { fontSize: 13, color: C.gray, fontFamily: 'Inter_400Regular' },
  backBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 20 },
  backText: { color: C.gray, fontFamily: 'Inter_400Regular', fontSize: 14 },
  fieldGroup: { fontSize: 11, color: C.gray, fontFamily: 'Inter_600SemiBold', letterSpacing: 1.4, marginBottom: 10, marginTop: 4 },
  submitBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: C.red, borderRadius: 14, paddingVertical: 16, marginTop: 24,
    shadowColor: C.red, shadowOpacity: 0.3, shadowRadius: 12, shadowOffset: { width: 0, height: 4 },
  },
  submitText: { color: C.white, fontFamily: 'Inter_700Bold', fontSize: 16 },
});
