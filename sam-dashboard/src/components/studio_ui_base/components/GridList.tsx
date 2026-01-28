import {Border} from '@/components/Border'
import {FadeIn, FadeInStagger} from '@/components/FadeIn'

export function GridList({
                             children,
                             className,
                         }: {
    children: React.ReactNode
    className?: string
}) {
    return (
        <FadeInStagger>
            <ul
                role="list"
            >
                {children}
            </ul>
        </FadeInStagger>
    )
}

export function GridListItem({
                                 title,
                                 children,
                                 className,
                                 invert = false,
                             }: {
    title: string
    children: React.ReactNode
    className?: string
    invert?: boolean
}) {
    return (
        <li
        >
            <FadeIn>
                <Border position="left" invert={invert}>
                    <strong
                    >
                        {title}.
                    </strong>{' '}
                    {children}
                </Border>
            </FadeIn>
        </li>
    )
}
