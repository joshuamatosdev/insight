import { render } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import { describe, expect, it } from 'vitest';

import { Card } from './Card';
import { CardHeader } from './CardHeader';
import { CardBody } from './CardBody';

expect.extend(toHaveNoViolations);

describe('Card accessibility', () => {
  it('should have no accessibility violations with basic content', async () => {
    const { container } = render(
      <Card>
        <p>Card content</p>
      </Card>
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('should have no accessibility violations with header and body', async () => {
    const { container } = render(
      <Card>
        <CardHeader>
          <h2>Card Title</h2>
        </CardHeader>
        <CardBody>
          <p>Card content goes here</p>
        </CardBody>
      </Card>
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('should have no accessibility violations as an article', async () => {
    const { container } = render(
      <Card as="article">
        <CardHeader>
          <h2>Article Title</h2>
        </CardHeader>
        <CardBody>
          <p>Article content</p>
        </CardBody>
      </Card>
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('should have no accessibility violations with interactive elements', async () => {
    const { container } = render(
      <Card>
        <CardHeader>
          <h2>Interactive Card</h2>
        </CardHeader>
        <CardBody>
          <button type="button">Action 1</button>
          <button type="button">Action 2</button>
        </CardBody>
      </Card>
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('should have no accessibility violations with form elements', async () => {
    const { container } = render(
      <Card>
        <CardHeader>
          <h2>Form Card</h2>
        </CardHeader>
        <CardBody>
          <form>
            <label htmlFor="card-input">Input Label</label>
            <input id="card-input" type="text" />
            <button type="submit">Submit</button>
          </form>
        </CardBody>
      </Card>
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('should have no accessibility violations with images', async () => {
    const { container } = render(
      <Card>
        <img src="/placeholder.jpg" alt="Descriptive alt text" />
        <CardBody>
          <p>Card with image</p>
        </CardBody>
      </Card>
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
