/**
 * Progress Component Examples
 *
 * This file demonstrates the usage of the Progress component from Catalyst UI.
 * It is not imported anywhere and serves as documentation.
 */

import { Progress, ProgressWithLabel } from './progress'

export function ProgressExamples() {
  return (
    <div className="space-y-8 p-8">
      {/* Basic Progress Bar */}
      <div>
        <h3 className="mb-2 text-sm font-medium text-zinc-900 dark:text-white">Basic Progress</h3>
        <Progress value={50} max={100} />
      </div>

      {/* Different Colors */}
      <div>
        <h3 className="mb-2 text-sm font-medium text-zinc-900 dark:text-white">Color Variants</h3>
        <div className="space-y-3">
          <Progress value={75} color="blue" />
          <Progress value={75} color="indigo" />
          <Progress value={75} color="green" />
          <Progress value={75} color="emerald" />
          <Progress value={75} color="red" />
          <Progress value={75} color="yellow" />
          <Progress value={75} color="zinc" />
        </div>
      </div>

      {/* Different Sizes */}
      <div>
        <h3 className="mb-2 text-sm font-medium text-zinc-900 dark:text-white">Size Variants</h3>
        <div className="space-y-3">
          <Progress value={60} size="xs" />
          <Progress value={60} size="sm" />
          <Progress value={60} size="md" />
          <Progress value={60} size="lg" />
          <Progress value={60} size="xl" />
        </div>
      </div>

      {/* With Label */}
      <div>
        <h3 className="mb-4 text-sm font-medium text-zinc-900 dark:text-white">With Label</h3>
        <ProgressWithLabel value={45} label="Uploading files..." />
      </div>

      {/* With Label and Percentage */}
      <div>
        <h3 className="mb-4 text-sm font-medium text-zinc-900 dark:text-white">With Label and Value</h3>
        <ProgressWithLabel value={67} label="Processing documents..." showValue={true} />
      </div>

      {/* Indeterminate State */}
      <div>
        <h3 className="mb-4 text-sm font-medium text-zinc-900 dark:text-white">Indeterminate (Loading)</h3>
        <ProgressWithLabel label="Loading..." />
      </div>

      {/* Realistic Use Cases */}
      <div>
        <h3 className="mb-4 text-sm font-medium text-zinc-900 dark:text-white">Realistic Examples</h3>
        <div className="space-y-4">
          {/* File Upload */}
          <ProgressWithLabel value={33} max={100} label="Uploading contract.pdf" showValue={true} color="blue" />

          {/* Processing */}
          <ProgressWithLabel
            value={80}
            max={100}
            label="Analyzing SAM.gov opportunities"
            showValue={true}
            color="indigo"
          />

          {/* Budget Usage */}
          <ProgressWithLabel value={85} max={100} label="Budget utilization" showValue={true} color="yellow" />

          {/* Task Completion */}
          <ProgressWithLabel
            value={12}
            max={15}
            label="Deliverables completed"
            showValue={true}
            color="green"
          />

          {/* Critical Alert */}
          <ProgressWithLabel value={95} max={100} label="Storage usage (critical)" showValue={true} color="red" />
        </div>
      </div>

      {/* Different Max Values */}
      <div>
        <h3 className="mb-4 text-sm font-medium text-zinc-900 dark:text-white">Custom Max Values</h3>
        <div className="space-y-4">
          <ProgressWithLabel value={3} max={5} label="Steps completed" showValue={true} />
          <ProgressWithLabel value={7} max={10} label="Tasks remaining" showValue={true} />
          <ProgressWithLabel value={250} max={500} label="Pages processed" showValue={true} />
        </div>
      </div>
    </div>
  )
}

/**
 * Usage Examples (Code)
 */

// Simple progress bar
// <Progress value={50} max={100} />

// With color
// <Progress value={75} max={100} color="green" />

// With size
// <Progress value={60} max={100} size="lg" />

// With label and percentage
// <ProgressWithLabel
//   value={67}
//   max={100}
//   label="Processing..."
//   showValue={true}
//   color="indigo"
// />

// Indeterminate state (loading)
// <Progress />
// or
// <ProgressWithLabel label="Loading..." />

// Custom max value
// <ProgressWithLabel
//   value={3}
//   max={5}
//   label="Steps completed"
//   showValue={true}
// />
