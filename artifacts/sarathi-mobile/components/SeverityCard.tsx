import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Linking, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import C, { SEVERITY_COLORS } from '@/constants/colors';

interface TriageResult {
  severity: string;
  severityScore: number;
  confidence: number;
  immediateAction: string;
  firstAid: string[];
  possibleConditions: string[];
  callEmergency: boolean;
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

interface Props {
  triage: TriageResult;
  hospitals: Hospital[];
  userName: string;
  symptoms: string;
  parentPhone: string;
}

const SEVERITY_ICONS: Record<string, any> = {
  LOW: 'checkmark-circle',
  MEDIUM: 'warning',
  HIGH: 'alert-circle',
  CRITICAL: 'nuclear',
};

export function SeverityCard({ triage, hospitals, userName, symptoms, parentPhone }: Props) {
  const color = SEVERITY_COLORS[triage.severity] || C.cyan;
  const icon = SEVERITY_ICONS[triage.severity] || 'pulse';

  const sendWhatsApp = () => {
    const msg = `🚨 EMERGENCY ALERT from SARATHI AI 🚨\n\nName: ${userName}\nSymptoms: ${symptoms}\nSeverity: ${triage.severity}\nScore: ${triage.severityScore}/100\n\nImmediate Action: ${triage.immediateAction}\n\nPlease check on them immediately! Call 108 if needed.`;
    Linking.openURL(`https://wa.me/91${parentPhone}?text=${encodeURIComponent(msg)}`);
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Severity Header */}
      <View style={[styles.severityHeader, { borderColor: color }]}>
        <View style={[styles.severityIconBox, { backgroundColor: color + '22' }]}>
          <Ionicons name={icon} size={32} color={color} />
        </View>
        <View style={styles.severityInfo}>
          <Text style={styles.severityLabel}>Severity Level</Text>
          <Text style={[styles.severityText, { color }]}>{triage.severity}</Text>
          <Text style={styles.confidenceText}>Confidence: {triage.confidence}%</Text>
        </View>
        <View style={styles.scoreBox}>
          <Text style={[styles.scoreNum, { color }]}>{triage.severityScore}</Text>
          <Text style={styles.scoreLabel}>/100</Text>
        </View>
      </View>

      {/* Emergency Call */}
      {triage.callEmergency && (
        <Pressable style={styles.emergencyBtn} onPress={() => Linking.openURL('tel:108')}>
          <Ionicons name="call" size={20} color={C.white} />
          <Text style={styles.emergencyBtnText}>CALL 108 NOW</Text>
        </Pressable>
      )}

      {/* Immediate Action */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Immediate Action</Text>
        <View style={[styles.actionBox, { borderLeftColor: color }]}>
          <Text style={styles.actionText}>{triage.immediateAction}</Text>
        </View>
      </View>

      {/* First Aid Steps */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>First Aid Steps</Text>
        {triage.firstAid.map((step, i) => (
          <View key={i} style={styles.stepRow}>
            <View style={[styles.stepNum, { backgroundColor: color + '33' }]}>
              <Text style={[styles.stepNumText, { color }]}>{i + 1}</Text>
            </View>
            <Text style={styles.stepText}>{step}</Text>
          </View>
        ))}
      </View>

      {/* WhatsApp Alert */}
      <Pressable style={styles.waBtn} onPress={sendWhatsApp}>
        <Ionicons name="logo-whatsapp" size={20} color={C.whatsapp} />
        <Text style={styles.waBtnText}>Alert Parents on WhatsApp</Text>
        <Ionicons name="chevron-forward" size={16} color={C.gray} />
      </Pressable>

      {/* Hospitals */}
      {hospitals.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Nearby Hospitals</Text>
          {hospitals.slice(0, 4).map(h => (
            <View key={h.id} style={styles.hospitalCard}>
              <View style={styles.hospitalHeader}>
                <Text style={styles.hospitalName} numberOfLines={1}>{h.name}</Text>
                <View style={[styles.distanceBadge]}>
                  <Text style={styles.distanceText}>{h.distance}</Text>
                </View>
              </View>
              <Text style={styles.hospitalSpec}>{h.speciality}</Text>
              <View style={styles.hospitalActions}>
                <Pressable style={styles.callBtn} onPress={() => Linking.openURL(`tel:${h.phone}`)}>
                  <Ionicons name="call" size={14} color={C.white} />
                  <Text style={styles.callBtnText}>Call</Text>
                </Pressable>
                <Pressable style={styles.dirBtn} onPress={() => Linking.openURL(h.mapsUrl)}>
                  <Ionicons name="navigate" size={14} color={C.cyan} />
                  <Text style={styles.dirBtnText}>Directions</Text>
                </Pressable>
              </View>
            </View>
          ))}
        </View>
      )}

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  severityHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.navyCard,
    borderRadius: 16,
    borderWidth: 1.5,
    padding: 16,
    marginBottom: 12,
    gap: 12,
  },
  severityIconBox: {
    width: 56,
    height: 56,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  severityInfo: { flex: 1 },
  severityLabel: { fontSize: 11, color: C.gray, fontFamily: 'Inter_500Medium', letterSpacing: 1.2, textTransform: 'uppercase' },
  severityText: { fontSize: 24, fontFamily: 'Inter_700Bold', marginTop: 2 },
  confidenceText: { fontSize: 12, color: C.gray, fontFamily: 'Inter_400Regular', marginTop: 2 },
  scoreBox: { alignItems: 'center' },
  scoreNum: { fontSize: 28, fontFamily: 'Inter_700Bold' },
  scoreLabel: { fontSize: 12, color: C.gray, fontFamily: 'Inter_400Regular' },
  emergencyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: C.red,
    borderRadius: 14,
    paddingVertical: 14,
    marginBottom: 12,
  },
  emergencyBtnText: { color: C.white, fontFamily: 'Inter_700Bold', fontSize: 16, letterSpacing: 1 },
  section: { marginBottom: 16 },
  sectionTitle: { fontSize: 11, color: C.gray, fontFamily: 'Inter_600SemiBold', letterSpacing: 1.2, textTransform: 'uppercase', marginBottom: 8 },
  actionBox: { backgroundColor: C.navyCard, borderRadius: 12, padding: 14, borderLeftWidth: 3 },
  actionText: { color: C.white, fontFamily: 'Inter_500Medium', fontSize: 14, lineHeight: 20 },
  stepRow: { flexDirection: 'row', gap: 10, marginBottom: 8, alignItems: 'flex-start' },
  stepNum: { width: 24, height: 24, borderRadius: 12, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  stepNumText: { fontSize: 12, fontFamily: 'Inter_700Bold' },
  stepText: { flex: 1, color: C.white, fontFamily: 'Inter_400Regular', fontSize: 13, lineHeight: 19 },
  waBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: C.navyCard,
    borderRadius: 14,
    padding: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: C.whatsapp + '40',
  },
  waBtnText: { flex: 1, color: C.white, fontFamily: 'Inter_600SemiBold', fontSize: 14 },
  hospitalCard: {
    backgroundColor: C.navyCard,
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: C.navyBorder,
  },
  hospitalHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
  hospitalName: { flex: 1, color: C.white, fontFamily: 'Inter_600SemiBold', fontSize: 14 },
  distanceBadge: { backgroundColor: C.cyanDim, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3 },
  distanceText: { color: C.cyan, fontFamily: 'Inter_600SemiBold', fontSize: 11 },
  hospitalSpec: { color: C.gray, fontFamily: 'Inter_400Regular', fontSize: 12, marginBottom: 10 },
  hospitalActions: { flexDirection: 'row', gap: 8 },
  callBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5, backgroundColor: C.red, borderRadius: 10, paddingVertical: 8 },
  callBtnText: { color: C.white, fontFamily: 'Inter_600SemiBold', fontSize: 12 },
  dirBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5, backgroundColor: C.cyanDim, borderRadius: 10, paddingVertical: 8 },
  dirBtnText: { color: C.cyan, fontFamily: 'Inter_600SemiBold', fontSize: 12 },
});
