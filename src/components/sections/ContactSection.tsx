import { ArrowUpRight, Check, Copy, Download, Radio } from 'lucide-react';
import { m } from 'motion/react';
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
import { statusBadgeVariants } from '@/motion/variants';
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

  const canUseInView =
    !prefersReducedMotion && typeof IntersectionObserver !== 'undefined';

  return (
    <SectionShell
      id="contact"
      index="07"
      indexLabel="CONTACT"
      title="Contact"
      description={hasHeadline && contact.headline ? contact.headline : undefined}
    >
      <div className="pointer-events-none space-y-8">
        {hasAvailability && contact.availabilityNote && (
          <div className="pointer-events-auto inline-flex items-center gap-3 rounded-full border border-[var(--planet-contact)]/35 bg-[var(--surface-glass)] px-4 py-2 backdrop-blur-md">
            <Radio className="size-4 text-[var(--planet-contact)] shrink-0" aria-hidden="true" />
            <p className="type-meta text-xs sm:text-sm text-[var(--planet-contact)]">
              {contact.availabilityNote}
            </p>
          </div>
        )}

        {validEmail || validSocialLinks.length > 0 ? (
          <div className="swiss-grid items-stretch gap-y-8 pointer-events-none">
            {/* Left 7 columns: Reconstructed Direct Signal Terminal Console */}
            {validEmail && (
              <m.div
                initial={canUseInView ? { x: -24 } : false}
                whileInView={canUseInView ? { x: 0 } : undefined}
                viewport={{ once: true, amount: 0.15 }}
                transition={{ duration: 0.48, ease: [0.22, 1, 0.36, 1] }}
                className="col-span-4 md:col-span-8 lg:col-span-7 pointer-events-auto"
              >
                <GlassCard
                  as="article"
                  padding="lg"
                  variant="strong"
                  className="relative overflow-hidden h-full p-6 sm:p-8 lg:p-10 flex flex-col justify-between gap-6 border-[var(--planet-contact)]/40"
                >
                  {/* Nova Rose orbital beacon geometry */}
                  <svg
                    aria-hidden="true"
                    viewBox="0 0 260 260"
                    className="pointer-events-none absolute -right-12 -top-12 h-56 w-56 opacity-20"
                    fill="none"
                  >
                    <circle cx="130" cy="130" r="95" stroke="#F472B6" strokeDasharray="4 6" />
                    <circle cx="130" cy="130" r="58" stroke="#DCE4F0" strokeOpacity="0.45" />
                    <circle cx="225" cy="130" r="4" fill="#F472B6" />
                  </svg>

                  <div className="relative z-10 space-y-4">
                    <p className="type-meta uppercase tracking-[0.16em] text-[var(--planet-contact)]">
                      DIRECT SIGNAL // PRIMARY INBOX
                    </p>

                    <div className="space-y-4">
                      <a
                        ref={emailRef}
                        href={`mailto:${validEmail}`}
                        className="inline-flex min-h-[44px] items-center gap-3 text-xl sm:text-2xl lg:text-3xl font-display font-bold text-[var(--text-primary)] hover:text-[var(--planet-contact)] transition-colors duration-200 break-all focus-visible:outline-2 focus-visible:outline-[var(--focus-ring)] focus-visible:outline-offset-[3px]"
                      >
                        <MailIcon className="size-6 shrink-0 text-[var(--planet-contact)]" />
                        <span>{validEmail}</span>
                      </a>

                      <div className="flex flex-wrap items-center gap-3 pt-1">
                        <Button
                          variant="secondary"
                          size="md"
                          onClick={() => {
                            void handleCopyEmail();
                          }}
                          leftIcon={
                            status === 'copied' ? (
                              <Check className="size-4 text-[var(--status-success)]" />
                            ) : (
                              <Copy className="size-4" />
                            )
                          }
                          aria-label={
                            status === 'copied'
                              ? 'Email address copied'
                              : 'Copy Email'
                          }
                        >
                          {status === 'copied' ? 'Copied!' : 'Copy'}
                        </Button>

                        <a
                          href={`mailto:${validEmail}`}
                          className="inline-flex min-h-[44px] items-center gap-2 rounded-[var(--radius-control)] border border-[var(--planet-contact)]/45 bg-[var(--planet-contact)]/12 px-4 py-2.5 font-mono text-xs sm:text-sm font-medium text-[var(--text-primary)] hover:border-[var(--planet-contact)] hover:bg-[var(--planet-contact)]/20 transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-[var(--focus-ring)] focus-visible:outline-offset-[3px]"
                        >
                          <span>Compose Mail</span>
                          <ArrowUpRight className="size-4 text-[var(--planet-contact)]" aria-hidden="true" />
                        </a>
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
                  </div>

                  <div className="relative z-10 grid grid-cols-1 sm:grid-cols-3 gap-3 border-t border-[var(--border-subtle)] pt-5">
                    {[
                      { label: 'Focus', value: 'Software Engineering' },
                      { label: 'Domain', value: 'Python & Applied AI/ML' },
                      { label: 'Base', value: 'Chennai, India' },
                    ].map((meta) => (
                      <div
                        key={meta.label}
                        className="rounded-[var(--radius-control)] border border-[var(--border-subtle)]/80 bg-[var(--surface-elevated)]/70 px-3.5 py-3"
                      >
                        <p className="type-meta text-[11px] uppercase text-[var(--planet-contact)]">
                          {meta.label}
                        </p>
                        <p className="text-sm font-medium text-[var(--text-primary)] mt-0.5">
                          {meta.value}
                        </p>
                      </div>
                    ))}
                  </div>
                </GlassCard>
              </m.div>
            )}

            {/* Right 5 columns: Reconstructed Celestial Relay Hub with Minimal Circular Icon Nodes */}
            <m.div
              initial={canUseInView ? { x: 24 } : false}
              whileInView={canUseInView ? { x: 0 } : undefined}
              viewport={{ once: true, amount: 0.15 }}
              transition={{ duration: 0.48, ease: [0.22, 1, 0.36, 1] }}
              className="col-span-4 md:col-span-8 lg:col-span-5 pointer-events-auto flex"
            >
              <GlassCard
                padding="lg"
                variant="default"
                className="relative overflow-hidden w-full p-6 sm:p-8 flex flex-col justify-between gap-6 border-[var(--planet-contact)]/25"
              >
                <div className="space-y-2">
                  <p className="type-meta uppercase tracking-[0.16em] text-[var(--planet-contact)]">
                    CELESTIAL RELAY // VERIFIED NODES
                  </p>
                  <p className="type-body text-sm md:text-base text-[var(--text-secondary)]">
                    Connect directly via verified profiles or download the complete résumé dossier.
                  </p>
                </div>

                <nav
                  aria-label="Verified Contact & Social Links"
                  data-testid="contact-relay-dock"
                  className="flex flex-wrap items-center justify-around sm:justify-between gap-6 py-4"
                >
                  {validSocialLinks.map((link) => {
                    const Icon = PLATFORM_ICONS[link.platform] ?? ArrowUpRight;
                    return (
                      <a
                        key={link.id}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group inline-flex min-h-[48px] min-w-[48px] flex-col items-center gap-2.5 text-center focus-visible:outline-2 focus-visible:outline-[var(--focus-ring)] focus-visible:outline-offset-[4px]"
                      >
                        <span className="inline-flex h-14 w-14 md:h-16 md:w-16 items-center justify-center rounded-full border border-[var(--border-glass)] bg-[var(--surface-elevated)]/85 text-[var(--planet-contact)] transition-[border-color,transform,box-shadow] duration-200 group-hover:scale-110 group-hover:border-[var(--planet-contact)] group-hover:shadow-[0_0_24px_rgba(244,114,182,0.34)]">
                          <Icon className="size-6" />
                        </span>
                        <span className="flex flex-col items-center">
                          <span className="font-display text-sm font-semibold text-[var(--text-primary)] group-hover:text-[var(--planet-contact)] transition-colors duration-200">
                            {link.label}
                            <span className="sr-only">{` — Austin Joshua on ${link.label}`}</span>
                          </span>
                          {hasNonEmptyText(link.handle) && (
                            <span className="font-mono text-xs text-[var(--text-muted)]">
                              {link.handle}
                            </span>
                          )}
                        </span>
                      </a>
                    );
                  })}

                  {hasResume && profileData.resume && (
                    <a
                      href={profileData.resume.url}
                      download="Austin_Joshua_Resume.pdf"
                      className="group inline-flex min-h-[48px] min-w-[48px] flex-col items-center gap-2.5 text-center focus-visible:outline-2 focus-visible:outline-[var(--focus-ring)] focus-visible:outline-offset-[4px]"
                    >
                      <span className="inline-flex h-14 w-14 md:h-16 md:w-16 items-center justify-center rounded-full border border-[var(--planet-sun)]/50 bg-[var(--planet-sun)]/12 text-[var(--planet-sun)] transition-[border-color,transform,box-shadow] duration-200 group-hover:scale-110 group-hover:border-[var(--planet-sun)] group-hover:shadow-[0_0_24px_rgba(255,179,71,0.34)]">
                        <Download className="size-6" aria-hidden="true" />
                      </span>
                      <span className="flex flex-col items-center">
                        <span className="font-display text-sm font-semibold text-[var(--planet-sun)]">
                          Résumé
                          <span className="sr-only"> — Download Austin Joshua</span>
                        </span>
                        <span className="font-mono text-xs text-[var(--text-muted)]">
                          PDF Dossier
                        </span>
                      </span>
                    </a>
                  )}
                </nav>
              </GlassCard>
            </m.div>
          </div>
        ) : (
          <GlassCard padding="lg" variant="elevated" className="pointer-events-auto">
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
