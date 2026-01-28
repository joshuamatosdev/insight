import {Link} from 'react-router-dom'


import {Border} from './Border'
import {Container} from './Container'
import {FadeIn, FadeInStagger} from './FadeIn'
import {GridPattern} from './GridPattern'
import {SectionIntro} from './SectionIntro'

function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

function ArrowIcon(props: React.ComponentPropsWithoutRef<'svg'>) {
  return (
    <svg viewBox="0 0 24 6" aria-hidden="true" {...props}>
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M24 3 18 .5v2H0v1h18v2L24 3Z"
      />
    </svg>
  )
}

interface Page {
  href: string
  date: string
  title: string
  description: string
}

function PageLink({ page }: { page: Page }) {
  return (
    <article key={page.href}>
      <Border
        position="left"
      >
        <h3>
          {page.title}
        </h3>
        <time
          dateTime={page.date}
        >
          {formatDate(page.date)}
        </time>
        <p>{page.description}</p>
        <Link
          to={page.href}
          aria-label={`Read more: ${page.title}`}
        >
          Read more
          <ArrowIcon />
          <span />
        </Link>
      </Border>
    </article>
  )
}

export function PageLinks({
  title,
  pages,
  intro,
  className,
}: {
  title: string
  pages: Array<Page>
  intro?: string
  className?: string
}) {
  return (
    <div>
      <div>
        <GridPattern
          yOffset={-270}
        />
      </div>

      <SectionIntro title={title} smaller>
        {intro && <p>{intro}</p>}
      </SectionIntro>

      <Container>
        <FadeInStagger>
          {pages.map((page) => (
            <FadeIn key={page.href}>
              <PageLink page={page} />
            </FadeIn>
          ))}
        </FadeInStagger>
      </Container>
    </div>
  )
}
