import { UserIcon, BuildingOfficeIcon, UsersIcon, CreditCardIcon } from '@heroicons/react/20/solid'
import { Tab, TabList, TabPanel, TabPanels, Tabs } from './tabs'

/**
 * Example: Basic Tabs (Underline variant - default)
 */
export function BasicTabsExample() {
  return (
    <Tabs>
      <TabList>
        <Tab index={0}>My Account</Tab>
        <Tab index={1}>Company</Tab>
        <Tab index={2}>Team Members</Tab>
        <Tab index={3}>Billing</Tab>
      </TabList>
      <TabPanels>
        <TabPanel index={0}>
          <div className="py-4">My Account content</div>
        </TabPanel>
        <TabPanel index={1}>
          <div className="py-4">Company content</div>
        </TabPanel>
        <TabPanel index={2}>
          <div className="py-4">Team Members content</div>
        </TabPanel>
        <TabPanel index={3}>
          <div className="py-4">Billing content</div>
        </TabPanel>
      </TabPanels>
    </Tabs>
  )
}

/**
 * Example: Tabs with Icons
 */
export function TabsWithIconsExample() {
  return (
    <Tabs variant="underline">
      <TabList>
        <Tab index={0} icon={UserIcon}>
          My Account
        </Tab>
        <Tab index={1} icon={BuildingOfficeIcon}>
          Company
        </Tab>
        <Tab index={2} icon={UsersIcon}>
          Team Members
        </Tab>
        <Tab index={3} icon={CreditCardIcon}>
          Billing
        </Tab>
      </TabList>
      <TabPanels>
        <TabPanel index={0}>
          <div className="py-4">My Account content</div>
        </TabPanel>
        <TabPanel index={1}>
          <div className="py-4">Company content</div>
        </TabPanel>
        <TabPanel index={2}>
          <div className="py-4">Team Members content</div>
        </TabPanel>
        <TabPanel index={3}>
          <div className="py-4">Billing content</div>
        </TabPanel>
      </TabPanels>
    </Tabs>
  )
}

/**
 * Example: Pill Variant
 */
export function PillTabsExample() {
  return (
    <Tabs variant="pill">
      <TabList>
        <Tab index={0}>My Account</Tab>
        <Tab index={1}>Company</Tab>
        <Tab index={2}>Team Members</Tab>
        <Tab index={3}>Billing</Tab>
      </TabList>
      <TabPanels>
        <TabPanel index={0}>
          <div className="py-4">My Account content</div>
        </TabPanel>
        <TabPanel index={1}>
          <div className="py-4">Company content</div>
        </TabPanel>
        <TabPanel index={2}>
          <div className="py-4">Team Members content</div>
        </TabPanel>
        <TabPanel index={3}>
          <div className="py-4">Billing content</div>
        </TabPanel>
      </TabPanels>
    </Tabs>
  )
}

/**
 * Example: Bar Variant
 */
export function BarTabsExample() {
  return (
    <Tabs variant="bar">
      <TabList>
        <Tab index={0}>My Account</Tab>
        <Tab index={1}>Company</Tab>
        <Tab index={2}>Team Members</Tab>
        <Tab index={3}>Billing</Tab>
      </TabList>
      <TabPanels>
        <TabPanel index={0}>
          <div className="py-4">My Account content</div>
        </TabPanel>
        <TabPanel index={1}>
          <div className="py-4">Company content</div>
        </TabPanel>
        <TabPanel index={2}>
          <div className="py-4">Team Members content</div>
        </TabPanel>
        <TabPanel index={3}>
          <div className="py-4">Billing content</div>
        </TabPanel>
      </TabPanels>
    </Tabs>
  )
}

/**
 * Example: Tabs with Badges
 */
export function TabsWithBadgesExample() {
  return (
    <Tabs>
      <TabList>
        <Tab index={0} badge="52">
          Applied
        </Tab>
        <Tab index={1} badge="6">
          Phone Screening
        </Tab>
        <Tab index={2} badge="4">
          Interview
        </Tab>
        <Tab index={3}>Offer</Tab>
        <Tab index={4}>Disqualified</Tab>
      </TabList>
      <TabPanels>
        <TabPanel index={0}>
          <div className="py-4">Applied content</div>
        </TabPanel>
        <TabPanel index={1}>
          <div className="py-4">Phone Screening content</div>
        </TabPanel>
        <TabPanel index={2}>
          <div className="py-4">Interview content</div>
        </TabPanel>
        <TabPanel index={3}>
          <div className="py-4">Offer content</div>
        </TabPanel>
        <TabPanel index={4}>
          <div className="py-4">Disqualified content</div>
        </TabPanel>
      </TabPanels>
    </Tabs>
  )
}

/**
 * Example: Controlled Tabs
 */
export function ControlledTabsExample() {
  const [selectedIndex, setSelectedIndex] = React.useState(0)

  return (
    <div>
      <div className="mb-4">
        <p>Current tab: {selectedIndex}</p>
        <button onClick={() => setSelectedIndex(2)}>Jump to tab 3</button>
      </div>
      <Tabs selectedIndex={selectedIndex} onChange={setSelectedIndex}>
        <TabList>
          <Tab index={0}>Tab 1</Tab>
          <Tab index={1}>Tab 2</Tab>
          <Tab index={2}>Tab 3</Tab>
        </TabList>
        <TabPanels>
          <TabPanel index={0}>
            <div className="py-4">Content 1</div>
          </TabPanel>
          <TabPanel index={1}>
            <div className="py-4">Content 2</div>
          </TabPanel>
          <TabPanel index={2}>
            <div className="py-4">Content 3</div>
          </TabPanel>
        </TabPanels>
      </Tabs>
    </div>
  )
}

/**
 * Example: Disabled Tabs
 */
export function DisabledTabsExample() {
  return (
    <Tabs>
      <TabList>
        <Tab index={0}>Active Tab</Tab>
        <Tab index={1} disabled={true}>
          Disabled Tab
        </Tab>
        <Tab index={2}>Another Active Tab</Tab>
      </TabList>
      <TabPanels>
        <TabPanel index={0}>
          <div className="py-4">Active content</div>
        </TabPanel>
        <TabPanel index={1}>
          <div className="py-4">Disabled content (cannot be reached)</div>
        </TabPanel>
        <TabPanel index={2}>
          <div className="py-4">Another active content</div>
        </TabPanel>
      </TabPanels>
    </Tabs>
  )
}

/**
 * Example: Tabs with Default Selection
 */
export function TabsWithDefaultExample() {
  return (
    <Tabs defaultIndex={2}>
      <TabList>
        <Tab index={0}>Tab 1</Tab>
        <Tab index={1}>Tab 2</Tab>
        <Tab index={2}>Tab 3 (Default)</Tab>
      </TabList>
      <TabPanels>
        <TabPanel index={0}>
          <div className="py-4">Content 1</div>
        </TabPanel>
        <TabPanel index={1}>
          <div className="py-4">Content 2</div>
        </TabPanel>
        <TabPanel index={2}>
          <div className="py-4">Content 3 - This is selected by default</div>
        </TabPanel>
      </TabPanels>
    </Tabs>
  )
}
