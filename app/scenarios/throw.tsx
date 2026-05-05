import type { ReactElement } from 'react';

// Tiny screen that throws on render so the root ErrorBoundary catches
// it. Used by the "Trigger error boundary" scenario.

export default function Throw(): ReactElement {
  throw new Error('Intentional crash from /scenarios/throw — caught by ErrorBoundary.');
}
