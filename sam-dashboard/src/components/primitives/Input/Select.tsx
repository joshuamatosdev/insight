import { forwardRef, CSSProperties } from 'react';
import { SelectProps, InputSize } from './Input.types';

const sizeStyles: Record<InputSize, CSSProperties> = {
  sm: {
    padding: '0.35rem 2rem 0.35rem 0.75rem',
    fontSize: 'var(--font-size-sm)',
    borderRadius: 'var(--radius-md)',
  },
  md: {
    padding: '0.5rem 2.5rem 0.5rem 1rem',
    fontSize: 'var(--font-size-base)',
    borderRadius: 'var(--radius-md)',
  },
  lg: {
    padding: '0.75rem 3rem 0.75rem 1.25rem',
    fontSize: 'var(--font-size-lg)',
    borderRadius: 'var(--radius-lg)',
  },
};

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      size = 'md',
      isInvalid = false,
      fullWidth = false,
      options,
      placeholder,
      style,
      className,
      required,
      'aria-describedby': ariaDescribedBy,
      'aria-errormessage': ariaErrorMessage,
      ...rest
    },
    ref
  ) => {
    const selectStyles: CSSProperties = {
      fontFamily: 'var(--font-family)',
      border: `1px solid ${isInvalid ? 'var(--color-danger)' : 'var(--color-gray-300)'}`,
      backgroundColor: 'var(--color-white)',
      color: 'var(--color-gray-900)',
      outline: 'none',
      transition: 'var(--transition-fast)',
      width: fullWidth ? '100%' : 'auto',
      cursor: 'pointer',
      appearance: 'none',
      backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'%3e%3cpath fill='none' stroke='%23343a40' stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='m2 5 6 6 6-6'/%3e%3c/svg%3e")`,
      backgroundRepeat: 'no-repeat',
      backgroundPosition: 'right 0.75rem center',
      backgroundSize: '16px 12px',
      ...sizeStyles[size],
      ...style,
    };

    return (
      <select
        ref={ref}
        className={className}
        style={selectStyles}
        aria-invalid={isInvalid}
        aria-required={required}
        aria-describedby={ariaDescribedBy}
        aria-errormessage={isInvalid ? ariaErrorMessage : undefined}
        required={required}
        {...rest}
      >
        {placeholder !== undefined && placeholder !== null && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((option) => (
          <option key={option.value} value={option.value} disabled={option.disabled}>
            {option.label}
          </option>
        ))}
      </select>
    );
  }
);

Select.displayName = 'Select';

export default Select;
