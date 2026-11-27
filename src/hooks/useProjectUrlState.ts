import { useCallback, useEffect, useRef, useState } from 'react';
import {
  buildProjectUrl,
  buildRouteTitle,
  PROJECTS_BASE_ROUTE,
  resolveLocationRoute,
} from '@/routes/routes';
import type { ProjectItem } from '@/types/portfolio';
import { resolveProjectBySlug } from '@/utils/slugValidation';

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

  const resolvedRoute = resolveLocationRoute();
  if (!resolvedRoute.hasProjectParam) {
    return { initialSlug: null, initialInvalid: false };
  }

  const resolved = resolveProjectBySlug(resolvedRoute.projectParam, projects);
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
  const syncedInitialRouteRef = useRef(false);

  useEffect(() => {
    onInvalidSlugRef.current = onInvalidSlug;
  }, [onInvalidSlug]);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    if (!syncedInitialRouteRef.current) {
      syncedInitialRouteRef.current = true;
      const initialRoute = resolveLocationRoute();

      if (initialRoute.hasProjectParam) {
        const matched = resolveProjectBySlug(initialRoute.projectParam, projects);
        if (!matched) {
          window.history.replaceState(
            window.history.state,
            '',
            buildProjectUrl(null),
          );
          document.title = buildRouteTitle('projects');
          onInvalidSlugRef.current?.();
        } else {
          const canonicalUrl = buildProjectUrl(matched.slug);
          const currentUrl = `${window.location.pathname}${window.location.search}${window.location.hash}`;
          if (currentUrl !== canonicalUrl) {
            window.history.replaceState(
              { projectSlug: matched.slug, sectionId: 'projects' },
              '',
              canonicalUrl,
            );
          }
          document.title = buildRouteTitle('projects', matched.title);
        }
      }
    }

    const handlePopState = () => {
      const nextRoute = resolveLocationRoute();
      if (!nextRoute.hasProjectParam) {
        setSelectedSlug(null);
        return;
      }

      const resolved = resolveProjectBySlug(nextRoute.projectParam, projects);
      if (resolved) {
        setSelectedSlug(resolved.slug);
        setInvalidSlugNotice(null);
        document.title = buildRouteTitle('projects', resolved.title);
        return;
      }

      setSelectedSlug(null);
      setInvalidSlugNotice(INVALID_SLUG_MESSAGE);
      window.history.replaceState(
        window.history.state,
        '',
        buildProjectUrl(null),
      );
      document.title = buildRouteTitle('projects');
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
          const currentRoute = resolveLocationRoute();
          if (currentRoute.hasProjectParam) {
            window.history.replaceState(
              window.history.state,
              '',
              buildProjectUrl(null),
            );
          }
          document.title = buildRouteTitle('projects');
        }
        onInvalidSlugRef.current?.();
        return;
      }

      setInvalidSlugNotice(null);
      setSelectedSlug(resolved.slug);

      if (typeof window !== 'undefined') {
        const currentRoute = resolveLocationRoute();
        const currentResolved = resolveProjectBySlug(
          currentRoute.projectParam,
          projects,
        );
        const canonicalUrl = buildProjectUrl(resolved.slug);
        const currentUrl = `${window.location.pathname}${window.location.search}${window.location.hash}`;

        if (currentResolved?.slug !== resolved.slug || currentUrl !== canonicalUrl) {
          window.history.pushState(
            { projectSlug: resolved.slug, sectionId: 'projects' },
            '',
            canonicalUrl,
          );
        }
        document.title = buildRouteTitle('projects', resolved.title);
      }
    },
    [projects],
  );

  const closeProject = useCallback(() => {
    setSelectedSlug(null);

    if (typeof window !== 'undefined') {
      const currentRoute = resolveLocationRoute();
      if (currentRoute.hasProjectParam) {
        window.history.pushState(
          { projectSlug: null, sectionId: 'projects' },
          '',
          PROJECTS_BASE_ROUTE,
        );
      }
      document.title = buildRouteTitle('projects');
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
