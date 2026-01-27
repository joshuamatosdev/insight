import { ChevronLeftIcon, ChevronRightIcon, ListBulletIcon, Squares2X2Icon } from '@heroicons/react/20/solid'
import { ButtonGroup, ButtonGroupItem } from './button-group'

export function ButtonGroupExamples() {
  return (
    <div className="space-y-8 p-8">
      {/* Basic time period selector */}
      <div>
        <h3 className="mb-4 text-sm font-semibold text-gray-900 dark:text-white">
          Time Period Selector
        </h3>
        <ButtonGroup aria-label="Select time period">
          <ButtonGroupItem>Years</ButtonGroupItem>
          <ButtonGroupItem>Months</ButtonGroupItem>
          <ButtonGroupItem>Days</ButtonGroupItem>
        </ButtonGroup>
      </div>

      {/* Outline variant */}
      <div>
        <h3 className="mb-4 text-sm font-semibold text-gray-900 dark:text-white">
          Outline Variant
        </h3>
        <ButtonGroup variant="outline" aria-label="Select chart type">
          <ButtonGroupItem>Line</ButtonGroupItem>
          <ButtonGroupItem>Bar</ButtonGroupItem>
          <ButtonGroupItem>Pie</ButtonGroupItem>
        </ButtonGroup>
      </div>

      {/* Small size */}
      <div>
        <h3 className="mb-4 text-sm font-semibold text-gray-900 dark:text-white">
          Small Size
        </h3>
        <ButtonGroup size="sm" aria-label="Select view">
          <ButtonGroupItem>All</ButtonGroupItem>
          <ButtonGroupItem>Active</ButtonGroupItem>
          <ButtonGroupItem>Archived</ButtonGroupItem>
        </ButtonGroup>
      </div>

      {/* Large size */}
      <div>
        <h3 className="mb-4 text-sm font-semibold text-gray-900 dark:text-white">
          Large Size
        </h3>
        <ButtonGroup size="lg" aria-label="Select status">
          <ButtonGroupItem>Draft</ButtonGroupItem>
          <ButtonGroupItem>Published</ButtonGroupItem>
          <ButtonGroupItem>Scheduled</ButtonGroupItem>
        </ButtonGroup>
      </div>

      {/* With icons */}
      <div>
        <h3 className="mb-4 text-sm font-semibold text-gray-900 dark:text-white">
          View Switcher with Icons
        </h3>
        <ButtonGroup variant="outline" size="sm">
          <ButtonGroupItem icon={<ListBulletIcon className="size-4" />} aria-label="List view" />
          <ButtonGroupItem icon={<Squares2X2Icon className="size-4" />} aria-label="Grid view" />
        </ButtonGroup>
      </div>

      {/* Pagination */}
      <div>
        <h3 className="mb-4 text-sm font-semibold text-gray-900 dark:text-white">
          Pagination
        </h3>
        <ButtonGroup variant="outline">
          <ButtonGroupItem icon={<ChevronLeftIcon className="size-4" />}>Previous</ButtonGroupItem>
          <ButtonGroupItem>1</ButtonGroupItem>
          <ButtonGroupItem>2</ButtonGroupItem>
          <ButtonGroupItem>3</ButtonGroupItem>
          <ButtonGroupItem icon={<ChevronRightIcon className="size-4" />}>Next</ButtonGroupItem>
        </ButtonGroup>
      </div>

      {/* With disabled button */}
      <div>
        <h3 className="mb-4 text-sm font-semibold text-gray-900 dark:text-white">
          With Disabled Button
        </h3>
        <ButtonGroup aria-label="Select option">
          <ButtonGroupItem>Option 1</ButtonGroupItem>
          <ButtonGroupItem disabled>Option 2 (disabled)</ButtonGroupItem>
          <ButtonGroupItem>Option 3</ButtonGroupItem>
        </ButtonGroup>
      </div>

      {/* Single button */}
      <div>
        <h3 className="mb-4 text-sm font-semibold text-gray-900 dark:text-white">
          Single Button
        </h3>
        <ButtonGroup>
          <ButtonGroupItem>Only Button</ButtonGroupItem>
        </ButtonGroup>
      </div>

      {/* With click handlers */}
      <div>
        <h3 className="mb-4 text-sm font-semibold text-gray-900 dark:text-white">
          Interactive
        </h3>
        <ButtonGroup variant="outline">
          <ButtonGroupItem onClick={() => console.log('Clicked: All')}>All</ButtonGroupItem>
          <ButtonGroupItem onClick={() => console.log('Clicked: Active')}>Active</ButtonGroupItem>
          <ButtonGroupItem onClick={() => console.log('Clicked: Completed')}>Completed</ButtonGroupItem>
        </ButtonGroup>
      </div>
    </div>
  )
}
