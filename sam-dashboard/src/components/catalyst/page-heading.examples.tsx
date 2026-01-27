/**
 * PageHeading Component Examples
 *
 * This file demonstrates various usage patterns for the PageHeading component family.
 * NOT imported in production - for documentation purposes only.
 */

import {
  PageHeading,
  PageHeadingTitle,
  PageHeadingDescription,
  PageHeadingActions,
  PageHeadingMeta,
  PageHeadingMetaItem,
  PageHeadingSection,
} from './page-heading'
import { Button } from './button'
import { Badge } from './badge'

// Example icons (in real usage, import from @heroicons/react/20/solid)
const BriefcaseIcon = (props: React.ComponentPropsWithoutRef<'svg'>) => (
  <svg {...props} />
)
const MapPinIcon = (props: React.ComponentPropsWithoutRef<'svg'>) => (
  <svg {...props} />
)
const CalendarIcon = (props: React.ComponentPropsWithoutRef<'svg'>) => (
  <svg {...props} />
)
const CurrencyDollarIcon = (props: React.ComponentPropsWithoutRef<'svg'>) => (
  <svg {...props} />
)

/**
 * Example 1: Basic page heading with title only
 */
export function BasicPageHeading() {
  return (
    <PageHeading>
      <PageHeadingSection>
        <PageHeadingTitle>Contract Details</PageHeadingTitle>
      </PageHeadingSection>
    </PageHeading>
  )
}

/**
 * Example 2: Page heading with title and description
 */
export function PageHeadingWithDescription() {
  return (
    <PageHeading>
      <PageHeadingSection>
        <PageHeadingTitle>Contract ABC-123-456</PageHeadingTitle>
        <PageHeadingDescription>
          Federal IT services contract with the Department of Defense
        </PageHeadingDescription>
      </PageHeadingSection>
    </PageHeading>
  )
}

/**
 * Example 3: Page heading with action buttons
 */
export function PageHeadingWithActions() {
  return (
    <PageHeading>
      <PageHeadingSection>
        <PageHeadingTitle>Contract ABC-123-456</PageHeadingTitle>
        <PageHeadingDescription>
          Federal IT services contract with the Department of Defense
        </PageHeadingDescription>
      </PageHeadingSection>
      <PageHeadingActions>
        <Button outline>Edit</Button>
        <Button color="indigo">Save Changes</Button>
      </PageHeadingActions>
    </PageHeading>
  )
}

/**
 * Example 4: Page heading with metadata items (no icons)
 */
export function PageHeadingWithSimpleMeta() {
  return (
    <PageHeading>
      <PageHeadingSection>
        <PageHeadingTitle>Opportunity: Cloud Migration Services</PageHeadingTitle>
        <PageHeadingMeta>
          <PageHeadingMetaItem>Status: Active</PageHeadingMetaItem>
          <PageHeadingMetaItem>Value: $2.5M</PageHeadingMetaItem>
          <PageHeadingMetaItem>Due: January 30, 2026</PageHeadingMetaItem>
        </PageHeadingMeta>
      </PageHeadingSection>
    </PageHeading>
  )
}

/**
 * Example 5: Page heading with metadata items with icons
 */
export function PageHeadingWithIconMeta() {
  return (
    <PageHeading>
      <PageHeadingSection>
        <PageHeadingTitle>Back End Developer</PageHeadingTitle>
        <PageHeadingMeta>
          <PageHeadingMetaItem icon={BriefcaseIcon}>
            Full-time
          </PageHeadingMetaItem>
          <PageHeadingMetaItem icon={MapPinIcon}>
            Remote
          </PageHeadingMetaItem>
          <PageHeadingMetaItem icon={CurrencyDollarIcon}>
            $120k – $140k
          </PageHeadingMetaItem>
          <PageHeadingMetaItem icon={CalendarIcon}>
            Closing on January 9, 2026
          </PageHeadingMetaItem>
        </PageHeadingMeta>
      </PageHeadingSection>
    </PageHeading>
  )
}

/**
 * Example 6: Complete page heading with all features
 */
export function CompletePageHeading() {
  return (
    <PageHeading>
      <PageHeadingSection>
        <PageHeadingTitle>Contract: Cloud Infrastructure Modernization</PageHeadingTitle>
        <PageHeadingDescription>
          Multi-year contract for cloud migration and infrastructure modernization
          services for federal agencies
        </PageHeadingDescription>
        <PageHeadingMeta>
          <PageHeadingMetaItem icon={BriefcaseIcon}>
            Prime Contract
          </PageHeadingMetaItem>
          <PageHeadingMetaItem icon={CurrencyDollarIcon}>
            $5.2M Base + $2.1M Options
          </PageHeadingMetaItem>
          <PageHeadingMetaItem icon={CalendarIcon}>
            Performance Period: Jan 2026 - Dec 2028
          </PageHeadingMetaItem>
        </PageHeadingMeta>
      </PageHeadingSection>
      <PageHeadingActions>
        <Button outline>Export PDF</Button>
        <Button outline>View Timeline</Button>
        <Button color="indigo">Edit Contract</Button>
      </PageHeadingActions>
    </PageHeading>
  )
}

/**
 * Example 7: Page heading with badges in metadata
 */
export function PageHeadingWithBadges() {
  return (
    <PageHeading>
      <PageHeadingSection>
        <PageHeadingTitle>Pipeline: Q1 2026 Opportunities</PageHeadingTitle>
        <PageHeadingDescription>
          Active opportunities being tracked for first quarter submissions
        </PageHeadingDescription>
        <PageHeadingMeta>
          <div className="mt-2 flex items-center gap-2">
            <Badge color="green">12 Active</Badge>
            <Badge color="yellow">5 Under Review</Badge>
            <Badge color="zinc">3 Archived</Badge>
          </div>
        </PageHeadingMeta>
      </PageHeadingSection>
      <PageHeadingActions>
        <Button outline>Filter</Button>
        <Button color="indigo">Add Opportunity</Button>
      </PageHeadingActions>
    </PageHeading>
  )
}

/**
 * Example 8: Minimal page heading (title + single action)
 */
export function MinimalPageHeading() {
  return (
    <PageHeading>
      <PageHeadingSection>
        <PageHeadingTitle>Settings</PageHeadingTitle>
      </PageHeadingSection>
      <PageHeadingActions>
        <Button color="indigo">Save</Button>
      </PageHeadingActions>
    </PageHeading>
  )
}

/**
 * Example 9: Page heading without PageHeadingSection wrapper
 * (Alternative simpler structure for basic cases)
 */
export function SimpleStructurePageHeading() {
  return (
    <PageHeading>
      <div className="min-w-0 flex-1">
        <PageHeadingTitle>Contracts List</PageHeadingTitle>
        <PageHeadingDescription>
          View all active and completed contracts
        </PageHeadingDescription>
      </div>
      <PageHeadingActions>
        <Button color="indigo">New Contract</Button>
      </PageHeadingActions>
    </PageHeading>
  )
}

/**
 * Example 10: Page heading with multiple action groups
 */
export function PageHeadingMultipleActionGroups() {
  return (
    <PageHeading>
      <PageHeadingSection>
        <PageHeadingTitle>Contract Deliverables</PageHeadingTitle>
        <PageHeadingDescription>
          Track and manage contract deliverables and milestones
        </PageHeadingDescription>
      </PageHeadingSection>
      <PageHeadingActions>
        <div className="flex gap-2">
          <Button outline>Export</Button>
          <Button outline>Print</Button>
        </div>
        <Button color="indigo">Add Deliverable</Button>
      </PageHeadingActions>
    </PageHeading>
  )
}
