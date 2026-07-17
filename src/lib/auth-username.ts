const INTERNAL_AUTH_DOMAIN = "sahabat-bahasa.local";

export function normalizeUsername(value: string) {
  const username = value.trim().toLowerCase();

  const slug = username
    .replace(/[^a-z0-9._-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^[-.]+|[-.]+$/g, "");

  if (!slug) {
    throw new Error("Username wajib diisi.");
  }

  return slug;
}

export function usernameToInternalEmail(username: string) {
  return `${normalizeUsername(username)}@${INTERNAL_AUTH_DOMAIN}`;
}

