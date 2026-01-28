import {render, screen} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {describe, expect, it, vi} from 'vitest'
import {ButtonGroup, ButtonGroupItem} from './button-group'

describe('ButtonGroup', () => {
    describe('ButtonGroup Container', () => {
        it('renders group of buttons', () => {
            render(
                <ButtonGroup>
                    <ButtonGroupItem>Years</ButtonGroupItem>
                    <ButtonGroupItem>Months</ButtonGroupItem>
                    <ButtonGroupItem>Days</ButtonGroupItem>
                </ButtonGroup>
            )

            expect(screen.getByText('Years')).toBeInTheDocument()
            expect(screen.getByText('Months')).toBeInTheDocument()
            expect(screen.getByText('Days')).toBeInTheDocument()
        })

        it('applies custom className to container', () => {
            const {container} = render(
                <ButtonGroup className="custom-group-class">
                    <ButtonGroupItem>Button 1</ButtonGroupItem>
                </ButtonGroup>
            )

            const group = container.querySelector('.custom-group-class')
            expect(group).toBeInTheDocument()
        })

        it('renders as span by default', () => {
            const {container} = render(
                <ButtonGroup>
                    <ButtonGroupItem>Button</ButtonGroupItem>
                </ButtonGroup>
            )

            const group = container.querySelector('span')
            expect(group).toBeInTheDocument()
        })
    })

    describe('ButtonGroupItem styling', () => {
        it('applies rounded corners to first button only', () => {
            const {container} = render(
                <ButtonGroup>
                    <ButtonGroupItem>First</ButtonGroupItem>
                    <ButtonGroupItem>Middle</ButtonGroupItem>
                    <ButtonGroupItem>Last</ButtonGroupItem>
                </ButtonGroup>
            )

            const buttons = screen.getAllByRole('button')
            const firstButton = buttons.at(0)

            expect(firstButton).toHaveClass('rounded-l-lg')
            expect(firstButton).not.toHaveClass('rounded-r-lg')
        })

        it('applies rounded corners to last button only', () => {
            const {container} = render(
                <ButtonGroup>
                    <ButtonGroupItem>First</ButtonGroupItem>
                    <ButtonGroupItem>Middle</ButtonGroupItem>
                    <ButtonGroupItem>Last</ButtonGroupItem>
                </ButtonGroup>
            )

            const buttons = screen.getAllByRole('button')
            const lastButton = buttons.at(-1)

            expect(lastButton).toHaveClass('rounded-r-lg')
            expect(lastButton).not.toHaveClass('rounded-l-lg')
        })

        it('applies no rounded corners to middle buttons', () => {
            const {container} = render(
                <ButtonGroup>
                    <ButtonGroupItem>First</ButtonGroupItem>
                    <ButtonGroupItem>Middle</ButtonGroupItem>
                    <ButtonGroupItem>Last</ButtonGroupItem>
                </ButtonGroup>
            )

            const buttons = screen.getAllByRole('button')
            const middleButton = buttons.at(1)

            expect(middleButton).not.toHaveClass('rounded-l-lg')
            expect(middleButton).not.toHaveClass('rounded-r-lg')
        })

        it('applies full rounded corners when only one button', () => {
            render(
                <ButtonGroup>
                    <ButtonGroupItem>Only</ButtonGroupItem>
                </ButtonGroup>
            )

            const button = screen.getByRole('button')
            expect(button).toHaveClass('rounded-lg')
        })
    })

    describe('Variant prop - outline', () => {
        it('applies outline styles to all buttons', () => {
            render(
                <ButtonGroup variant="outline">
                    <ButtonGroupItem>First</ButtonGroupItem>
                    <ButtonGroupItem>Second</ButtonGroupItem>
                </ButtonGroup>
            )

            const buttons = screen.getAllByRole('button')
            buttons.forEach(button => {
                expect(button).toHaveClass('border-zinc-950/10')
            })
        })
    })

    describe('Variant prop - solid', () => {
        it('applies solid styles to all buttons', () => {
            render(
                <ButtonGroup variant="solid">
                    <ButtonGroupItem>First</ButtonGroupItem>
                    <ButtonGroupItem>Second</ButtonGroupItem>
                </ButtonGroup>
            )

            const buttons = screen.getAllByRole('button')
            buttons.forEach(button => {
                expect(button).toHaveClass('border-transparent')
            })
        })

        it('uses solid variant by default', () => {
            render(
                <ButtonGroup>
                    <ButtonGroupItem>First</ButtonGroupItem>
                </ButtonGroup>
            )

            const button = screen.getByRole('button')
            expect(button).toHaveClass('border-transparent')
        })
    })

    describe('Size prop', () => {
        it('applies small size styles', () => {
            const {container} = render(
                <ButtonGroup size="sm">
                    <ButtonGroupItem>Small</ButtonGroupItem>
                </ButtonGroup>
            )

            const button = screen.getByRole('button')
            expect(button).toHaveClass('px-2', 'py-1', 'text-xs')
        })

        it('applies medium size styles by default', () => {
            const {container} = render(
                <ButtonGroup>
                    <ButtonGroupItem>Medium</ButtonGroupItem>
                </ButtonGroup>
            )

            const button = screen.getByRole('button')
            expect(button).toHaveClass('px-3', 'py-1.5', 'text-sm')
        })

        it('applies large size styles', () => {
            const {container} = render(
                <ButtonGroup size="lg">
                    <ButtonGroupItem>Large</ButtonGroupItem>
                </ButtonGroup>
            )

            const button = screen.getByRole('button')
            expect(button).toHaveClass('px-4', 'py-2', 'text-base')
        })
    })

    describe('Individual button disabled state', () => {
        it('allows individual buttons to be disabled', () => {
            render(
                <ButtonGroup>
                    <ButtonGroupItem>Enabled</ButtonGroupItem>
                    <ButtonGroupItem disabled>Disabled</ButtonGroupItem>
                </ButtonGroup>
            )

            const buttons = screen.getAllByRole('button')
            const enabledButton = buttons.at(0)
            const disabledButton = buttons.at(1)

            expect(enabledButton).not.toBeDisabled()
            expect(disabledButton).toBeDisabled()
        })

        it('applies disabled styling to disabled button', () => {
            render(
                <ButtonGroup>
                    <ButtonGroupItem disabled>Disabled</ButtonGroupItem>
                </ButtonGroup>
            )

            const button = screen.getByRole('button')
            expect(button).toBeDisabled()
            expect(button).toHaveClass('data-disabled:opacity-50')
        })
    })

    describe('Icon support', () => {
        it('renders button with icon', () => {
            const TestIcon = () => <svg data-testid="test-icon"/>

            render(
                <ButtonGroup>
                    <ButtonGroupItem icon={<TestIcon/>}>With Icon</ButtonGroupItem>
                </ButtonGroup>
            )

            expect(screen.getByTestId('test-icon')).toBeInTheDocument()
            expect(screen.getByText('With Icon')).toBeInTheDocument()
        })

        it('renders button with icon only', () => {
            const TestIcon = () => <svg data-testid="test-icon"/>

            render(
                <ButtonGroup>
                    <ButtonGroupItem icon={<TestIcon/>} aria-label="Icon only"/>
                </ButtonGroup>
            )

            expect(screen.getByTestId('test-icon')).toBeInTheDocument()
            expect(screen.getByLabelText('Icon only')).toBeInTheDocument()
        })
    })

    describe('Custom className support', () => {
        it('applies custom className to individual button', () => {
            render(
                <ButtonGroup>
                    <ButtonGroupItem className="custom-button-class">Custom</ButtonGroupItem>
                </ButtonGroup>
            )

            const button = screen.getByRole('button')
            expect(button).toHaveClass('custom-button-class')
        })

        it('preserves base styles when custom className is applied', () => {
            render(
                <ButtonGroup>
                    <ButtonGroupItem className="custom-class">Button</ButtonGroupItem>
                </ButtonGroup>
            )

            const button = screen.getByRole('button')
            expect(button).toHaveClass('custom-class')
            expect(button).toHaveClass('relative')
            expect(button).toHaveClass('inline-flex')
        })
    })

    describe('Click handlers', () => {
        it('calls onClick when button is clicked', async () => {
            const user = userEvent.setup()
            const handleClick = vi.fn()

            render(
                <ButtonGroup>
                    <ButtonGroupItem onClick={handleClick}>Clickable</ButtonGroupItem>
                </ButtonGroup>
            )

            const button = screen.getByRole('button')
            await user.click(button)

            expect(handleClick).toHaveBeenCalledTimes(1)
        })

        it('does not call onClick when disabled button is clicked', async () => {
            const user = userEvent.setup()
            const handleClick = vi.fn()

            render(
                <ButtonGroup>
                    <ButtonGroupItem onClick={handleClick} disabled>Disabled</ButtonGroupItem>
                </ButtonGroup>
            )

            const button = screen.getByRole('button')
            await user.click(button)

            expect(handleClick).not.toHaveBeenCalled()
        })
    })

    describe('Accessibility', () => {
        it('has role="group" on container', () => {
            const {container} = render(
                <ButtonGroup>
                    <ButtonGroupItem>Button</ButtonGroupItem>
                </ButtonGroup>
            )

            const group = container.querySelector('[role="group"]')
            expect(group).toBeInTheDocument()
        })

        it('supports aria-label on container', () => {
            render(
                <ButtonGroup aria-label="Time period selector">
                    <ButtonGroupItem>Years</ButtonGroupItem>
                    <ButtonGroupItem>Months</ButtonGroupItem>
                </ButtonGroup>
            )

            expect(screen.getByLabelText('Time period selector')).toBeInTheDocument()
        })

        it('each button is keyboard accessible', () => {
            render(
                <ButtonGroup>
                    <ButtonGroupItem>Button 1</ButtonGroupItem>
                    <ButtonGroupItem>Button 2</ButtonGroupItem>
                </ButtonGroup>
            )

            const buttons = screen.getAllByRole('button')
            buttons.forEach(button => {
                expect(button).toHaveAttribute('type', 'button')
            })
        })
    })

    describe('Complete button group examples', () => {
        it('renders time period selector', () => {
            render(
                <ButtonGroup aria-label="Select time period">
                    <ButtonGroupItem>Years</ButtonGroupItem>
                    <ButtonGroupItem>Months</ButtonGroupItem>
                    <ButtonGroupItem>Days</ButtonGroupItem>
                </ButtonGroup>
            )

            expect(screen.getByText('Years')).toBeInTheDocument()
            expect(screen.getByText('Months')).toBeInTheDocument()
            expect(screen.getByText('Days')).toBeInTheDocument()
        })

        it('renders view switcher with icons', () => {
            const ListIcon = () => <svg data-testid="list-icon"/>
            const GridIcon = () => <svg data-testid="grid-icon"/>

            render(
                <ButtonGroup variant="outline" size="sm">
                    <ButtonGroupItem icon={<ListIcon/>} aria-label="List view"/>
                    <ButtonGroupItem icon={<GridIcon/>} aria-label="Grid view"/>
                </ButtonGroup>
            )

            expect(screen.getByTestId('list-icon')).toBeInTheDocument()
            expect(screen.getByTestId('grid-icon')).toBeInTheDocument()
        })

        it('renders pagination controls', () => {
            render(
                <ButtonGroup variant="outline">
                    <ButtonGroupItem>Previous</ButtonGroupItem>
                    <ButtonGroupItem>1</ButtonGroupItem>
                    <ButtonGroupItem>2</ButtonGroupItem>
                    <ButtonGroupItem>3</ButtonGroupItem>
                    <ButtonGroupItem>Next</ButtonGroupItem>
                </ButtonGroup>
            )

            expect(screen.getByText('Previous')).toBeInTheDocument()
            expect(screen.getByText('1')).toBeInTheDocument()
            expect(screen.getByText('2')).toBeInTheDocument()
            expect(screen.getByText('3')).toBeInTheDocument()
            expect(screen.getByText('Next')).toBeInTheDocument()
        })
    })
})
