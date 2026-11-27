import { Pressable, StyleSheet } from 'react-native';
import { colors, touch } from '../constants/theme';
import { IconChevronRight } from './icons';

interface Props {
  onPress?: () => void;
  tone?: 'green' | 'red';
  /** Obrigatório: é o que o leitor de tela fala (ex.: "Abrir Clientes"). */
  label: string;
}

/** Botão ">" de 56 dp. Verde (action) por padrão; vermelho no módulo Saídas. */
export function ArrowButton({ onPress, tone = 'green', label }: Props) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      style={({ pressed }) => [
        styles.botao,
        { backgroundColor: tone === 'red' ? colors.red : colors.action },
        pressed && styles.pressionado,
      ]}
    >
      <IconChevronRight size={30} color="#FFFFFF" strokeWidth={3} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  botao: {
    width: touch,
    height: touch,
    borderRadius: touch / 2,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOpacity: 0.18,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
    elevation: 3,
  },
  pressionado: { opacity: 0.85, transform: [{ scale: 0.96 }] },
});
