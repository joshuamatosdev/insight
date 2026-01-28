import {useCallback, useEffect, useRef, useState} from 'react';
import {Box, Flex} from '../../components/catalyst/layout';

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

  const getInputClasses = (index: number): string => {
    const isFocused = focusedIndex === index;
    const hasValue = value[index] !== undefined && value[index] !== '';

    return clsx(
      'w-12 h-14 text-2xl text-center rounded-lg outline-none transition-all duration-200',
      'border-2',
      disabled === true ? 'bg-zinc-100 dark:bg-zinc-800' : 'bg-white dark:bg-zinc-900',
      error === true
        ? 'border-red-500'
        : isFocused === true
          ? 'border-blue-600 ring-4 ring-blue-100 dark:ring-blue-900'
          : hasValue === true
            ? 'border-zinc-400'
            : 'border-zinc-300 dark:border-zinc-600'
    );
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
            aria-label={`Digit ${index + 1} of ${length}`}
          />
        </Box>
      ))}
    </Flex>
  );
}

export default OtpInput;
