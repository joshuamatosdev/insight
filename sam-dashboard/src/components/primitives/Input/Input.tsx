import { forwardRef, CSSProperties } from 'react';
import { InputProps, InputSize } from './Input.types';

const sizeStyles: Record<InputSize, CSSProperties> = {
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
    padding: '0.75rem 1.25rem',
    fontSize: 'var(--font-size-lg)',
    borderRadius: 'var(--radius-lg)',
  },
};

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      size = 'md',
      leftIcon,
      rightIcon,
      isInvalid = false,
      fullWidth = false,
      containerStyle,
      style,
      className,
      required,
      'aria-describedby': ariaDescribedBy,
      'aria-errormessage': ariaErrorMessage,
      ...rest
    },
    ref
  ) => {
    const hasIcon = leftIcon !== undefined || rightIcon !== undefined;

    const inputStyles: CSSProperties = {
      fontFamily: 'var(--font-family)',
      border: `1px solid ${isInvalid ? 'var(--color-danger)' : 'var(--color-gray-300)'}`,
      backgroundColor: 'var(--color-white)',
      color: 'var(--color-gray-900)',
      outline: 'none',
      transition: 'var(--transition-fast)',
      width: fullWidth ? '100%' : 'auto',
      ...sizeStyles[size],
      ...(leftIcon !== undefined && { paddingLeft: '2.5rem' }),
      ...(rightIcon !== undefined && { paddingRight: '2.5rem' }),
      ...style,
    };

    const wrapperStyles: CSSProperties = {
      position: 'relative',
      display: fullWidth ? 'block' : 'inline-block',
      width: fullWidth ? '100%' : 'auto',
      ...containerStyle,
    };

    const iconBaseStyles: CSSProperties = {
      position: 'absolute',
      top: '50%',
      transform: 'translateY(-50%)',
      color: 'var(--color-gray-500)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      pointerEvents: 'none',
    };

    const inputElement = (
      <input
        ref={ref}
        className={className}
        style={inputStyles}
        aria-invalid={isInvalid}
        aria-required={required}
        aria-describedby={ariaDescribedBy}
        aria-errormessage={isInvalid ? ariaErrorMessage : undefined}
        required={required}
        {...rest}
      />
    );

    if (hasIcon) {
      return (
        <div style={wrapperStyles}>
          {leftIcon !== undefined && (
            <span aria-hidden="true" style={{ ...iconBaseStyles, left: '0.75rem' }}>
              {leftIcon}
            </span>
          )}
          {inputElement}
          {rightIcon !== undefined && (
            <span aria-hidden="true" style={{ ...iconBaseStyles, right: '0.75rem' }}>
              {rightIcon}
            </span>
          )}
        </div>
      );
    }

    return inputElement;
  }
);

Input.displayName = 'Input';

export default Input;
