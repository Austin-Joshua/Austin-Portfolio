import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { App } from '@/App';
import { MotionPreferenceProvider } from '@/context/MotionPreferenceContext';
import { PORTFOLIO_SECTIONS } from '@/data/sections';

describe('App smoke test', () => {
  it('renders semantic landmarks, single h1, and all seven sections in canonical order', () => {
    render(
      <MotionPreferenceProvider>
        <App />
      </MotionPreferenceProvider>,
    );

    expect(screen.getByRole('banner')).toBeInTheDocument();
    expect(screen.getByRole('main')).toBeInTheDocument();
    expect(screen.getByRole('contentinfo')).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { level: 1, name: /Austin Joshua/i }),
    ).toBeInTheDocument();

    const main = screen.getByRole('main');
    const renderedIds = Array.from(main.querySelectorAll(':scope > section')).map(
      (section) => section.id,
    );
    expect(renderedIds).toEqual(PORTFOLIO_SECTIONS.map((section) => section.id));
  });
});
