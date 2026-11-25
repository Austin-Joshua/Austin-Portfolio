import { ArrowUpRight, Check, Copy, Mail } from 'lucide-react';
import { AnimatePresence, m } from 'motion/react';
import { useRef } from 'react';
import { SectionShell } from '@/components/layout/SectionShell';
import { Button } from '@/components/ui/Button';
import { GlassCard } from '@/components/ui/GlassCard';
import { LiveAnnouncer } from '@/components/ui/LiveAnnouncer';
import { useOptionalMotionPreference } from '@/context/MotionPreferenceContext';
import { contactData } from '@/data/contact';
import { profileData } from '@/data/profile';
import { useClipboard } from '@/hooks/useClipboard';
import { REDUCED_TRANSITION, statusBadgeVariants } from '@/motion/variants';
import type { ContactData } from '@/types/portfolio';
import {
  hasNonEmptyText,
  isValidEmailAddress,
  isValidHttpUrl,
  isValidLocalOrHttpAssetUrl,
} from '@/utils/dataGuards';

export interface ContactSectionProps {
  contact?: ContactData;
}

function GitHubIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.438 9.8 8.207 11.387.6.113.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0 1 12 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.63-5.37-12-12-12z" />
    </svg>
  );
}

function LinkedInIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  );
}

type IconComponent = React.ComponentType<{ className?: string }>;

const PLATFORM_ICONS: Record<string, IconComponent> = {
  github: GitHubIcon,
  linkedin: LinkedInIcon,
};

