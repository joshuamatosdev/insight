import {Link} from '@tanstack/react-router'

import {Container} from './Container'
import {FadeIn} from './FadeIn'
import {Logo} from './Logo'
import {socialMediaProfiles} from './SocialMedia'

interface NavigationLink {
    title: string | React.ReactNode
    href: string
}

interface NavigationSection {
    title: string
    links: NavigationLink[]
}

const navigation = [
    {
        title: 'Work',
        links: [
            {title: 'FamilyFund', href: '/work/family-fund'},
            {title: 'Unseal', href: '/work/unseal'},
            {title: 'Phobia', href: '/work/phobia'},
            {
                title: (
                    <>
                        See all <span aria-hidden="true">&rarr;</span>
                    </>
                ),
                href: '/work',
            },
        ],
    },
    {
        title: 'Company',
        links: [
            {title: 'About', href: '/about'},
            {title: 'Process', href: '/process'},
            {title: 'Blog', href: '/blog'},
            {title: 'Contact us', href: '/contact'},
        ],
    },
    {
        title: 'Connect',
        links: socialMediaProfiles,
    },
]

function Navigation() {
    return (
        <nav>
            <ul role="list">
                {navigation.map((section: NavigationSection, sectionIndex: number) => (
                    <li key={sectionIndex}>
                        <div>
                            {section.title}
                        </div>
                        <ul role="list">
                            {section.links.map((link: NavigationLink, linkIndex: number) => (
                                <li key={linkIndex}>
                                    <Link
                                        to={link.href}
                                    >
                                        {link.title}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </li>
                ))}
            </ul>
        </nav>
    )
}

function ArrowIcon(props: React.ComponentPropsWithoutRef<'svg'>) {
    return (
        <svg viewBox="0 0 16 6" aria-hidden="true" {...props}>
            <path
                fill="currentColor"
                fillRule="evenodd"
                clipRule="evenodd"
                d="M16 3 10 .5v2H0v1h10v2L16 3Z"
            />
        </svg>
    )
}

function NewsletterForm() {
    return (
        <form>
            <h2>
                Sign up for our newsletter
            </h2>
            <p>
                Subscribe to get the latest design news, articles, resources and
                inspiration.
            </p>
            <div>
                <input
                    type="email"
                    placeholder="Email address"
                    autoComplete="email"
                    aria-label="Email address"
                />
                <div>
                    <button
                        type="submit"
                        aria-label="Submit"
                    >
                        <ArrowIcon/>
                    </button>
                </div>
            </div>
        </form>
    )
}

export function Footer() {
    return (
        <Container as="footer">
            <FadeIn>
                <div>
                    <Navigation/>
                    <div>
                        <NewsletterForm/>
                    </div>
                </div>
                <div>
                    <Link to="/" aria-label="Home">
                        <Logo fillOnHover/>
                    </Link>
                    <p>
                        © Studio Agency Inc. {new Date().getFullYear()}
                    </p>
                </div>
            </FadeIn>
        </Container>
    )
}
