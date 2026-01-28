import {
    type ColumnDef,
    type ColumnFiltersState,
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    type PaginationState,
    type SortingState,
    type Table as TanStackTable,
    useReactTable,
    type VisibilityState,
} from '@tanstack/react-table';
import clsx from 'clsx';
import {useCallback, useState} from 'react';
import {ChevronDown, ChevronsUpDown, ChevronUp} from 'lucide-react';
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from './table';
import {Button} from '../primitives/button';

// ==================== Types ====================

export interface DataTableProps<TData> {
    data: TData[];
    columns: ColumnDef<TData, unknown>[];
    pageSize?: number;
    enableSorting?: boolean;
    enableFiltering?: boolean;
    enablePagination?: boolean;
    enableRowSelection?: boolean;
    dense?: boolean;
    striped?: boolean;
    grid?: boolean;
    bleed?: boolean;
    onRowClick?: (row: TData) => void;
    className?: string;
    // External pagination (server-side)
    manualPagination?: boolean;
    pageCount?: number;
    page?: number;
    onPageChange?: (page: number) => void;
    // External sorting (server-side)
    manualSorting?: boolean;
    onSortingChange?: (sorting: SortingState) => void;
}

export interface DataTablePaginationProps<TData> {
    table: TanStackTable<TData>;
}

// ==================== Sort Icon Component ====================

function SortIcon({isSorted}: { isSorted: false | 'asc' | 'desc' }) {
    if (isSorted === 'asc') {
        return <ChevronUp className="ml-1 h-4 w-4 inline-block"/>;
    }
    if (isSorted === 'desc') {
        return <ChevronDown className="ml-1 h-4 w-4 inline-block"/>;
    }
    return <ChevronsUpDown className="ml-1 h-4 w-4 inline-block opacity-50"/>;
}

// ==================== DataTable Component ====================

