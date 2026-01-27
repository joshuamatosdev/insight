import { forwardRef, CSSProperties } from 'react';
import { TextAreaProps, InputSize } from './Input.types';

const sizeStyles: Record<InputSize, CSSProperties> = {
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
    padding: '0.75rem 1.25rem',
    fontSize: '1.125rem',
    borderRadius: '0.5rem',
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
      fontFamily: 'inherit',
      border: `1px solid ${isInvalid ? '#ef4444' : '#d4d4d8'}`,
      backgroundColor: '#ffffff',
      color: '#18181b',
      outline: 'none',
      transition: '0.15s ease',
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
