import { useEffect, RefObject } from 'react';

const FOCUSABLE = 'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])';

/**
 * Shared dialog behavior for overlays (cart drawer, inquiry modal, concierge,
 * lightboxes): Escape closes, Tab cycles inside the container, focus moves in
 * on open and returns to the previously focused element on close.
 *
 * The container element should carry role="dialog" aria-modal="true" and
 * tabIndex={-1} so it can receive initial focus.
 */
export function useModalA11y(isOpen: boolean, onClose: () => void, containerRef: RefObject<HTMLElement | null>) {
    useEffect(() => {
        if (!isOpen) return;

        const previouslyFocused = document.activeElement as HTMLElement | null;
        const container = containerRef.current;

        // Focus the first interactive element, falling back to the container.
        const firstFocusable = container?.querySelector<HTMLElement>(FOCUSABLE);
        (firstFocusable || container)?.focus?.();

        const onKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                e.stopPropagation();
                onClose();
                return;
            }
            if (e.key !== 'Tab' || !container) return;

            const focusables = Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE))
                .filter(el => el.offsetParent !== null || el === document.activeElement);
            if (focusables.length === 0) return;

            const first = focusables[0];
            const last = focusables[focusables.length - 1];
            const active = document.activeElement as HTMLElement | null;

            if (e.shiftKey && (active === first || !container.contains(active))) {
                e.preventDefault();
                last.focus();
            } else if (!e.shiftKey && (active === last || !container.contains(active))) {
                e.preventDefault();
                first.focus();
            }
        };

        document.addEventListener('keydown', onKeyDown, true);
        return () => {
            document.removeEventListener('keydown', onKeyDown, true);
            previouslyFocused?.focus?.();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen]);
}
