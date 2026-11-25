export function hasNonEmptyText(value: string | null | undefined): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

export function isValidHttpUrl(url: string | null | undefined): url is string {
  if (!hasNonEmptyText(url)) {
    return false;
  }

  try {
    const parsed = new URL(url);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

export function isValidLocalOrHttpAssetUrl(
  url: string | null | undefined,
): url is string {
  if (!hasNonEmptyText(url)) {
    return false;
  }

  const trimmed = url.trim();
  if (trimmed.startsWith('/')) {
    return !trimmed.startsWith('//');
  }

  return isValidHttpUrl(trimmed);
}

export function isValidEmailAddress(email: string | null | undefined): email is string {
  if (!hasNonEmptyText(email)) {
    return false;
  }

  const trimmed = email.trim();
  if (/\s/.test(trimmed) || trimmed.length > 254) {
    return false;
  }

  const parts = trimmed.split('@');
  if (parts.length !== 2) {
    return false;
  }

  const [localPart, domainPart] = parts;
  return Boolean(
    localPart &&
      domainPart &&
      domainPart.includes('.') &&
      !domainPart.startsWith('.') &&
      !domainPart.endsWith('.'),
  );
}
