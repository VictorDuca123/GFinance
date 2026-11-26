import { StyleSheet, Text, View } from 'react-native';
import { colors, fontSize, layout, spacing } from '../constants/theme';

export function ErrorBanner({ message }: { message: string }) {
  return (
    <View accessibilityRole="alert" style={styles.box}>
      <Text style={styles.text}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    backgroundColor: '#FDECEA',
    borderColor: colors.danger,
    borderWidth: 1,
    borderRadius: layout.radius,
    padding: spacing.md,
  },
  text: { color: colors.danger, fontSize: fontSize.body },
});