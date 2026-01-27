/**
 * Card Component Usage Examples
 *
 * This file demonstrates the various ways to use the Card component
 * following Catalyst UI patterns.
 */

import { Card, CardHeader, CardTitle, CardDescription, CardBody, CardFooter } from './card'
import { Button } from './button'

// Example 1: Basic Card
export function BasicCard() {
  return <Card>This is a basic card with default styling</Card>
}

// Example 2: Card with Header
export function CardWithHeader() {
  return (
    <Card padding="none">
      <CardHeader>
        <CardTitle>Card Title</CardTitle>
        <CardDescription>This is a description of the card content</CardDescription>
      </CardHeader>
      <CardBody>Main content goes here</CardBody>
    </Card>
  )
}

// Example 3: Card with Footer
export function CardWithFooter() {
  return (
    <Card padding="none">
      <CardBody>Main content goes here</CardBody>
      <CardFooter>
        <div className="flex justify-end gap-3">
          <Button variant="secondary">Cancel</Button>
          <Button>Save</Button>
        </div>
      </CardFooter>
    </Card>
  )
}

// Example 4: Card with Header and Footer
export function CardWithHeaderAndFooter() {
  return (
    <Card padding="none">
      <CardHeader divider>
        <CardTitle>Complete Card</CardTitle>
        <CardDescription>With header, body, and footer sections</CardDescription>
      </CardHeader>
      <CardBody>Main content goes here</CardBody>
      <CardFooter divider>
        <div className="flex justify-end gap-3">
          <Button variant="secondary">Cancel</Button>
          <Button>Save</Button>
        </div>
      </CardFooter>
    </Card>
  )
}

// Example 5: Card Variants
export function CardVariants() {
  return (
    <div className="space-y-4">
      <Card variant="elevated">Elevated card with shadow</Card>
      <Card variant="outlined">Outlined card with border</Card>
      <Card variant="filled">Filled card with background</Card>
    </div>
  )
}

// Example 6: Card with Gray Footer
export function CardWithGrayFooter() {
  return (
    <Card padding="none">
      <CardBody>Main content with white background</CardBody>
      <CardFooter variant="gray">
        <div className="flex justify-between">
          <span className="text-sm text-zinc-500">Last updated: 2 hours ago</span>
          <Button variant="secondary">View Details</Button>
        </div>
      </CardFooter>
    </Card>
  )
}

// Example 7: Card with Gray Body
export function CardWithGrayBody() {
  return (
    <Card padding="none">
      <CardHeader>
        <CardTitle>Report Summary</CardTitle>
      </CardHeader>
      <CardBody variant="gray">
        <div className="space-y-2">
          <div className="flex justify-between">
            <span>Total Contracts:</span>
            <strong>42</strong>
          </div>
          <div className="flex justify-between">
            <span>Active Proposals:</span>
            <strong>8</strong>
          </div>
        </div>
      </CardBody>
    </Card>
  )
}

// Example 8: Edge-to-Edge Mobile Card
export function EdgeToEdgeMobileCard() {
  return (
    <Card edgeToEdgeMobile>
      This card has no rounded corners on mobile devices but becomes rounded on larger screens.
    </Card>
  )
}

// Example 9: Card with Different Padding Sizes
export function CardPaddingSizes() {
  return (
    <div className="space-y-4">
      <Card padding="none">No padding</Card>
      <Card padding="sm">Small padding</Card>
      <Card padding="md">Medium padding (default)</Card>
      <Card padding="lg">Large padding</Card>
    </div>
  )
}

// Example 10: Dashboard Stats Card
export function DashboardStatsCard() {
  return (
    <Card variant="outlined" padding="none">
      <CardHeader>
        <CardTitle>Monthly Revenue</CardTitle>
        <CardDescription>Total revenue for January 2026</CardDescription>
      </CardHeader>
      <CardBody>
        <div className="text-3xl font-bold text-zinc-950 dark:text-white">$127,500</div>
        <div className="mt-1 text-sm text-green-600 dark:text-green-400">+12% from last month</div>
      </CardBody>
    </Card>
  )
}
