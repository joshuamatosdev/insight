import { forwardRef } from 'react';
import { ButtonBase } from './ButtonBase';
import { ButtonBaseProps } from './Button.types';

export const Button = forwardRef<HTMLButtonElement, ButtonBaseProps>((props, ref) => {
  return <ButtonBase ref={ref} {...props} />;
});

Button.displayName = 'Button';

export default Button;
