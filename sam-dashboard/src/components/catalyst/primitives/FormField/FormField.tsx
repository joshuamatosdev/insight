import { CSSProperties, useId, cloneElement, isValidElement } from 'react';
import { FormFieldProps } from './FormField.types';

/** Visually hidden styles for screen reader only text */
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

const containerStyles: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '0.25rem',
};

const labelStyles: CSSProperties = {
  fontFamily: 'inherit',
  fontSize: '0.875rem',
  fontWeight: 500,
  color: '#3f3f46',
  display: 'flex',
  alignItems: 'center',
  gap: '0.25rem',
};

const requiredIndicatorStyles: CSSProperties = {
  color: '#ef4444',
  marginLeft: '2px',
};

const descriptionStyles: CSSProperties = {
  fontFamily: 'inherit',
  fontSize: '0.75rem',
  color: '#71717a',
  marginTop: '0.25rem',
};

const errorStyles: CSSProperties = {
  fontFamily: 'inherit',
  fontSize: '0.75rem',
  color: '#ef4444',
  marginTop: '0.25rem',
  display: 'flex',
  alignItems: 'center',
  gap: '0.25rem',
};

const hintStyles: CSSProperties = {
  fontFamily: 'inherit',
  fontSize: '0.75rem',
  color: '#a1a1aa',
  marginTop: '0.25rem',
};

const characterCountStyles: CSSProperties = {
  fontFamily: 'inherit',
  fontSize: '0.75rem',
  color: '#a1a1aa',
  textAlign: 'right',
  marginTop: '0.25rem',
};

/**
 * FormField component wraps form inputs with proper labels, descriptions, and error messages.
 * Automatically handles ARIA attributes for accessibility.
 */
export function FormField({
  children,
  label,
  id: providedId,
  description,
  error,
  required = false,
  disabled = false,
  className,
  style,
  hideLabel = false,
  hint,
  characterCount,
}: FormFieldProps) {
  const generatedId = useId();
  const fieldId = providedId ?? generatedId;
  const descriptionId = `${fieldId}-description`;
  const errorId = `${fieldId}-error`;
  const hintId = `${fieldId}-hint`;

  const hasError = error !== undefined && error !== '';
  const hasDescription = description !== undefined && description !== '';
  const hasHint = hint !== undefined && hint !== null;

  // Build aria-describedby value
  const ariaDescribedBy: string[] = [];
  if (hasDescription) {
    ariaDescribedBy.push(descriptionId);
  }
  if (hasHint) {
    ariaDescribedBy.push(hintId);
  }
  if (hasError) {
    ariaDescribedBy.push(errorId);
  }

  // Clone the child element with enhanced props
  const enhancedChild = isValidElement(children)
    ? cloneElement(children, {
        id: fieldId,
        'aria-invalid': hasError,
        'aria-required': required,
        'aria-describedby': ariaDescribedBy.length > 0 ? ariaDescribedBy.join(' ') : undefined,
        'aria-errormessage': hasError ? errorId : undefined,
        disabled: disabled || children.props.disabled,
        isInvalid: hasError || children.props.isInvalid,
        required: required || children.props.required,
      } as Record<string, unknown>)
    : children;

  const isOverLimit =
    characterCount !== undefined && characterCount.current > characterCount.max;

  return (
    <div className={className} style={{ ...containerStyles, ...style }}>
      <label
        htmlFor={fieldId}
        style={hideLabel ? srOnlyStyles : labelStyles}
      >
        {label}
        {required && (
          <span style={requiredIndicatorStyles} aria-hidden="true">
            *
          </span>
        )}
        {required && <span style={srOnlyStyles}>(required)</span>}
      </label>

      {enhancedChild}

      {hasDescription && (
        <div id={descriptionId} style={descriptionStyles}>
          {description}
        </div>
      )}

      {hasHint && (
        <div id={hintId} style={hintStyles}>
          {hint}
        </div>
      )}

      {hasError && (
        <div
          id={errorId}
          style={errorStyles}
          role="alert"
          aria-live="polite"
        >
          <span aria-hidden="true">!</span>
          {error}
        </div>
      )}

      {characterCount !== undefined && (
        <div
          style={{
            ...characterCountStyles,
            color: isOverLimit ? '#ef4444' : '#a1a1aa',
          }}
          aria-live="polite"
          aria-atomic="true"
        >
          {characterCount.current}/{characterCount.max}
          {isOverLimit && (
            <span style={srOnlyStyles}>
              {` characters over limit by ${characterCount.current - characterCount.max}`}
            </span>
          )}
        </div>
      )}
    </div>
  );
}

export default FormField;
