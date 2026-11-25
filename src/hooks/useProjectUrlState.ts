import { useCallback, useEffect, useRef, useState } from 'react';
import type { ProjectItem } from '@/types/portfolio';
import {
  parseProjectQueryParam,
  resolveProjectBySlug,
} from '@/utils/slugValidation';

export interface UseProjectUrlStateOptions {
  projects: readonly ProjectItem[];
  onInvalidSlug?: () => void;
}

export interface UseProjectUrlStateResult {
  activeProject: ProjectItem | null;
  invalidSlugNotice: string | null;
  dismissInvalidSlugNotice: () => void;
  openProject: (slug: string) => void;
  closeProject: () => void;
}

const INVALID_SLUG_MESSAGE =
  'Requested project entry was not found. Displaying all available projects.';

function buildProjectsUrl(slug: string | null): string {
  if (typeof window === 'undefined') {
    return slug ? `?project=${encodeURIComponent(slug)}#projects` : '#projects';
  }

  const url = new URL(window.location.href);
  if (slug !== null) {
    url.searchParams.set('project', slug);
  } else {
    url.searchParams.delete('project');
  }

  url.hash = '#projects';

  return `${url.pathname}${url.search}${url.hash}`;
}

interface InitialUrlResolution {
  initialSlug: string | null;
  initialInvalid: boolean;
}

function readInitialUrlResolution(
  projects: readonly ProjectItem[],
): InitialUrlResolution {
  if (typeof window === 'undefined') {
    return { initialSlug: null, initialInvalid: false };
  }

  const { hasParam, rawValue } = parseProjectQueryParam(window.location.search);
  if (!hasParam) {
    return { initialSlug: null, initialInvalid: false };
  }

  const resolved = resolveProjectBySlug(rawValue, projects);
  if (!resolved) {
    return { initialSlug: null, initialInvalid: true };
  }

  return { initialSlug: resolved.slug, initialInvalid: false };
}

export function useProjectUrlState({
  projects,
  onInvalidSlug,
}: UseProjectUrlStateOptions): UseProjectUrlStateResult {
  const [selectedSlug, setSelectedSlug] = useState<string | null>(
    () => readInitialUrlResolution(projects).initialSlug,
  );
  const [invalidSlugNotice, setInvalidSlugNotice] = useState<string | null>(() =>
    readInitialUrlResolution(projects).initialInvalid
      ? INVALID_SLUG_MESSAGE
      : null,
  );

  const onInvalidSlugRef = useRef<(() => void) | undefined>(onInvalidSlug);
  const cleanedInitialInvalidRef = useRef(false);

  useEffect(() => {
    onInvalidSlugRef.current = onInvalidSlug;
  }, [onInvalidSlug]);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    if (!cleanedInitialInvalidRef.current) {
      const { hasParam, rawValue } = parseProjectQueryParam(window.location.search);
      if (hasParam && !resolveProjectBySlug(rawValue, projects)) {
        cleanedInitialInvalidRef.current = true;
        window.history.replaceState(
          window.history.state,
          '',
          buildProjectsUrl(null),
        );
        onInvalidSlugRef.current?.();
      }
    }

    const handlePopState = () => {
      const { hasParam, rawValue } = parseProjectQueryParam(window.location.search);
      if (!hasParam) {
        setSelectedSlug(null);
        return;
      }

      const resolved = resolveProjectBySlug(rawValue, projects);
      if (resolved) {
        setSelectedSlug(resolved.slug);
        setInvalidSlugNotice(null);
        return;
      }

      setSelectedSlug(null);
      setInvalidSlugNotice(INVALID_SLUG_MESSAGE);
      window.history.replaceState(
        window.history.state,
        '',
        buildProjectsUrl(null),
      );
      onInvalidSlugRef.current?.();
    };

    window.addEventListener('popstate', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [projects]);

  const dismissInvalidSlugNotice = useCallback(() => {
    setInvalidSlugNotice(null);
  }, []);

  const openProject = useCallback(
    (slug: string) => {
      const resolved = resolveProjectBySlug(slug, projects);
      if (!resolved) {
        setSelectedSlug(null);
        setInvalidSlugNotice(INVALID_SLUG_MESSAGE);
        if (typeof window !== 'undefined') {
          const { hasParam } = parseProjectQueryParam(window.location.search);
          if (hasParam) {
            window.history.replaceState(
              window.history.state,
              '',
              buildProjectsUrl(null),
            );
          }
        }
        onInvalidSlugRef.current?.();
        return;
      }

      setInvalidSlugNotice(null);
      setSelectedSlug(resolved.slug);

      if (typeof window !== 'undefined') {
        const { rawValue } = parseProjectQueryParam(window.location.search);
        const currentResolved = resolveProjectBySlug(rawValue, projects);
        if (currentResolved?.slug !== resolved.slug) {
          window.history.pushState(
            { projectSlug: resolved.slug },
            '',
            buildProjectsUrl(resolved.slug),
          );
        }
      }
    },
    [projects],
  );

  const closeProject = useCallback(() => {
    setSelectedSlug(null);

    if (typeof window !== 'undefined') {
      const { hasParam } = parseProjectQueryParam(window.location.search);
      if (hasParam) {
        window.history.pushState(
          { projectSlug: null },
          '',
          buildProjectsUrl(null),
        );
      }
    }
  }, []);

  const activeProject = selectedSlug
    ? resolveProjectBySlug(selectedSlug, projects)
    : null;

  return {
    activeProject,
    invalidSlugNotice,
    dismissInvalidSlugNotice,
    openProject,
    closeProject,
  };
}
