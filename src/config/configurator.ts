// ── Status helper ──────────────────────────────────────────────────────────

export type Status = "ativo" | "inativo" | "pendente" | "erro";

// ── Tables ─────────────────────────────────────────────────────────────────

export type TableRecord = {
    id: string;
    name: string;
    schema: string;
    rowCount: number;
    sizeKb: number;
    status: Status;
    createdAt: string;
    updatedAt: string;
};

export const MOCK_TABLES: TableRecord[] = [
    { id: "1", name: "users",           schema: "public",  rowCount: 1240,  sizeKb: 520,   status: "ativo",  createdAt: "2024-01-10", updatedAt: "2024-10-01" },
    { id: "2", name: "transactions",    schema: "public",  rowCount: 98430, sizeKb: 12480, status: "ativo",  createdAt: "2024-01-10", updatedAt: "2024-10-12" },
    { id: "3", name: "categories",      schema: "public",  rowCount: 45,    sizeKb: 12,    status: "ativo",  createdAt: "2024-01-12", updatedAt: "2024-06-01" },
    { id: "4", name: "institutions",    schema: "public",  rowCount: 9,     sizeKb: 8,     status: "ativo",  createdAt: "2024-01-12", updatedAt: "2024-06-01" },
    { id: "5", name: "permissions",     schema: "auth",    rowCount: 280,   sizeKb: 64,    status: "ativo",  createdAt: "2024-01-15", updatedAt: "2024-09-15" },
    { id: "6", name: "audit_logs",      schema: "log",     rowCount: 542000, sizeKb: 98400, status: "ativo", createdAt: "2024-02-01", updatedAt: "2024-10-12" },
    { id: "7", name: "reports_cache",   schema: "cache",   rowCount: 340,   sizeKb: 2200,  status: "inativo", createdAt: "2024-03-01", updatedAt: "2024-08-01" },
    { id: "8", name: "subscriptions",   schema: "billing", rowCount: 892,   sizeKb: 360,   status: "ativo",  createdAt: "2024-04-01", updatedAt: "2024-10-10" },
];

// ── Fields ─────────────────────────────────────────────────────────────────

export type FieldDataType = "uuid" | "varchar" | "integer" | "bigint" | "boolean" | "timestamp" | "decimal" | "text" | "jsonb" | "serial";

export type FieldRecord = {
    id: string;
    name: string;
    table: string;
    dataType: FieldDataType;
    length?: number;
    nullable: boolean;
    defaultValue: string;
    isPrimary: boolean;
    isForeign: boolean;
    status: Status;
};

export const MOCK_FIELDS: FieldRecord[] = [
    { id: "1",  name: "id",           table: "users",        dataType: "uuid",      nullable: false, defaultValue: "gen_random_uuid()", isPrimary: true,  isForeign: false, status: "ativo" },
    { id: "2",  name: "name",         table: "users",        dataType: "varchar",   length: 255, nullable: false, defaultValue: "",                isPrimary: false, isForeign: false, status: "ativo" },
    { id: "3",  name: "email",        table: "users",        dataType: "varchar",   length: 320, nullable: false, defaultValue: "",                isPrimary: false, isForeign: false, status: "ativo" },
    { id: "4",  name: "created_at",   table: "users",        dataType: "timestamp", nullable: false, defaultValue: "now()",              isPrimary: false, isForeign: false, status: "ativo" },
    { id: "5",  name: "id",           table: "transactions", dataType: "uuid",      nullable: false, defaultValue: "gen_random_uuid()", isPrimary: true,  isForeign: false, status: "ativo" },
    { id: "6",  name: "user_id",      table: "transactions", dataType: "uuid",      nullable: false, defaultValue: "",                isPrimary: false, isForeign: true,  status: "ativo" },
    { id: "7",  name: "amount",       table: "transactions", dataType: "decimal",   nullable: false, defaultValue: "0.00",             isPrimary: false, isForeign: false, status: "ativo" },
    { id: "8",  name: "description",  table: "transactions", dataType: "varchar",   length: 500, nullable: true, defaultValue: "",   isPrimary: false, isForeign: false, status: "ativo" },
    { id: "9",  name: "category_id",  table: "transactions", dataType: "uuid",      nullable: true,  defaultValue: "",                isPrimary: false, isForeign: true,  status: "ativo" },
    { id: "10", name: "metadata",     table: "transactions", dataType: "jsonb",     nullable: true,  defaultValue: "{}",              isPrimary: false, isForeign: false, status: "ativo" },
];

