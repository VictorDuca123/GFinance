import { Stack, useRouter } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { Card } from '../src/components/Card';
import { Screen } from '../src/components/Screen';
import { Muted, Subtitle, Title } from '../src/components/Typography';
import { APP_NAME } from '../src/constants/config';
import { spacing } from '../src/constants/theme';

const MODULOS = [
  { titulo: 'Clientes', descricao: 'Cadastro e valores pendentes', icone: '👥', rota: '/clientes' },
  { titulo: 'Fornecedores', descricao: 'Cadastro e consulta', icone: '🏭', rota: '/fornecedores' },
  { titulo: 'Recebimentos', descricao: 'Valores recebidos dos clientes', icone: '💰', rota: '/recebimentos' },
  { titulo: 'Saídas', descricao: 'Despesas efetuadas', icone: '🧾', rota: '/saidas' },
  { titulo: 'Relatórios', descricao: 'Totais e resultado por período', icone: '📊', rota: '/relatorios' },
  { titulo: 'Histórico', descricao: 'Quem alterou o quê e quando', icone: '🕘', rota: '/historico' },
] as const;

export default function HomeScreen() {
  const router = useRouter();
  return (
    <Screen>
      <Stack.Screen options={{ title: APP_NAME }} />
      <Title>O que você quer fazer?</Title>
      <Muted>Escolha um módulo para começar.</Muted>
      <View style={styles.grade}>
        {MODULOS.map((m) => (
          <View key={m.rota} style={styles.celula}>
            <Card onPress={() => router.push(m.rota)}>
              <Text style={styles.icone}>{m.icone}</Text>
              <Subtitle>{m.titulo}</Subtitle>
              <Muted>{m.descricao}</Muted>
            </Card>
          </View>
        ))}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  grade: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md },
  celula: { flexBasis: '47%', flexGrow: 1, minWidth: 260 },
  icone: { fontSize: 36 },
});