import { useState } from 'react';
import { PessoaDados } from '../types';
import { AppButton } from './AppButton';
import { ErrorBanner } from './ErrorBanner';
import { TextField } from './TextField';

interface Props {
  rotuloNome: string;
  inicial?: PessoaDados;
  textoBotao: string;
  onSubmit: (dados: PessoaDados) => Promise<void>;
}

export function PessoaForm({ rotuloNome, inicial, textoBotao, onSubmit }: Props) {
  const [nome, setNome] = useState(inicial?.nome ?? '');
  const [info, setInfo] = useState(inicial?.outrasInformacoes ?? '');
  const [erroNome, setErroNome] = useState<string | null>(null);
  const [erroEnvio, setErroEnvio] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  async function salvar() {
    const nomeLimpo = nome.trim();
    if (!nomeLimpo) {
      setErroNome('Informe o nome.'); // RF01: nome obrigatório, sem aceitar só espaços
      return;
    }
    setErroNome(null);
    setErroEnvio(null);
    setEnviando(true);
    try {
      await onSubmit({ nome: nomeLimpo, outrasInformacoes: info.trim() });
    } catch (e) {
      setErroEnvio(e instanceof Error ? e.message : 'Não foi possível salvar. Tente novamente.');
    } finally {
      setEnviando(false);
    }
  }

  return (
    <>
      <TextField label={rotuloNome} value={nome} onChangeText={setNome} error={erroNome} maxLength={150} autoCapitalize="words" />
      <TextField
        label="Outras informações (opcional)"
        value={info}
        onChangeText={setInfo}
        maxLength={255}
        multiline
        style={{ minHeight: 96, textAlignVertical: 'top', paddingTop: 12 }}
      />
      {!!erroEnvio && <ErrorBanner message={erroEnvio} />}
      <AppButton label={textoBotao} onPress={salvar} loading={enviando} />
    </>
  );
}