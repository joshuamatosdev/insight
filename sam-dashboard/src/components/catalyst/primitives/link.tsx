/* link.tsx - VITE VERSION */
import * as Headless from '@headlessui/react'
import React, {forwardRef} from 'react'
import {Link as RouterLink} from 'react-router-dom'

export const Link = forwardRef(function Link(
  props: { href: string } & React.ComponentPropsWithoutRef<'a'>,
  ref: React.ForwardedRef<HTMLAnchorElement>
) {
  // If it's an external link, use standard <a>
  if (props.href.startsWith('http') || props.href.startsWith('#')) {
    return (
      <Headless.DataInteractive>
        <a {...props} ref={ref} />
      </Headless.DataInteractive>
    )
  }

  // Otherwise use React Router
  return (
    <Headless.DataInteractive>
      <RouterLink to={props.href} {...(props as unknown as object)} ref={ref} />
    </Headless.DataInteractive>
  )
})
