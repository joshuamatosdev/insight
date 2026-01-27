import { forwardRef, CSSProperties } from 'react';
import { ButtonBaseProps, ButtonVariant, ButtonSize } from './Button.types';

const variantStyles: Record<ButtonVariant, CSSProperties> = {
  primary: {
    backgroundColor: '#2563eb',
    color: '#ffffff',
    border: 'none',
  },
  secondary: {
    backgroundColor: '#e4e4e7',
    color: '#27272a',
    border: 'none',
  },
  outline: {
    backgroundColor: 'transparent',
    color: '#2563eb',
    border: '1px solid #2563eb',
  },
  ghost: {
    backgroundColor: 'transparent',
    color: '#3f3f46',
    border: 'none',
  },
  danger: {
    backgroundColor: '#ef4444',
    color: '#ffffff',
    border: 'none',
  },
};

const sizeStyles: Record<ButtonSize, CSSProperties> = {
  sm: {
    padding: '0.35rem 0.75rem',
    fontSize: '0.875rem',
    borderRadius: '0.375rem',
  },
  md: {
    padding: '0.5rem 1rem',
    fontSize: '1rem',
    borderRadius: '0.375rem',
  },
  lg: {
    padding: '0.75rem 1.5rem',
    fontSize: '1.125rem',
    borderRadius: '0.5rem',
  },
};

/** Visually hidden styles for screen reader text */
const srOnlyStyles: CSSProperties = {
  position: 'absolute',
  width: '1px',
  height: '1px',
  padding: 0,
  margin: '-1px',
  overflow: 'hidden',
  clip: 'rect(0, 0, 0, 0)',
  whiteSpace: 'nowrap',
  border: 0,
};

export const ButtonBase = forwardRef<HTMLButtonElement, ButtonBaseProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      isLoading = false,
      isDisabled = false,
      leftIcon,
      rightIcon,
      fullWidth = false,
      className,
      style,
      children,
      loadingText = 'Loading',
      'aria-pressed': ariaPressed,
      ...rest
    },
    ref
  ) => {
    const baseStyles: CSSProperties = {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '0.5rem',
      fontFamily: 'inherit',
      fontWeight: 500,
      lineHeight: '1.25',
      cursor: isDisabled || isLoading ? 'not-allowed' : 'pointer',
      opacity: isDisabled ? 0.6 : 1,
      transition: '0.15s ease',
      textDecoration: 'none',
      ...(fullWidth && { width: '100%' }),
      ...variantStyles[variant],
      ...sizeStyles[size],
      ...style,
    };

    const isDisabledOrLoading = isDisabled || isLoading;

    return (
      <button
        ref={ref}
        className={className}
        style={baseStyles}
        disabled={isDisabledOrLoading}
        aria-disabled={isDisabledOrLoading}
        aria-busy={isLoading}
        aria-pressed={ariaPressed}
        {...rest}
      >
        {isLoading && (
          <>
            <span
              aria-hidden="true"
              style={{
                width: '1em',
                height: '1em',
                border: '2px solid currentColor',
                borderRightColor: 'transparent',
                borderRadius: '50%',
                animation: 'spin 0.6s linear infinite',
              }}
            />
            <span style={srOnlyStyles}>{loadingText}</span>
          </>
        )}
        {isLoading === false && leftIcon}
        {children}
        {isLoading === false && rightIcon}
      </button>
    );
  }
);

ButtonBase.displayName = 'ButtonBase';

export default ButtonBase;
