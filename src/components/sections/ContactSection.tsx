import { ArrowUpRight, Check, Copy, Download, Radio } from 'lucide-react';
import { AnimatePresence, m } from 'motion/react';
import { useRef } from 'react';
import { GitHubIcon, LinkedInIcon, MailIcon } from '@/components/icons/SocialIcons';
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
    <SectionShell
      id="contact"
      index="07"
      indexLabel="CONTACT"
      title="Contact"
      description={hasHeadline && contact.headline ? contact.headline : undefined}
    >
      <div className="pointer-events-auto space-y-8">
        {hasAvailability && contact.availabilityNote && (
          <div className="inline-flex items-center gap-2.5">
            <Radio className="size-4 text-[var(--planet-contact)]" aria-hidden="true" />
            <p className="type-meta text-[var(--planet-contact)]">
              {contact.availabilityNote}
            </p>
          </div>
        )}

        {validEmail || validSocialLinks.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
            {/* Primary Direct Communication Beacon */}
            {validEmail && (
              <GlassCard
                as="article"
                padding="lg"
                variant="strong"
                className="lg:col-span-7 relative overflow-hidden flex flex-col justify-between gap-6 border-[var(--planet-contact)]/35"
              >
                {/* Signal pulse ring motif */}
                <svg
                  aria-hidden="true"
                  viewBox="0 0 180 180"
                  className="pointer-events-none absolute -right-8 -top-8 h-44 w-44 opacity-20"
                  fill="none"
                >
                  <circle cx="90" cy="90" r="24" stroke="#F472B6" strokeWidth="1.5" />
                  <circle cx="90" cy="90" r="48" stroke="#F472B6" strokeDasharray="4 6" />
                  <circle cx="90" cy="90" r="76" stroke="#F472B6" strokeDasharray="2 8" />
                </svg>

                <div className="relative z-10 space-y-3">
                  <p className="type-meta uppercase text-[var(--planet-contact)]">
                    DIRECT SIGNAL BEACON
                  </p>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
                    <a
                      ref={emailRef}
                      href={`mailto:${validEmail}`}
                      className={[
                        'inline-flex min-h-[44px] items-center gap-2.5 sm:gap-3',
                        'font-display text-[15px] sm:text-xl md:text-2xl font-semibold',
                        'text-[var(--text-primary)] break-all hover:text-[var(--planet-contact)]',
                        'transition-colors duration-200 rounded-[var(--radius-control)]',
                        'focus-visible:outline-2 focus-visible:outline-[var(--focus-ring)] focus-visible:outline-offset-[3px]',
                      ].join(' ')}
                    >
                      <MailIcon className="size-5 shrink-0 text-[var(--planet-contact)]" />
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

            {/* Orbiting Communication Satellites */}
            <div className="lg:col-span-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4">
              {validSocialLinks.map((link) => {
                const Icon = PLATFORM_ICONS[link.platform] ?? ArrowUpRight;
                return (
                  <a
                    key={link.id}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="glass-surface flex min-h-[64px] items-center justify-between gap-4 px-5 py-4 rounded-[var(--radius-card)] hover:border-[var(--planet-contact)] transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-[var(--focus-ring)] focus-visible:outline-offset-[3px]"
                  >
                    <div className="flex items-center gap-3.5">
                      <span className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[var(--border-glass)] bg-[var(--surface-card)] text-[var(--planet-contact)]">
                        <Icon className="size-4" />
                      </span>
                      <div>
                        <p className="text-sm font-semibold text-[var(--text-primary)]">
                          {link.label}
                          <span className="sr-only">{` — Austin Joshua on ${link.label}`}</span>
                        </p>
                        {hasNonEmptyText(link.handle) && (
                          <p className="type-meta text-xs text-[var(--text-muted)]">
                            {link.handle}
                          </p>
                        )}
                      </div>
                    </div>
                    <ArrowUpRight className="size-4 text-[var(--planet-contact)] shrink-0" aria-hidden="true" />
                  </a>
                );
              })}

              {hasResume && profileData.resume && (
                <a
                  href={profileData.resume.url}
                  download="Austin_Joshua_Resume.pdf"
                  className="glass-surface flex min-h-[64px] items-center justify-between gap-4 px-5 py-4 rounded-[var(--radius-card)] hover:border-[var(--planet-sun)] transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-[var(--focus-ring)] focus-visible:outline-offset-[3px]"
                >
                  <div className="flex items-center gap-3.5">
                    <span className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[var(--planet-sun)]/40 bg-[var(--planet-sun)]/10 text-[var(--planet-sun)]">
                      <Download className="size-4" aria-hidden="true" />
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-[var(--text-primary)]">
                        Résumé
                      </p>
                      <p className="type-meta text-xs text-[var(--text-muted)]">
                        Austin Joshua · PDF
                      </p>
                    </div>
                  </div>
                  <span className="font-mono text-xs text-[var(--planet-sun)]">Download</span>
                </a>
              )}
            </div>
          </div>
        ) : (
          <GlassCard padding="lg" variant="elevated">
            <p className="type-meta uppercase text-[var(--text-muted)] mb-2">
              CONTACT // PENDING_VERIFICATION
            </p>
            <p className="type-body text-[var(--text-secondary)] max-w-[68ch]">
              Contact links will be published here prior to release.
            </p>
          </GlassCard>
        )}
      </div>
    </SectionShell>
  );
}
