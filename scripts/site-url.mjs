/** @param {string | undefined} value */
export function requireSiteUrl(value) {
  if (!value?.trim()) throw new Error('SITE_URL is required for builds. Set it to the public HTTPS origin.');

  let url;
  try {
    url = new URL(value);
  } catch {
    throw new Error('SITE_URL must be a valid HTTPS origin (for example, https://your-project.vercel.app).');
  }

  if (
    url.protocol !== 'https:' ||
    !url.hostname ||
    url.hostname.replace(/\.$/, '').endsWith('.example') ||
    url.username ||
    url.password ||
    url.pathname !== '/' ||
    url.search ||
    url.hash
  ) {
    throw new Error('SITE_URL must be a public HTTPS origin, not a placeholder, path or URL with credentials.');
  }

  return url.origin;
}
