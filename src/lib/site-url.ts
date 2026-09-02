export function resolveSiteUrl(env?: NodeJS.ProcessEnv): URL;
export function resolveSiteUrl(env?: Partial<NodeJS.ProcessEnv>): URL;
export function resolveSiteUrl(env: Partial<NodeJS.ProcessEnv> = process.env): URL {
  if (env.NEXT_PUBLIC_SITE_URL) return new URL(env.NEXT_PUBLIC_SITE_URL);

  if (env.VERCEL_PROJECT_PRODUCTION_URL) {
    return new URL(`https://${env.VERCEL_PROJECT_PRODUCTION_URL}`);
  }

  return new URL("http://localhost:3000");
}
