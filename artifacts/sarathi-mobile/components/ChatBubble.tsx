import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import C from '@/constants/colors';

interface Props {
  role: 'user' | 'assistant';
  content: string;
}

export function ChatBubble({ role, content }: Props) {
  const isAI = role === 'assistant';
  return (
    <View style={[styles.row, isAI ? styles.rowAI : styles.rowUser]}>
      {isAI && (
        <View style={styles.avatar}>
          <Ionicons name="pulse" size={16} color={C.cyan} />
        </View>
      )}
      <View style={[styles.bubble, isAI ? styles.bubbleAI : styles.bubbleUser]}>
        <Text style={[styles.text, isAI ? styles.textAI : styles.textUser]}>{content}</Text>
      </View>
    </View>
  );
}

export function TypingIndicator() {
  return (
    <View style={[styles.row, styles.rowAI]}>
      <View style={styles.avatar}>
        <Ionicons name="pulse" size={16} color={C.cyan} />
      </View>
      <View style={[styles.bubble, styles.bubbleAI, styles.typingBubble]}>
        <View style={styles.dotsRow}>
          <View style={[styles.dot, { opacity: 0.4 }]} />
          <View style={[styles.dot, { opacity: 0.7 }]} />
          <View style={styles.dot} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', marginVertical: 5, paddingHorizontal: 16, alignItems: 'flex-end' },
  rowAI: { justifyContent: 'flex-start' },
  rowUser: { justifyContent: 'flex-end' },
  avatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: C.cyanDim,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
    flexShrink: 0,
  },
  bubble: {
    maxWidth: '80%',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 18,
  },
  bubbleAI: {
    backgroundColor: C.navyCard,
    borderWidth: 1,
    borderColor: C.navyBorder,
    borderBottomLeftRadius: 4,
  },
  bubbleUser: {
    backgroundColor: C.red,
    borderBottomRightRadius: 4,
  },
  typingBubble: { paddingVertical: 14, paddingHorizontal: 18 },
  text: { fontSize: 15, lineHeight: 21 },
  textAI: { color: C.white, fontFamily: 'Inter_400Regular' },
  textUser: { color: C.white, fontFamily: 'Inter_500Medium' },
  dotsRow: { flexDirection: 'row', gap: 5 },
  dot: { width: 7, height: 7, borderRadius: 4, backgroundColor: C.cyan },
});
