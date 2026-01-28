import {ChevronDownIcon} from '@heroicons/react/16/solid'
import clsx from 'clsx'
import type React from 'react'
import {Children, createContext, forwardRef, useContext, useState} from 'react'

// Types
type TabVariant = 'underline' | 'pill' | 'bar'

interface TabsContextValue {
  selectedIndex: number
  setSelectedIndex: (index: number) => void
  variant: TabVariant
}

const TabsContext = createContext<TabsContextValue | null>(null)

function useTabsContext() {
  const context = useContext(TabsContext)
  if (context === null) {
    throw new Error('Tabs compound components must be used within a Tabs component')
  }
  return context
}

// Variant styles
const variants = {
  underline: {
    list: 'border-b border-zinc-200 dark:border-white/10',
    listInner: '-mb-px flex space-x-8',
    tab: {
      base: 'border-b-2 px-1 py-4 text-sm font-medium whitespace-nowrap transition-colors',
      active: 'border-indigo-500 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400',
      inactive:
        'border-transparent text-zinc-500 hover:border-zinc-300 hover:text-zinc-700 dark:text-zinc-400 dark:hover:border-white/20 dark:hover:text-zinc-200',
      disabled: 'opacity-50 cursor-not-allowed hover:border-transparent hover:text-zinc-500',
    },
    icon: {
      active: 'text-indigo-500 dark:text-indigo-400',
      inactive: 'text-zinc-400 group-hover:text-zinc-500 dark:text-zinc-500 dark:group-hover:text-zinc-400',
    },
    badge: {
      active: 'bg-indigo-100 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-400',
      inactive: 'bg-zinc-100 text-zinc-900 dark:bg-white/10 dark:text-zinc-300',
    },
  },
  pill: {
    list: '',
    listInner: 'flex space-x-4',
    tab: {
      base: 'rounded-md px-3 py-2 text-sm font-medium transition-colors',
      active: 'bg-zinc-100 text-zinc-700 dark:bg-white/10 dark:text-zinc-200',
      inactive: 'text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200',
      disabled: 'opacity-50 cursor-not-allowed hover:text-zinc-500',
    },
    icon: {
      active: 'text-zinc-700 dark:text-zinc-200',
      inactive: 'text-zinc-500 group-hover:text-zinc-700 dark:text-zinc-400 dark:group-hover:text-zinc-200',
    },
    badge: {
      active: 'bg-zinc-200 text-zinc-800 dark:bg-white/20 dark:text-zinc-100',
      inactive: 'bg-zinc-100 text-zinc-600 dark:bg-white/10 dark:text-zinc-400',
    },
  },
  bar: {
    list: '',
    listInner:
      'isolate flex divide-x divide-zinc-200 rounded-lg bg-white shadow-sm dark:divide-white/10 dark:bg-zinc-800/50 dark:shadow-none dark:outline dark:-outline-offset-1 dark:outline-white/10',
    tab: {
      base: 'group relative min-w-0 flex-1 overflow-hidden px-4 py-4 text-center text-sm font-medium hover:bg-zinc-50 focus:z-10 dark:hover:bg-white/5 transition-colors',
      active: 'text-zinc-900 dark:text-white',
      inactive: 'text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-white',
      disabled: 'opacity-50 cursor-not-allowed hover:bg-transparent hover:text-zinc-500',
    },
    icon: {
      active: 'text-zinc-900 dark:text-white',
      inactive: 'text-zinc-500 group-hover:text-zinc-700 dark:text-zinc-400 dark:group-hover:text-white',
    },
    badge: {
      active: 'bg-indigo-100 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-400',
      inactive: 'bg-zinc-100 text-zinc-600 dark:bg-white/10 dark:text-zinc-400',
    },
  },
}

// Main Tabs component
export interface TabsProps {
  variant?: TabVariant
  defaultIndex?: number
  selectedIndex?: number
  onChange?: (index: number) => void
  className?: string
  children: React.ReactNode
}

export function Tabs({
  variant = 'underline',
  defaultIndex = 0,
  selectedIndex: controlledIndex,
  onChange,
  className,
  children,
}: TabsProps) {
  const [uncontrolledIndex, setUncontrolledIndex] = useState(defaultIndex)
  const isControlled = controlledIndex !== undefined
  const selectedIndex = isControlled ? controlledIndex : uncontrolledIndex

  const setSelectedIndex = (index: number) => {
    if (onChange !== undefined) {
      onChange(index)
    }
    if (isControlled === false) {
      setUncontrolledIndex(index)
    }
  }

  return (
    <TabsContext.Provider value={{ selectedIndex, setSelectedIndex, variant }}>
      <div className={clsx(className)}>{children}</div>
    </TabsContext.Provider>
  )
}

// TabList component
export interface TabListProps {
  'aria-label'?: string
  className?: string
  children: React.ReactNode
}

