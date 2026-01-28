import {describe, expect, it, vi} from 'vitest';
import {render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {FilterBar} from './FilterBar';
import {SearchInput} from './SearchInput';
import {SortSelect} from './SortSelect';
import {FilterState} from './Filters.types';

describe('SearchInput', () => {
    it('renders input element', () => {
        render(<SearchInput value="" onChange={() => {
        }}/>);
        expect(screen.getByRole('textbox')).toBeInTheDocument();
    });

    it('displays current value', () => {
        render(<SearchInput value="test search" onChange={() => {
        }}/>);
        expect(screen.getByDisplayValue('test search')).toBeInTheDocument();
    });

    it('calls onChange when typing', async () => {
        const user = userEvent.setup();
        const handleChange = vi.fn();
        render(<SearchInput value="" onChange={handleChange}/>);

        const input = screen.getByRole('textbox');
        await user.type(input, 'a');
        expect(handleChange).toHaveBeenCalled();
    });

    it('applies placeholder text', () => {
        render(<SearchInput value="" onChange={() => {
        }} placeholder="Search..."/>);
        expect(screen.getByPlaceholderText('Search...')).toBeInTheDocument();
    });
});

describe('SortSelect', () => {
    it('renders select element', () => {
        render(<SortSelect value="deadline" onChange={() => {
        }}/>);
        expect(screen.getByRole('combobox')).toBeInTheDocument();
    });

    it('displays deadline option', () => {
        render(<SortSelect value="deadline" onChange={() => {
        }}/>);
        expect(screen.getByText('Sort by Deadline')).toBeInTheDocument();
    });

    it('displays posted option', () => {
        render(<SortSelect value="posted" onChange={() => {
        }}/>);
        expect(screen.getByText('Sort by Posted Date')).toBeInTheDocument();
    });

    it('calls onChange when selecting', async () => {
        const user = userEvent.setup();
        const handleChange = vi.fn();
        render(<SortSelect value="deadline" onChange={handleChange}/>);

        const select = screen.getByRole('combobox');
        await user.selectOptions(select, 'posted');
        expect(handleChange).toHaveBeenCalledWith('posted');
    });
});

describe('FilterBar', () => {
    const defaultFilters: FilterState = {
        search: '',
        sort: 'deadline',
    };

    it('renders search input', () => {
        render(<FilterBar filters={defaultFilters} onFilterChange={() => {
        }}/>);
        expect(screen.getByRole('textbox')).toBeInTheDocument();
    });

    it('renders sort select', () => {
        render(<FilterBar filters={defaultFilters} onFilterChange={() => {
        }}/>);
        expect(screen.getByRole('combobox')).toBeInTheDocument();
    });

    it('calls onFilterChange when search changes', async () => {
        const user = userEvent.setup();
        const handleFilterChange = vi.fn();
        render(<FilterBar filters={defaultFilters} onFilterChange={handleFilterChange}/>);

        const input = screen.getByRole('textbox');
        await user.type(input, 'a');
        expect(handleFilterChange).toHaveBeenCalled();
    });

    it('calls onFilterChange when sort changes', async () => {
        const user = userEvent.setup();
        const handleFilterChange = vi.fn();
        render(<FilterBar filters={defaultFilters} onFilterChange={handleFilterChange}/>);

        const select = screen.getByRole('combobox');
        await user.selectOptions(select, 'posted');
        expect(handleFilterChange).toHaveBeenCalledWith({search: '', sort: 'posted'});
    });

    it('displays current search value', () => {
        const filters = {search: 'test', sort: 'deadline' as const};
        render(<FilterBar filters={filters} onFilterChange={() => {
        }}/>);
        expect(screen.getByDisplayValue('test')).toBeInTheDocument();
    });
});
