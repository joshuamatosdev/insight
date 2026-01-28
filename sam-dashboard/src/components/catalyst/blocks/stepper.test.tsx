import {render, screen} from '@testing-library/react'
import {describe, expect, it} from 'vitest'
import {Step, Stepper} from './stepper'

describe('Stepper Component', () => {
    describe('Basic Rendering', () => {
        it('renders all steps', () => {
            render(
                <Stepper currentStep={1}>
                    <Step label="Account"/>
                    <Step label="Profile"/>
                    <Step label="Review"/>
                </Stepper>
            )

            expect(screen.getByText('Account')).toBeDefined()
            expect(screen.getByText('Profile')).toBeDefined()
            expect(screen.getByText('Review')).toBeDefined()
        })

        it('renders steps with descriptions', () => {
            render(
                <Stepper currentStep={1}>
                    <Step label="Account" description="Create your account"/>
                    <Step label="Profile" description="Complete your profile"/>
                    <Step label="Review" description="Review and submit"/>
                </Stepper>
            )

            expect(screen.getByText('Create your account')).toBeDefined()
            expect(screen.getByText('Complete your profile')).toBeDefined()
            expect(screen.getByText('Review and submit')).toBeDefined()
        })
    })

    describe('Step States', () => {
        it('highlights current step', () => {
            const {container} = render(
                <Stepper currentStep={2}>
                    <Step label="Account"/>
                    <Step label="Profile"/>
                    <Step label="Review"/>
                </Stepper>
            )

            const steps = container.querySelectorAll('[data-step]')
            const currentStep = steps[1] as HTMLElement
            const stepIndicator = currentStep.querySelector('[data-step-indicator]')

            expect(stepIndicator?.className).toContain('bg-primary')
        })

        it('shows completed steps with checkmark', () => {
            render(
                <Stepper currentStep={3}>
                    <Step label="Account"/>
                    <Step label="Profile"/>
                    <Step label="Review"/>
                </Stepper>
            )

            const checkIcons = screen.getAllByLabelText('Completed')
            expect(checkIcons.length).toBe(2) // Steps 1 and 2 are complete
        })

        it('shows pending steps as disabled', () => {
            const {container} = render(
                <Stepper currentStep={1}>
                    <Step label="Account"/>
                    <Step label="Profile"/>
                    <Step label="Review"/>
                </Stepper>
            )

            const steps = container.querySelectorAll('[data-step]')
            const pendingStep = steps[2] as HTMLElement
            const stepIndicator = pendingStep.querySelector('[data-step-indicator]')

            expect(stepIndicator?.className).toContain('bg-zinc-200')
        })

        it('applies correct state classes to first step when completed', () => {
            const {container} = render(
                <Stepper currentStep={2}>
                    <Step label="Account"/>
                    <Step label="Profile"/>
                </Stepper>
            )

            const steps = container.querySelectorAll('[data-step]')
            const completedStep = steps[0] as HTMLElement
            const stepIndicator = completedStep.querySelector('[data-step-indicator]')

            expect(stepIndicator?.className).toContain('bg-primary')
        })

        it('applies correct state classes to last step when pending', () => {
            const {container} = render(
                <Stepper currentStep={1}>
                    <Step label="Account"/>
                    <Step label="Profile"/>
                </Stepper>
            )

            const steps = container.querySelectorAll('[data-step]')
            const pendingStep = steps[1] as HTMLElement
            const stepIndicator = pendingStep.querySelector('[data-step-indicator]')

            expect(stepIndicator?.className).toContain('bg-zinc-200')
        })
    })

    describe('Orientation', () => {
        it('applies horizontal layout by default', () => {
            const {container} = render(
                <Stepper currentStep={1}>
                    <Step label="Account"/>
                    <Step label="Profile"/>
                </Stepper>
            )

            const stepper = container.querySelector('[data-stepper]')
            expect(stepper?.className).toContain('flex-row')
        })

        it('applies vertical layout when specified', () => {
            const {container} = render(
                <Stepper currentStep={1} orientation="vertical">
                    <Step label="Account"/>
                    <Step label="Profile"/>
                </Stepper>
            )

            const stepper = container.querySelector('[data-stepper]')
            expect(stepper?.className).toContain('flex-col')
        })

        it('renders connecting lines between steps in horizontal orientation', () => {
            const {container} = render(
                <Stepper currentStep={1} orientation="horizontal">
                    <Step label="Account"/>
                    <Step label="Profile"/>
                    <Step label="Review"/>
                </Stepper>
            )

            const connectors = container.querySelectorAll('[data-connector]')
            expect(connectors.length).toBe(2) // 2 connectors for 3 steps
        })

        it('renders connecting lines between steps in vertical orientation', () => {
            const {container} = render(
                <Stepper currentStep={1} orientation="vertical">
                    <Step label="Account"/>
                    <Step label="Profile"/>
                    <Step label="Review"/>
                </Stepper>
            )

            const connectors = container.querySelectorAll('[data-connector]')
            expect(connectors.length).toBe(2) // 2 connectors for 3 steps
        })

        it('does not render connector after last step', () => {
            const {container} = render(
                <Stepper currentStep={1} orientation="horizontal">
                    <Step label="Account"/>
                    <Step label="Profile"/>
                </Stepper>
            )

            const steps = container.querySelectorAll('[data-step]')
            const lastStep = steps[steps.length - 1] as HTMLElement
            const connector = lastStep.querySelector('[data-connector]')

            expect(connector).toBeNull()
        })
    })

    describe('Custom Styling', () => {
        it('supports custom className on Stepper', () => {
            const {container} = render(
                <Stepper currentStep={1} className="custom-stepper">
                    <Step label="Account"/>
                </Stepper>
            )

            const stepper = container.querySelector('[data-stepper]')
            expect(stepper?.className).toContain('custom-stepper')
        })

        it('supports custom className on Step', () => {
            const {container} = render(
                <Stepper currentStep={1}>
                    <Step label="Account" className="custom-step"/>
                </Stepper>
            )

            const step = container.querySelector('[data-step]')
            expect(step?.className).toContain('custom-step')
        })
    })

    describe('Edge Cases', () => {
        it('handles single step', () => {
            render(
                <Stepper currentStep={1}>
                    <Step label="Single"/>
                </Stepper>
            )

            expect(screen.getByText('Single')).toBeDefined()
        })

        it('handles currentStep of 0 by treating first step as current', () => {
            const {container} = render(
                <Stepper currentStep={0}>
                    <Step label="Account"/>
                    <Step label="Profile"/>
                </Stepper>
            )

            const steps = container.querySelectorAll('[data-step]')
            const firstStep = steps[0] as HTMLElement
            const stepIndicator = firstStep.querySelector('[data-step-indicator]')

            expect(stepIndicator?.className).toContain('bg-primary')
        })

        it('handles currentStep beyond total steps by showing all completed', () => {
            render(
                <Stepper currentStep={5}>
                    <Step label="Account"/>
                    <Step label="Profile"/>
                </Stepper>
            )

            const checkIcons = screen.getAllByLabelText('Completed')
            expect(checkIcons.length).toBe(2) // Both steps complete
        })

        it('renders without descriptions', () => {
            render(
                <Stepper currentStep={1}>
                    <Step label="Account"/>
                    <Step label="Profile"/>
                </Stepper>
            )

            expect(screen.getByText('Account')).toBeDefined()
            expect(screen.getByText('Profile')).toBeDefined()
        })
    })

    describe('Accessibility', () => {
        it('uses nav element with aria-label', () => {
            const {container} = render(
                <Stepper currentStep={1}>
                    <Step label="Account"/>
                    <Step label="Profile"/>
                </Stepper>
            )

            const nav = container.querySelector('nav')
            expect(nav).toBeDefined()
            expect(nav?.getAttribute('aria-label')).toBe('Progress')
        })

        it('marks current step with aria-current', () => {
            const {container} = render(
                <Stepper currentStep={2}>
                    <Step label="Account"/>
                    <Step label="Profile"/>
                    <Step label="Review"/>
                </Stepper>
            )

            const steps = container.querySelectorAll('[data-step]')
            const currentStep = steps[1] as HTMLElement

            expect(currentStep.getAttribute('aria-current')).toBe('step')
        })

        it('does not mark non-current steps with aria-current', () => {
            const {container} = render(
                <Stepper currentStep={2}>
                    <Step label="Account"/>
                    <Step label="Profile"/>
                    <Step label="Review"/>
                </Stepper>
            )

            const steps = container.querySelectorAll('[data-step]')
            const firstStep = steps[0] as HTMLElement
            const lastStep = steps[2] as HTMLElement

            expect(firstStep.getAttribute('aria-current')).toBeNull()
            expect(lastStep.getAttribute('aria-current')).toBeNull()
        })

        it('provides accessible label for completed checkmark', () => {
            render(
                <Stepper currentStep={2}>
                    <Step label="Account"/>
                    <Step label="Profile"/>
                </Stepper>
            )

            const checkIcon = screen.getByLabelText('Completed')
            expect(checkIcon).toBeDefined()
        })
    })

    describe('Props Spreading', () => {
        it('spreads additional props to Stepper', () => {
            const {container} = render(
                <Stepper currentStep={1} data-testid="test-stepper">
                    <Step label="Account"/>
                </Stepper>
            )

            const stepper = container.querySelector('[data-testid="test-stepper"]')
            expect(stepper).toBeDefined()
        })

        it('spreads additional props to Step', () => {
            const {container} = render(
                <Stepper currentStep={1}>
                    <Step label="Account" data-testid="test-step"/>
                </Stepper>
            )

            const step = container.querySelector('[data-testid="test-step"]')
            expect(step).toBeDefined()
        })
    })
})
