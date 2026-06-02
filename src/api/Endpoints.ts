/**
 * Catálogo central de endpoints da plataforma Finlumia.
 *
 * Cada entrada expõe { url, method } derivados do ambiente ativo.
 * Contratos detalhados (schemas de request/response) estão nos JSONs:
 *   src/api/endpoints/identification.endpoints.json
 *   src/api/endpoints/movimentation.endpoints.json
 *   src/api/endpoints/document.endpoints.json
 *   src/api/endpoints/configurator.endpoints.json
 */

// ── Tipos base ─────────────────────────────────────────────────────────────

type Environment  = "production" | "homologation" | "local";
type ServiceName  = "configurator" | "identification" | "movimentation" | "document";
type HttpMethod   = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
type Endpoint     = { url: string; method: HttpMethod };

// ── Configuração de ambiente ───────────────────────────────────────────────

const CURRENT_ENV = (process.env.NEXT_PUBLIC_APP_ENV ?? "local") as Environment;

export const API_VERSION = process.env.NEXT_PUBLIC_API_VERSION ?? "v1";

const BASE: Record<Environment, Record<ServiceName, string>> = {
  local: {
    configurator:   process.env.NEXT_PUBLIC_SERVICE_CONFIGURATOR_LOCAL   ?? "http://localhost:8080/configurator",
    identification: process.env.NEXT_PUBLIC_SERVICE_IDENTIFICATION_LOCAL  ?? "http://localhost:8080/identification",
    movimentation:  process.env.NEXT_PUBLIC_SERVICE_MOVIMENTATION_LOCAL   ?? "http://localhost:8080/movimentation",
    document:       process.env.NEXT_PUBLIC_SERVICE_DOCUMENT_LOCAL        ?? "http://localhost:8080/document",
  },
  homologation: {
    configurator:   process.env.NEXT_PUBLIC_SERVICE_CONFIGURATOR_HOMOLOGATION   ?? "",
    identification: process.env.NEXT_PUBLIC_SERVICE_IDENTIFICATION_HOMOLOGATION  ?? "",
    movimentation:  process.env.NEXT_PUBLIC_SERVICE_MOVIMENTATION_HOMOLOGATION   ?? "",
    document:       process.env.NEXT_PUBLIC_SERVICE_DOCUMENT_HOMOLOGATION        ?? "",
  },
  production: {
    configurator:   process.env.NEXT_PUBLIC_SERVICE_CONFIGURATOR_PRODUCTION   ?? "",
    identification: process.env.NEXT_PUBLIC_SERVICE_IDENTIFICATION_PRODUCTION  ?? "",
    movimentation:  process.env.NEXT_PUBLIC_SERVICE_MOVIMENTATION_PRODUCTION   ?? "",
    document:       process.env.NEXT_PUBLIC_SERVICE_DOCUMENT_PRODUCTION        ?? "",
  },
};

/** Constrói { url, method } para um endpoint específico. */
const ep = (service: ServiceName, path: string, method: HttpMethod): Endpoint => ({
  url:    `${BASE[CURRENT_ENV][service]}/${API_VERSION}${path}`,
  method,
});

/** Substitui parâmetros de rota — ep('/transactions/:id', { id: '123' }) */
export function buildUrl(endpoint: Endpoint, params: Record<string, string> = {}): string {
  return Object.entries(params).reduce(
    (url, [k, v]) => url.replace(`:${k}`, encodeURIComponent(v)),
    endpoint.url,
  );
}

// ── Catálogo de endpoints ──────────────────────────────────────────────────

