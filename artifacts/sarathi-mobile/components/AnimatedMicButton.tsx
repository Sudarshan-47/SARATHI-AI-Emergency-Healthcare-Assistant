import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import React, { useEffect } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  cancelAnimation,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import C from '@/constants/colors';

interface Props {
  isListening: boolean;
  onPress: () => void;
  disabled?: boolean;
}

export function AnimatedMicButton({ isListening, onPress, disabled }: Props) {
  const ring1 = useSharedValue(1);
  const ring2 = useSharedValue(1);
  const ring3 = useSharedValue(1);
  const btnScale = useSharedValue(1);

  useEffect(() => {
    if (isListening) {
      ring1.value = withRepeat(
        withSequence(withTiming(1.5, { duration: 800, easing: Easing.out(Easing.ease) }), withTiming(1, { duration: 0 })),
        -1
      );
      ring2.value = withRepeat(
        withSequence(withTiming(1.5, { duration: 1100, easing: Easing.out(Easing.ease) }), withTiming(1, { duration: 0 })),
        -1
      );
      ring3.value = withRepeat(
        withSequence(withTiming(1.5, { duration: 1400, easing: Easing.out(Easing.ease) }), withTiming(1, { duration: 0 })),
        -1
      );
      btnScale.value = withRepeat(
        withSequence(withTiming(0.96, { duration: 600 }), withTiming(1.0, { duration: 600 })),
        -1
      );
    } else {
      cancelAnimation(ring1);
      cancelAnimation(ring2);
      cancelAnimation(ring3);
      cancelAnimation(btnScale);
      ring1.value = withTiming(1);
      ring2.value = withTiming(1);
      ring3.value = withTiming(1);
      btnScale.value = withTiming(1);
    }
  }, [isListening]);

  const ring1Style = useAnimatedStyle(() => ({
    transform: [{ scale: ring1.value }],
    opacity: isListening ? 2 - ring1.value : 0,
  }));
  const ring2Style = useAnimatedStyle(() => ({
    transform: [{ scale: ring2.value }],
    opacity: isListening ? 2 - ring2.value : 0,
  }));
  const ring3Style = useAnimatedStyle(() => ({
    transform: [{ scale: ring3.value }],
    opacity: isListening ? 2 - ring3.value : 0,
  }));
  const btnStyle = useAnimatedStyle(() => ({
    transform: [{ scale: btnScale.value }],
  }));

  const handlePress = () => {
    if (disabled) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onPress();
  };

  return (
    <View style={styles.wrapper}>
      <Animated.View style={[styles.ring, styles.ring3, ring3Style, isListening && styles.ringActive]} />
      <Animated.View style={[styles.ring, styles.ring2, ring2Style, isListening && styles.ringActive]} />
      <Animated.View style={[styles.ring, styles.ring1, ring1Style, isListening && styles.ringActive]} />
      <Pressable onPress={handlePress} disabled={disabled}>
        <Animated.View style={[styles.button, isListening && styles.buttonActive, btnStyle]}>
          <Ionicons
            name={isListening ? 'mic' : 'mic-outline'}
            size={36}
            color={isListening ? C.white : C.cyan}
          />
        </Animated.View>
      </Pressable>
    </View>
  );
}

const BASE = 80;
const styles = StyleSheet.create({
  wrapper: {
    width: BASE + 60,
    height: BASE + 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  button: {
    width: BASE,
    height: BASE,
    borderRadius: BASE / 2,
    backgroundColor: C.navyCard,
    borderWidth: 2,
    borderColor: C.cyan,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: C.cyan,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
  },
  buttonActive: {
    backgroundColor: C.red,
    borderColor: C.red,
    shadowColor: C.red,
    shadowOpacity: 0.6,
  },
  ring: {
    position: 'absolute',
    width: BASE,
    height: BASE,
    borderRadius: BASE / 2,
    borderWidth: 1.5,
    borderColor: C.cyan,
    opacity: 0,
  },
  ringActive: {
    borderColor: C.red,
  },
  ring1: {},
  ring2: {},
  ring3: {},
});
