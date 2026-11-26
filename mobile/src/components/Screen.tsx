import { ReactNode } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, layout, spacing } from '../constants/theme';

interface Props { children: ReactNode; scroll?: boolean }

export function Screen({ children, scroll = true }: Props) {
  return (
    <SafeAreaView style={styles.safe} edges={['bottom', 'left', 'right']}>
      {scroll ? (
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          <View style={styles.content}>{children}</View>
        </ScrollView>
      ) : (
        <View style={styles.fixed}>
          <View style={[styles.content, styles.fill]}>{children}</View>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  scrollContent: { flexGrow: 1, alignItems: 'center', padding: spacing.md },
  fixed: { flex: 1, alignItems: 'center', padding: spacing.md },
  content: { width: '100%', maxWidth: layout.maxContentWidth, gap: spacing.md },
  fill: { flex: 1 },
});