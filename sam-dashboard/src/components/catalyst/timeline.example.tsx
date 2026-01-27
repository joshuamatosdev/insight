import React from 'react'
import { Timeline, TimelineItem } from './timeline'

// Example icons (would typically come from @heroicons/react)
const CheckIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg {...props} viewBox="0 0 20 20" fill="currentColor">
    <path
      fillRule="evenodd"
      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
      clipRule="evenodd"
    />
  </svg>
)

const DocumentIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg {...props} viewBox="0 0 20 20" fill="currentColor">
    <path
      fillRule="evenodd"
      d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z"
      clipRule="evenodd"
    />
  </svg>
)

const ClockIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg {...props} viewBox="0 0 20 20" fill="currentColor">
    <path
      fillRule="evenodd"
      d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
      clipRule="evenodd"
    />
  </svg>
)

export function BasicTimeline() {
  return (
    <Timeline>
      <TimelineItem icon={CheckIcon} date="Jan 15, 2026" status="completed">
        Contract signed
      </TimelineItem>
      <TimelineItem icon={DocumentIcon} date="Jan 20, 2026" status="current">
        Deliverable submitted
      </TimelineItem>
      <TimelineItem icon={ClockIcon} date="Feb 1, 2026" status="pending">
        Final review
      </TimelineItem>
    </Timeline>
  )
}

export function DetailedTimeline() {
  return (
    <Timeline>
      <TimelineItem status="completed" date="Jan 15, 2026" icon={CheckIcon}>
        <div>
          <h3 className="font-semibold text-sm">Contract signed</h3>
          <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1">
            All parties have signed the agreement. The contract is now active.
          </p>
        </div>
      </TimelineItem>
      <TimelineItem status="current" date="Jan 20, 2026" icon={DocumentIcon}>
        <div>
          <h3 className="font-semibold text-sm">Deliverable submitted</h3>
          <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1">
            Working on milestone 1. Expected completion by end of week.
          </p>
        </div>
      </TimelineItem>
      <TimelineItem status="pending" date="Feb 1, 2026" icon={ClockIcon}>
        <div>
          <h3 className="font-semibold text-sm">Final review</h3>
          <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1">
            Scheduled for next month. Awaiting preliminary results.
          </p>
        </div>
      </TimelineItem>
    </Timeline>
  )
}

export function SimpleTimeline() {
  return (
    <Timeline>
      <TimelineItem status="completed" date="Jan 15, 2026">
        Contract signed
      </TimelineItem>
      <TimelineItem status="current" date="Jan 20, 2026">
        Deliverable submitted
      </TimelineItem>
      <TimelineItem status="pending" date="Feb 1, 2026">
        Final review
      </TimelineItem>
    </Timeline>
  )
}

export function TimelineWithoutDates() {
  return (
    <Timeline>
      <TimelineItem status="completed" icon={CheckIcon}>
        First step completed
      </TimelineItem>
      <TimelineItem status="current" icon={DocumentIcon}>
        Currently working on this
      </TimelineItem>
      <TimelineItem status="pending" icon={ClockIcon}>
        Next step
      </TimelineItem>
    </Timeline>
  )
}
