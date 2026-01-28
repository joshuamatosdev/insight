import {render, screen} from '@testing-library/react'
import {describe, expect, it} from 'vitest'
import {Card, CardBody, CardDescription, CardFooter, CardHeader, CardTitle} from './card'

describe('Card Component', () => {
    it('renders basic card with children', () => {
        render(<Card>Card content</Card>)
        expect(screen.getByText('Card content')).toBeDefined()
    })

    it('applies elevated variant by default', () => {
        const {container} = render(<Card>Content</Card>)
        const card = container.firstChild as HTMLElement
        expect(card.className).toContain('bg-white')
        expect(card.className).toContain('shadow-sm')
    })

    it('applies outlined variant when specified', () => {
        const {container} = render(<Card variant="outlined">Content</Card>)
        const card = container.firstChild as HTMLElement
        expect(card.className).toContain('border')
        expect(card.className).toContain('border-gray-200')
    })

    it('applies filled variant when specified', () => {
        const {container} = render(<Card variant="filled">Content</Card>)
        const card = container.firstChild as HTMLElement
        expect(card.className).toContain('bg-gray-50')
    })

    it('applies medium padding by default', () => {
        const {container} = render(<Card>Content</Card>)
        const card = container.firstChild as HTMLElement
        expect(card.className).toContain('px-4')
        expect(card.className).toContain('py-5')
    })

    it('applies no padding when specified', () => {
        const {container} = render(<Card padding="none">Content</Card>)
        const card = container.firstChild as HTMLElement
        expect(card.className).not.toContain('px-4')
        expect(card.className).not.toContain('py-5')
    })

    it('applies edge-to-edge mobile styling when specified', () => {
        const {container} = render(<Card edgeToEdgeMobile>Content</Card>)
        const card = container.firstChild as HTMLElement
        expect(card.className).toContain('sm:rounded-lg')
        expect(card.className).not.toContain('rounded-lg')
    })

    it('renders card with header, body, and footer', () => {
        render(
            <Card>
                <CardHeader>
                    <CardTitle>Title</CardTitle>
                    <CardDescription>Description</CardDescription>
                </CardHeader>
                <CardBody>Body content</CardBody>
                <CardFooter>Footer content</CardFooter>
            </Card>
        )

        expect(screen.getByText('Title')).toBeDefined()
        expect(screen.getByText('Description')).toBeDefined()
        expect(screen.getByText('Body content')).toBeDefined()
        expect(screen.getByText('Footer content')).toBeDefined()
    })

    it('applies divider to header when specified', () => {
        const {container} = render(
            <Card>
                <CardHeader divider>Header</CardHeader>
            </Card>
        )
        const header = container.querySelector('[class*="border-b"]')
        expect(header).toBeDefined()
    })

    it('applies gray variant to body when specified', () => {
        const {container} = render(
            <Card>
                <CardBody variant="gray">Body</CardBody>
            </Card>
        )
        const body = container.querySelector('[class*="bg-gray-50"]')
        expect(body).toBeDefined()
    })

    it('applies gray variant to footer when specified', () => {
        const {container} = render(
            <Card>
                <CardFooter variant="gray">Footer</CardFooter>
            </Card>
        )
        const footer = container.querySelector('[class*="bg-gray-50"]')
        expect(footer).toBeDefined()
    })

    it('forwards ref to Card', () => {
        const ref = {current: null}
        render(<Card ref={ref}>Content</Card>)
        expect(ref.current).not.toBeNull()
    })

    it('forwards ref to CardHeader', () => {
        const ref = {current: null}
        render(<CardHeader ref={ref}>Header</CardHeader>)
        expect(ref.current).not.toBeNull()
    })

    it('forwards ref to CardBody', () => {
        const ref = {current: null}
        render(<CardBody ref={ref}>Body</CardBody>)
        expect(ref.current).not.toBeNull()
    })

    it('forwards ref to CardFooter', () => {
        const ref = {current: null}
        render(<CardFooter ref={ref}>Footer</CardFooter>)
        expect(ref.current).not.toBeNull()
    })

    it('allows custom className override', () => {
        const {container} = render(<Card className="custom-class">Content</Card>)
        const card = container.firstChild as HTMLElement
        expect(card.className).toContain('custom-class')
    })

    it('spreads additional props to Card', () => {
        const {container} = render(
            <Card data-testid="test-card" aria-label="Test Card">
                Content
            </Card>
        )
        const card = container.firstChild as HTMLElement
        expect(card.getAttribute('data-testid')).toBe('test-card')
        expect(card.getAttribute('aria-label')).toBe('Test Card')
    })
})
