import { ArrowUpRight, Check, Copy, Radio } from 'lucide-react';
import { m } from 'motion/react';
import { useRef } from 'react';
import { GitHubIcon, LinkedInIcon, MailIcon } from '@/components/icons/SocialIcons';
import { SectionShell } from '@/components/layout/SectionShell';
import { Button } from '@/components/ui/Button';
import { GlassCard } from '@/components/ui/GlassCard';
import { LiveAnnouncer } from '@/components/ui/LiveAnnouncer';
import { SideReveal } from '@/components/ui/SideReveal';
import { contactData } from '@/data/contact';
import { useClipboard } from '@/hooks/useClipboard';
import { statusBadgeVariants } from '@/motion/variants';
import type { ContactData } from '@/types/portfolio';
import {
  hasNonEmptyText,
  isValidEmailAddress,
  isValidHttpUrl,
} from '@/utils/dataGuards';
import { playClick, playSuccess } from '@/utils/soundEffects';

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
    if (!validEmail) return;
    const copied = await copy(validEmail);
    if (copied) {
      playSuccess();
    } else {
      playClick();
      selectTextNode(emailRef.current);
    }
  };

  return (
    <SectionShell
      id="contact"
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
            {validEmail && (
              <SideReveal
                direction="left"
                className="col-span-4 md:col-span-8 lg:col-span-7 pointer-events-auto"
              >
                <GlassCard
                  as="article"
                  padding="lg"
                  variant="strong"
                  className="h-full p-6 sm:p-8 lg:p-10 flex flex-col justify-between gap-6 border-[var(--planet-contact)]/40"
                >
                  <div className="space-y-5">
                    <p className="type-meta text-xs font-medium text-[var(--planet-contact)]">
                      Direct email
                    </p>

                    <div className="space-y-5">
                      <a
                        ref={emailRef}
                        href={`mailto:${validEmail}`}
                        onClick={() => playClick()}
                        className="inline-flex min-h-[44px] items-center gap-3.5 text-xl sm:text-2xl lg:text-[2.1rem] leading-tight font-display font-bold text-[var(--text-primary)] hover:text-[var(--planet-contact)] transition-colors duration-150 break-all focus-visible:outline-2 focus-visible:outline-[var(--focus-ring)] focus-visible:outline-offset-[3px]"
                      >
                        <MailIcon className="size-6 shrink-0 text-[var(--planet-contact)]" />
                        <span>{validEmail}</span>
                      </a>

                      <div className="flex flex-wrap items-center gap-3.5 pt-1">
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
                          {status === 'copied' ? 'Copied' : 'Copy'}
                        </Button>

                        <a
                          href={`mailto:${validEmail}`}
                          onClick={() => playClick()}
                          className="inline-flex min-h-[44px] items-center gap-2 rounded-[var(--radius-control)] border border-[var(--planet-contact)]/45 bg-[var(--planet-contact)]/12 px-5 py-2.5 font-mono text-xs sm:text-sm font-medium text-[var(--text-primary)] hover:border-[var(--planet-contact)] hover:bg-[var(--planet-contact)]/20 transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-[var(--focus-ring)] focus-visible:outline-offset-[3px]"
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

                  <p className="type-body text-sm md:text-base text-[var(--text-secondary)] border-t border-[var(--border-subtle)] pt-5">
                    Open to <span className="font-medium text-[var(--text-primary)]">Software Engineering</span>,{' '}
                    <span className="font-medium text-[var(--text-primary)]">Python Backend</span>, and{' '}
                    <span className="font-medium text-[var(--text-primary)]">Applied AI/ML</span> roles.
                  </p>
                </GlassCard>
              </SideReveal>
            )}

            <SideReveal
              direction="right"
              className="col-span-4 md:col-span-8 lg:col-span-5 pointer-events-auto flex"
            >
              <GlassCard
                padding="lg"
                variant="default"
                className="w-full p-6 sm:p-8 lg:p-10 flex flex-col justify-between gap-7 border-[var(--planet-contact)]/25"
              >
                <div className="space-y-2">
                  <p className="type-meta text-xs font-medium text-[var(--planet-contact)]">
                    Profiles
                  </p>
                  <p className="type-body text-sm md:text-base text-[var(--text-secondary)]">
                    Source repositories and direct professional profiles.
                  </p>
                </div>

                <nav
                  aria-label="Verified Contact & Social Links"
                  data-testid="contact-relay-dock"
                  className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-1"
                >
                  {validSocialLinks.map((link) => {
                    const Icon = PLATFORM_ICONS[link.platform] ?? ArrowUpRight;
                    return (
                      <a
                        key={link.id}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => playClick()}
                        className="group flex min-h-[48px] items-center gap-3.5 rounded-[var(--radius-control)] border border-[var(--border-subtle)] bg-[var(--surface-elevated)]/80 px-4 py-3.5 transition-colors duration-150 hover:border-[var(--planet-contact)] focus-visible:outline-2 focus-visible:outline-[var(--focus-ring)] focus-visible:outline-offset-[3px]"
                      >
                        <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[var(--border-glass)] bg-[var(--surface-card)] text-[var(--planet-contact)]">
                          <Icon className="size-[18px]" />
                        </span>
                        <span className="min-w-0 flex flex-col">
                          <span className="font-display text-sm font-semibold text-[var(--text-primary)] group-hover:text-[var(--planet-contact)] transition-colors duration-150">
                            {link.label}
                            <span className="sr-only">{` — Austin Joshua on ${link.label}`}</span>
                          </span>
                          {hasNonEmptyText(link.handle) && (
                            <span className="font-mono text-xs text-[var(--text-muted)] truncate">
                              {link.handle}
                            </span>
                          )}
                        </span>
                      </a>
                    );
                  })}
                </nav>

                <p className="type-meta text-xs text-[var(--text-muted)] border-t border-[var(--border-subtle)] pt-4">
                  Based in Chennai, India
                </p>
              </GlassCard>
            </SideReveal>
          </div>
        ) : (
          <GlassCard padding="lg" variant="elevated" className="pointer-events-auto">
            <p className="type-meta text-xs text-[var(--text-muted)] mb-2">
              Contact
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
