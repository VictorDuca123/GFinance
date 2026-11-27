import { useEffect, useState } from 'react';
import { AccessibilityInfo } from 'react-native';

/** true quando o Android está com "Remover animações" ligado: o app troca animação por mudança direta. */
export function useReduceMotion(): boolean {
  const [reduzir, setReduzir] = useState(false);
  useEffect(() => {
    let ativo = true;
    AccessibilityInfo.isReduceMotionEnabled().then((v) => ativo && setReduzir(v));
    const sub = AccessibilityInfo.addEventListener('reduceMotionChanged', setReduzir);
    return () => {
      ativo = false;
      sub.remove();
    };
  }, []);
  return reduzir;
}
