/**
 * Slugs of the hidden projects (lib/hiddenProjects.ts), on their own so proxy.ts can route them
 * without importing the projects themselves. Server-side only by convention: never import it from
 * a Client Component. lib/hiddenProjects.ts checks the two lists match.
 */
export const hiddenSlugs: readonly string[] = ['food-lucky-wheel', 'personal-movie-blog'];
