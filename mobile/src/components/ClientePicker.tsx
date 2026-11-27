import { useState } from 'react';
import { FlatList, Modal, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, fonts, radius, shadow, touch } from '../constants/theme';
import { useDebounce } from '../hooks/useDebounce';
import { useScreenData } from '../hooks/useScreenData';
import { clientesApi } from '../services/api';
import { Cliente } from '../types';
import { Badge } from './Badge';
import { Button } from './Button';
import { IconAlert, IconChevronRight, IconSearch } from './icons';
import { Avatar } from './NumberCircle';
import { StateView } from './StateView';

interface Props {
  selecionado: Cliente | null;
  onSelect: (cliente: Cliente) => void;
  erro?: string | null;
}

/** Campo "Cliente": abre uma lista com busca para escolher o cliente do lançamento. */
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
    <View style={styles.bloco}>
      <Text style={styles.rotulo}>Cliente</Text>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={selecionado ? `Cliente: ${selecionado.nome}. Toque para trocar` : 'Selecionar cliente'}
        accessibilityHint={erro ?? undefined}
        onPress={() => setAberto(true)}
        style={({ pressed }) => [styles.campo, !!erro && styles.campoErro, pressed && styles.campoPressionado]}
      >
        {selecionado && <Avatar nome={selecionado.nome} size={36} />}
        <Text style={[styles.valor, !selecionado && styles.valorVazio]} numberOfLines={1}>
          {selecionado ? selecionado.nome : 'Toque para escolher o cliente'}
        </Text>
        <IconChevronRight size={24} color={colors.action} strokeWidth={2.6} />
      </Pressable>
      {!!erro && (
        <View style={styles.erro} accessibilityRole="alert">
          <IconAlert size={20} color={colors.error} strokeWidth={2.4} />
          <Text style={styles.textoErro}>{erro}</Text>
        </View>
      )}

      <Modal visible={aberto} animationType="slide" onRequestClose={() => setAberto(false)}>
        <SafeAreaView style={styles.modal}>
          <View style={styles.conteudoModal}>
            <Text style={styles.tituloModal} accessibilityRole="header">Escolher cliente</Text>
            <View style={styles.busca}>
              <IconSearch size={24} color={colors.muted} />
              <TextInput
                value={busca}
                onChangeText={setBusca}
                placeholder="Buscar cliente pelo nome"
                placeholderTextColor={colors.muted}
                accessibilityLabel="Buscar cliente pelo nome"
                autoCorrect={false}
                style={styles.campoBusca}
              />
            </View>
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
                  contentContainerStyle={styles.itens}
                  keyboardShouldPersistTaps="handled"
                  renderItem={({ item }) => (
                    <Pressable
                      accessibilityRole="button"
                      accessibilityLabel={`${item.nome}. ${item.valorPendente > 0 ? 'Com valor pendente' : 'Em dia'}`}
                      onPress={() => escolher(item)}
                      style={({ pressed }) => [styles.linha, pressed && styles.linhaPressionada]}
                    >
                      <Avatar nome={item.nome} />
                      <Text style={styles.nome} numberOfLines={2}>{item.nome}</Text>
                      {item.valorPendente > 0 ? <Badge tipo="pending" valor={item.valorPendente} /> : <Badge tipo="ok" />}
                    </Pressable>
                  )}
                />
              </StateView>
            </View>
            <Button label="Cancelar" variant="ghost" onPress={() => setAberto(false)} />
          </View>
        </SafeAreaView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  bloco: { gap: 8 },
  rotulo: { fontFamily: fonts.bold, fontSize: 16, color: colors.muted },
  campo: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    minHeight: touch, paddingLeft: 12, paddingRight: 18,
    borderRadius: radius.field, borderWidth: 2, borderColor: colors.border, backgroundColor: colors.surface,
  },
  campoPressionado: { borderColor: colors.action },
  campoErro: { borderWidth: 3, borderColor: colors.error },
  valor: { flex: 1, fontFamily: fonts.semibold, fontSize: 20, color: colors.ink, paddingLeft: 8 },
  valorVazio: { color: colors.muted },
  erro: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  textoErro: { flex: 1, fontFamily: fonts.bold, fontSize: 16, color: colors.error },

  modal: { flex: 1, backgroundColor: colors.bg },
  conteudoModal: { flex: 1, width: '100%', maxWidth: 760, alignSelf: 'center', padding: 24, gap: 16 },
  tituloModal: { fontFamily: fonts.heavy, fontSize: 28, color: colors.ink },
  busca: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    minHeight: touch, borderRadius: radius.field, paddingHorizontal: 20,
    backgroundColor: colors.surface, ...shadow.card,
  },
  campoBusca: { flex: 1, minHeight: touch, fontFamily: fonts.semibold, fontSize: 18, color: colors.ink },
  lista: { flex: 1 },
  itens: { gap: 12, paddingVertical: 4 },
  linha: {
    flexDirection: 'row', alignItems: 'center', gap: 16,
    minHeight: 76, borderRadius: radius.field, paddingHorizontal: 16, paddingVertical: 12,
    backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.borderSoft,
  },
  linhaPressionada: { borderColor: colors.action, backgroundColor: colors.tint },
  nome: { flex: 1, fontFamily: fonts.bold, fontSize: 19, color: colors.ink },
});
