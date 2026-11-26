import { ReactNode } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { colors, spacing } from '../constants/theme';
import { AppButton } from './AppButton';
import { Body, Subtitle } from './Typography';

interface Props {
  loading?: boolean;
  error?: string | null;
  empty?: boolean;
  emptyMessage?: string;
  onRetry?: () => void;
  children: ReactNode;
}

export function StateView({ loading, error, empty, emptyMessage = 'Nenhum registro encontrado.', onRetry, children }: Props) {
  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Body>Carregando...</Body>
      </View>
    );
  }
  if (error) {
    return (
      <View style={styles.center}>
        <Subtitle>Não foi possível carregar</Subtitle>
        <Body>{error}</Body>
        {onRetry && <AppButton label="Tentar novamente" onPress={onRetry} />}
      </View>
    );
  }
  if (empty) {
    return (
      <View style={styles.center}>
        <Body>{emptyMessage}</Body>
      </View>
    );
  }
  return <>{children}</>;
}

const styles = StyleSheet.create({
  center: { alignItems: 'center', justifyContent: 'center', gap: spacing.md, padding: spacing.xl },
});