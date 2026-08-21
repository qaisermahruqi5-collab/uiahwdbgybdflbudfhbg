import type Lenis from 'lenis';

/* Module-level holder for the Lenis instance owned by Layout.
   Lets non-scroll components (e.g. Navbar) perform Lenis-aware
   scroll resets without prop-drilling or context. */
let lenisInstance: Lenis | null = null;

export function setLenis(instance: Lenis | null): void {
  lenisInstance = instance;
}

export function getLenis(): Lenis | null {
  return lenisInstance;
}
