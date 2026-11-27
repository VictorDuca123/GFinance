import { Href, useRouter } from 'expo-router';
import { Pressable, StyleSheet } from 'react-native';
import { colors, touch } from '../constants/theme';
import { IconChevronLeft } from './icons';

/** Volta para a tela anterior; se não houver (tela aberta direto), vai para a Início. */
export function useVoltar() {
  const router = useRouter();
  return () => (router.canGoBack() ? router.back() : router.replace('/' as Href));
}

/** Botão voltar redondo de 56 dp para usar sobre a faixa em degradê. */
export function BackButton() {
  const voltar = useVoltar();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Voltar"
      onPress={voltar}
      style={({ pressed }) => [styles.botao, pressed && styles.pressionado]}
    >
      <IconChevronLeft size={28} color={colors.onDark} strokeWidth={2.8} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  botao: {
    width: touch,
    height: touch,
    borderRadius: touch / 2,
    backgroundColor: colors.glassButton,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressionado: { opacity: 0.85 },
});
