import { CSSProperties } from 'react';
import { Input, SearchIcon } from '../../primitives';

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  style?: CSSProperties;
}

export function SearchInput({
  value,
  onChange,
  placeholder = 'Search...',
  className,
  style,
}: SearchInputProps) {
  return (
    <Input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      leftIcon={<SearchIcon size="sm" color="muted" />}
      className={className}
      style={{ width: '250px', ...style }}
    />
  );
}

export default SearchInput;
