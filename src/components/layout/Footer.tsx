import { profileData } from '@/data/profile';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative z-10 pointer-events-auto bg-[var(--surface-canvas)]/92 backdrop-blur-sm pb-20 md:pb-0">
      <div className="container-portfolio py-3 md:py-3.5">
        <div className="flex flex-wrap items-center justify-between gap-2 pr-14 md:pr-0 text-xs text-[var(--text-muted)]">
          <div className="flex items-center gap-2.5">
            <img
              src="/assets/brand/aj-emblem.png"
              alt="AJ"
              width={24}
              height={24}
              className="h-6 w-6 rounded-full object-contain shrink-0"
            />
            <span className="font-medium text-[var(--text-secondary)]">
              {profileData.name}
            </span>
            <span aria-hidden="true">·</span>
            <span className="type-meta text-[11px]">© {currentYear}</span>
          </div>

          <span className="type-meta text-[11px]">Chennai, India</span>
        </div>
      </div>
    </footer>
  );
}
