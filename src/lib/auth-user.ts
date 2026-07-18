import type { UserProfile } from "@/api/types";

type BackendUser = Record<string, unknown> | null | undefined;

/** O backend de identidade responde o usuário embutido no TokenResponse em
 * snake_case (last_login/created_at/updated_at) — normaliza para o formato
 * camelCase (UserProfile) usado no resto do frontend. */
export function normalizeAuthUser(raw: BackendUser): UserProfile | null {
  if (!raw) return null;

  return {
    id:        raw.id as string,
    name:      raw.name as string,
    email:     raw.email as string,
    role:      raw.role as UserProfile["role"],
    status:    raw.status as UserProfile["status"],
    mfa:       Boolean(raw.mfa),
    lastLogin: (raw.lastLogin ?? raw.last_login ?? null) as string | null,
    createdAt: (raw.createdAt ?? raw.created_at) as string,
    updatedAt: (raw.updatedAt ?? raw.updated_at) as string,
  };
}
