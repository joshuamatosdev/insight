import {Container} from './Container'
import {FadeIn} from './FadeIn'

export function SectionIntro({
                                 title,
                                 eyebrow,
                                 children,
                                 smaller = false,
                                 invert = false,
                                 ...props
                             }: Omit<
    React.ComponentPropsWithoutRef<typeof Container>,
    'title' | 'children'
> & {
    title: string
    eyebrow?: string
    children?: React.ReactNode
    smaller?: boolean
    invert?: boolean
}) {
    return (
        <Container {...props}>
            <FadeIn>
                <h2>
                    {eyebrow && (
                        <>
              <span
              >
                {eyebrow}
              </span>
                            <span> - </span>
                        </>
                    )}
                    <span
                    >
            {title}
          </span>
                </h2>
                {children && (
                    <div
                    >
                        {children}
                    </div>
                )}
            </FadeIn>
        </Container>
    )
}
