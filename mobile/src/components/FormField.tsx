import { ReactNode, useState } from 'react';
import { StyleSheet, Text, TextInput, TextInputProps, View } from 'react-native';
import { colors, fonts, radius, touch } from '../constants/theme';
import { IconAlert } from './icons';

interface Props extends Omit<TextInputProps, 'style'> {
  label: string;
  error?: string | null;
  /** Texto fixo antes do valor, ex.: "R$". */
  prefix?: string;
  /** Altura mínima do campo (padrão 56 dp). */
  minHeight?: number;
  /** Conteúdo extra abaixo do campo (ex.: botão "Valor total", atalhos de data). */
  children?: ReactNode;
}

/**
 * Campo do novo visual: rótulo visível acima, borda verde de 3 dp em foco,
 * borda vermelha com ícone e mensagem quando há erro (nunca só a cor).
 */
export function FormField({ label, error, prefix, minHeight = touch, children, onFocus, onBlur, multiline, ...input }: Props) {
  const [foco, setFoco] = useState(false);
  return (
    <View style={styles.bloco}>
      <Text style={styles.rotulo}>{label}</Text>
      <View
        style={[
          styles.campo,
          { minHeight, borderRadius: multiline ? 24 : radius.field },
          foco && styles.campoFoco,
          !!error && styles.campoErro,
        ]}
      >
        {!!prefix && <Text style={styles.prefixo} accessibilityElementsHidden importantForAccessibility="no">{prefix}</Text>}
        <TextInput
          {...input}
          multiline={multiline}
          accessibilityLabel={label}
          accessibilityHint={error ?? undefined}
          placeholderTextColor={colors.placeholder}
          onFocus={(e) => { setFoco(true); onFocus?.(e); }}
          onBlur={(e) => { setFoco(false); onBlur?.(e); }}
          style={[styles.entrada, multiline && styles.entradaMultilinha, { minHeight: minHeight - 6 }]}
        />
      </View>
      {!!error && (
        <View style={styles.erro} accessibilityRole="alert" accessibilityLiveRegion="polite">
          <IconAlert size={20} color={colors.error} strokeWidth={2.4} />
          <Text style={styles.textoErro}>{error}</Text>
        </View>
      )}
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  bloco: { gap: 8 },
  rotulo: { fontFamily: fonts.bold, fontSize: 16, color: colors.muted },
  campo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 22,
    borderWidth: 2,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  // Borda de 3 dp sem "pular" o texto: o recuo diminui 1 dp para compensar.
  campoFoco: { borderWidth: 3, borderColor: colors.action, paddingHorizontal: 21 },
  campoErro: { borderWidth: 3, borderColor: colors.error, paddingHorizontal: 21 },
  prefixo: { fontFamily: fonts.semibold, fontSize: 20, color: colors.muted },
  entrada: { flex: 1, fontFamily: fonts.semibold, fontSize: 20, color: colors.ink, paddingVertical: 0 },
  entradaMultilinha: { paddingVertical: 12, textAlignVertical: 'top' },
  erro: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  textoErro: { flex: 1, fontFamily: fonts.bold, fontSize: 16, color: colors.error },
});
