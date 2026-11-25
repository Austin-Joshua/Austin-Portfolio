import { ArrowUpRight, Check, Copy, Mail } from 'lucide-react';
import { AnimatePresence, m } from 'motion/react';
import { useRef } from 'react';
import { SectionShell } from '@/components/layout/SectionShell';
import { Button } from '@/components/ui/Button';
import { GlassCard } from '@/components/ui/GlassCard';
import { LiveAnnouncer } from '@/components/ui/LiveAnnouncer';
import { useOptionalMotionPreference } from '@/context/MotionPreferenceContext';
import { contactData } from '@/data/contact';
import { useClipboard } from '@/hooks/useClipboard';
import { REDUCED_TRANSITION, statusBadgeVariants } from '@/motion/variants';
import type { ContactData } from '@/types/portfolio';
import {
  hasNonEmptyText,
  isValidEmailAddress,
  isValidHttpUrl,
} from '@/utils/dataGuards';

export interface ContactSectionProps {
  contact?: ContactData;
}

function selectTextNode(element: HTMLElement | null): void {
  if (!element || typeof window === 'undefined' || typeof document === 'undefined') {
    return;
  }

  try {
    const selection = window.getSelection();
    if (!selection) {
      return;
    }
    const range = document.createRange();
    range.selectNodeContents(element);
    selection.removeAllRanges();
    selection.addRange(range);
  } catch {
    // Selection API optional
  }
}

export function ContactSection({ contact = contactData }: ContactSectionProps) {
  const { status, announcement, copy } = useClipboard();
  const { prefersReducedMotion } = useOptionalMotionPreference();
  const emailRef = useRef<HTMLAnchorElement>(null);

  const hasEmail = isValidEmailAddress(contact.email);
  const validEmail = hasEmail && contact.email ? contact.email.trim() : null;
  const validSocialLinks = contact.socialLinks.filter(
    (link) =>
      hasNonEmptyText(link.id) &&
      hasNonEmptyText(link.label) &&
      isValidHttpUrl(link.url),
  );
  const hasHeadline = hasNonEmptyText(contact.headline);
  const hasAvailability = hasNonEmptyText(contact.availabilityNote);

  const handleCopyEmail = async () => {
    if (!validEmail) {
      return;
    }

    const copied = await copy(validEmail);
    if (!copied) {
      selectTextNode(emailRef.current);
    }
  };

  return (
    <SectionShell id="contact" index="07" indexLabel="CONTACT" title="Contact">
      <div className="space-y-6">
        {hasHeadline && contact.headline && (
          <p className="type-lead text-[var(--text-secondary)] max-w-[60ch]">
            {contact.headline}
          </p>
        )}

        {hasAvailability && contact.availabilityNote && (
          <p className="type-meta uppercase text-[var(--accent-primary)]">
            STATUS // {contact.availabilityNote}
          </p>
        )}

        {validEmail || validSocialLinks.length > 0 ? (
          <GlassCard padding="lg" className="space-y-6">
            {validEmail && (
              <div className="space-y-4">
                <p className="type-meta uppercase text-[var(--text-muted)]">
                  DIRECT EMAIL
                </p>

                <div className="flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
                  <a
                    ref={emailRef}
                    href={`mailto:${validEmail}`}
                    className={[
                      'inline-flex min-h-[44px] items-center gap-3 font-display text-xl md:text-2xl font-semibold',
                      'text-[var(--text-primary)] break-all hover:text-[var(--accent-primary)]',
                      'rounded-[var(--radius-control)]',
                      'focus-visible:outline-2 focus-visible:outline-[var(--focus-ring)] focus-visible:outline-offset-[3px]',
                    ].join(' ')}
                  >
                    <Mail className="size-5 shrink-0 text-[var(--accent-primary)]" aria-hidden="true" />
                    <span>{validEmail}</span>
                  </a>

                  <Button
                    variant={status === 'copied' ? 'primary' : 'secondary'}
                    size="md"
                    onClick={() => void handleCopyEmail()}
                    leftIcon={
                      <AnimatePresence mode="wait" initial={false}>
                        {status === 'copied' ? (
                          <m.span
                            key="check"
                            initial={
                              prefersReducedMotion ? false : { opacity: 0, scale: 0.8 }
                            }
                            animate={{ opacity: 1, scale: 1 }}
                            exit={
                              prefersReducedMotion ? undefined : { opacity: 0, scale: 0.8 }
                            }
                            transition={
                              prefersReducedMotion
                                ? REDUCED_TRANSITION
                                : { duration: 0.16 }
                            }
                            className="inline-flex items-center"
                          >
                            <Check className="size-4" />
                          </m.span>
                        ) : (
                          <m.span
                            key="copy"
                            initial={prefersReducedMotion ? false : { opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={prefersReducedMotion ? undefined : { opacity: 0 }}
                            transition={
                              prefersReducedMotion
                                ? REDUCED_TRANSITION
                                : { duration: 0.12 }
                            }
                            className="inline-flex items-center"
                          >
                            <Copy className="size-4" />
                          </m.span>
                        )}
                      </AnimatePresence>
                    }
                  >
                    {status === 'copied' ? 'Copied' : 'Copy Email'}
                  </Button>
                </div>

                <m.div
                  data-testid="copy-feedback-badge"
                  variants={statusBadgeVariants}
                  initial={false}
                  animate={status !== 'idle' ? 'visible' : 'hidden'}
                >
                  <LiveAnnouncer
                    message={announcement}
                    politeness="polite"
                    visible={status !== 'idle'}
                    className={
                      status === 'copied'
                        ? 'text-sm text-[var(--status-success)]'
                        : 'text-sm text-[var(--status-warning)]'
                    }
                  />
                </m.div>
              </div>
            )}

            {validSocialLinks.length > 0 && (
              <div
                className={
                  validEmail ? 'border-t border-[var(--border-subtle)] pt-5' : ''
                }
              >
                <p className="type-meta uppercase text-[var(--text-muted)] mb-3">
                  PROFILES
                </p>
                <ul className="flex flex-wrap gap-3 m-0 p-0 list-none">
                  {validSocialLinks.map((link) => (
                    <li key={link.id}>
                      <a
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={[
                          'glass-surface inline-flex min-h-[44px] items-center gap-2 px-4 py-2.5',
                          'rounded-[var(--radius-control)] font-mono text-xs font-medium text-[var(--text-primary)]',
                          'transition-[background-color,border-color] duration-[var(--transition-theme)]',
                          'hover:border-[var(--accent-primary)] hover:bg-[var(--surface-card)]',
                          'focus-visible:outline-2 focus-visible:outline-[var(--focus-ring)] focus-visible:outline-offset-[3px]',
                        ].join(' ')}
                      >
                        <span>{link.label}</span>
                        {hasNonEmptyText(link.handle) && (
                          <span className="text-[var(--text-muted)]">
                            ({link.handle})
                          </span>
                        )}
                        <ArrowUpRight className="size-3.5 shrink-0" aria-hidden="true" />
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </GlassCard>
        ) : (
          <GlassCard padding="lg" variant="elevated">
            <p className="type-meta uppercase text-[var(--text-muted)] mb-2">
              CONTACT // PENDING_VERIFICATION
            </p>
            <p className="type-body text-[var(--text-secondary)] max-w-[68ch]">
              Verified contact channels have not been published yet.
            </p>
          </GlassCard>
        )}
      </div>
    </SectionShell>
  );
}
