import { BoxProps } from './Box.types';

/**
 * Box - A generic container component
 *
 * Use this component instead of raw <div>, <span>, or other container elements.
 * Tailwind classes and inline styles are encapsulated here.
 */
export function Box({
  children,
  className,
  style,
  as: Element = 'div',
  ...rest
}: BoxProps) {
  return (
    <Element className={className} style={style} {...rest}>
      {children}
    </Element>
  );
}

export default Box;
