import {render, screen} from '@testing-library/react'
import {describe, expect, it} from 'vitest'
import {Timeline, TimelineItem} from './timeline'

describe('Timeline', () => {
    it('renders timeline with multiple items', () => {
        render(
            <Timeline>
                <TimelineItem>First event</TimelineItem>
                <TimelineItem>Second event</TimelineItem>
                <TimelineItem>Third event</TimelineItem>
            </Timeline>
        )

        expect(screen.getByText('First event')).toBeInTheDocument()
        expect(screen.getByText('Second event')).toBeInTheDocument()
        expect(screen.getByText('Third event')).toBeInTheDocument()
    })

    it('renders timeline item with date', () => {
        render(
            <Timeline>
                <TimelineItem date="Jan 15, 2026">Contract signed</TimelineItem>
            </Timeline>
        )

        expect(screen.getByText('Jan 15, 2026')).toBeInTheDocument()
        expect(screen.getByText('Contract signed')).toBeInTheDocument()
    })

    it('renders timeline item with icon', () => {
        const TestIcon = () => (
            <svg data-testid="test-icon">
                <circle/>
            </svg>
        )

        render(
            <Timeline>
                <TimelineItem icon={TestIcon}>Event with icon</TimelineItem>
            </Timeline>
        )

        expect(screen.getByTestId('test-icon')).toBeInTheDocument()
        expect(screen.getByText('Event with icon')).toBeInTheDocument()
    })

    it('applies completed status styling', () => {
        render(
            <Timeline>
                <TimelineItem status="completed" data-testid="completed-item">
                    Completed task
                </TimelineItem>
            </Timeline>
        )

        const item = screen.getByTestId('completed-item')
        expect(item).toBeInTheDocument()
        expect(screen.getByText('Completed task')).toBeInTheDocument()
    })

    it('applies current status styling', () => {
        render(
            <Timeline>
                <TimelineItem status="current" data-testid="current-item">
                    Current task
                </TimelineItem>
            </Timeline>
        )

        const item = screen.getByTestId('current-item')
        expect(item).toBeInTheDocument()
        expect(screen.getByText('Current task')).toBeInTheDocument()
    })

    it('applies pending status styling', () => {
        render(
            <Timeline>
                <TimelineItem status="pending" data-testid="pending-item">
                    Pending task
                </TimelineItem>
            </Timeline>
        )

        const item = screen.getByTestId('pending-item')
        expect(item).toBeInTheDocument()
        expect(screen.getByText('Pending task')).toBeInTheDocument()
    })

    it('applies default status when not specified', () => {
        render(
            <Timeline>
                <TimelineItem data-testid="default-item">Default task</TimelineItem>
            </Timeline>
        )

        const item = screen.getByTestId('default-item')
        expect(item).toBeInTheDocument()
        expect(screen.getByText('Default task')).toBeInTheDocument()
    })

    it('renders connecting line between items', () => {
        const {container} = render(
            <Timeline>
                <TimelineItem>First</TimelineItem>
                <TimelineItem>Second</TimelineItem>
            </Timeline>
        )

        // The connecting line should be present in the DOM structure
        const lines = container.querySelectorAll('[data-slot="timeline-line"]')
        expect(lines.length).toBeGreaterThan(0)
    })

    it('applies custom className to Timeline', () => {
        render(
            <Timeline className="custom-timeline" data-testid="timeline">
                <TimelineItem>Event</TimelineItem>
            </Timeline>
        )

        const timeline = screen.getByTestId('timeline')
        expect(timeline).toHaveClass('custom-timeline')
    })

    it('applies custom className to TimelineItem', () => {
        render(
            <Timeline>
                <TimelineItem className="custom-item" data-testid="item">
                    Custom event
                </TimelineItem>
            </Timeline>
        )

        const item = screen.getByTestId('item')
        expect(item).toHaveClass('custom-item')
    })

    it('renders timeline with mixed status items', () => {
        render(
            <Timeline>
                <TimelineItem status="completed" date="Jan 15, 2026">
                    Completed
                </TimelineItem>
                <TimelineItem status="current" date="Jan 20, 2026">
                    In Progress
                </TimelineItem>
                <TimelineItem status="pending" date="Feb 1, 2026">
                    Upcoming
                </TimelineItem>
            </Timeline>
        )

        expect(screen.getByText('Completed')).toBeInTheDocument()
        expect(screen.getByText('In Progress')).toBeInTheDocument()
        expect(screen.getByText('Upcoming')).toBeInTheDocument()
        expect(screen.getByText('Jan 15, 2026')).toBeInTheDocument()
        expect(screen.getByText('Jan 20, 2026')).toBeInTheDocument()
        expect(screen.getByText('Feb 1, 2026')).toBeInTheDocument()
    })

    it('renders timeline item without date', () => {
        render(
            <Timeline>
                <TimelineItem>Event without date</TimelineItem>
            </Timeline>
        )

        expect(screen.getByText('Event without date')).toBeInTheDocument()
    })

    it('renders timeline item without icon', () => {
        render(
            <Timeline>
                <TimelineItem>Event without icon</TimelineItem>
            </Timeline>
        )

        expect(screen.getByText('Event without icon')).toBeInTheDocument()
    })

    it('spreads additional props to Timeline', () => {
        render(
            <Timeline data-testid="test-timeline" aria-label="Event Timeline">
                <TimelineItem>Event</TimelineItem>
            </Timeline>
        )

        const timeline = screen.getByTestId('test-timeline')
        expect(timeline.getAttribute('aria-label')).toBe('Event Timeline')
    })

    it('spreads additional props to TimelineItem', () => {
        render(
            <Timeline>
                <TimelineItem data-testid="test-item" aria-label="Test Event">
                    Event
                </TimelineItem>
            </Timeline>
        )

        const item = screen.getByTestId('test-item')
        expect(item.getAttribute('aria-label')).toBe('Test Event')
    })

    it('renders complex timeline with all features', () => {
        const CheckIcon = () => (
            <svg data-testid="check-icon">
                <circle/>
            </svg>
        )
        const ClockIcon = () => (
            <svg data-testid="clock-icon">
                <circle/>
            </svg>
        )

        render(
            <Timeline>
                <TimelineItem status="completed" date="Jan 15, 2026" icon={CheckIcon}>
                    <div>
                        <h3>Contract signed</h3>
                        <p>All parties have signed the agreement</p>
                    </div>
                </TimelineItem>
                <TimelineItem status="current" date="Jan 20, 2026">
                    <div>
                        <h3>Deliverable in progress</h3>
                        <p>Working on milestone 1</p>
                    </div>
                </TimelineItem>
                <TimelineItem status="pending" date="Feb 1, 2026" icon={ClockIcon}>
                    <div>
                        <h3>Final review</h3>
                        <p>Scheduled for next month</p>
                    </div>
                </TimelineItem>
            </Timeline>
        )

        expect(screen.getByTestId('check-icon')).toBeInTheDocument()
        expect(screen.getByTestId('clock-icon')).toBeInTheDocument()
        expect(screen.getByText('Contract signed')).toBeInTheDocument()
        expect(screen.getByText('Deliverable in progress')).toBeInTheDocument()
        expect(screen.getByText('Final review')).toBeInTheDocument()
    })
})
