import { forwardRef, CSSProperties } from 'react';
import { SelectProps, InputSize } from './Input.types';

const sizeStyles: Record<InputSize, CSSProperties> = {
  sm: {
    padding: '0.35rem 2rem 0.35rem 0.75rem',
    fontSize: '0.875rem',
    borderRadius: '0.375rem',
  },
  md: {
    padding: '0.5rem 2.5rem 0.5rem 1rem',
    fontSize: '1rem',
    borderRadius: '0.375rem',
  },
  lg: {
    padding: '0.75rem 3rem 0.75rem 1.25rem',
    fontSize: '1.125rem',
    borderRadius: '0.5rem',
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
      fontFamily: 'inherit',
      border: `1px solid ${isInvalid ? '#ef4444' : '#d4d4d8'}`,
      backgroundColor: '#ffffff',
      color: '#18181b',
      outline: 'none',
      transition: '0.15s ease',
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