function selectTextNode(element: HTMLElement | null): void {
  if (!element || typeof window === 'undefined' || typeof document === 'undefined') return;
  try {
    const selection = window.getSelection();
    if (!selection) return;
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

  const hasResume =
    profileData.resume !== null &&
    isValidLocalOrHttpAssetUrl(profileData.resume.url);

  const handleCopyEmail = async () => {
    if (!validEmail) return;
    const copied = await copy(validEmail);
    if (!copied) selectTextNode(emailRef.current);
  };

  return (
    <SectionShell id="contact" index="07" indexLabel="CONTACT" title="Contact">
      <div className="space-y-8">
        {/* Headline */}
        {hasHeadline && contact.headline && (
          <p className="type-lead text-[var(--text-secondary)] max-w-[56ch]">
            {contact.headline}
          </p>
        )}

        {/* Availability badge */}
        {hasAvailability && contact.availabilityNote && (
          <div className="inline-flex items-center gap-2">
            <span
              aria-hidden="true"
              className="inline-block h-2 w-2 rounded-full bg-[var(--status-success)]"
              style={{ boxShadow: '0 0 6px var(--status-success)' }}
            />
            <p className="type-meta text-[var(--status-success)]">
              {contact.availabilityNote}
            </p>
          </div>
        )}

        {validEmail || validSocialLinks.length > 0 ? (
          <div className="swiss-grid gap-y-4">
            {/* Email card */}
            {validEmail && (
              <GlassCard
                padding="lg"
                className="col-span-4 md:col-span-8 lg:col-span-8 space-y-5"
              >
                <p className="type-meta uppercase text-[var(--text-muted)]">
                  Direct Email
                </p>

                <div className="flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
                  <a
                    ref={emailRef}
                    href={`mailto:${validEmail}`}
                    className={[
                      'inline-flex min-h-[44px] items-center gap-3',
                      'font-display text-xl md:text-2xl font-semibold',
                      'text-[var(--text-primary)] break-all',
                      'hover:text-[var(--accent-primary)]',
                      'transition-colors duration-200',
                      'rounded-[var(--radius-control)]',
                      'focus-visible:outline-2 focus-visible:outline-[var(--focus-ring)] focus-visible:outline-offset-[3px]',
                    ].join(' ')}
                  >
                    <Mail
                      className="size-5 shrink-0 text-[var(--accent-primary)]"
                      aria-hidden="true"
                    />
                    <span>{validEmail}</span>
                  </a>

                  <Button
                    variant={status === 'copied' ? 'primary' : 'secondary'}
                    size="md"
                    aria-label="Copy Email"
                    onClick={() => void handleCopyEmail()}
                    leftIcon={
                      <AnimatePresence mode="wait" initial={false}>
                        {status === 'copied' ? (
                          <m.span
                            key="check"
                            initial={prefersReducedMotion ? false : { opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={prefersReducedMotion ? undefined : { opacity: 0, scale: 0.8 }}
                            transition={prefersReducedMotion ? REDUCED_TRANSITION : { duration: 0.16 }}
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
                            transition={prefersReducedMotion ? REDUCED_TRANSITION : { duration: 0.12 }}
                            className="inline-flex items-center"
                          >
                            <Copy className="size-4" />
                          </m.span>
                        )}
                      </AnimatePresence>
                    }
                  >
                    {status === 'copied' ? 'Copied!' : 'Copy'}
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
              </GlassCard>
            )}

            {/* Social profile cards */}
            {validSocialLinks.map((link) => {
              const Icon = PLATFORM_ICONS[link.platform] ?? ArrowUpRight;
              return (
                <GlassCard
                  key={link.id}
                  as="article"
                  padding="lg"
                  className="col-span-4 md:col-span-4 lg:col-span-4 space-y-4 glass-card-cinematic group"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div
                      className="inline-flex h-10 w-10 items-center justify-center rounded-[var(--radius-control)] border border-[var(--border-glass)] bg-[var(--surface-card)] text-[var(--accent-primary)]"
                    >
                      <Icon className="size-5" />
                    </div>
                  </div>

                  <div>
                    <p className="type-h3 text-[var(--text-primary)]">{link.label}</p>
                    {hasNonEmptyText(link.handle) && (
                      <p className="type-meta text-[var(--text-muted)] mt-1">{link.handle}</p>
                    )}
                  </div>

                  <a
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={[
                      'inline-flex min-h-[44px] items-center gap-2 px-4 py-2',
                      'rounded-[var(--radius-control)]',
                      'bg-[var(--accent-primary)] text-[var(--text-on-accent)]',
                      'font-mono text-xs font-semibold',
                      'hover:brightness-110 transition-[filter,transform] duration-200 hover:-translate-y-0.5',
                      'focus-visible:outline-2 focus-visible:outline-[var(--focus-ring)] focus-visible:outline-offset-[3px]',
                    ].join(' ')}
                  >
                    <span>View Profile</span>
                    <ArrowUpRight className="size-3.5 shrink-0" aria-hidden="true" />
                  </a>
                </GlassCard>
              );
            })}

            {/* Résumé card */}
            {hasResume && profileData.resume && (
              <GlassCard
                as="article"
                padding="lg"
                className="col-span-4 md:col-span-4 lg:col-span-4 space-y-4 glass-card-cinematic"
              >
                <div className="flex items-start justify-between gap-2">
                  <div
                    className="inline-flex h-10 w-10 items-center justify-center rounded-[var(--radius-control)] border border-[var(--border-glass)] bg-[var(--surface-card)] text-[var(--accent-gold)]"
                  >
                    <ArrowUpRight className="size-5" aria-hidden="true" />
                  </div>
                </div>

                <div>
                  <p className="type-h3 text-[var(--text-primary)]">Résumé</p>
                  <p className="type-meta text-[var(--text-muted)] mt-1">PDF · {profileData.resume.sizeLabel ?? 'Download'}</p>
                </div>

                <a
                  href={profileData.resume.url}
                  download
                  rel="noopener noreferrer"
                  className={[
                    'inline-flex min-h-[44px] items-center gap-2 px-4 py-2',
                    'rounded-[var(--radius-control)]',
                    'glass-surface border-[var(--accent-gold)] text-[var(--accent-gold)]',
                    'font-mono text-xs font-semibold',
                    'hover:bg-[var(--surface-card)] transition-[background-color,transform] duration-200 hover:-translate-y-0.5',
                    'focus-visible:outline-2 focus-visible:outline-[var(--focus-ring)] focus-visible:outline-offset-[3px]',
                  ].join(' ')}
                  style={{ borderColor: 'var(--accent-gold)' }}
                >
                  <span>↓ Download</span>
                </a>
              </GlassCard>
            )}
          </div>
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
