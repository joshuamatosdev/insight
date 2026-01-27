import { useState } from 'react'
import { Button } from './button'
import { Drawer, DrawerBody, DrawerFooter, DrawerHeader } from './drawer'

export function DrawerExample() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <Button onClick={() => setOpen(true)}>Open Drawer</Button>
      <Drawer open={open} onClose={setOpen} position="right">
        <DrawerHeader>Settings</DrawerHeader>
        <DrawerBody>
          <p>Drawer content goes here.</p>
          <p>This is a slide-out panel for additional content or actions.</p>
        </DrawerBody>
        <DrawerFooter>
          <Button onClick={() => setOpen(false)}>Close</Button>
        </DrawerFooter>
      </Drawer>
    </>
  )
}

export function DrawerLeftExample() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <Button onClick={() => setOpen(true)}>Open Left Drawer</Button>
      <Drawer open={open} onClose={setOpen} position="left" size="sm">
        <DrawerHeader>Navigation</DrawerHeader>
        <DrawerBody>
          <nav>
            <ul className="space-y-2">
              <li>
                <a href="#" className="block px-4 py-2 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800">
                  Dashboard
                </a>
              </li>
              <li>
                <a href="#" className="block px-4 py-2 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800">
                  Settings
                </a>
              </li>
              <li>
                <a href="#" className="block px-4 py-2 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800">
                  Profile
                </a>
              </li>
            </ul>
          </nav>
        </DrawerBody>
      </Drawer>
    </>
  )
}

export function DrawerLargeExample() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <Button onClick={() => setOpen(true)}>Open Large Drawer</Button>
      <Drawer open={open} onClose={setOpen} position="right" size="xl">
        <DrawerHeader>Details Panel</DrawerHeader>
        <DrawerBody>
          <div className="space-y-4">
            <section>
              <h3 className="font-semibold text-zinc-900 dark:text-white mb-2">Overview</h3>
              <p className="text-zinc-600 dark:text-zinc-400">
                This is a larger drawer that can accommodate more detailed content and complex layouts.
              </p>
            </section>
            <section>
              <h3 className="font-semibold text-zinc-900 dark:text-white mb-2">Features</h3>
              <ul className="list-disc list-inside text-zinc-600 dark:text-zinc-400 space-y-1">
                <li>Slide-in animation from right or left</li>
                <li>Multiple size options (sm, md, lg, xl, 2xl)</li>
                <li>Backdrop with blur effect</li>
                <li>Keyboard accessible (ESC to close)</li>
                <li>Dark mode support</li>
              </ul>
            </section>
          </div>
        </DrawerBody>
        <DrawerFooter>
          <Button outline onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={() => setOpen(false)}>Save Changes</Button>
        </DrawerFooter>
      </Drawer>
    </>
  )
}
