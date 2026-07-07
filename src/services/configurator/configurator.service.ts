import { http } from "@/lib/http-client";
import { API_ENDPOINTS, buildUrl } from "@/api/Endpoints";
import type {
  CfgTable, CfgTableCreateRequest,
  CfgField, CfgFieldCreateRequest,
  AdminUser, AdminUserCreateRequest,
  Permission, PermissionCreateRequest,
  CfgFunction, CfgFunctionCreateRequest, FunctionTestRequest, FunctionTestResponse,
  CfgIndex, CfgIndexCreateRequest, IndexStats,
  CfgTrigger, CfgTriggerCreateRequest,
  PaginatedResponse,
} from "@/api/types";

// ── Helpers ────────────────────────────────────────────────────────────────

type QueryParams = Record<string, string | number | boolean | undefined>;

function toQuery(params: QueryParams): string {
  const p = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== null && v !== "") p.set(k, String(v));
  }
  const s = p.toString();
  return s ? `?${s}` : "";
}

const MAX = 200;

// ── Tabelas ────────────────────────────────────────────────────────────────

export const cfgTablesService = {
  list: (params: QueryParams = {}) =>
    http.get<PaginatedResponse<CfgTable>>(
      `${API_ENDPOINTS.cfgTables.list.url}${toQuery({ page_size: MAX, ...params })}`,
    ),
  getById: (id: string) =>
    http.get<CfgTable>(buildUrl(API_ENDPOINTS.cfgTables.getById, { id })),
  create: (data: CfgTableCreateRequest) =>
    http.post<CfgTable>(API_ENDPOINTS.cfgTables.create.url, data),
  update: (id: string, data: Partial<CfgTableCreateRequest>) =>
    http.put<CfgTable>(buildUrl(API_ENDPOINTS.cfgTables.update, { id }), data),
  delete: (id: string) =>
    http.delete<void>(buildUrl(API_ENDPOINTS.cfgTables.delete, { id })),
};

// ── Campos ────────────────────────────────────────────────────────────────

export const cfgFieldsService = {
  list: (params: QueryParams = {}) =>
    http.get<PaginatedResponse<CfgField>>(
      `${API_ENDPOINTS.cfgFields.list.url}${toQuery({ page_size: MAX, ...params })}`,
    ),
  getById: (id: string) =>
    http.get<CfgField>(buildUrl(API_ENDPOINTS.cfgFields.getById, { id })),
  create: (data: CfgFieldCreateRequest) =>
    http.post<CfgField>(API_ENDPOINTS.cfgFields.create.url, data),
  update: (id: string, data: Partial<CfgFieldCreateRequest>) =>
    http.put<CfgField>(buildUrl(API_ENDPOINTS.cfgFields.update, { id }), data),
  delete: (id: string) =>
    http.delete<void>(buildUrl(API_ENDPOINTS.cfgFields.delete, { id })),
};

// ── Usuários admin ─────────────────────────────────────────────────────────

export const cfgUsersService = {
  list: (params: QueryParams = {}) =>
    http.get<PaginatedResponse<AdminUser>>(
      `${API_ENDPOINTS.cfgUsers.list.url}${toQuery({ page_size: MAX, ...params })}`,
    ),
  getById: (id: string) =>
    http.get<AdminUser>(buildUrl(API_ENDPOINTS.cfgUsers.getById, { id })),
  create: (data: AdminUserCreateRequest) =>
    http.post<AdminUser>(API_ENDPOINTS.cfgUsers.create.url, data),
  update: (id: string, data: Partial<AdminUserCreateRequest>) =>
    http.put<AdminUser>(buildUrl(API_ENDPOINTS.cfgUsers.update, { id }), data),
  delete: (id: string) =>
    http.delete<void>(buildUrl(API_ENDPOINTS.cfgUsers.delete, { id })),
  toggleStatus: (id: string, status: "ativo" | "inativo") =>
    http.patch<AdminUser>(buildUrl(API_ENDPOINTS.cfgUsers.toggleStatus, { id }), { status }),
  adminResetPassword: (id: string) =>
    http.post<void>(buildUrl(API_ENDPOINTS.cfgUsers.adminResetPassword, { id })),
};

// ── Permissões ────────────────────────────────────────────────────────────

