import {
  OpenSans_400Regular, OpenSans_600SemiBold, OpenSans_700Bold, OpenSans_800ExtraBold,
} from '@expo-google-fonts/open-sans';
import { Philosopher_700Bold } from '@expo-google-fonts/philosopher';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { IdentificacaoProvider } from '../src/components/IdentificacaoProvider';
import { colors } from '../src/constants/theme';

// Segura a tela de abertura até as fontes carregarem, para o texto não "pular" de fonte.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [carregadas, erro] = useFonts({
    OpenSans_400Regular, OpenSans_600SemiBold, OpenSans_700Bold, OpenSans_800ExtraBold, Philosopher_700Bold,
  });
  // Se a fonte falhar, o app abre mesmo assim com a fonte do sistema (melhor que travar na abertura).
  const pronto = carregadas || !!erro;

  useEffect(() => {
    if (pronto) SplashScreen.hideAsync();
  }, [pronto]);

  if (!pronto) return null;

  return (
    <IdentificacaoProvider>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: colors.primary },
          headerTintColor: colors.text,
          headerTitleStyle: { fontSize: 22, fontWeight: '700' },
          headerBackTitle: 'Voltar',
          contentStyle: { backgroundColor: colors.background },
        }}
      />
    </IdentificacaoProvider>
  );
}
