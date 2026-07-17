import { http } from "@/lib/http-client";
import { API_ENDPOINTS, buildUrl } from "@/api/Endpoints";
import type {
  Transaction,
  TransactionCreateRequest,
  TransactionListQuery,
  TransactionListResponse,
  ImportJobStatus,
  OcrPreviewResult,
  ConfirmOcrRequest,
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

// ── Categorias (público) ───────────────────────────────────────────────────

export type Category = { id: string; label: string; icon?: string; color?: string };

export const categoriesService = {
  // Backend responde envelopado: { data: Category[] }.
  list: () =>
    http.get<{ data: Category[] }>(API_ENDPOINTS.categories.list.url, {}).then((res) => res.data),
};

// ── Instituições (público) ────────────────────────────────────────────────

export type Institution = { id: string; label: string; abbr?: string; color?: string; logo?: string };

export const institutionsService = {
  // Backend responde envelopado: { data: Institution[] }.
  list: () =>
    http.get<{ data: Institution[] }>(API_ENDPOINTS.institutions.list.url, {}).then((res) => res.data),
};

// ── Orçamentos ────────────────────────────────────────────────────────────

export type BudgetType = "despesa" | "receita";
export type BudgetScope = "geral" | "categoria" | "forma_pagamento" | "banco";

export type BudgetView = {
  id: string;
  name: string;
  type: BudgetType;
  scope: BudgetScope;
  scopeValue: string | null;
  limitAmount: number;
  periodStart: string;
  periodEnd: string;
  currentTotal: number;
  progressPercent: number;
  notifiedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type BudgetUpsertRequest = {
  name: string;
  type: BudgetType;
  scope: BudgetScope;
  scopeValue: string | null;
  limitAmount: number;
  periodStart: string;
  periodEnd: string;
};

export type BudgetListQuery = { page?: number; pageSize?: number; type?: BudgetType };

export const budgetsService = {
  list: (params: BudgetListQuery = {}) =>
    http.get<PaginatedResponse<BudgetView>>(
      `${API_ENDPOINTS.budgets.list.url}${toQuery(params as QueryParams)}`,
    ),

  getById: (id: string) =>
    http.get<BudgetView>(buildUrl(API_ENDPOINTS.budgets.getById, { id })),

  create: (data: BudgetUpsertRequest) =>
    http.post<BudgetView>(API_ENDPOINTS.budgets.create.url, data),

  // Atenção: um PUT reseta o alerta (notifiedAt volta a null) — se o total já
  // ultrapassava o limite antes da edição, um novo lançamento pode disparar
  // o alerta de novo. É intencional: editar o limite implica reavaliação.
  update: (id: string, data: BudgetUpsertRequest) =>
    http.put<BudgetView>(buildUrl(API_ENDPOINTS.budgets.update, { id }), data),

  delete: (id: string) =>
    http.delete<void>(buildUrl(API_ENDPOINTS.budgets.delete, { id })),
};

// ── Transações ────────────────────────────────────────────────────────────

export type TransactionPatchRequest = {
  category?:    string;
  description?: string;
  notes?:       string;
  tags?:        string[];
};

export type DeleteMode = "single" | "from_here" | "all";

export const transactionsService = {
  list: (params: TransactionListQuery = {}) =>
    http.get<TransactionListResponse>(
      `${API_ENDPOINTS.transactions.list.url}${toQuery(params as QueryParams)}`,
    ),

  getById: (id: string) =>
    http.get<Transaction>(buildUrl(API_ENDPOINTS.transactions.getById, { id })),

  // Backend retorna List<TransactionView> (não um objeto único): um lançamento
  // recorrente (isRecurring=true) gera várias linhas na mesma chamada.
  create: (data: TransactionCreateRequest) =>
    http.post<Transaction[]>(API_ENDPOINTS.transactions.create.url, data),

  update: (id: string, data: TransactionCreateRequest) =>
    http.put<Transaction>(buildUrl(API_ENDPOINTS.transactions.update, { id }), data),

  patch: (id: string, data: TransactionPatchRequest) =>
    http.patch<Transaction>(buildUrl(API_ENDPOINTS.transactions.patch, { id }), data),

  delete: (id: string, deleteMode: DeleteMode = "single") =>
    http.delete<void>(
      `${buildUrl(API_ENDPOINTS.transactions.delete, { id })}${toQuery({ deleteMode })}`,
    ),

  batchDelete: (ids: string[]) =>
    http.delete<void>(API_ENDPOINTS.transactions.batchDelete.url, { ids }),
};

// ── Importação ────────────────────────────────────────────────────────────

export type ImportJobStatusResponse = PaginatedResponse<ImportJobStatus> | ImportJobStatus;

async function uploadFile(file: File): Promise<{ jobId: string }> {
  const form = new FormData();
  form.append("file", file);

  // O cookie HttpOnly é enviado automaticamente (same-origin).
  // O proxy injeta o Authorization header antes de encaminhar ao backend.
  const res = await fetch(API_ENDPOINTS.import.uploadFile.url, {
    method:      "POST",
    credentials: "same-origin",
    body:        form,
  });

  if (!res.ok) {
    const payload = await res.json().catch(() => null);
    throw payload ?? { message: `Erro ${res.status}: ${res.statusText}` };
  }

  return res.json();
}

export const importService = {
  upload: uploadFile,

  getJobStatus: (jobId: string) =>
    http.get<ImportJobStatus | OcrPreviewResult>(
      buildUrl(API_ENDPOINTS.import.getJobStatus, { jobId }),
    ),

  confirmOcr: (jobId: string, data: ConfirmOcrRequest) =>
    http.post<Transaction>(
      buildUrl(API_ENDPOINTS.import.confirmOcr, { jobId }),
      data,
    ),

  confirmFileImport: (jobId: string) =>
    http.post<{ imported: number; errors: string[] }>(
      buildUrl(API_ENDPOINTS.import.confirmFileImport, { jobId }),
    ),
};
