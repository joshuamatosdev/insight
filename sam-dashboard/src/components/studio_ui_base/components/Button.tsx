import {Link, LinkProps} from 'react-router-dom'


type ButtonAsLink = Omit<LinkProps, 'to'> & {
  invert?: boolean
  href: string
  className?: string
}

type ButtonAsButton = React.ComponentPropsWithoutRef<'button'> & {
  invert?: boolean
  href?: undefined
}

type ButtonProps = ButtonAsLink | ButtonAsButton

export function Button({
  invert = false,
  className,
  children,
  ...props
}: ButtonProps) {
  const buttonClassName = clsx(
    className,
    'inline-flex rounded-full px-4 py-1.5 text-sm font-semibold transition',
    invert
      ? 'bg-white text-neutral-950 hover:bg-neutral-200'
      : 'bg-neutral-950 text-white hover:bg-neutral-800',
  )

  let inner = <span>{children}</span>

  if (typeof props.href === 'undefined') {
    const { href: _, ...buttonProps } = props as ButtonAsButton
    return (
      <button {...buttonProps}>
        {inner}
      </button>
    )
  }

  const { href, ...linkProps } = props as ButtonAsLink
  return (
    <Link to={href} {...linkProps}>
      {inner}
    </Link>
  )
}
