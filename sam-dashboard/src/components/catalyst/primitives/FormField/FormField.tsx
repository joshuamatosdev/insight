import {cloneElement, isValidElement, useId} from 'react';
import clsx from 'clsx';
import {FormFieldProps} from './FormField.types';

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
    const enhancedChild = isValidElement<Record<string, unknown>>(children)
        ? cloneElement(children, {
            id: fieldId,
            'aria-invalid': hasError,
            'aria-required': required,
            'aria-describedby': ariaDescribedBy.length > 0 ? ariaDescribedBy.join(' ') : undefined,
            'aria-errormessage': hasError ? errorId : undefined,
            disabled: disabled === true || children.props.disabled === true,
            invalid: hasError || children.props.invalid === true,
            required: required === true || children.props.required === true,
        } as Record<string, unknown>)
        : children;

    const isOverLimit =
        characterCount !== undefined && characterCount.current > characterCount.max;

    return (
        <div className={clsx('flex flex-col gap-1', className)} style={style}>
            <label
                htmlFor={fieldId}
                className={clsx(
                    hideLabel ? 'sr-only' : 'font-medium text-sm text-zinc-700 flex items-center gap-1'
                )}
            >
                {label}
                {required && (
                    <span className="text-red-500 ml-0.5" aria-hidden="true">
            *
          </span>
                )}
                {required && <span className="sr-only">(required)</span>}
            </label>

            {enhancedChild}

            {hasDescription && (
                <div id={descriptionId} className="text-xs text-zinc-500 mt-1">
                    {description}
                </div>
            )}

            {hasHint && (
                <div id={hintId} className="text-xs text-zinc-400 mt-1">
                    {hint}
                </div>
            )}

            {hasError && (
                <div
                    id={errorId}
                    className="text-xs text-red-500 mt-1 flex items-center gap-1"
                    role="alert"
                    aria-live="polite"
                >
                    <span aria-hidden="true">!</span>
                    {error}
                </div>
            )}

            {characterCount !== undefined && (
                <div
                    className={clsx(
                        'text-xs text-right mt-1',
                        isOverLimit ? 'text-red-500' : 'text-zinc-400'
                    )}
                    aria-live="polite"
                    aria-atomic="true"
                >
                    {characterCount.current}/{characterCount.max}
                    {isOverLimit && (
                        <span className="sr-only">
              {` characters over limit by ${characterCount.current - characterCount.max}`}
            </span>
                    )}
                </div>
            )}
        </div>
    );
}

export default FormField;
