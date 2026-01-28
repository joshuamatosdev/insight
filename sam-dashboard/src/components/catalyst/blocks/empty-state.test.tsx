import {render, screen} from '@testing-library/react'
import {describe, expect, it} from 'vitest'
import {
    EmptyState,
    EmptyStateActions,
    EmptyStateDashed,
    EmptyStateDescription,
    EmptyStateIcon,
    EmptyStateTitle,
} from './empty-state'

describe('EmptyState', () => {
    it('renders empty state with all compound components', () => {
        render(
            <EmptyState>
                <EmptyStateIcon>
                    <svg data-testid="icon">
                        <circle/>
                    </svg>
                </EmptyStateIcon>
                <EmptyStateTitle>No projects</EmptyStateTitle>
                <EmptyStateDescription>Get started by creating a new project.</EmptyStateDescription>
                <EmptyStateActions>
                    <button type="button">New Project</button>
                </EmptyStateActions>
            </EmptyState>
        )

        expect(screen.getByTestId('icon')).toBeInTheDocument()
        expect(screen.getByText('No projects')).toBeInTheDocument()
        expect(screen.getByText('Get started by creating a new project.')).toBeInTheDocument()
        expect(screen.getByRole('button', {name: 'New Project'})).toBeInTheDocument()
    })

    it('renders dashed border variant as div', () => {
        render(
            <EmptyStateDashed data-testid="dashed-container">
                <EmptyStateIcon>
                    <svg>
                        <circle/>
                    </svg>
                </EmptyStateIcon>
                <EmptyStateTitle>Create a new database</EmptyStateTitle>
            </EmptyStateDashed>
        )

        const container = screen.getByTestId('dashed-container')
        expect(container.tagName).toBe('DIV')
        expect(screen.getByText('Create a new database')).toBeInTheDocument()
    })

    it('renders dashed border variant as button', () => {
        render(
            <EmptyStateDashed as="button" type="button">
                <EmptyStateIcon>
                    <svg>
                        <circle/>
                    </svg>
                </EmptyStateIcon>
                <EmptyStateTitle>Create a new database</EmptyStateTitle>
            </EmptyStateDashed>
        )

        const button = screen.getByRole('button')
        expect(button).toBeInTheDocument()
        expect(screen.getByText('Create a new database')).toBeInTheDocument()
    })

    it('applies custom className to EmptyState', () => {
        render(
            <EmptyState className="custom-class" data-testid="empty-state">
                <EmptyStateTitle>Test</EmptyStateTitle>
            </EmptyState>
        )

        const container = screen.getByTestId('empty-state')
        expect(container).toHaveClass('custom-class')
        expect(container).toHaveClass('text-center')
    })

    it('applies custom className to EmptyStateIcon', () => {
        render(
            <EmptyStateIcon className="size-16" data-testid="icon-container">
                <svg>
                    <circle/>
                </svg>
            </EmptyStateIcon>
        )

        const iconContainer = screen.getByTestId('icon-container')
        expect(iconContainer).toHaveClass('size-16')
        expect(iconContainer).toHaveClass('mx-auto')
    })

    it('applies custom className to EmptyStateTitle', () => {
        render(<EmptyStateTitle className="text-lg">Custom Title</EmptyStateTitle>)

        const title = screen.getByText('Custom Title')
        expect(title).toHaveClass('text-lg')
        expect(title).toHaveClass('font-semibold')
    })

    it('applies custom className to EmptyStateDescription', () => {
        render(<EmptyStateDescription className="text-base">Custom description</EmptyStateDescription>)

        const description = screen.getByText('Custom description')
        expect(description).toHaveClass('text-base')
        expect(description).toHaveClass('text-sm')
    })

    it('applies custom className to EmptyStateActions', () => {
        render(
            <EmptyStateActions className="mt-8" data-testid="actions">
                <button type="button">Action</button>
            </EmptyStateActions>
        )

        const actions = screen.getByTestId('actions')
        expect(actions).toHaveClass('mt-8')
        expect(actions).toHaveClass('mt-6')
    })

    it('supports centered layout inside cards', () => {
        render(
            <div data-testid="card">
                <EmptyState>
                    <EmptyStateIcon>
                        <svg>
                            <circle/>
                        </svg>
                    </EmptyStateIcon>
                    <EmptyStateTitle>No data</EmptyStateTitle>
                </EmptyState>
            </div>
        )

        const card = screen.getByTestId('card')
        expect(card).toBeInTheDocument()
        expect(screen.getByText('No data')).toBeInTheDocument()
    })

    it('renders with multiple action buttons', () => {
        render(
            <EmptyState>
                <EmptyStateTitle>No items</EmptyStateTitle>
                <EmptyStateActions>
                    <button type="button">Primary Action</button>
                    <button type="button">Secondary Action</button>
                </EmptyStateActions>
            </EmptyState>
        )

        expect(screen.getByRole('button', {name: 'Primary Action'})).toBeInTheDocument()
        expect(screen.getByRole('button', {name: 'Secondary Action'})).toBeInTheDocument()
    })
})
