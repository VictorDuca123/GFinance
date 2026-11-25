import { ReactNode } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { colors, layout, spacing } from '../constants/theme';

interface Props { children: ReactNode; onPress?: () => void }

export function Card({ children, onPress }: Props) {
  if (!onPress) return <View style={styles.card}>{children}</View>;
  return (
    <Pressable accessibilityRole="button" onPress={onPress} style={({ pressed }) => [styles.card, pressed && styles.pressed]}>
      {children}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: layout.radius,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    gap: spacing.xs,
  },
  pressed: { opacity: 0.85 },
});