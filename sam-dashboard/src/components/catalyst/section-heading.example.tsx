/**
 * SectionHeading Component Examples
 *
 * This file demonstrates various usage patterns for the SectionHeading component.
 * These examples are based on the Tailwind UI Section Headings patterns.
 */

import {
  SectionHeading,
  SectionHeadingTitle,
  SectionHeadingDescription,
  SectionHeadingActions,
} from './section-heading'
import { Button } from './button'

// =============================================================================
// Example 1: Simple section heading with border
// =============================================================================
export function SimpleHeading() {
  return (
    <SectionHeading>
      <SectionHeadingTitle>Job Postings</SectionHeadingTitle>
    </SectionHeading>
  )
}

// =============================================================================
// Example 2: Section heading with description
// =============================================================================
export function HeadingWithDescription() {
  return (
    <SectionHeading>
      <SectionHeadingTitle>Job Postings</SectionHeadingTitle>
      <SectionHeadingDescription>
        Workcation is a property rental website. Etiam ullamcorper massa viverra consequat,
        consectetur id nulla tempus. Fringilla egestas justo massa purus sagittis malesuada.
      </SectionHeadingDescription>
    </SectionHeading>
  )
}

// =============================================================================
// Example 3: Section heading with actions
// =============================================================================
export function HeadingWithActions() {
  return (
    <SectionHeading>
      <div className="sm:flex sm:items-center sm:justify-between">
        <SectionHeadingTitle>Job Postings</SectionHeadingTitle>
        <SectionHeadingActions>
          <Button outline>Share</Button>
          <Button color="primary">Create</Button>
        </SectionHeadingActions>
      </div>
    </SectionHeading>
  )
}

// =============================================================================
// Example 4: Section heading with single action
// =============================================================================
export function HeadingWithSingleAction() {
  return (
    <SectionHeading>
      <div className="sm:flex sm:items-center sm:justify-between">
        <SectionHeadingTitle>Job Postings</SectionHeadingTitle>
        <SectionHeadingActions>
          <Button color="primary">Create new job</Button>
        </SectionHeadingActions>
      </div>
    </SectionHeading>
  )
}

// =============================================================================
// Example 5: Section heading without border (for tabs integration)
// =============================================================================
export function HeadingWithoutBorder() {
  return (
    <SectionHeading border={false}>
      <SectionHeadingTitle>Candidates</SectionHeadingTitle>
    </SectionHeading>
  )
}

// =============================================================================
// Example 6: Section heading with custom h2 level
// =============================================================================
export function HeadingWithCustomLevel() {
  return (
    <SectionHeading>
      <SectionHeadingTitle level="h2">Main Section</SectionHeadingTitle>
      <SectionHeadingDescription>
        This heading uses h2 for semantic hierarchy.
      </SectionHeadingDescription>
    </SectionHeading>
  )
}

// =============================================================================
// Example 7: Complex section heading with actions and description
// =============================================================================
export function ComplexHeading() {
  return (
    <SectionHeading>
      <div className="sm:flex sm:items-start sm:justify-between">
        <div>
          <SectionHeadingTitle>Contract Opportunities</SectionHeadingTitle>
          <SectionHeadingDescription>
            Review and manage active opportunities across all government agencies.
            Filter by NAICS code, deadline, or contract value.
          </SectionHeadingDescription>
        </div>
        <SectionHeadingActions>
          <Button outline>Export</Button>
          <Button color="primary">Add Filter</Button>
        </SectionHeadingActions>
      </div>
    </SectionHeading>
  )
}

// =============================================================================
// Example 8: Subsection heading (h4 level)
// =============================================================================
export function SubsectionHeading() {
  return (
    <SectionHeading>
      <SectionHeadingTitle level="h4">Subsection Details</SectionHeadingTitle>
    </SectionHeading>
  )
}
