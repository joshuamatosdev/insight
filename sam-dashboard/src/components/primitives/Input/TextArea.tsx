import { forwardRef, CSSProperties } from 'react';
import { TextAreaProps, InputSize } from './Input.types';

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

export const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(
  (
    {
      size = 'md',
      isInvalid = false,
      fullWidth = false,
      style,
      className,
      required,
      'aria-describedby': ariaDescribedBy,
      'aria-errormessage': ariaErrorMessage,
      ...rest
    },
    ref
  ) => {
    const textareaStyles: CSSProperties = {
      fontFamily: 'var(--font-family)',
      border: `1px solid ${isInvalid ? 'var(--color-danger)' : 'var(--color-gray-300)'}`,
      backgroundColor: 'var(--color-white)',
      color: 'var(--color-gray-900)',
      outline: 'none',
      transition: 'var(--transition-fast)',
      width: fullWidth ? '100%' : 'auto',
      resize: 'vertical',
      minHeight: '80px',
      ...sizeStyles[size],
      ...style,
    };

    return (
      <textarea
        ref={ref}
        className={className}
        style={textareaStyles}
        aria-invalid={isInvalid}
        aria-required={required}
        aria-describedby={ariaDescribedBy}
        aria-errormessage={isInvalid ? ariaErrorMessage : undefined}
        required={required}
        {...rest}
      />
    );
  }
);

TextArea.displayName = 'TextArea';

export default TextArea;
