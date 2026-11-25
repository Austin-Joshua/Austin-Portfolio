import type { Transition, Variants } from 'motion/react';

export const SWISS_EASE = [0.22, 1, 0.36, 1] as const;

export const MODAL_TRANSITION: Transition = {
  duration: 0.22,
  ease: SWISS_EASE,
};

export const REDUCED_TRANSITION: Transition = {
  duration: 0.08,
  ease: 'linear',
};

export const FILTER_LAYOUT_TRANSITION: Transition = {
  duration: 0.2,
  ease: SWISS_EASE,
};

export const backdropVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.18, ease: 'easeOut' },
  },
  exit: {
    opacity: 0,
    transition: { duration: 0.14, ease: 'easeIn' },
  },
};

export function createModalDialogVariants(
  isMobileViewport: boolean,
  prefersReducedMotion: boolean,
): Variants {
  if (prefersReducedMotion) {
    return {
      hidden: { opacity: 0 },
      visible: { opacity: 1, transition: REDUCED_TRANSITION },
      exit: { opacity: 0, transition: REDUCED_TRANSITION },
    };
  }

  if (isMobileViewport) {
    return {
      hidden: { opacity: 0, y: 24 },
      visible: { opacity: 1, y: 0, transition: MODAL_TRANSITION },
      exit: { opacity: 0, y: 16, transition: { duration: 0.15, ease: 'easeIn' } },
    };
  }

  return {
    hidden: { opacity: 0, scale: 0.97, y: 8 },
    visible: { opacity: 1, scale: 1, y: 0, transition: MODAL_TRANSITION },
    exit: {
      opacity: 0,
      scale: 0.98,
      y: 4,
      transition: { duration: 0.14, ease: 'easeIn' },
    },
  };
}

export const statusBadgeVariants: Variants = {
  hidden: { opacity: 0, y: -4 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.18, ease: SWISS_EASE },
  },
  exit: {
    opacity: 0,
    y: -2,
    transition: { duration: 0.12, ease: 'easeIn' },
  },
};