export function DataTable<TData>({
                                     data,
                                     columns,
                                     pageSize = 10,
                                     enableSorting = true,
                                     enableFiltering = false,
                                     enablePagination = false,
                                     enableRowSelection = false,
                                     dense = false,
                                     striped = false,
                                     grid = false,
                                     bleed = false,
                                     onRowClick,
                                     className,
                                     manualPagination = false,
                                     pageCount,
                                     page = 0,
                                     onPageChange,
                                     manualSorting = false,
                                     onSortingChange,
                                 }: DataTableProps<TData>) {
    const [sorting, setSorting] = useState<SortingState>([]);
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
    const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
    const [rowSelection, setRowSelection] = useState({});
    const [pagination, setPagination] = useState<PaginationState>({
        pageIndex: page,
        pageSize,
    });

    const handleSortingChange = useCallback(
        (updater: SortingState | ((old: SortingState) => SortingState)) => {
            const newSorting = typeof updater === 'function' ? updater(sorting) : updater;
            setSorting(newSorting);
            if (onSortingChange !== undefined) {
                onSortingChange(newSorting);
            }
        },
        [sorting, onSortingChange]
    );

    const handlePaginationChange = useCallback(
        (updater: PaginationState | ((old: PaginationState) => PaginationState)) => {
            const newPagination = typeof updater === 'function' ? updater(pagination) : updater;
            setPagination(newPagination);
            if (onPageChange !== undefined) {
                onPageChange(newPagination.pageIndex);
            }
        },
        [pagination, onPageChange]
    );

    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
        // Sorting
        ...(enableSorting && {
            getSortedRowModel: manualSorting ? undefined : getSortedRowModel(),
            onSortingChange: handleSortingChange,
            manualSorting,
        }),
        // Filtering
        ...(enableFiltering && {
            getFilteredRowModel: getFilteredRowModel(),
            onColumnFiltersChange: setColumnFilters,
        }),
        // Pagination
        ...(enablePagination && {
            getPaginationRowModel: manualPagination ? undefined : getPaginationRowModel(),
            onPaginationChange: handlePaginationChange,
            manualPagination,
            pageCount: manualPagination ? pageCount : undefined,
        }),
        // Row selection
        ...(enableRowSelection && {
            onRowSelectionChange: setRowSelection,
        }),
        onColumnVisibilityChange: setColumnVisibility,
        state: {
            sorting,
            columnFilters,
            columnVisibility,
            rowSelection,
            pagination,
        },
    });

    return (
        <div className={clsx('space-y-4', className)}>
            <Table dense={dense} striped={striped} grid={grid} bleed={bleed}>
                <TableHead>
                    {table.getHeaderGroups().map((headerGroup) => (
                        <TableRow key={headerGroup.id}>
                            {headerGroup.headers.map((header) => {
                                const canSort = enableSorting && header.column.getCanSort();
                                return (
                                    <TableHeader
                                        key={header.id}
                                        className={clsx(canSort && 'cursor-pointer select-none hover:bg-zinc-100 dark:hover:bg-zinc-800')}
                                        onClick={canSort ? header.column.getToggleSortingHandler() : undefined}
                                    >
                                        {header.isPlaceholder ? null : (
                                            <span className="flex items-center">
                        {flexRender(header.column.columnDef.header, header.getContext())}
                                                {canSort && <SortIcon isSorted={header.column.getIsSorted()}/>}
                      </span>
                                        )}
                                    </TableHeader>
                                );
                            })}
                        </TableRow>
                    ))}
                </TableHead>
                <TableBody>
                    {table.getRowModel().rows.length > 0 ? (
                        table.getRowModel().rows.map((row) => (
                            <TableRow
                                key={row.id}
                                className={clsx(
                                    onRowClick !== undefined && 'cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-800/50'
                                )}
                                onClick={onRowClick !== undefined ? () => onRowClick(row.original) : undefined}
                            >
                                {row.getVisibleCells().map((cell) => (
                                    <TableCell key={cell.id}>
                                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                    </TableCell>
                                ))}
                            </TableRow>
                        ))
                    ) : (
                        <TableRow>
                            <TableCell className="h-24 text-center text-zinc-500">No results.</TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>

            {enablePagination && <DataTablePagination table={table}/>}
        </div>
    );
}

// ==================== Pagination Component ====================

export function DataTablePagination<TData>({table}: DataTablePaginationProps<TData>) {
    const pageCount = table.getPageCount();
    const currentPage = table.getState().pagination.pageIndex;
    const canPrevious = table.getCanPreviousPage();
    const canNext = table.getCanNextPage();

    return (
        <div className="flex items-center justify-between px-2">
            <div className="flex-1 text-sm text-zinc-500 dark:text-zinc-400">
                {table.getFilteredSelectedRowModel().rows.length > 0 && (
                    <span>
            {table.getFilteredSelectedRowModel().rows.length} of{' '}
                        {table.getFilteredRowModel().rows.length} row(s) selected.
          </span>
                )}
            </div>
            <div className="flex items-center space-x-6 lg:space-x-8">
                <div className="flex items-center space-x-2">
                    <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                        Page {currentPage + 1} of {pageCount}
                    </p>
                </div>
                <div className="flex items-center space-x-2">
                    <Button
                        outline
                        onClick={() => table.setPageIndex(0)}
                        disabled={canPrevious === false}
                    >
                        {'<<'}
                    </Button>
                    <Button
                        outline
                        onClick={() => table.previousPage()}
                        disabled={canPrevious === false}
                    >
                        Previous
                    </Button>
                    <Button
                        outline
                        onClick={() => table.nextPage()}
                        disabled={canNext === false}
                    >
                        Next
                    </Button>
                    <Button
                        outline
                        onClick={() => table.setPageIndex(pageCount - 1)}
                        disabled={canNext === false}
                    >
                        {'>>'}
                    </Button>
                </div>
            </div>
        </div>
    );
}

// ==================== Helper: Create Column Helper ====================

export {createColumnHelper} from '@tanstack/react-table';

// Re-export types for consumers
export type {ColumnDef, SortingState, ColumnFiltersState, PaginationState};
