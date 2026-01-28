import {SearchInputProps} from './Filters.types';
import {Input, SearchIcon} from '../../catalyst/primitives';

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
            leftIcon={<SearchIcon size="sm" color="muted"/>}
            style={{width: '250px', ...style}}
        />
    );
}

export default SearchInput;
