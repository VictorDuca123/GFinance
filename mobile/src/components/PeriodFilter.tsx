import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { spacing } from '../constants/theme';
import { Periodo } from '../types';
import { dateBRToISO, maskDate } from '../utils/format';
import { AppButton } from './AppButton';
import { ErrorBanner } from './ErrorBanner';
import { TextField } from './TextField';

interface Props {
  obrigatorio?: boolean;
  textoBotao?: string;
  onApply: (periodo: Periodo) => void;
}

export function PeriodFilter({ obrigatorio = false, textoBotao = 'Filtrar', onApply }: Props) {
  const [inicio, setInicio] = useState('');
  const [fim, setFim] = useState('');
  const [erro, setErro] = useState<string | null>(null);

  function aplicar() {
    const di = inicio ? dateBRToISO(inicio) : null;
    const df = fim ? dateBRToISO(fim) : null;
    if ((inicio && !di) || (fim && !df)) {
      setErro('Use datas válidas no formato dd/mm/aaaa.');
      return;
    }
    if (obrigatorio && (!di || !df)) {
      setErro('Informe a data inicial e a data final.');
      return;
    }
    if (di && df && df < di) {
      setErro('A data final não pode ser anterior à data inicial.');
      return;
    }
    setErro(null);
    onApply({ dataInicio: di, dataFim: df });
  }

  function limpar() {
    setInicio('');
    setFim('');
    setErro(null);
    onApply({ dataInicio: null, dataFim: null });
  }

  return (
    <View style={styles.box}>
      <View style={styles.linha}>
        <View style={styles.campo}>
          <TextField label="Data inicial" value={inicio} onChangeText={(t) => setInicio(maskDate(t))} placeholder="dd/mm/aaaa" keyboardType="numeric" maxLength={10} />
        </View>
        <View style={styles.campo}>
          <TextField label="Data final" value={fim} onChangeText={(t) => setFim(maskDate(t))} placeholder="dd/mm/aaaa" keyboardType="numeric" maxLength={10} />
        </View>
      </View>
      {!!erro && <ErrorBanner message={erro} />}
      <View style={styles.linha}>
        <View style={styles.campo}><AppButton label={textoBotao} onPress={aplicar} /></View>
        {!obrigatorio && <View style={styles.campo}><AppButton label="Limpar" variant="secondary" onPress={limpar} /></View>}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  box: { gap: spacing.md },
  linha: { flexDirection: 'row', gap: spacing.md },
  campo: { flex: 1 },
});