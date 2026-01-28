import {CSSProperties, ReactNode, SVGAttributes} from 'react';

export type IconSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

/**
 * Color can be a semantic preset or a Tailwind class name (e.g., 'text-blue-600').
 * When using 'inherit', the icon inherits from parent's currentColor.
 */
export type IconColor =
    'inherit'
    | 'primary'
    | 'secondary'
    | 'muted'
    | 'success'
    | 'warning'
    | 'danger'
    | 'info'
    | 'white'
    | (string & {});

export interface IconProps {
    size?: IconSize;
    /** Color can be a semantic preset or a Tailwind class name (e.g., 'text-blue-600') */
    color?: IconColor;
    className?: string;
    style?: CSSProperties;
    children?: ReactNode;
}

export interface IconComponentProps extends Omit<SVGAttributes<SVGSVGElement>, 'style' | 'color'>, IconProps {
    viewBox?: string;
    paths: string[];
    fillRule?: 'nonzero' | 'evenodd';
}
