import Svg, { Circle, Path, Rect } from 'react-native-svg';

/*
 * Ícones do app, desenhados em SVG com traço arredondado (mesmo estilo em todos).
 * São decorativos por padrão: quem usa o ícone coloca o texto ou o accessibilityLabel ao lado.
 */

export interface IconProps { size?: number; color: string; strokeWidth?: number }

function Base({ size = 24, color, strokeWidth = 2.1, children }: IconProps & { children: React.ReactNode }) {
  return (
    <Svg
      width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color}
      strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round"
      accessibilityElementsHidden importantForAccessibility="no-hide-descendants"
    >
      {children}
    </Svg>
  );
}

export const IconChevronRight = (p: IconProps) => <Base {...p}><Path d="M9 5l7 7-7 7" /></Base>;
export const IconChevronLeft = (p: IconProps) => <Base {...p}><Path d="M15 5l-7 7 7 7" /></Base>;
export const IconPlus = (p: IconProps) => <Base {...p}><Path d="M12 5v14M5 12h14" /></Base>;
export const IconCheck = (p: IconProps) => <Base {...p}><Path d="M5 12.5l4.5 4.5L19 7.5" /></Base>;
export const IconSearch = (p: IconProps) => (
  <Base {...p}><Circle cx={11} cy={11} r={6.5} /><Path d="M16 16l4 4" /></Base>
);
export const IconClock = (p: IconProps) => (
  <Base {...p}><Circle cx={12} cy={12} r={8.5} /><Path d="M12 7.5V12l3 2" /></Base>
);
export const IconAlert = (p: IconProps) => (
  <Base {...p}><Circle cx={12} cy={12} r={8.5} /><Path d="M12 7.5v5.5M12 16.4v.1" /></Base>
);
export const IconUsers = (p: IconProps) => (
  <Base {...p}>
    <Circle cx={9} cy={8.5} r={3.5} />
    <Path d="M2.5 19.5c.7-3.2 3.3-5 6.5-5s5.8 1.8 6.5 5" />
    <Path d="M15.5 5.3a3.4 3.4 0 010 6.4M17.5 14.8c2 .7 3.4 2.3 4 4.7" />
  </Base>
);
/** Entrada: seta para dentro de uma bandeja. */
export const IconArrowIn = (p: IconProps) => (
  <Base {...p}><Path d="M12 3.5v11M7.5 10l4.5 4.5 4.5-4.5" /><Path d="M4 15.5v3a2 2 0 002 2h12a2 2 0 002-2v-3" /></Base>
);
/** Saída: seta para fora de uma bandeja. */
export const IconArrowOut = (p: IconProps) => (
  <Base {...p}><Path d="M12 14.5v-11M7.5 8L12 3.5 16.5 8" /><Path d="M4 15.5v3a2 2 0 002 2h12a2 2 0 002-2v-3" /></Base>
);
export const IconChart = (p: IconProps) => (
  <Base {...p}><Path d="M4 20h16" /><Path d="M7 16.5v-5M12 16.5V6.5M17 16.5v-8" /></Base>
);
export const IconHistory = (p: IconProps) => (
  <Base {...p}><Path d="M4 12a8 8 0 102.4-5.7L4 8.5" /><Path d="M4 4.5v4h4" /><Path d="M12 8v4.2l2.8 1.8" /></Base>
);
export const IconTruck = (p: IconProps) => (
  <Base {...p}>
    <Path d="M2.5 6.5h11v9h-11zM13.5 9.5h4l3 3.2v2.8h-7" />
    <Circle cx={7} cy={17.5} r={1.8} /><Circle cx={17} cy={17.5} r={1.8} />
  </Base>
);
export const IconWifiOff = (p: IconProps) => (
  <Base {...p}>
    <Path d="M3.5 3.5l17 17" />
    <Path d="M8.6 13.4a5 5 0 016.2-.6M5.3 10.2a9.8 9.8 0 015.2-2.6M14 7.7a9.8 9.8 0 014.7 2.5" />
    <Path d="M12 18.2v.1" />
  </Base>
);
export const IconCalendar = (p: IconProps) => (
  <Base {...p}><Rect x={3.5} y={5} width={17} height={15} rx={2.5} /><Path d="M3.5 10h17M8 3.2v3.4M16 3.2v3.4" /></Base>
);
export const IconReceipt = (p: IconProps) => (
  <Base {...p}><Path d="M6 3.5h12v17l-3-2-3 2-3-2-3 2z" /><Path d="M9 8.5h6M9 12h6" /></Base>
);
