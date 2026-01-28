type BorderProps<T extends React.ElementType> = {
    as?: T
    className?: string
    position?: 'top' | 'left'
    invert?: boolean
}

export function Border<T extends React.ElementType = 'div'>({
                                                                as,
                                                                className,
                                                                position = 'top',
                                                                invert = false,
                                                                ...props
                                                            }: Omit<React.ComponentPropsWithoutRef<T>, keyof BorderProps<T>> &
    BorderProps<T>) {
    let Component = as ?? 'div'

    return (
        <Component
            {...props}
        />
    )
}
