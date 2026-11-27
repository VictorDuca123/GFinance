import { StyleSheet, Text, View } from 'react-native';
import { colors, fonts } from '../constants/theme';

/** Círculo verde (action) com o número do responsável em branco. 48 dp na identificação. */
export function NumberCircle({ numero, size = 48 }: { numero: number; size?: number }) {
  return (
    <View
      style={[styles.circulo, { width: size, height: size, borderRadius: size / 2 }]}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    >
      <Text style={[styles.numero, { fontSize: Math.round(size * 0.46) }]}>{numero}</Text>
    </View>
  );
}

/** Avatar de iniciais do cliente: círculo de 52 dp com a primeira letra do nome. */
export function Avatar({ nome, size = 52 }: { nome: string; size?: number }) {
  const inicial = nome.trim().charAt(0).toLocaleUpperCase('pt-BR') || '?';
  return (
    <View
      style={[styles.circulo, { width: size, height: size, borderRadius: size / 2 }]}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    >
      <Text style={[styles.numero, { fontSize: 22, fontFamily: fonts.bold }]}>{inicial}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  circulo: { backgroundColor: colors.action, alignItems: 'center', justifyContent: 'center' },
  numero: { fontFamily: fonts.heavy, color: '#FFFFFF' },
});
