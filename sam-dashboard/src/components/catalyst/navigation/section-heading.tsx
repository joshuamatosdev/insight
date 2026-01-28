import clsx from 'clsx'

// Type definitions
type HeadingLevel = 'h2' | 'h3' | 'h4'

type SectionHeadingProps = {
  level?: HeadingLevel
  border?: boolean
  children: React.ReactNode
} & Omit<React.ComponentPropsWithoutRef<'div'>, 'children'>

type SectionHeadingTitleProps = {
  level?: HeadingLevel
} & React.ComponentPropsWithoutRef<'h2' | 'h3' | 'h4'>

type SectionHeadingDescriptionProps = React.ComponentPropsWithoutRef<'p'>

type SectionHeadingActionsProps = React.ComponentPropsWithoutRef<'div'>

/**
 * SectionHeading - Container for section headings with optional border
 *
 * @example
 * // Simple with border
 * <SectionHeading>
 *   <SectionHeadingTitle>Job Postings</SectionHeadingTitle>
 * </SectionHeading>
 *
 * @example
 * // With description
 * <SectionHeading>
 *   <SectionHeadingTitle>Job Postings</SectionHeadingTitle>
 *   <SectionHeadingDescription>
 *     Workcation is a property rental website.
 *   </SectionHeadingDescription>
 * </SectionHeading>
 *
 * @example
 * // With actions
 * <SectionHeading>
 *   <div className="sm:flex sm:items-center sm:justify-between">
 *     <SectionHeadingTitle>Job Postings</SectionHeadingTitle>
 *     <SectionHeadingActions>
 *       <Button>Share</Button>
 *       <Button color="primary">Create</Button>
 *     </SectionHeadingActions>
 *   </div>
 * </SectionHeading>
 */
export function SectionHeading({
  level = 'h3',
  border = true,
  className,
  children,
  ...props
}: SectionHeadingProps) {
  return (
    <div
      {...props}
      className={clsx(
        className,
        border && 'border-b border-gray-200 pb-5 dark:border-white/10',
        !border && 'pb-5'
      )}
    >
      {children}
    </div>
  )
}

/**
 * SectionHeadingTitle - Title for section headings
 * Smaller scale than PageHeading, suitable for subsections
 */
export function SectionHeadingTitle({
  level = 'h3',
  className,
  ...props
}: SectionHeadingTitleProps) {
  const Element = level

  return (
    <Element
      {...props}
      className={clsx(
        className,
        'text-base font-semibold text-gray-900 dark:text-white'
      )}
    />
  )
}

/**
 * SectionHeadingDescription - Description text for section headings
 * Displayed below the title with muted styling
 */
export function SectionHeadingDescription({
  className,
  ...props
}: SectionHeadingDescriptionProps) {
  return (
    <p
      {...props}
      className={clsx(
        className,
        'mt-2 max-w-4xl text-sm text-gray-500 dark:text-gray-400'
      )}
    />
  )
}

/**
 * SectionHeadingActions - Container for action buttons in section headings
 * Typically used with Button components on the right side
 */
export function SectionHeadingActions({
  className,
  ...props
}: SectionHeadingActionsProps) {
  return (
    <div
      {...props}
      className={clsx(
        className,
        'mt-3 flex sm:mt-0 sm:ml-4'
      )}
    />
  )
}
