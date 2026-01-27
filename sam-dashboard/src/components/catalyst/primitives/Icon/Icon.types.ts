import { CSSProperties, ReactNode, SVGAttributes } from 'react';

export type IconSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
export type IconColor = 'inherit' | 'primary' | 'secondary' | 'muted' | 'success' | 'warning' | 'danger' | 'info' | 'white';

export interface IconProps {
  size?: IconSize;
  color?: IconColor;
  className?: string;
  style?: CSSProperties;
  children?: ReactNode;
}

export interface IconComponentProps extends Omit<SVGAttributes<SVGSVGElement>, 'style'>, IconProps {
  viewBox?: string;
  paths: string[];
  fillRule?: 'nonzero' | 'evenodd';
}
