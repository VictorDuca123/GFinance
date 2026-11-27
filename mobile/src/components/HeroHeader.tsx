import { LinearGradient } from 'expo-linear-gradient';
import { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';
import { colors, heroGradient } from '../constants/theme';

interface Props {
  /** Altura da faixa com degradê (dp). */
  height: number;
  /** Onde começa a onda que recorta a base. Sem valor = faixa sem onda. */
  waveTop?: number;
  children?: ReactNode;
}

/**
 * Faixa do topo: degradê da marca, decoração suave e a onda na base, desenhada com a cor
 * do fundo da tela. Fica atrás do conteúdo (posição absoluta); a decoração é ignorada pelo leitor de tela.
 */
export function HeroHeader({ height, waveTop, children }: Props) {
  return (
    <View style={[styles.faixa, { height: height + 40 }]} pointerEvents="box-none">
      <LinearGradient {...heroGradient} style={{ height, overflow: 'hidden' }}>
        <Svg
          width="100%" height={height} viewBox={`0 0 1280 ${height}`} preserveAspectRatio="none"
          style={StyleSheet.absoluteFill} accessibilityElementsHidden importantForAccessibility="no-hide-descendants"
        >
          <Path
            d={`M-60 ${height - 30} C 160 ${height - 150}, 300 ${height - 40}, 520 ${height - 120} S 860 ${height - 20}, 1000 ${height - 80} L1000 ${height} L-60 ${height} Z`}
            fill="rgba(255,255,255,0.07)"
          />
          <Circle cx={1130} cy={60} r={170} fill="rgba(214,241,63,0.30)" />
          <Circle cx={80} cy={height - 40} r={90} fill="rgba(0,0,0,0.18)" />
        </Svg>
      </LinearGradient>
      {waveTop !== undefined && (
        <Svg
          width="100%" height={111} viewBox="0 0 1280 111" preserveAspectRatio="none"
          style={[styles.onda, { top: waveTop }]} accessibilityElementsHidden importantForAccessibility="no-hide-descendants"
        >
          <Path d="M0 90 C 200 22, 460 14, 680 56 S 1100 72, 1280 40 L1280 111 L0 111 Z" fill={colors.bg} />
        </Svg>
      )}
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  faixa: { position: 'absolute', top: 0, left: 0, right: 0 },
  onda: { position: 'absolute', left: 0, right: 0 },
});
