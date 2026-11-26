import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { IdentificacaoProvider } from '../src/components/IdentificacaoProvider';
import { colors } from '../src/constants/theme';

export default function RootLayout() {
  return (
    <IdentificacaoProvider>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: colors.primary },
          headerTintColor: colors.onPrimary,
          headerTitleStyle: { fontSize: 22, fontWeight: '700' },
          headerBackTitle: 'Voltar',
          contentStyle: { backgroundColor: colors.background },
        }}
      />
    </IdentificacaoProvider>
  );
}