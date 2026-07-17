/**
 * Catálogo central de endpoints da plataforma Finlumia.
 *
 * Todas as chamadas são roteadas pelo proxy Next.js (/proxy/<serviço>/*).
 * O proxy injeta o Authorization header a partir do cookie HttpOnly —
 * nenhuma URL de backend fica exposta no bundle do browser.
 */

// ── Tipos base ─────────────────────────────────────────────────────────────

type ServiceName = "configurator" | "identification" | "movimentation" | "document" | "support";
type HttpMethod  = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
type Endpoint    = { url: string; method: HttpMethod };

// Todos os ambientes usam o proxy — as URLs reais ficam em variáveis server-only.
const BASE: Record<ServiceName, string> = {
  identification: "/proxy/identify",
  movimentation:  "/proxy/movement",
  document:       "/proxy/document",
  configurator:   "/proxy/configurator",
  support:        "/proxy/support",
};

/** Constrói { url, method } concatenando o prefixo do proxy com o path completo. */
const ep = (service: ServiceName, path: string, method: HttpMethod): Endpoint => ({
  url:    `${BASE[service]}${path}`,
  method,
});

/** Substitui parâmetros de rota — buildUrl(ep, { id: '123' }) */
export function buildUrl(endpoint: Endpoint, params: Record<string, string> = {}): string {
  return Object.entries(params).reduce(
    (url, [k, v]) => url.replace(`:${k}`, encodeURIComponent(v)),
    endpoint.url,
  );
}

// ── Catálogo de endpoints ──────────────────────────────────────────────────