// ── Users ──────────────────────────────────────────────────────────────────

export type UserRole = "admin" | "gerente" | "analista" | "viewer";

export type UserRecord = {
    id: string;
    name: string;
    email: string;
    role: UserRole;
    status: Status;
    lastLogin: string;
    createdAt: string;
    mfa: boolean;
};

export const MOCK_USERS: UserRecord[] = [
    { id: "1", name: "Thiago Benevide",   email: "thiago@finlumia.com",    role: "admin",    status: "ativo",   lastLogin: "2024-10-12 14:32", createdAt: "2024-01-10", mfa: true },
    { id: "2", name: "Ana Souza",         email: "ana@finlumia.com",       role: "gerente",  status: "ativo",   lastLogin: "2024-10-11 09:15", createdAt: "2024-02-15", mfa: true },
    { id: "3", name: "Carlos Mendes",     email: "carlos@finlumia.com",    role: "analista", status: "ativo",   lastLogin: "2024-10-10 16:40", createdAt: "2024-03-01", mfa: false },
    { id: "4", name: "Fernanda Lima",     email: "fernanda@finlumia.com",  role: "viewer",   status: "ativo",   lastLogin: "2024-10-09 11:20", createdAt: "2024-04-10", mfa: false },
    { id: "5", name: "Rafael Costa",      email: "rafael@finlumia.com",    role: "analista", status: "pendente", lastLogin: "—",               createdAt: "2024-10-01", mfa: false },
    { id: "6", name: "Mariana Oliveira",  email: "mariana@finlumia.com",   role: "gerente",  status: "inativo", lastLogin: "2024-08-20 10:00", createdAt: "2024-01-20", mfa: true },
];

// ── Permissions ────────────────────────────────────────────────────────────

export type PermissionRecord = {
    id: string;
    module: string;
    subsystem: string;
    role: UserRole;
    canRead: boolean;
    canWrite: boolean;
    canDelete: boolean;
    canAdmin: boolean;
};

export const MOCK_PERMISSIONS: PermissionRecord[] = [
    { id: "1",  module: "Movimentações", subsystem: "Lançamentos",    role: "admin",    canRead: true,  canWrite: true,  canDelete: true,  canAdmin: true  },
    { id: "2",  module: "Movimentações", subsystem: "Lançamentos",    role: "gerente",  canRead: true,  canWrite: true,  canDelete: false, canAdmin: false },
    { id: "3",  module: "Movimentações", subsystem: "Lançamentos",    role: "analista", canRead: true,  canWrite: true,  canDelete: false, canAdmin: false },
    { id: "4",  module: "Movimentações", subsystem: "Lançamentos",    role: "viewer",   canRead: true,  canWrite: false, canDelete: false, canAdmin: false },
    { id: "5",  module: "Relatórios",    subsystem: "Fluxo de Caixa", role: "admin",    canRead: true,  canWrite: true,  canDelete: true,  canAdmin: true  },
    { id: "6",  module: "Relatórios",    subsystem: "Fluxo de Caixa", role: "gerente",  canRead: true,  canWrite: false, canDelete: false, canAdmin: false },
    { id: "7",  module: "Relatórios",    subsystem: "Fluxo de Caixa", role: "analista", canRead: true,  canWrite: false, canDelete: false, canAdmin: false },
    { id: "8",  module: "Relatórios",    subsystem: "Fluxo de Caixa", role: "viewer",   canRead: true,  canWrite: false, canDelete: false, canAdmin: false },
    { id: "9",  module: "Configurador",  subsystem: "Usuários",       role: "admin",    canRead: true,  canWrite: true,  canDelete: true,  canAdmin: true  },
    { id: "10", module: "Configurador",  subsystem: "Usuários",       role: "gerente",  canRead: true,  canWrite: false, canDelete: false, canAdmin: false },
    { id: "11", module: "Configurador",  subsystem: "Usuários",       role: "analista", canRead: false, canWrite: false, canDelete: false, canAdmin: false },
    { id: "12", module: "Configurador",  subsystem: "Usuários",       role: "viewer",   canRead: false, canWrite: false, canDelete: false, canAdmin: false },
];

