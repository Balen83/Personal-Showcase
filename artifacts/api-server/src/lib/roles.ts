export const SUPER_ADMIN_EMAIL = "balenwarty19@gmail.com";

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function isSuperAdmin(email: string): boolean {
  return normalizeEmail(email) === SUPER_ADMIN_EMAIL;
}

export type Role = "user" | "admin" | "super_admin";

export function effectiveRole(email: string, dbRole: string): Role {
  if (isSuperAdmin(email)) return "super_admin";
  return dbRole === "admin" ? "admin" : "user";
}

export function canModerate(role: Role): boolean {
  return role === "admin" || role === "super_admin";
}
