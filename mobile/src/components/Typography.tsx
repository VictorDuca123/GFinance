import { Text, TextProps, TextStyle } from 'react-native';
import { colors, fontSize } from '../constants/theme';

function criar(base: TextStyle) {
  return function Texto({ style, ...resto }: TextProps) {
    return <Text {...resto} style={[base, style]} />;
  };
}

export const Title = criar({ fontSize: fontSize.title, fontWeight: '700', color: colors.text });
export const Subtitle = criar({ fontSize: fontSize.subtitle, fontWeight: '600', color: colors.text });
export const Body = criar({ fontSize: fontSize.body, color: colors.text });
export const Strong = criar({ fontSize: fontSize.body, fontWeight: '700', color: colors.text });
export const Muted = criar({ fontSize: fontSize.small, color: colors.textMuted });