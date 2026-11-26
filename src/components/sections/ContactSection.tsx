import { ArrowUpRight, Check, Copy, Download, Radio } from 'lucide-react';
import { m } from 'motion/react';
import { useRef } from 'react';
import { GitHubIcon, LinkedInIcon, MailIcon } from '@/components/icons/SocialIcons';
import { SectionShell } from '@/components/layout/SectionShell';
import { Button } from '@/components/ui/Button';
import { GlassCard } from '@/components/ui/GlassCard';
import { LiveAnnouncer } from '@/components/ui/LiveAnnouncer';
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
      <div className="pointer-events-auto space-y-6">
        {hasAvailability && contact.availabilityNote && (
          <div className="inline-flex items-center gap-2.5">
            <Radio className="size-4 text-[var(--planet-contact)] shrink-0" aria-hidden="true" />
            <p className="type-meta text-[var(--planet-contact)]">
              {contact.availabilityNote}
            </p>
          </div>
        )}

        {validEmail || validSocialLinks.length > 0 ? (
          <div className="swiss-grid items-center gap-y-6">
            {/* Compact Direct Email Signal Console */}
            {validEmail && (
              <GlassCard
                as="article"
                padding="md"
                variant="strong"
                className="col-span-4 md:col-span-8 lg:col-span-6 relative overflow-hidden flex flex-col justify-between gap-3 border-[var(--planet-contact)]/35"
              >
                <p className="type-meta uppercase tracking-[0.14em] text-[var(--planet-contact)]">
                  DIRECT SIGNAL
                </p>

                <div className="flex flex-wrap items-center justify-between gap-3">
                  <a
                    ref={emailRef}
                    href={`mailto:${validEmail}`}
                    className="inline-flex min-h-[44px] items-center gap-2.5 text-base sm:text-lg font-display font-semibold text-[var(--text-primary)] hover:text-[var(--planet-contact)] transition-colors duration-200 break-all focus-visible:outline-2 focus-visible:outline-[var(--focus-ring)] focus-visible:outline-offset-[3px]"
                  >
                    <MailIcon className="size-4 shrink-0 text-[var(--planet-contact)]" />
                    <span>{validEmail}</span>
                  </a>

                  <Button
                    variant="secondary"
                    size="sm"
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

            {/* Minimal Celestial Icon Nodes (single authoritative social & résumé destination) */}
            <nav
              aria-label="Verified Contact & Social Links"
              data-testid="contact-relay-dock"
              className="col-span-4 md:col-span-8 lg:col-span-6 relative flex flex-wrap items-center justify-start lg:justify-end gap-5 sm:gap-7 py-2"
            >
              {validSocialLinks.map((link) => {
                const Icon = PLATFORM_ICONS[link.platform] ?? ArrowUpRight;
                return (
                  <a
                    key={link.id}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group inline-flex min-h-[48px] min-w-[48px] flex-col items-center gap-2 text-center focus-visible:outline-2 focus-visible:outline-[var(--focus-ring)] focus-visible:outline-offset-[4px]"
                  >
                    <span className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-[var(--border-glass)] bg-[var(--surface-elevated)]/80 text-[var(--planet-contact)] transition-[border-color,transform,box-shadow] duration-200 group-hover:scale-105 group-hover:border-[var(--planet-contact)] group-hover:shadow-[0_0_20px_rgba(244,114,182,0.28)]">
                      <Icon className="size-5" />
                    </span>
                    <span className="font-mono text-xs text-[var(--text-secondary)] group-hover:text-[var(--text-primary)] transition-colors duration-200">
                      {link.label}
                      <span className="sr-only">{` — Austin Joshua on ${link.label}`}</span>
                    </span>
                  </a>
                );
              })}

              {hasResume && profileData.resume && (
                <a
                  href={profileData.resume.url}
                  download="Austin_Joshua_Resume.pdf"
                  aria-label="Download Austin Joshua Résumé (PDF)"
                  className="group inline-flex min-h-[48px] min-w-[48px] flex-col items-center gap-2 text-center focus-visible:outline-2 focus-visible:outline-[var(--focus-ring)] focus-visible:outline-offset-[4px]"
                >
                  <span className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-[var(--planet-sun)]/45 bg-[var(--planet-sun)]/10 text-[var(--planet-sun)] transition-[border-color,transform,box-shadow] duration-200 group-hover:scale-105 group-hover:border-[var(--planet-sun)] group-hover:shadow-[0_0_20px_rgba(255,179,71,0.28)]">
                    <Download className="size-5" aria-hidden="true" />
                  </span>
                  <span className="font-mono text-xs text-[var(--planet-sun)] group-hover:brightness-110 transition-colors duration-200">
                    Résumé
                  </span>
                </a>
              )}
            </nav>
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
