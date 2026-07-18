/**
 * Tipos TypeScript derivados dos contratos de API.
 * Fonte de verdade: src/api/endpoints/*.endpoints.json
 */

// ── Enums compartilhados ───────────────────────────────────────────────────

export type UserRole      = "admin" | "gerente" | "analista" | "viewer";
export type UserStatus    = "ativo" | "inativo" | "pendente";
export type RecordStatus  = "ativo" | "inativo";
export type Period        = "3m" | "6m" | "12m" | "ytd" | "custom";

export type TransactionType  = "receita" | "despesa";
export type PaymentMethod    = "pix" | "credito" | "debito" | "dinheiro" | "ted" | "doc";
export type InstitutionId    = "nubank" | "itau" | "bb" | "bradesco" | "santander" | "picpay" | "inter" | "c6" | "xp";
export type CategoryId       = "alimentacao" | "saude" | "educacao" | "transporte" | "lazer" | "moradia" | "salario" | "vendas" | "tecnologia" | "marketing" | "servicos" | "investimento" | "outros";

export type SchemaName    = "public" | "auth" | "log" | "cache" | "billing";
export type FieldDataType = "uuid" | "varchar" | "integer" | "bigint" | "boolean" | "timestamp" | "decimal" | "text" | "jsonb" | "serial";
export type Volatility    = "volatile" | "stable" | "immutable";
export type FunctionLang  = "sql" | "plpgsql" | "javascript";
export type IndexType     = "btree" | "hash" | "gin" | "gist" | "brin";
export type TriggerEvent  = "INSERT" | "UPDATE" | "DELETE" | "TRUNCATE";
export type TriggerTiming = "BEFORE" | "AFTER" | "INSTEAD OF";
export type ExportFormat  = "pdf" | "csv" | "xlsx";
export type InsightType   = "positive" | "negative" | "neutral" | "alert";

// ── Utilitários ────────────────────────────────────────────────────────────

export type PaginationMeta = {
  page:       number;
  pageSize:   number;
  total:      number;
  totalPages: number;
};

export type PaginatedResponse<T> = {
  data: T[];
  meta: PaginationMeta;
};

export type ApiError = {
  code:    string;
  message: string;
  field?:  string;
};

// ── identification — Auth ──────────────────────────────────────────────────

export type TokenPair = {
  accessToken:  string;
  refreshToken: string;
  expiresIn:    number;
  tokenType:    "Bearer";
};

export type UserProfile = {
  id:        string;
  name:      string;
  email:     string;
  role:      UserRole;
  status:    UserStatus;
  mfa:       boolean;
  lastLogin: string | null;
  createdAt: string;
  updatedAt: string;
};

export type LoginRequest = {
  email:    string;
  password: string;
  remember?: boolean;
};

export type LoginResponse = TokenPair & { user: UserProfile };

export type LoginGoogleRequest  = { idToken: string };
export type LoginGoogleResponse = TokenPair & { user: UserProfile; isNewUser: boolean };

export type ForgotPasswordRequest    = { email: string };
export type VerifyResetTokenRequest  = { email: string; token: string };
export type VerifyResetTokenResponse = { resetSession: string };

export type ResetPasswordRequest  = {
  resetSession:    string;
  newPassword:     string;
  confirmPassword: string;
};

export type RegisterRequest  = { name: string; email: string; password: string };
export type RegisterResponse = { message: string };

export type VerifyEmailRequest        = { email: string; code: string };
export type ResendVerificationRequest = { email: string };

export type UpdateProfileRequest  = { name?: string; locale?: string; theme?: "light" | "dark" };
export type ChangePasswordRequest = { currentPassword: string; newPassword: string; confirmPassword: string };

// ── identification — Dashboard ─────────────────────────────────────────────

export type DashboardKPI = {
  totalBalance:     number;
  totalIncome:      number;
  totalExpenses:    number;
  totalInvestments: number;
  savingRate:       number;
  periodStart:      string;
  periodEnd:        string;
};

// ── movimentation — Transactions ───────────────────────────────────────────

export type Transaction = {
  id:             string;
  userId:         string;
  type:           TransactionType;
  method:         PaymentMethod;
  institution:    InstitutionId;
  date:           string;
  category:       CategoryId;
  description:    string;
  subDescription?: string;
  amount:         number;
  notes?:         string;
  tags?:          string[];
  isRecurring:    boolean;
  recurringId?:   string;
  createdAt:      string;
  updatedAt:      string;
};

export type TransactionCreateRequest = {
  type:           TransactionType;
  method:         PaymentMethod;
  institution:    InstitutionId;
  date:           string;
  category:       CategoryId;
  description:    string;
  subDescription?: string;
  amount:         number;
  notes?:         string;
  tags?:          string[];
  // Obrigatório no backend (@NotNull) — omitir o campo passou a resultar em
  // 422 em vez de assumir `false` silenciosamente (isso causava desvinculação
  // acidental de recorrências ao editar). Sempre envie true|false explícito.
  isRecurring:    boolean;
  recurringMonths?: number;
};