// ── Functions ──────────────────────────────────────────────────────────────

export type FunctionLanguage = "sql" | "plpgsql" | "javascript";

export type FunctionRecord = {
    id: string;
    name: string;
    schema: string;
    language: FunctionLanguage;
    returnType: string;
    args: string;
    volatility: "volatile" | "stable" | "immutable";
    status: Status;
    createdAt: string;
    description: string;
};

export const MOCK_FUNCTIONS: FunctionRecord[] = [
    { id: "1", name: "get_user_balance",       schema: "public",   language: "plpgsql", returnType: "decimal",  args: "user_id uuid",             volatility: "volatile",  status: "ativo",   createdAt: "2024-02-01", description: "Calcula saldo atual do usuário somando todas as transações" },
    { id: "2", name: "monthly_summary",        schema: "public",   language: "sql",     returnType: "table",    args: "user_id uuid, month int",  volatility: "stable",    status: "ativo",   createdAt: "2024-02-15", description: "Retorna resumo mensal de receitas e despesas por categoria" },
    { id: "3", name: "audit_log_insert",       schema: "log",      language: "plpgsql", returnType: "trigger",  args: "",                         volatility: "volatile",  status: "ativo",   createdAt: "2024-03-01", description: "Registra operações de INSERT na tabela de auditoria" },
    { id: "4", name: "categorize_transaction", schema: "public",   language: "plpgsql", returnType: "uuid",     args: "description varchar",      volatility: "stable",    status: "ativo",   createdAt: "2024-04-10", description: "Sugere categoria automaticamente com base na descrição" },
    { id: "5", name: "refresh_reports_cache",  schema: "cache",    language: "sql",     returnType: "void",     args: "user_id uuid",             volatility: "volatile",  status: "inativo", createdAt: "2024-05-01", description: "Atualiza cache de relatórios para o usuário especificado" },
    { id: "6", name: "validate_transaction",   schema: "public",   language: "plpgsql", returnType: "boolean",  args: "amount decimal, type text", volatility: "immutable", status: "ativo",  createdAt: "2024-06-01", description: "Valida se uma transação respeita as regras de negócio" },
];

// ── Indexes ────────────────────────────────────────────────────────────────

export type IndexType = "btree" | "hash" | "gin" | "gist" | "brin";

export type IndexRecord = {
    id: string;
    name: string;
    table: string;
    schema: string;
    fields: string;
    type: IndexType;
    unique: boolean;
    partial: boolean;
    sizeKb: number;
    status: Status;
    createdAt: string;
};

