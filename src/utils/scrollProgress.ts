export function calculateScrollProgress(
  scrollY: number,
  scrollHeight: number,
  innerHeight: number,
): number {
  if (
    !Number.isFinite(scrollY) ||
    !Number.isFinite(scrollHeight) ||
    !Number.isFinite(innerHeight)
  ) {
    return 0;
  }

  const maxScroll = Math.max(0, scrollHeight - innerHeight);
  if (maxScroll === 0) {
    return 0;
  }

  const ratio = scrollY / maxScroll;
  return Math.min(1, Math.max(0, ratio));
}