export function TabList({ 'aria-label': ariaLabel = 'Tabs', className, children }: TabListProps) {
  const { variant, selectedIndex, setSelectedIndex } = useTabsContext()
  const variantStyles = variants[variant]

  // Extract tab names and count for mobile select
  const tabNames: string[] = []
  const childrenArray = Children.toArray(children)

  childrenArray.forEach((child) => {
    if (child !== null && child !== undefined && typeof child === 'object' && 'props' in child) {
      const childProps = child.props as { children?: React.ReactNode }
      if (typeof childProps.children === 'string') {
        tabNames.push(childProps.children)
      } else if (Array.isArray(childProps.children)) {
        const textChild = childProps.children.find((c) => typeof c === 'string')
        if (textChild !== undefined) {
          tabNames.push(textChild as string)
        }
      }
    }
  })

  return (
    <div className={className}>
      {/* Mobile select dropdown */}
      <div className="grid grid-cols-1 sm:hidden">
        <select
          value={selectedIndex}
          onChange={(e) => {
            setSelectedIndex(Number(e.target.value))
          }}
          aria-label={ariaLabel}
          className="col-start-1 row-start-1 w-full appearance-none rounded-md bg-white py-2 pr-8 pl-3 text-base text-zinc-900 outline-1 -outline-offset-1 outline-zinc-300 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 dark:bg-white/5 dark:text-zinc-100 dark:outline-white/10 dark:*:bg-zinc-800 dark:focus:outline-indigo-500"
        >
          {tabNames.map((name, index) => (
            <option key={index} value={index}>
              {name}
            </option>
          ))}
        </select>
        <ChevronDownIcon
          aria-hidden="true"
          className="pointer-events-none col-start-1 row-start-1 mr-2 size-5 self-center justify-self-end fill-zinc-500 dark:fill-zinc-400"
        />
      </div>

      {/* Desktop tabs */}
      <div className="hidden sm:block">
        <div className={variantStyles.list}>
          <nav aria-label={ariaLabel} className={variantStyles.listInner}>
            {children}
          </nav>
        </div>
      </div>
    </div>
  )
}

// Tab component
export interface TabProps {
  index: number
  icon?: React.ComponentType<{ className?: string }>
  badge?: string | number
  disabled?: boolean
  className?: string
  children: React.ReactNode
}

export const Tab = forwardRef<HTMLButtonElement, TabProps>(function Tab(
  { index, icon: Icon, badge, disabled = false, className, children },
  ref
) {
  const { selectedIndex, setSelectedIndex, variant } = useTabsContext()
  const isActive = selectedIndex === index
  const variantStyles = variants[variant]

  const handleClick = () => {
    if (disabled === false) {
      setSelectedIndex(index)
    }
  }

  const buttonClasses = clsx(
    variantStyles.tab.base,
    isActive ? variantStyles.tab.active : variantStyles.tab.inactive,
    disabled === true && variantStyles.tab.disabled,
    Icon !== undefined && 'group inline-flex items-center',
    className
  )

  const iconClasses = clsx(
    'mr-2 -ml-0.5 size-5',
    isActive ? variantStyles.icon.active : variantStyles.icon.inactive
  )

  const badgeClasses = clsx(
    'ml-3 hidden rounded-full px-2.5 py-0.5 text-xs font-medium md:inline-block',
    isActive ? variantStyles.badge.active : variantStyles.badge.inactive
  )

  return (
    <button
      ref={ref}
      type="button"
      role="tab"
      aria-selected={isActive}
      aria-disabled={disabled}
      aria-controls={`tabpanel-${index}`}
      id={`tab-${index}`}
      tabIndex={isActive ? 0 : -1}
      onClick={handleClick}
      disabled={disabled}
      className={buttonClasses}
    >
      {Icon !== undefined && <Icon aria-hidden="true" className={iconClasses} />}
      {variant === 'bar' && badge === undefined && <span>{children}</span>}
      {variant !== 'bar' && children}
      {badge !== undefined && badge !== null && <span className={badgeClasses}>{badge}</span>}
      {/* Bar variant indicator */}
      {variant === 'bar' && (
        <span
          aria-hidden="true"
          className={clsx(
            'absolute inset-x-0 bottom-0 h-0.5',
            isActive ? 'bg-indigo-500 dark:bg-indigo-400' : 'bg-transparent'
          )}
        />
      )}
    </button>
  )
})

// TabPanels component
export interface TabPanelsProps {
  className?: string
  children: React.ReactNode
}

export function TabPanels({ className, children }: TabPanelsProps) {
  return <div className={className}>{children}</div>
}

// TabPanel component
export interface TabPanelProps {
  index: number
  className?: string
  children: React.ReactNode
}

export function TabPanel({ index, className, children }: TabPanelProps) {
  const { selectedIndex } = useTabsContext()
  const isActive = selectedIndex === index

  if (isActive === false) {
    return null
  }

  return (
    <div
      role="tabpanel"
      id={`tabpanel-${index}`}
      aria-labelledby={`tab-${index}`}
      tabIndex={0}
      className={className}
    >
      {children}
    </div>
  )
}

