const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH || ''

/** Resolves a file under `public/` against the configured base path. */
export function asset(path: string): string {
  return `${BASE_PATH}${path.startsWith('/') ? path : `/${path}`}`
}
