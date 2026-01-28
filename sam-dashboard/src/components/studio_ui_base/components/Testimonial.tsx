import Image, {type ImageProps} from 'next/image'


import {Container} from '@/components/Container'
import {FadeIn} from '@/components/FadeIn'
import {GridPattern} from '@/components/GridPattern'

export function Testimonial({
  children,
  client,
  className,
}: {
  children: React.ReactNode
  client: { logo: ImageProps['src']; name: string }
  className?: string
}) {
  return (
    <div
    >
      <GridPattern
        yOffset={-256}
      />
      <Container>
        <FadeIn>
          <figure>
            <blockquote>
              <p>
                {children}
              </p>
            </blockquote>
            <figcaption>
              <Image src={client.logo} alt={client.name} unoptimized />
            </figcaption>
          </figure>
        </FadeIn>
      </Container>
    </div>
  )
}
