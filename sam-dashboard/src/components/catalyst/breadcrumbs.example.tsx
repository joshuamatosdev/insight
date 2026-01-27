// Example usage of Breadcrumbs component
// This file demonstrates how to use the Breadcrumbs component in your pages

import { BreadcrumbItem, Breadcrumbs } from './breadcrumbs'

// Example 1: Simple breadcrumbs with home link and chevron separators (default)
export function SimpleBreadcrumbs() {
  return (
    <Breadcrumbs>
      <BreadcrumbItem href="/projects">Projects</BreadcrumbItem>
      <BreadcrumbItem href="/projects/123" current={true}>
        Project Nero
      </BreadcrumbItem>
    </Breadcrumbs>
  )
}

// Example 2: Breadcrumbs with slash separators
export function SlashBreadcrumbs() {
  return (
    <Breadcrumbs separator="slash">
      <BreadcrumbItem href="/contracts" separator="slash">
        Contracts
      </BreadcrumbItem>
      <BreadcrumbItem href="/contracts/456" separator="slash">
        Contract ABC-123
      </BreadcrumbItem>
      <BreadcrumbItem separator="slash" current={true}>
        Details
      </BreadcrumbItem>
    </Breadcrumbs>
  )
}

// Example 3: Breadcrumbs with arrow separators
export function ArrowBreadcrumbs() {
  return (
    <Breadcrumbs separator="arrow">
      <BreadcrumbItem href="/opportunities" separator="arrow">
        Opportunities
      </BreadcrumbItem>
      <BreadcrumbItem href="/opportunities/789" separator="arrow" current={true}>
        Opportunity XYZ
      </BreadcrumbItem>
    </Breadcrumbs>
  )
}

// Example 4: Breadcrumbs without home link
export function NoHomeBreadcrumbs() {
  return (
    <Breadcrumbs showHome={false}>
      <BreadcrumbItem href="/settings">Settings</BreadcrumbItem>
      <BreadcrumbItem href="/settings/profile" current={true}>
        Profile
      </BreadcrumbItem>
    </Breadcrumbs>
  )
}

// Example 5: Breadcrumbs with custom home href
export function CustomHomeBreadcrumbs() {
  return (
    <Breadcrumbs homeHref="/dashboard">
      <BreadcrumbItem href="/financial">Financial</BreadcrumbItem>
      <BreadcrumbItem href="/financial/invoices" current={true}>
        Invoices
      </BreadcrumbItem>
    </Breadcrumbs>
  )
}

// Example 6: Breadcrumbs with non-link current item
export function NonLinkCurrentBreadcrumbs() {
  return (
    <Breadcrumbs>
      <BreadcrumbItem href="/compliance">Compliance</BreadcrumbItem>
      <BreadcrumbItem href="/compliance/certifications">Certifications</BreadcrumbItem>
      <BreadcrumbItem current={true}>Current Page</BreadcrumbItem>
    </Breadcrumbs>
  )
}

// Example 7: Breadcrumbs with custom className
export function StyledBreadcrumbs() {
  return (
    <Breadcrumbs className="mb-4">
      <BreadcrumbItem href="/pipeline">Pipeline</BreadcrumbItem>
      <BreadcrumbItem href="/pipeline/proposals" current={true}>
        Proposals
      </BreadcrumbItem>
    </Breadcrumbs>
  )
}
