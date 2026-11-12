import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import ViewSwitch from './ViewSwitch';

// Marker attribute proves the switch goes through Next.js Link (client navigation), not a raw <a>
vi.mock('next/link', () => ({
  default: ({
    href,
    children,
    prefetch: _prefetch,
    ...rest
  }: {
    href: string;
    children: React.ReactNode;
    prefetch?: boolean;
  }) => (
    <a href={href} data-next-link="true" {...rest}>
      {children}
    </a>
  ),
}));

afterEach(cleanup);

describe('ViewSwitch', () => {
  // TC-005
  it('renders map and overview links through next/link for the route param', () => {
    render(<ViewSwitch artistId="rm" current="map" />);
    const nav = screen.getByRole('navigation', { name: '切換檢視' });
    const links = nav.querySelectorAll('a');
    expect(links).toHaveLength(2);
    expect(screen.getByRole('link', { name: '地圖' }).getAttribute('href')).toBe('/map/rm');
    expect(screen.getByRole('link', { name: '總覽' }).getAttribute('href')).toBe(
      '/map/rm/overview'
    );
    links.forEach((a) => expect(a.getAttribute('data-next-link')).toBe('true'));
  });

  // TC-006
  it('marks only the current page with aria-current', () => {
    render(<ViewSwitch artistId="rm" current="map" />);
    expect(screen.getByRole('link', { name: '地圖' }).getAttribute('aria-current')).toBe('page');
    expect(screen.getByRole('link', { name: '總覽' }).getAttribute('aria-current')).toBeNull();
    cleanup();

    render(<ViewSwitch artistId="rm" current="overview" />);
    expect(screen.getByRole('link', { name: '總覽' }).getAttribute('aria-current')).toBe('page');
    expect(screen.getByRole('link', { name: '地圖' }).getAttribute('aria-current')).toBeNull();
  });
});
