import '@testing-library/jest-dom';
import React from 'react';
import { TextEncoder, TextDecoder } from 'util';

if (typeof global.TextEncoder === 'undefined') {
  global.TextEncoder = TextEncoder;
}
if (typeof global.TextDecoder === 'undefined') {
  global.TextDecoder = TextDecoder as unknown as typeof global.TextDecoder;
}

// Mock next/link to render clean anchor tags without Next.js idle prefetch intersection observers in JSDOM
jest.mock('next/link', () => {
  return function MockLink({
    children,
    href,
    prefetch: _prefetch,
    ...rest
  }: React.AnchorHTMLAttributes<HTMLAnchorElement> & { prefetch?: boolean }) {
    return React.createElement(
      'a',
      {
        href: typeof href === 'string' ? href : undefined,
        ...rest,
      },
      children
    );
  };
});
