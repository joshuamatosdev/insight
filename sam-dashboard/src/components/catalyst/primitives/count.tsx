import clsx from 'clsx'

interface CountProps {
  value: number | string
  className?: string
}

export function Count({ value, className }: CountProps) {
  return (
    <span className={clsx('text-sm text-zinc-400', className)}>
      {value}
    </span>
  )
}
