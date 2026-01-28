/* link.tsx - TanStack Router VERSION */
import * as Headless from '@headlessui/react'
import React, {forwardRef} from 'react'
import {Link as RouterLink} from '@tanstack/react-router'

export const Link = forwardRef(function Link(
    props: { href: string } & React.ComponentPropsWithoutRef<'a'>,
    ref: React.ForwardedRef<HTMLAnchorElement>
) {
    const {href, ...rest} = props

    // If it's an external link, use standard <a>
    if (href.startsWith('http') || href.startsWith('#') || href.startsWith('mailto:')) {
        return (
            <Headless.DataInteractive>
                <a href={href} {...rest} ref={ref}/>
            </Headless.DataInteractive>
        )
    }

    // Otherwise use TanStack Router
    return (
        <Headless.DataInteractive>
            <RouterLink to={href} {...rest} ref={ref}/>
        </Headless.DataInteractive>
    )
})
