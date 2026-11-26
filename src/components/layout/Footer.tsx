import { MapPin } from 'lucide-react';
import { profileData } from '@/data/profile';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative z-10 pointer-events-auto border-t border-[var(--border-subtle)] bg-[var(--surface-canvas)]/92 backdrop-blur-sm pb-20 md:pb-8">
      <div className="container-portfolio py-7 md:py-9">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          {/* Canonical branding & verified role + copyright */}
          <div className="flex items-start gap-3.5">
            <img
              src="/assets/brand/aj-emblem.png"
              alt="AJ Cosmic Emblem"
              width={36}
              height={36}
              className="h-9 w-9 rounded-full object-contain shrink-0 mt-0.5"
            />
            <div className="space-y-1">
              <p className="font-display text-sm font-bold text-[var(--text-primary)]">
                {profileData.name}
              </p>
              {profileData.roleLabel && (
                <p className="type-meta text-[var(--text-muted)]">
                  {profileData.roleLabel}
                </p>
              )}
              <p className="type-meta text-xs text-[var(--text-muted)]">
                © {currentYear} {profileData.name} · AJ Cosmic Universe
              </p>
            </div>
          </div>

          {/* Concise cosmic station colophon (no duplicate socials or duplicate back-to-top) */}
          <div className="flex items-center gap-2.5 type-meta text-xs text-[var(--text-muted)] sm:text-right">
            <MapPin className="size-3.5 text-[var(--planet-sun)] shrink-0" aria-hidden="true" />
            <span>Chennai, India · Built with React, Three.js &amp; TypeScript</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
