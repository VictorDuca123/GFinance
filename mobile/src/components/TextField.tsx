import { StyleSheet, Text, TextInput, TextInputProps, View } from 'react-native';
import { colors, fontSize, layout, spacing } from '../constants/theme';

interface Props extends TextInputProps { label: string; error?: string | null }

export function TextField({ label, error, style, ...resto }: Props) {
  return (
    <View style={styles.wrapper}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        {...resto}
        accessibilityLabel={label}
        placeholderTextColor={colors.textMuted}
        style={[styles.input, !!error && styles.inputError, style]}
      />
      {!!error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { gap: spacing.xs },
  label: { fontSize: fontSize.small, fontWeight: '600', color: colors.text },
  input: {
    minHeight: layout.touchTarget,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: layout.radius,
    paddingHorizontal: spacing.md,
    fontSize: fontSize.body,
    color: colors.text,
    backgroundColor: colors.surface,
  },
  inputError: { borderColor: colors.danger },
  error: { fontSize: fontSize.small, color: colors.danger },
});