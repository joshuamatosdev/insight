import {Border} from '@/components/Border'
import {FadeIn, FadeInStagger} from '@/components/FadeIn'

export function List({
                         children,
                         className,
                     }: {
    children: React.ReactNode
    className?: string
}) {
    return (
        <FadeInStagger>
            <ul role="list">
                {children}
            </ul>
        </FadeInStagger>
    )
}

export function ListItem({
                             children,
                             title,
                         }: {
    children: React.ReactNode
    title?: string
}) {
    return (
        <li>
            <FadeIn>
                <Border>
                    {title && (
                        <strong>{`${title}. `}</strong>
                    )}
                    {children}
                </Border>
            </FadeIn>
        </li>
    )
}
