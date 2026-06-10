// URL slugs for shop products: "Ostrich Bucket Bag " -> "ostrich-bucket-bag".
// Used for links, route matching, canonicals, and schema URLs. Matching by
// slug also keeps legacy encoded-name URLs working (they slugify identically).
export function slugify(name: string): string {
  return String(name || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}
