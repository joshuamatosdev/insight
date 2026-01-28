import {render, screen} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {describe, expect, it, vi} from 'vitest'
import {Tab, TabList, TabPanel, TabPanels, Tabs} from './tabs'

describe('Tabs', () => {
  it('renders tabs with correct initial selection', () => {
    render(
      <Tabs defaultIndex={0}>
        <TabList>
          <Tab index={0}>Tab 1</Tab>
          <Tab index={1}>Tab 2</Tab>
          <Tab index={2}>Tab 3</Tab>
        </TabList>
        <TabPanels>
          <TabPanel index={0}>Panel 1</TabPanel>
          <TabPanel index={1}>Panel 2</TabPanel>
          <TabPanel index={2}>Panel 3</TabPanel>
        </TabPanels>
      </Tabs>
    )

    expect(screen.getByRole('tab', { name: 'Tab 1' })).toHaveAttribute('aria-selected', 'true')
    expect(screen.getByRole('tab', { name: 'Tab 2' })).toHaveAttribute('aria-selected', 'false')
    expect(screen.getByText('Panel 1')).toBeInTheDocument()
    expect(screen.queryByText('Panel 2')).not.toBeInTheDocument()
  })

  it('switches tabs when clicked', async () => {
    const user = userEvent.setup()

    render(
      <Tabs>
        <TabList>
          <Tab index={0}>Tab 1</Tab>
          <Tab index={1}>Tab 2</Tab>
        </TabList>
        <TabPanels>
          <TabPanel index={0}>Panel 1</TabPanel>
          <TabPanel index={1}>Panel 2</TabPanel>
        </TabPanels>
      </Tabs>
    )

    await user.click(screen.getByRole('tab', { name: 'Tab 2' }))

    expect(screen.getByRole('tab', { name: 'Tab 2' })).toHaveAttribute('aria-selected', 'true')
    expect(screen.getByText('Panel 2')).toBeInTheDocument()
    expect(screen.queryByText('Panel 1')).not.toBeInTheDocument()
  })

  it('supports controlled mode', async () => {
    const user = userEvent.setup()
    const handleChange = vi.fn()

    const { rerender } = render(
      <Tabs selectedIndex={0} onChange={handleChange}>
        <TabList>
          <Tab index={0}>Tab 1</Tab>
          <Tab index={1}>Tab 2</Tab>
        </TabList>
        <TabPanels>
          <TabPanel index={0}>Panel 1</TabPanel>
          <TabPanel index={1}>Panel 2</TabPanel>
        </TabPanels>
      </Tabs>
    )

    await user.click(screen.getByRole('tab', { name: 'Tab 2' }))

    expect(handleChange).toHaveBeenCalledWith(1)

    rerender(
      <Tabs selectedIndex={1} onChange={handleChange}>
        <TabList>
          <Tab index={0}>Tab 1</Tab>
          <Tab index={1}>Tab 2</Tab>
        </TabList>
        <TabPanels>
          <TabPanel index={0}>Panel 1</TabPanel>
          <TabPanel index={1}>Panel 2</TabPanel>
        </TabPanels>
      </Tabs>
    )

    expect(screen.getByRole('tab', { name: 'Tab 2' })).toHaveAttribute('aria-selected', 'true')
  })

  it('renders different variants', () => {
    const { rerender } = render(
      <Tabs variant="underline">
        <TabList>
          <Tab index={0}>Tab 1</Tab>
        </TabList>
      </Tabs>
    )

    expect(screen.getByRole('tab')).toHaveClass('border-b-2')

    rerender(
      <Tabs variant="pill">
        <TabList>
          <Tab index={0}>Tab 1</Tab>
        </TabList>
      </Tabs>
    )

    expect(screen.getByRole('tab')).toHaveClass('rounded-md')

    rerender(
      <Tabs variant="bar">
        <TabList>
          <Tab index={0}>Tab 1</Tab>
        </TabList>
      </Tabs>
    )

    expect(screen.getByRole('tab')).toHaveClass('relative')
  })

  it('supports disabled tabs', async () => {
    const user = userEvent.setup()
    const handleChange = vi.fn()

    render(
      <Tabs onChange={handleChange}>
        <TabList>
          <Tab index={0}>Tab 1</Tab>
          <Tab index={1} disabled={true}>
            Tab 2
          </Tab>
        </TabList>
      </Tabs>
    )

    await user.click(screen.getByRole('tab', { name: 'Tab 2' }))

    expect(handleChange).not.toHaveBeenCalled()
    expect(screen.getByRole('tab', { name: 'Tab 1' })).toHaveAttribute('aria-selected', 'true')
  })

  it('renders badges', () => {
    render(
      <Tabs>
        <TabList>
          <Tab index={0} badge="10">
            Tab 1
          </Tab>
          <Tab index={1} badge={5}>
            Tab 2
          </Tab>
        </TabList>
      </Tabs>
    )

    expect(screen.getByText('10')).toBeInTheDocument()
    expect(screen.getByText('5')).toBeInTheDocument()
  })

  it('has correct ARIA attributes', () => {
    render(
      <Tabs>
        <TabList aria-label="Settings tabs">
          <Tab index={0}>Tab 1</Tab>
          <Tab index={1}>Tab 2</Tab>
        </TabList>
        <TabPanels>
          <TabPanel index={0}>Panel 1</TabPanel>
          <TabPanel index={1}>Panel 2</TabPanel>
        </TabPanels>
      </Tabs>
    )

    const tab1 = screen.getByRole('tab', { name: 'Tab 1' })
    const panel1 = screen.getByRole('tabpanel')

    expect(tab1).toHaveAttribute('aria-controls', 'tabpanel-0')
    expect(tab1).toHaveAttribute('id', 'tab-0')
    expect(panel1).toHaveAttribute('aria-labelledby', 'tab-0')
    expect(panel1).toHaveAttribute('id', 'tabpanel-0')

    const nav = screen.getByRole('navigation', { name: 'Settings tabs' })
    expect(nav).toBeInTheDocument()
  })
})
