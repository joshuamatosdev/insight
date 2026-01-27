import { useState, useRef, useEffect, useCallback } from 'react';
import { Flex, Box } from '../../components/layout';

interface OtpInputProps {
  length?: number;
  value: string;
  onChange: (value: string) => void;
  onComplete?: (value: string) => void;
  disabled?: boolean;
  autoFocus?: boolean;
  error?: boolean;
}

/**
 * OTP input component with individual digit boxes
 */
export function OtpInput({
  length = 6,
  value,
  onChange,
  onComplete,
  disabled = false,
  autoFocus = false,
  error = false,
}: OtpInputProps): React.ReactElement {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null);

  // Fill refs array
  useEffect(() => {
    inputRefs.current = inputRefs.current.slice(0, length);
  }, [length]);

  // Auto-focus first input
  useEffect(() => {
    if (autoFocus === true && inputRefs.current[0] !== null) {
      inputRefs.current[0]?.focus();
    }
  }, [autoFocus]);

  // Check completion
  useEffect(() => {
    if (value.length === length && onComplete !== undefined) {
      onComplete(value);
    }
  }, [value, length, onComplete]);

  const handleChange = useCallback(
    (index: number, inputValue: string) => {
      // Only allow digits
      const digit = inputValue.replace(/\D/g, '').slice(-1);
      
      const newValue = value.split('');
      newValue[index] = digit;
      const updatedValue = newValue.join('').slice(0, length);
      
      onChange(updatedValue);

      // Move to next input
      if (digit !== '' && index < length - 1) {
        inputRefs.current[index + 1]?.focus();
      }
    },
    [value, length, onChange]
  );

  const handleKeyDown = useCallback(
    (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Backspace') {
        if (value[index] === undefined || value[index] === '') {
          // Move to previous input if current is empty
          if (index > 0) {
            inputRefs.current[index - 1]?.focus();
            const newValue = value.slice(0, -1);
            onChange(newValue);
          }
        } else {
          // Clear current digit
          const newValue = value.split('');
          newValue[index] = '';
          onChange(newValue.join(''));
        }
        e.preventDefault();
      } else if (e.key === 'ArrowLeft' && index > 0) {
        inputRefs.current[index - 1]?.focus();
      } else if (e.key === 'ArrowRight' && index < length - 1) {
        inputRefs.current[index + 1]?.focus();
      }
    },
    [value, length, onChange]
  );

  const handlePaste = useCallback(
    (e: React.ClipboardEvent) => {
      e.preventDefault();
      const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, length);
      onChange(pastedData);
      
      // Focus the appropriate input
      const focusIndex = Math.min(pastedData.length, length - 1);
      inputRefs.current[focusIndex]?.focus();
    },
    [length, onChange]
  );

  const handleFocus = useCallback((index: number) => {
    setFocusedIndex(index);
  }, []);

  const handleBlur = useCallback(() => {
    setFocusedIndex(null);
  }, []);

  const getInputStyle = (index: number): React.CSSProperties => {
    const isFocused = focusedIndex === index;
    const hasValue = value[index] !== undefined && value[index] !== '';
    
    return {
      width: '48px',
      height: '56px',
      fontSize: '24px',
      textAlign: 'center',
      border: `2px solid ${
        error === true
          ? 'var(--color-danger)'
          : isFocused === true
          ? 'var(--color-primary)'
          : hasValue === true
          ? 'var(--color-gray-400)'
          : 'var(--color-gray-300)'
      }`,
      borderRadius: '8px',
      outline: 'none',
      backgroundColor: disabled === true ? 'var(--color-gray-100)' : 'white',
      transition: 'border-color 0.2s, box-shadow 0.2s',
      boxShadow: isFocused === true ? '0 0 0 3px var(--color-primary-100)' : 'none',
    };
  };

  return (
    <Flex gap="sm" justify="center" onPaste={handlePaste}>
      {Array.from({ length }, (_, index) => (
        <Box key={index}>
          <input
            ref={(el) => {
              inputRefs.current[index] = el;
            }}
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={1}
            value={value[index] ?? ''}
            onChange={(e) => handleChange(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            onFocus={() => handleFocus(index)}
            onBlur={handleBlur}
            disabled={disabled}
            style={getInputStyle(index)}
            aria-label={`Digit ${index + 1} of ${length}`}
          />
        </Box>
      ))}
    </Flex>
  );
}

export default OtpInput;