export const API_ENDPOINTS = {

  // ════════════════════════════════════════════════════════════
  // IDENTIFY — http://localhost:28083
  // ════════════════════════════════════════════════════════════
  auth: {
    login:            ep("identification", "/api/identify/token",                    "POST"),
    loginGoogle:      ep("identification", "/api/identify/auth/login/google",        "POST"),
    logout:           ep("identification", "/api/identify/token/revoke",             "POST"),
    refresh:          ep("identification", "/api/identify/token/refresh",            "POST"),
    forgotPassword:     ep("identification", "/api/identify/auth/forgot-password",       "POST"),
    verifyResetToken:   ep("identification", "/api/identify/auth/verify-reset-token",    "POST"),
    resetPassword:      ep("identification", "/api/identify/auth/reset-password",        "POST"),
    register:           ep("identification", "/api/identify/auth/register",              "POST"),
    verifyEmail:        ep("identification", "/api/identify/auth/verify-email",          "POST"),
    resendVerification: ep("identification", "/api/identify/auth/resend-verification",   "POST"),
  },

  me: {
    getProfile:     ep("identification", "/api/identify/me",                 "GET"),
    updateProfile:  ep("identification", "/api/identify/me",                 "PATCH"),
    changePassword: ep("identification", "/api/identify/me/change-password", "POST"),
    toggleMfa:      ep("identification", "/api/identify/me/mfa",             "PATCH"),
  },

  accessControl: {
    check: ep("identification", "/api/identify/access-control/check", "POST"),
  },

  // ════════════════════════════════════════════════════════════
  // MOVEMENT — http://localhost:28084
  // ════════════════════════════════════════════════════════════
  transactions: {
    list:        ep("movimentation", "/api/v1/transactions",     "GET"),
    getById:     ep("movimentation", "/api/v1/transactions/:id", "GET"),
    create:      ep("movimentation", "/api/v1/transactions",     "POST"),
    update:      ep("movimentation", "/api/v1/transactions/:id", "PUT"),
    patch:       ep("movimentation", "/api/v1/transactions/:id", "PATCH"),
    delete:      ep("movimentation", "/api/v1/transactions/:id", "DELETE"),
    batchDelete: ep("movimentation", "/api/v1/transactions",     "DELETE"),
  },

  import: {
    uploadFile:        ep("movimentation", "/api/v1/transactions/import/upload",              "POST"),
    getJobStatus:      ep("movimentation", "/api/v1/transactions/import/:jobId",              "GET"),
    confirmOcr:        ep("movimentation", "/api/v1/transactions/import/:jobId/confirm",      "POST"),
    confirmFileImport: ep("movimentation", "/api/v1/transactions/import/:jobId/import",       "POST"),
  },

  budgets: {
    list:     ep("movimentation", "/api/v1/budgets",     "GET"),
    getById:  ep("movimentation", "/api/v1/budgets/:id", "GET"),
    create:   ep("movimentation", "/api/v1/budgets",     "POST"),
    update:   ep("movimentation", "/api/v1/budgets/:id", "PUT"),
    delete:   ep("movimentation", "/api/v1/budgets/:id", "DELETE"),
  },

  categories: {
    list: ep("movimentation", "/api/v1/categories", "GET"),
  },

  institutions: {
    list: ep("movimentation", "/api/v1/institutions", "GET"),
  },

  // ════════════════════════════════════════════════════════════
  // DOCUMENT — http://localhost:28085  (28082 = Swagger UI apenas)
  // ════════════════════════════════════════════════════════════
  reports: {
    getKPIs:              ep("document", "/api/v1/reports/kpis",               "GET"),
    getCashFlow:          ep("document", "/api/v1/reports/cash-flow",          "GET"),
    getByCategory:        ep("document", "/api/v1/reports/by-category",        "GET"),
    getByInstitution:     ep("document", "/api/v1/reports/by-institution",     "GET"),
    getNetWorth:          ep("document", "/api/v1/reports/net-worth",          "GET"),
    getMonthlyComparison: ep("document", "/api/v1/reports/monthly-comparison", "GET"),
    getInsights:          ep("document", "/api/v1/reports/insights",           "GET"),
  },

  export: {
    exportTransactions: ep("document", "/api/v1/export/transactions", "GET"),
    exportReport:       ep("document", "/api/v1/export/report",       "POST"),
    getJobStatus:       ep("document", "/api/v1/export/:jobId",        "GET"),
  },

  // ════════════════════════════════════════════════════════════
  // CONFIGURATOR — http://localhost:28081
  // ════════════════════════════════════════════════════════════
  cfgTables: {
    list:    ep("configurator", "/v1/config/tables",     "GET"),
    getById: ep("configurator", "/v1/config/tables/:id", "GET"),
    create:  ep("configurator", "/v1/config/tables",     "POST"),
    update:  ep("configurator", "/v1/config/tables/:id", "PUT"),
    delete:  ep("configurator", "/v1/config/tables/:id", "DELETE"),
  },

  cfgFields: {
    list:    ep("configurator", "/v1/config/fields",     "GET"),
    getById: ep("configurator", "/v1/config/fields/:id", "GET"),
    create:  ep("configurator", "/v1/config/fields",     "POST"),
    update:  ep("configurator", "/v1/config/fields/:id", "PUT"),
    delete:  ep("configurator", "/v1/config/fields/:id", "DELETE"),
  },

  cfgUsers: {
    list:               ep("configurator", "/v1/config/users",                    "GET"),
    getById:            ep("configurator", "/v1/config/users/:id",                "GET"),
    create:             ep("configurator", "/v1/config/users",                    "POST"),
    update:             ep("configurator", "/v1/config/users/:id",                "PUT"),
    delete:             ep("configurator", "/v1/config/users/:id",                "DELETE"),
    toggleStatus:       ep("configurator", "/v1/config/users/:id/status",         "PATCH"),
    adminResetPassword: ep("configurator", "/v1/config/users/:id/reset-password", "POST"),
  },

  cfgPermissions: {
    list:        ep("configurator", "/v1/config/permissions",        "GET"),
    getMatrix:   ep("configurator", "/v1/config/permissions/matrix", "GET"),
    create:      ep("configurator", "/v1/config/permissions",        "POST"),
    update:      ep("configurator", "/v1/config/permissions/:id",    "PUT"),
    batchUpdate: ep("configurator", "/v1/config/permissions/batch",  "POST"),
    delete:      ep("configurator", "/v1/config/permissions/:id",    "DELETE"),
  },

  cfgFunctions: {
    list:    ep("configurator", "/v1/config/functions",          "GET"),
    getById: ep("configurator", "/v1/config/functions/:id",      "GET"),
    create:  ep("configurator", "/v1/config/functions",          "POST"),
    update:  ep("configurator", "/v1/config/functions/:id",      "PUT"),
    delete:  ep("configurator", "/v1/config/functions/:id",      "DELETE"),
    test:    ep("configurator", "/v1/config/functions/:id/test", "POST"),
  },

  cfgIndexes: {
    list:     ep("configurator", "/v1/config/indexes",              "GET"),
    getById:  ep("configurator", "/v1/config/indexes/:id",          "GET"),
    create:   ep("configurator", "/v1/config/indexes",              "POST"),
    update:   ep("configurator", "/v1/config/indexes/:id",          "PUT"),
    delete:   ep("configurator", "/v1/config/indexes/:id",          "DELETE"),
    rebuild:  ep("configurator", "/v1/config/indexes/:id/rebuild",  "POST"),
    getStats: ep("configurator", "/v1/config/indexes/:id/stats",    "GET"),
  },

  cfgTriggers: {
    list:    ep("configurator", "/v1/config/triggers",           "GET"),
    getById: ep("configurator", "/v1/config/triggers/:id",       "GET"),
    create:  ep("configurator", "/v1/config/triggers",           "POST"),
    update:  ep("configurator", "/v1/config/triggers/:id",       "PUT"),
    toggle:  ep("configurator", "/v1/config/triggers/:id/toggle","PATCH"),
    delete:  ep("configurator", "/v1/config/triggers/:id",       "DELETE"),
  },

  // ════════════════════════════════════════════════════════════
  // SUPPORT — http://localhost:28082 (serviço docs unificado)
  // ════════════════════════════════════════════════════════════
  support: {
    listTickets:        ep("support", "/api/v1/support/tickets",                                               "GET"),
    createTicket:       ep("support", "/api/v1/support/tickets",                                               "POST"),
    getStats:           ep("support", "/api/v1/support/tickets/stats",                                         "GET"),
    getTicket:          ep("support", "/api/v1/support/tickets/:id",                                           "GET"),
    patchTicket:        ep("support", "/api/v1/support/tickets/:id",                                           "PATCH"),
    deleteTicket:       ep("support", "/api/v1/support/tickets/:id",                                           "DELETE"),
    listResponses:      ep("support", "/api/v1/support/tickets/:ticketId/responses",                           "GET"),
    addResponse:        ep("support", "/api/v1/support/tickets/:ticketId/responses",                           "POST"),
    addAttachment:      ep("support", "/api/v1/support/tickets/:ticketId/attachments",                         "POST"),
    downloadAttachment: ep("support", "/api/v1/support/tickets/:ticketId/attachments/:attachmentId/download",  "GET"),
  },

} as const;

// ── Tipos derivados ────────────────────────────────────────────────────────

export type ApiEndpointKey = {
  [G in keyof typeof API_ENDPOINTS]: {
    [K in keyof (typeof API_ENDPOINTS)[G]]: `${G & string}.${K & string}`;
  }[(keyof (typeof API_ENDPOINTS)[G])];
}[keyof typeof API_ENDPOINTS];
