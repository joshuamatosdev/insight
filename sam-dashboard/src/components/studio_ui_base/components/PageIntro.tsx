import {Container} from '@/components/Container'
import {FadeIn} from '@/components/FadeIn'

export function PageIntro({
                              eyebrow,
                              title,
                              children,
                              centered = false,
                          }: {
    eyebrow: string
    title: string
    children: React.ReactNode
    centered?: boolean
}) {
    return (
        <Container
        >
            <FadeIn>
                <h1>
          <span>
            {eyebrow}
          </span>
                    <span> - </span>
                    <span
                    >
            {title}
          </span>
                </h1>
                <div
                >
                    {children}
                </div>
            </FadeIn>
        </Container>
    )
}
