import { ReactNode } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, fonts, shadow } from '../constants/theme';

export type ButtonVariant = 'primary' | 'outline' | 'ghost';

interface Props {
  label: string;
  onPress: () => void;
  variant?: ButtonVariant;
  disabled?: boolean;
  loading?: boolean;
  /** Ícone à esquerda do texto (decorativo; o texto já descreve a ação). */
  icon?: (cor: string) => ReactNode;
  /** Sombra verde do botão principal de um formulário (ex.: "Salvar entrada"). */
  elevated?: boolean;
  /** Pílula menor (44 dp de altura visual), para atalhos como "Hoje" e "Ontem". */
  compact?: boolean;
  /** Para filtros e atalhos que ficam marcados. */
  selected?: boolean;
  /** Dica falada pelo leitor de tela (ex.: por que o botão está desabilitado). */
  hint?: string;
}

const TEXTO: Record<ButtonVariant, string> = {
  primary: '#FFFFFF',
  outline: colors.action,
  ghost: colors.muted,
};

/** Botão do novo visual: primary (verde sólido), outline (borda verde) e ghost (borda cinza). */
export function Button({
  label, onPress, variant = 'primary', disabled = false, loading = false, icon, elevated, compact, selected, hint,
}: Props) {
  const inativo = disabled || loading;
  const corTexto = inativo && variant === 'primary' ? colors.disabledText : TEXTO[variant];

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityHint={hint}
      accessibilityState={{ disabled: inativo, busy: loading, ...(selected !== undefined && { selected }) }}
      onPress={onPress}
      disabled={inativo}
      // Pílula compacta: visual de 44 dp, mas a área de toque continua com 56 dp.
      hitSlop={compact ? 6 : undefined}
      style={({ pressed }) => [
        styles.base,
        compact ? styles.compacto : styles.normal,
        styles[variant],
        elevated && !inativo && shadow.button,
        inativo && variant === 'primary' && styles.desabilitado,
        inativo && variant !== 'primary' && styles.desabilitadoContorno,
        pressed && styles.pressionado,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'primary' ? '#FFFFFF' : colors.action} />
      ) : (
        <View style={styles.conteudo}>
          {icon?.(corTexto)}
          <Text style={[styles.texto, compact && styles.textoCompacto, { color: corTexto }]} numberOfLines={1}>
            {label}
          </Text>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: { alignItems: 'center', justifyContent: 'center', paddingHorizontal: 28 },
  normal: { minHeight: 60, borderRadius: 30 },
  compacto: { minHeight: 44, borderRadius: 22, paddingHorizontal: 20 },
  primary: { backgroundColor: colors.action },
  outline: { backgroundColor: colors.surface, borderWidth: 2, borderColor: colors.action },
  ghost: { backgroundColor: colors.surface, borderWidth: 2, borderColor: colors.border },
  desabilitado: { backgroundColor: colors.disabledBg },
  desabilitadoContorno: { opacity: 0.5 },
  pressionado: { opacity: 0.88, transform: [{ scale: 0.98 }] },
  conteudo: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  texto: { fontFamily: fonts.bold, fontSize: 20 },
  textoCompacto: { fontSize: 17 },
});
