import { forwardRef, CSSProperties } from 'react';
import { ButtonBase } from './ButtonBase';
import { IconButtonProps, ButtonSize } from './Button.types';

const iconSizeStyles: Record<ButtonSize, CSSProperties> = {
  sm: {
    width: '28px',
    height: '28px',
    padding: '4px',
  },
  md: {
    width: '36px',
    height: '36px',
    padding: '6px',
  },
  lg: {
    width: '44px',
    height: '44px',
    padding: '8px',
  },
};

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ icon, size = 'md', style, ...rest }, ref) => {
    const combinedStyles: CSSProperties = {
      ...iconSizeStyles[size],
      borderRadius: '0.375rem',
      ...style,
    };

    return (
      <ButtonBase ref={ref} size={size} style={combinedStyles} {...rest}>
        {icon}
      </ButtonBase>
    );
  }
);

IconButton.displayName = 'IconButton';

export default IconButton;