export type TransactionListQuery = {
  page?:        number;
  pageSize?:    number;
  type?:        TransactionType;
  method?:      PaymentMethod;
  institution?: InstitutionId;
  category?:    CategoryId;
  dateStart?:   string;
  dateEnd?:     string;
  amountMin?:   number;
  amountMax?:   number;
  search?:      string;
  sortBy?:      "date" | "amount" | "description" | "category";
  sortOrder?:   "asc" | "desc";
};

export type TransactionListResponse = {
  data:   Transaction[];
  meta:   PaginationMeta;
  totals: { totalIncome: number; totalExpenses: number; netBalance: number };
};

// ── movimentation — Import ─────────────────────────────────────────────────

export type ImportJobStatus = {
  id:           string;
  status:       "pending" | "processing" | "completed" | "failed";
  fileName:     string;
  fileType:     "ofx" | "csv" | "image";
  totalRows?:   number;
  importedRows?: number;
  errors?:      string[];
  createdAt:    string;
};

export type OcrPreviewResult = {
  jobId:  string;
  status: "processing" | "ready" | "failed";
  extracted: {
    description: string;
    amount:      number;
    date:        string;
    category:    CategoryId;
    method:      PaymentMethod;
    confidence:  number;
  };
};

export type ConfirmOcrRequest = {
  description: string;
  amount:      number;
  date:        string;
  category:    CategoryId;
  method:      PaymentMethod;
  institution?: InstitutionId;
};

// ── document — Reports ─────────────────────────────────────────────────────

export type PeriodQuery = {
  period?:      Period;
  periodStart?: string;
  periodEnd?:   string;
};

export type MonthlySummary = {
  month:      string;
  year:       number;
  receitas:   number;
  despesas:   number;
  saldo:      number;
  patrimonio: number;
};

export type KpiSummary = {
  totalReceitas:         number;
  totalDespesas:         number;
  saldoLiquido:          number;
  taxaPoupanca:          number;
  patrimonioAtual:       number;
  crescimentoPatrimonio: number;
  periodMonths:          number;
};

export type CategoryBreakdown = {
  categoryId:   string;
  label:        string;
  color:        string;
  total:        number;
  percent:      number;
  trend:        number;
  transactions: number;
};

export type InstitutionBreakdown = {
  id:      string;
  label:   string;
  color:   string;
  abbr:    string;
  total:   number;
  percent: number;
};

export type Insight = {
  id:               string;
  type:             InsightType;
  title:            string;
  description:      string;
  icon:             string;
  relatedCategory?: string;
  delta?:           number;
  generatedAt:      string;
};

// Todos os endpoints de /reports (exceto /kpis, que já é um objeto plano)
// respondem envelopados em { data: [...], ...metadados } — nunca um array puro.
export type CashFlowResponse = {
  data: MonthlySummary[];
  kpis: KpiSummary;
};

export type CategoryBreakdownResponse = {
  data:  CategoryBreakdown[];
  total: number;
};

export type InstitutionBreakdownResponse = {
  data:  InstitutionBreakdown[];
  total: number;
};

export type NetWorthDataPoint = {
  month:      string;
  year:       number;
  patrimonio: number;
};

export type NetWorthResponse = {
  data:    NetWorthDataPoint[];
  current: number;
  initial: number;
  growth:  number;
};

export type MonthlyComparisonItem = {
  label:    string;
  receitas: number;
  despesas: number;
  saldo:    number;
};

export type MonthlyComparisonResponse = {
  data: MonthlyComparisonItem[];
};

export type InsightsResponse = {
  data:        Insight[];
  generatedAt: string;
};

// ── configurator — Tabelas ─────────────────────────────────────────────────

export type CfgTable = {
  id:          string;
  name:        string;
  schema:      SchemaName;
  rowCount:    number;
  sizeKb:      number;
  status:      RecordStatus;
  description?: string;
  createdAt:   string;
  updatedAt:   string;
};

export type CfgTableCreateRequest = {
  name:        string;
  schema:      SchemaName;
  description?: string;
  status?:     RecordStatus;
};

// ── configurator — Campos ──────────────────────────────────────────────────

export type CfgField = {
  id:              string;
  name:            string;
  tableId:         string;
  table:           string;
  dataType:        FieldDataType;
  length?:         number;
  nullable:        boolean;
  defaultValue?:   string;
  isPrimary:       boolean;
  isForeign:       boolean;
  referencesTable?: string;
  referencesField?: string;
  status:          RecordStatus;
  createdAt:       string;
};

export type CfgFieldCreateRequest = {
  name:            string;
  tableId:         string;
  dataType:        FieldDataType;
  length?:         number;
  nullable?:       boolean;
  defaultValue?:   string;
  isPrimary?:      boolean;
  isForeign?:      boolean;
  referencesTable?: string;
  referencesField?: string;
  status?:         RecordStatus;
};

// ── configurator — Usuários (admin) ────────────────────────────────────────