export const cfgPermissionsService = {
  list: (params: QueryParams = {}) =>
    http.get<PaginatedResponse<Permission>>(
      `${API_ENDPOINTS.cfgPermissions.list.url}${toQuery({ page_size: MAX, ...params })}`,
    ),
  create: (data: PermissionCreateRequest) =>
    http.post<Permission>(API_ENDPOINTS.cfgPermissions.create.url, data),
  update: (id: string, data: Partial<PermissionCreateRequest>) =>
    http.put<Permission>(buildUrl(API_ENDPOINTS.cfgPermissions.update, { id }), data),
  delete: (id: string) =>
    http.delete<void>(buildUrl(API_ENDPOINTS.cfgPermissions.delete, { id })),
};

// ── Funções DB ────────────────────────────────────────────────────────────

export const cfgFunctionsService = {
  list: (params: QueryParams = {}) =>
    http.get<PaginatedResponse<CfgFunction>>(
      `${API_ENDPOINTS.cfgFunctions.list.url}${toQuery({ page_size: MAX, ...params })}`,
    ),
  getById: (id: string) =>
    http.get<CfgFunction>(buildUrl(API_ENDPOINTS.cfgFunctions.getById, { id })),
  create: (data: CfgFunctionCreateRequest) =>
    http.post<CfgFunction>(API_ENDPOINTS.cfgFunctions.create.url, data),
  update: (id: string, data: Partial<CfgFunctionCreateRequest>) =>
    http.put<CfgFunction>(buildUrl(API_ENDPOINTS.cfgFunctions.update, { id }), data),
  delete: (id: string) =>
    http.delete<void>(buildUrl(API_ENDPOINTS.cfgFunctions.delete, { id })),
  test: (id: string, args: FunctionTestRequest) =>
    http.post<FunctionTestResponse>(buildUrl(API_ENDPOINTS.cfgFunctions.test, { id }), args),
};

// ── Índices ───────────────────────────────────────────────────────────────

export const cfgIndexesService = {
  list: (params: QueryParams = {}) =>
    http.get<PaginatedResponse<CfgIndex>>(
      `${API_ENDPOINTS.cfgIndexes.list.url}${toQuery({ page_size: MAX, ...params })}`,
    ),
  getById: (id: string) =>
    http.get<CfgIndex>(buildUrl(API_ENDPOINTS.cfgIndexes.getById, { id })),
  create: (data: CfgIndexCreateRequest) =>
    http.post<CfgIndex>(API_ENDPOINTS.cfgIndexes.create.url, data),
  update: (id: string, data: Partial<CfgIndexCreateRequest>) =>
    http.put<CfgIndex>(buildUrl(API_ENDPOINTS.cfgIndexes.update, { id }), data),
  delete: (id: string) =>
    http.delete<void>(buildUrl(API_ENDPOINTS.cfgIndexes.delete, { id })),
  rebuild: (id: string) =>
    http.post<void>(buildUrl(API_ENDPOINTS.cfgIndexes.rebuild, { id })),
  getStats: (id: string) =>
    http.get<IndexStats>(buildUrl(API_ENDPOINTS.cfgIndexes.getStats, { id })),
};

// ── Triggers ──────────────────────────────────────────────────────────────

export const cfgTriggersService = {
  list: (params: QueryParams = {}) =>
    http.get<PaginatedResponse<CfgTrigger>>(
      `${API_ENDPOINTS.cfgTriggers.list.url}${toQuery({ page_size: MAX, ...params })}`,
    ),
  getById: (id: string) =>
    http.get<CfgTrigger>(buildUrl(API_ENDPOINTS.cfgTriggers.getById, { id })),
  create: (data: CfgTriggerCreateRequest) =>
    http.post<CfgTrigger>(API_ENDPOINTS.cfgTriggers.create.url, data),
  update: (id: string, data: Partial<CfgTriggerCreateRequest>) =>
    http.put<CfgTrigger>(buildUrl(API_ENDPOINTS.cfgTriggers.update, { id }), data),
  toggle: (id: string) =>
    http.patch<CfgTrigger>(buildUrl(API_ENDPOINTS.cfgTriggers.toggle, { id })),
  delete: (id: string) =>
    http.delete<void>(buildUrl(API_ENDPOINTS.cfgTriggers.delete, { id })),
};
