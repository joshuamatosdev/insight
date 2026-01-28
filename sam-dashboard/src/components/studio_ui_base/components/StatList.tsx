import {Border} from '@/components/Border'
import {FadeIn, FadeInStagger} from '@/components/FadeIn'

export function StatList({
                             children,
                             ...props
                         }: Omit<React.ComponentPropsWithoutRef<typeof FadeInStagger>, 'children'> & {
    children: React.ReactNode
}) {
    return (
        <FadeInStagger {...props}>
            <dl>
                {children}
            </dl>
        </FadeInStagger>
    )
}

export function StatListItem({
                                 label,
                                 value,
                             }: {
    label: string
    value: string
}) {
    return (
        <Border as={FadeIn} position="left">
            <dt>{label}</dt>
            <dd>
                {value}
            </dd>
        </Border>
    )
}
