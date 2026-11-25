import { useState } from 'react';
import { FlatList, Modal, Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, layout, spacing } from '../constants/theme';
import { useDebounce } from '../hooks/useDebounce';
import { useScreenData } from '../hooks/useScreenData';
import { clientesApi } from '../services/api';
import { Cliente } from '../types';
import { AppButton } from './AppButton';
import { Card } from './Card';
import { StateView } from './StateView';
import { TextField } from './TextField';
import { Body, Muted, Strong, Subtitle } from './Typography';

interface Props {
  selecionado: Cliente | null;
  onSelect: (cliente: Cliente) => void;
  erro?: string | null;
}

export function ClientePicker({ selecionado, onSelect, erro }: Props) {
  const [aberto, setAberto] = useState(false);
  const [busca, setBusca] = useState('');
  const termo = useDebounce(busca);
  const { data, loading, error, reload } = useScreenData(
    async () => (aberto ? await clientesApi.listar({ busca: termo }) : null),
    [aberto, termo],
  );

  function escolher(cliente: Cliente) {
    onSelect(cliente);
    setAberto(false);
    setBusca('');
  }

  return (
    <View style={styles.wrapper}>
      <Muted style={styles.label}>Cliente</Muted>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Selecionar cliente"
        onPress={() => setAberto(true)}
        style={[styles.campo, !!erro && styles.campoErro]}
      >
        <Body style={!selecionado && { color: colors.textMuted }}>
          {selecionado ? selecionado.nome : 'Toque para selecionar'}
        </Body>
      </Pressable>
      {!!erro && <Muted style={{ color: colors.danger }}>{erro}</Muted>}

      <Modal visible={aberto} animationType="slide" onRequestClose={() => setAberto(false)}>
        <SafeAreaView style={styles.modal}>
          <Subtitle>Selecionar cliente</Subtitle>
          <TextField label="Buscar por nome" value={busca} onChangeText={setBusca} />
          <View style={styles.lista}>
            <StateView
              loading={loading && !data}
              error={error}
              empty={!!data && data.itens.length === 0}
              emptyMessage="Nenhum cliente encontrado."
              onRetry={reload}
            >
              <FlatList
                data={data?.itens ?? []}
                keyExtractor={(c) => String(c.id)}
                contentContainerStyle={{ gap: spacing.sm }}
                renderItem={({ item }) => (
                  <Card onPress={() => escolher(item)}>
                    <Strong>{item.nome}</Strong>
                  </Card>
                )}
              />
            </StateView>
          </View>
          <AppButton label="Cancelar" variant="secondary" onPress={() => setAberto(false)} />
        </SafeAreaView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { gap: spacing.xs },
  label: { fontWeight: '600', color: colors.text },
  campo: {
    minHeight: layout.touchTarget,
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: layout.radius,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.surface,
  },
  campoErro: { borderColor: colors.danger },
  modal: { flex: 1, backgroundColor: colors.background, padding: spacing.md, gap: spacing.md },
  lista: { flex: 1 },
});