export const API_ENDPOINTS = {

  // ════════════════════════════════════════════════════════════
  // IDENTIFICATION — Autenticação, sessão, perfil, dashboard
  // ════════════════════════════════════════════════════════════
  auth: {
    login:             ep("identification", "/auth/login",              "POST"),
    loginGoogle:       ep("identification", "/auth/login/google",       "POST"),
    logout:            ep("identification", "/auth/logout",             "POST"),
    refresh:           ep("identification", "/auth/refresh",            "POST"),
    forgotPassword:    ep("identification", "/auth/forgot-password",    "POST"),
    verifyResetToken:  ep("identification", "/auth/verify-reset-token", "POST"),
    resetPassword:     ep("identification", "/auth/reset-password",     "POST"),
  },

  me: {
    getProfile:     ep("identification", "/me",                  "GET"),
    updateProfile:  ep("identification", "/me",                  "PATCH"),
    changePassword: ep("identification", "/me/change-password",  "POST"),
    toggleMfa:      ep("identification", "/me/mfa",              "PATCH"),
  },

  dashboard: {
    getKPIs:               ep("identification", "/dashboard/kpis",                "GET"),
    getRecentTransactions: ep("identification", "/dashboard/recent-transactions",  "GET"),
  },

  // ════════════════════════════════════════════════════════════
  // MOVIMENTATION — Lançamentos financeiros e importação
  // ════════════════════════════════════════════════════════════
  transactions: {
    list:        ep("movimentation", "/transactions",     "GET"),
    getById:     ep("movimentation", "/transactions/:id", "GET"),
    create:      ep("movimentation", "/transactions",     "POST"),
    update:      ep("movimentation", "/transactions/:id", "PUT"),
    patch:       ep("movimentation", "/transactions/:id", "PATCH"),
    delete:      ep("movimentation", "/transactions/:id", "DELETE"),
    batchDelete: ep("movimentation", "/transactions",     "DELETE"),
  },

  import: {
    uploadFile:        ep("movimentation", "/transactions/import/upload",         "POST"),
    getJobStatus:      ep("movimentation", "/transactions/import/:jobId",          "GET"),
    confirmOcr:        ep("movimentation", "/transactions/import/:jobId/confirm",  "POST"),
    confirmFileImport: ep("movimentation", "/transactions/import/:jobId/import",   "POST"),
  },

  categories: {
    list: ep("movimentation", "/categories", "GET"),
  },

  institutions: {
    list: ep("movimentation", "/institutions", "GET"),
  },

  // ════════════════════════════════════════════════════════════
  // DOCUMENT — Relatórios analíticos e exportação
  // ════════════════════════════════════════════════════════════
  reports: {
    getKPIs:               ep("document", "/reports/kpis",                "GET"),
    getCashFlow:           ep("document", "/reports/cash-flow",           "GET"),
    getByCategory:         ep("document", "/reports/by-category",         "GET"),
    getByInstitution:      ep("document", "/reports/by-institution",      "GET"),
    getNetWorth:           ep("document", "/reports/net-worth",           "GET"),
    getMonthlyComparison:  ep("document", "/reports/monthly-comparison",  "GET"),
    getInsights:           ep("document", "/reports/insights",            "GET"),
  },

  export: {
    exportTransactions: ep("document", "/export/transactions",  "GET"),
    exportReport:       ep("document", "/export/report",        "POST"),
    getJobStatus:       ep("document", "/export/:jobId",         "GET"),
  },

  // ════════════════════════════════════════════════════════════
  // CONFIGURATOR — Administração do sistema (admin only)
  // ════════════════════════════════════════════════════════════
  cfgTables: {
    list:    ep("configurator", "/config/tables",     "GET"),
    getById: ep("configurator", "/config/tables/:id", "GET"),
    create:  ep("configurator", "/config/tables",     "POST"),
    update:  ep("configurator", "/config/tables/:id", "PUT"),
    delete:  ep("configurator", "/config/tables/:id", "DELETE"),
  },

  cfgFields: {
    list:    ep("configurator", "/config/fields",     "GET"),
    getById: ep("configurator", "/config/fields/:id", "GET"),
    create:  ep("configurator", "/config/fields",     "POST"),
    update:  ep("configurator", "/config/fields/:id", "PUT"),
    delete:  ep("configurator", "/config/fields/:id", "DELETE"),
  },

  cfgUsers: {
    list:               ep("configurator", "/config/users",                    "GET"),
    getById:            ep("configurator", "/config/users/:id",                "GET"),
    create:             ep("configurator", "/config/users",                    "POST"),
    update:             ep("configurator", "/config/users/:id",                "PUT"),
    delete:             ep("configurator", "/config/users/:id",                "DELETE"),
    toggleStatus:       ep("configurator", "/config/users/:id/status",         "PATCH"),
    adminResetPassword: ep("configurator", "/config/users/:id/reset-password", "POST"),
  },

  cfgPermissions: {
    list:        ep("configurator", "/config/permissions",        "GET"),
    getMatrix:   ep("configurator", "/config/permissions/matrix", "GET"),
    create:      ep("configurator", "/config/permissions",        "POST"),
    update:      ep("configurator", "/config/permissions/:id",    "PUT"),
    batchUpdate: ep("configurator", "/config/permissions/batch",  "POST"),
    delete:      ep("configurator", "/config/permissions/:id",    "DELETE"),
  },

  cfgFunctions: {
    list:    ep("configurator", "/config/functions",         "GET"),
    getById: ep("configurator", "/config/functions/:id",     "GET"),
    create:  ep("configurator", "/config/functions",         "POST"),
    update:  ep("configurator", "/config/functions/:id",     "PUT"),
    delete:  ep("configurator", "/config/functions/:id",     "DELETE"),
    test:    ep("configurator", "/config/functions/:id/test","POST"),
  },

  cfgIndexes: {
    list:     ep("configurator", "/config/indexes",              "GET"),
    getById:  ep("configurator", "/config/indexes/:id",           "GET"),
    create:   ep("configurator", "/config/indexes",              "POST"),
    update:   ep("configurator", "/config/indexes/:id",           "PUT"),
    delete:   ep("configurator", "/config/indexes/:id",           "DELETE"),
    rebuild:  ep("configurator", "/config/indexes/:id/rebuild",   "POST"),
    getStats: ep("configurator", "/config/indexes/:id/stats",     "GET"),
  },

  cfgTriggers: {
    list:    ep("configurator", "/config/triggers",          "GET"),
    getById: ep("configurator", "/config/triggers/:id",      "GET"),
    create:  ep("configurator", "/config/triggers",          "POST"),
    update:  ep("configurator", "/config/triggers/:id",      "PUT"),
    toggle:  ep("configurator", "/config/triggers/:id/toggle","PATCH"),
    delete:  ep("configurator", "/config/triggers/:id",      "DELETE"),
  },

} as const;

// ── Tipos derivados ────────────────────────────────────────────────────────

export type ApiEndpointKey = {
  [G in keyof typeof API_ENDPOINTS]: {
    [K in keyof (typeof API_ENDPOINTS)[G]]: `${G & string}.${K & string}`;
  }[(keyof (typeof API_ENDPOINTS)[G])];
}[keyof typeof API_ENDPOINTS];