export const MOCK_INDEXES: IndexRecord[] = [
    { id: "1", name: "users_pkey",                  table: "users",        schema: "public",  fields: "id",                      type: "btree", unique: true,  partial: false, sizeKb: 64,   status: "ativo", createdAt: "2024-01-10" },
    { id: "2", name: "users_email_idx",             table: "users",        schema: "public",  fields: "email",                   type: "btree", unique: true,  partial: false, sizeKb: 32,   status: "ativo", createdAt: "2024-01-10" },
    { id: "3", name: "transactions_pkey",           table: "transactions", schema: "public",  fields: "id",                      type: "btree", unique: true,  partial: false, sizeKb: 2048, status: "ativo", createdAt: "2024-01-10" },
    { id: "4", name: "transactions_user_id_idx",    table: "transactions", schema: "public",  fields: "user_id",                 type: "btree", unique: false, partial: false, sizeKb: 1280, status: "ativo", createdAt: "2024-01-10" },
    { id: "5", name: "transactions_date_idx",       table: "transactions", schema: "public",  fields: "created_at DESC",         type: "btree", unique: false, partial: false, sizeKb: 940,  status: "ativo", createdAt: "2024-02-01" },
    { id: "6", name: "transactions_category_idx",   table: "transactions", schema: "public",  fields: "category_id",             type: "btree", unique: false, partial: true,  sizeKb: 480,  status: "ativo", createdAt: "2024-02-01" },
    { id: "7", name: "transactions_metadata_idx",   table: "transactions", schema: "public",  fields: "metadata",                type: "gin",   unique: false, partial: false, sizeKb: 3200, status: "ativo", createdAt: "2024-03-01" },
    { id: "8", name: "audit_logs_created_brin",     table: "audit_logs",   schema: "log",     fields: "created_at",              type: "brin",  unique: false, partial: false, sizeKb: 128,  status: "ativo", createdAt: "2024-04-01" },
];

// ── Triggers ───────────────────────────────────────────────────────────────

export type TriggerEvent  = "INSERT" | "UPDATE" | "DELETE" | "TRUNCATE";
export type TriggerTiming = "BEFORE" | "AFTER" | "INSTEAD OF";

export type TriggerRecord = {
    id: string;
    name: string;
    table: string;
    schema: string;
    event: TriggerEvent;
    timing: TriggerTiming;
    function: string;
    enabled: boolean;
    status: Status;
    createdAt: string;
    description: string;
};

export const MOCK_TRIGGERS: TriggerRecord[] = [
    { id: "1", name: "trg_audit_users_insert",        table: "users",        schema: "public", event: "INSERT",   timing: "AFTER",  function: "log.audit_log_insert()",         enabled: true,  status: "ativo",   createdAt: "2024-01-15", description: "Registra novos usuários na auditoria" },
    { id: "2", name: "trg_audit_users_update",        table: "users",        schema: "public", event: "UPDATE",   timing: "AFTER",  function: "log.audit_log_insert()",         enabled: true,  status: "ativo",   createdAt: "2024-01-15", description: "Registra alterações de usuários na auditoria" },
    { id: "3", name: "trg_audit_transactions_insert", table: "transactions", schema: "public", event: "INSERT",   timing: "AFTER",  function: "log.audit_log_insert()",         enabled: true,  status: "ativo",   createdAt: "2024-01-15", description: "Registra novos lançamentos" },
    { id: "4", name: "trg_audit_transactions_delete", table: "transactions", schema: "public", event: "DELETE",   timing: "BEFORE", function: "log.audit_log_insert()",         enabled: true,  status: "ativo",   createdAt: "2024-01-15", description: "Registra exclusão de lançamentos" },
    { id: "5", name: "trg_categorize_auto",           table: "transactions", schema: "public", event: "INSERT",   timing: "BEFORE", function: "public.categorize_transaction()", enabled: true,  status: "ativo",   createdAt: "2024-04-10", description: "Auto-categoriza transações na inserção" },
    { id: "6", name: "trg_invalidate_cache",          table: "transactions", schema: "public", event: "INSERT",   timing: "AFTER",  function: "cache.refresh_reports_cache()",  enabled: false, status: "inativo", createdAt: "2024-05-01", description: "Invalida cache de relatórios após novo lançamento" },
    { id: "7", name: "trg_balance_check",             table: "transactions", schema: "public", event: "INSERT",   timing: "BEFORE", function: "public.validate_transaction()",  enabled: true,  status: "ativo",   createdAt: "2024-06-01", description: "Valida regras de negócio antes de inserir transação" },
];
