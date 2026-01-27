import { forwardRef, CSSProperties } from 'react';
import { ButtonBaseProps, ButtonVariant, ButtonSize } from './Button.types';

const variantStyles: Record<ButtonVariant, CSSProperties> = {
  primary: {
    backgroundColor: 'var(--color-primary)',
    color: 'var(--color-white)',
    border: 'none',
  },
  secondary: {
    backgroundColor: 'var(--color-gray-200)',
    color: 'var(--color-gray-800)',
    border: 'none',
  },
  outline: {
    backgroundColor: 'transparent',
    color: 'var(--color-primary)',
    border: '1px solid var(--color-primary)',
  },
  ghost: {
    backgroundColor: 'transparent',
    color: 'var(--color-gray-700)',
    border: 'none',
  },
  danger: {
    backgroundColor: 'var(--color-danger)',
    color: 'var(--color-white)',
    border: 'none',
  },
};

const sizeStyles: Record<ButtonSize, CSSProperties> = {
  sm: {
    padding: '0.35rem 0.75rem',
    fontSize: 'var(--font-size-sm)',
    borderRadius: 'var(--radius-md)',
  },
  md: {
    padding: '0.5rem 1rem',
    fontSize: 'var(--font-size-base)',
    borderRadius: 'var(--radius-md)',
  },
  lg: {
    padding: '0.75rem 1.5rem',
    fontSize: 'var(--font-size-lg)',
    borderRadius: 'var(--radius-lg)',
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
      gap: 'var(--spacing-2)',
      fontFamily: 'var(--font-family)',
      fontWeight: 'var(--font-weight-medium)' as unknown as number,
      lineHeight: 'var(--line-height-tight)',
      cursor: isDisabled || isLoading ? 'not-allowed' : 'pointer',
      opacity: isDisabled ? 0.6 : 1,
      transition: 'var(--transition-fast)',
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
