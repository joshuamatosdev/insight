import { InformationCircleIcon, TrashIcon } from '@heroicons/react/24/outline'
import { Button } from './button'
import { Tooltip } from './tooltip'

export function TooltipExamples() {
  return (
    <div className="space-y-12 p-8">
      <section>
        <h2 className="text-lg font-semibold mb-4">Basic Tooltip</h2>
        <div className="flex gap-4">
          <Tooltip content="Delete this item">
            <Button color="red">
              <TrashIcon className="size-4" />
              Delete
            </Button>
          </Tooltip>
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold mb-4">Tooltip Positions</h2>
        <div className="flex justify-center items-center gap-16 min-h-[200px]">
          <Tooltip content="Positioned top" position="top">
            <Button outline>Top</Button>
          </Tooltip>

          <Tooltip content="Positioned right" position="right">
            <Button outline>Right</Button>
          </Tooltip>

          <Tooltip content="Positioned bottom" position="bottom">
            <Button outline>Bottom</Button>
          </Tooltip>

          <Tooltip content="Positioned left" position="left">
            <Button outline>Left</Button>
          </Tooltip>
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold mb-4">Icon Tooltip</h2>
        <div className="flex gap-4 items-center">
          <p>Hover over the icon for more information</p>
          <Tooltip content="This provides helpful context">
            <InformationCircleIcon className="size-5 text-zinc-500 dark:text-zinc-400 cursor-help" />
          </Tooltip>
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold mb-4">Delayed Tooltip</h2>
        <div className="flex gap-4">
          <Tooltip content="Appears after 500ms" delay={500}>
            <Button plain>Hover (500ms delay)</Button>
          </Tooltip>

          <Tooltip content="Appears after 1000ms" delay={1000}>
            <Button plain>Hover (1000ms delay)</Button>
          </Tooltip>
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold mb-4">Long Content</h2>
        <div className="flex gap-4">
          <Tooltip content="This is a longer tooltip with more detailed information about the action">
            <Button>Action</Button>
          </Tooltip>
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold mb-4">Keyboard Accessible</h2>
        <div className="flex gap-4">
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            Tab to focus buttons and see tooltips appear
          </p>
          <Tooltip content="Press Enter to activate">
            <Button>First</Button>
          </Tooltip>
          <Tooltip content="Use Tab to navigate">
            <Button>Second</Button>
          </Tooltip>
          <Tooltip content="Keyboard friendly">
            <Button>Third</Button>
          </Tooltip>
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold mb-4">Custom Styling</h2>
        <div className="flex gap-4">
          <Tooltip content="Custom styled tooltip" className="!bg-blue-600 !text-white">
            <Button color="blue">Custom Color</Button>
          </Tooltip>
        </div>
      </section>
    </div>
  )
}
