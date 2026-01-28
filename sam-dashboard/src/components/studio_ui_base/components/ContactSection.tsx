import {Button} from '@/components/Button'
import {Container} from '@/components/Container'
import {FadeIn} from '@/components/FadeIn'
import {Offices} from '@/components/Offices'

export function ContactSection() {
  return (
    <Container>
      <FadeIn>
        <div>
          <div>
            <h2>
              Tell us about your project
            </h2>
            <div>
              <Button href="/contact" invert>
                Say Hej
              </Button>
            </div>
            <div>
              <h3>
                Our offices
              </h3>
              <Offices
                invert
              />
            </div>
          </div>
        </div>
      </FadeIn>
    </Container>
  )
}