export type AdminUser = {
  id:        string;
  name:      string;
  email:     string;
  role:      UserRole;
  status:    UserStatus;
  mfa:       boolean;
  lastLogin: string | null;
  createdAt: string;
  updatedAt: string;
};

export type AdminUserCreateRequest = {
  name:       string;
  email:      string;
  role:       UserRole;
  status?:    "ativo" | "pendente";
  mfa?:       boolean;
  sendInvite?: boolean;
};

// ── configurator — Permissões ──────────────────────────────────────────────

export type Permission = {
  id:        string;
  module:    string;
  subsystem: string;
  role:      UserRole;
  canRead:   boolean;
  canWrite:  boolean;
  canDelete: boolean;
  canAdmin:  boolean;
};

export type PermissionCreateRequest = Omit<Permission, "id">;
export type PermissionBatchRequest  = { permissions: Permission[] };

// ── configurator — Funções ─────────────────────────────────────────────────

export type CfgFunction = {
  id:          string;
  name:        string;
  schema:      SchemaName;
  language:    FunctionLang;
  returnType:  string;
  args?:       string;
  volatility:  Volatility;
  body:        string;
  description?: string;
  status:      RecordStatus;
  createdAt:   string;
  updatedAt:   string;
};

export type CfgFunctionCreateRequest = Omit<CfgFunction, "id" | "createdAt" | "updatedAt">;

export type FunctionTestRequest  = { args?: Record<string, unknown> };
export type FunctionTestResponse = { result: unknown; executionMs: number };

// ── configurator — Índices ─────────────────────────────────────────────────

export type CfgIndex = {
  id:           string;
  name:         string;
  tableId:      string;
  table:        string;
  schema:       SchemaName;
  fields:       string;
  type:         IndexType;
  unique:       boolean;
  partial:      boolean;
  whereClause?: string;
  sizeKb:       number;
  status:       RecordStatus;
  createdAt:    string;
};

export type CfgIndexCreateRequest = Omit<CfgIndex, "id" | "sizeKb" | "createdAt" | "table">;

export type IndexStats = {
  sizeKb:     number;
  scans:      number;
  tupleReads: number;
  blksRead:   number;
  lastUsed:   string | null;
};

// ── configurator — Triggers ────────────────────────────────────────────────

export type CfgTrigger = {
  id:          string;
  name:        string;
  tableId:     string;
  table:       string;
  schema:      SchemaName;
  event:       TriggerEvent;
  timing:      TriggerTiming;
  function:    string;
  enabled:     boolean;
  description?: string;
  status:      RecordStatus;
  createdAt:   string;
};

export type CfgTriggerCreateRequest = Omit<CfgTrigger, "id" | "createdAt" | "table">;

// ── support — Helpdesk ─────────────────────────────────────────────────────

export type TicketCategory = "duvida" | "bug" | "melhoria" | "acesso" | "outros";
export type TicketPriority = "baixa" | "media" | "alta" | "urgente";
export type TicketStatus   = "aberto" | "em_analise" | "respondido" | "fechado";
export type AuthorRole     = "user" | "admin" | "gerente" | "suporte";

export type TicketUser = {
  id:    string;
  name:  string;
  email: string;
};

export type TicketAuthor = {
  id:   string;
  name: string;
  role: AuthorRole;
};

export type TicketListItem = {
  id:             string;
  ticket_code:    string;
  user:           TicketUser;
  title:          string;
  category:       TicketCategory;
  priority:       TicketPriority;
  status:         TicketStatus;
  description:    string;
  assigned_to:    string | null;
  response_count: number;
  created_at:     string;
  updated_at:     string;
};

export type TicketResponse = {
  id:          string;
  author:      TicketAuthor;
  message:     string;
  is_internal: boolean;
  created_at:  string;
};

export type TicketAttachment = {
  id:              string;
  file_name:       string;
  file_size_bytes: number;
  mime_type:       string;
  url:             string;
  created_at:      string;
};

export type TicketDetail = Omit<TicketListItem, "response_count"> & {
  responses:   TicketResponse[];
  attachments: TicketAttachment[];
};

export type TicketStats = {
  by_status:            Record<TicketStatus, number>;
  by_category:          Record<TicketCategory, number>;
  by_priority:          Record<TicketPriority, number>;
  total:                number;
  avg_resolution_hours: number | null;
};

export type SupportPageMeta = {
  page:        number;
  limit:       number;
  total:       number;
  total_pages: number;
};

export type SupportPaginatedResponse<T> = {
  data: T[];
  meta: SupportPageMeta;
};

export type CreateTicketBody = {
  title:       string;
  category:    TicketCategory;
  priority?:   TicketPriority;
  description: string;
};

export type PatchTicketBody = {
  status?:      TicketStatus;
  priority?:    TicketPriority;
  assigned_to?: string | null;
};

export type CreateResponseBody = {
  message:      string;
  is_internal?: boolean;
  new_status?:  TicketStatus;
};
