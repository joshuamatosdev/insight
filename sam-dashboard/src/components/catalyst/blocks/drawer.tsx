import * as Headless from '@headlessui/react'
import clsx from 'clsx'
import type React from 'react'

const sizes = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
}

const positions = {
    left: {
        container: 'left-0',
        transition: 'data-closed:-translate-x-full data-enter:ease-out data-leave:ease-in',
    },
    right: {
        container: 'right-0',
        transition: 'data-closed:translate-x-full data-enter:ease-out data-leave:ease-in',
    },
}

export function Drawer({
                           size = 'md',
                           position = 'left',
                           className,
                           children,
                           ...props
                       }: {
    size?: keyof typeof sizes
    position?: keyof typeof positions
    className?: string
    children: React.ReactNode
} & Omit<Headless.DialogProps, 'as' | 'className'>) {
    const positionStyles = positions[position]

    return (
        <Headless.Dialog {...props}>
            <Headless.DialogBackdrop
                transition
                className="fixed inset-0 bg-zinc-950/25 backdrop-blur-sm transition duration-200 data-closed:opacity-0 data-enter:ease-out data-leave:ease-in dark:bg-zinc-950/50"
            />

            <div className="fixed inset-0 overflow-hidden">
                <div className="absolute inset-0 overflow-hidden">
                    <div
                        className={clsx('pointer-events-none fixed inset-y-0 flex', position === 'right' && 'justify-end')}>
                        <Headless.DialogPanel
                            transition
                            className={clsx(
                                className,
                                sizes[size],
                                positionStyles.container,
                                positionStyles.transition,
                                'pointer-events-auto relative w-screen bg-white shadow-xl ring-1 ring-zinc-950/10 transition duration-200 will-change-transform dark:bg-zinc-900 dark:ring-white/10',
                                'flex flex-col'
                            )}
                        >
                            {children}
                        </Headless.DialogPanel>
                    </div>
                </div>
            </div>
        </Headless.Dialog>
    )
}

export function DrawerHeader({
                                 className,
                                 ...props
                             }: { className?: string } & Omit<Headless.DialogTitleProps, 'as' | 'className'>) {
    return (
        <Headless.DialogTitle
            {...props}
            className={clsx(
                className,
                'border-b border-zinc-950/10 px-6 py-4 text-lg font-semibold text-zinc-950 dark:border-white/10 dark:text-white'
            )}
        />
    )
}

export function DrawerBody({className, ...props}: React.ComponentPropsWithoutRef<'div'>) {
    return <div {...props} className={clsx(className, 'flex-1 overflow-y-auto px-6 py-4')}/>
}

export function DrawerFooter({className, ...props}: React.ComponentPropsWithoutRef<'div'>) {
    return (
        <div
            {...props}
            className={clsx(
                className,
                'border-t border-zinc-950/10 px-6 py-4 flex flex-row-reverse items-center justify-start gap-3 dark:border-white/10'
            )}
        />
    )
}
