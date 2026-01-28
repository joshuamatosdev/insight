import {render, screen} from '@testing-library/react'
import {describe, expect, it} from 'vitest'
import {RouterTestWrapper} from '@/test/router-test-utils'
import {BreadcrumbItem, Breadcrumbs} from './breadcrumbs'

describe('Breadcrumbs', () => {
    it('renders navigation with home link by default', () => {
        render(
            <RouterTestWrapper>
                <Breadcrumbs>
                    <BreadcrumbItem href="/projects">Projects</BreadcrumbItem>
                </Breadcrumbs>
            </RouterTestWrapper>
        )

        const nav = screen.getByRole('navigation', {name: 'Breadcrumb'})
        expect(nav).toBeTruthy()

        const homeLink = screen.getByRole('link', {name: 'Home'})
        expect(homeLink).toBeTruthy()
    })

    it('hides home link when showHome is false', () => {
        render(
            <RouterTestWrapper>
                <Breadcrumbs showHome={false}>
                    <BreadcrumbItem href="/projects">Projects</BreadcrumbItem>
                </Breadcrumbs>
            </RouterTestWrapper>
        )

        const homeLink = screen.queryByRole('link', {name: 'Home'})
        expect(homeLink).toBeNull()
    })

    it('renders breadcrumb items as links', () => {
        render(
            <RouterTestWrapper>
                <Breadcrumbs>
                    <BreadcrumbItem href="/projects">Projects</BreadcrumbItem>
                    <BreadcrumbItem href="/projects/123">Project Nero</BreadcrumbItem>
                </Breadcrumbs>
            </RouterTestWrapper>
        )

        const projectsLink = screen.getByRole('link', {name: 'Projects'})
        expect(projectsLink).toBeTruthy()
        expect(projectsLink.getAttribute('href')).toBe('/projects')

        const projectLink = screen.getByRole('link', {name: 'Project Nero'})
        expect(projectLink).toBeTruthy()
        expect(projectLink.getAttribute('href')).toBe('/projects/123')
    })

    it('marks current page with aria-current', () => {
        render(
            <RouterTestWrapper>
                <Breadcrumbs>
                    <BreadcrumbItem href="/projects">Projects</BreadcrumbItem>
                    <BreadcrumbItem href="/projects/123" current={true}>
                        Project Nero
                    </BreadcrumbItem>
                </Breadcrumbs>
            </RouterTestWrapper>
        )

        const currentLink = screen.getByRole('link', {name: 'Project Nero'})
        expect(currentLink.getAttribute('aria-current')).toBe('page')
    })

    it('renders non-link items without href', () => {
        render(
            <RouterTestWrapper>
                <Breadcrumbs>
                    <BreadcrumbItem href="/projects">Projects</BreadcrumbItem>
                    <BreadcrumbItem current={true}>Project Nero</BreadcrumbItem>
                </Breadcrumbs>
            </RouterTestWrapper>
        )

        const projectsLink = screen.getByRole('link', {name: 'Projects'})
        expect(projectsLink).toBeTruthy()

        // Current item should be a span, not a link
        const currentText = screen.getByText('Project Nero')
        expect(currentText.tagName).toBe('SPAN')
        expect(currentText.getAttribute('aria-current')).toBe('page')
    })

    it('supports custom home href', () => {
        render(
            <RouterTestWrapper>
                <Breadcrumbs homeHref="/dashboard">
                    <BreadcrumbItem href="/projects">Projects</BreadcrumbItem>
                </Breadcrumbs>
            </RouterTestWrapper>
        )

        const homeLink = screen.getByRole('link', {name: 'Home'})
        expect(homeLink.getAttribute('href')).toBe('/dashboard')
    })

    it('supports custom className', () => {
        const {container} = render(
            <RouterTestWrapper>
                <Breadcrumbs className="custom-class">
                    <BreadcrumbItem href="/projects">Projects</BreadcrumbItem>
                </Breadcrumbs>
            </RouterTestWrapper>
        )

        const nav = container.querySelector('nav')
        expect(nav?.classList.contains('custom-class')).toBe(true)
    })
})
